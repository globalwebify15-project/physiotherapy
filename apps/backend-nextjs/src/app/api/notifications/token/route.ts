import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

// POST /api/notifications/token - Register FCM device token for push notifications
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const token = body?.token;
    const mobile = body?.mobile;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'FCM token string is required' }, { status: 400 });
    }

    let targetUserId = user?.userId;

    if (mobile) {
      const cleanMobile = mobile.toString().replace(/^\+91/, '').trim();
      let dbUser = await User.findOne({
        $or: [{ mobile: cleanMobile }, { mobile: `+91${cleanMobile}` }, { mobile }]
      });
      if (!dbUser && cleanMobile.length >= 10) {
        dbUser = await User.create({
          mobile: cleanMobile,
          role: 'patient',
          isActive: true,
          fcmTokens: [token.trim()],
        });
      }
      if (dbUser) {
        targetUserId = dbUser._id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'User not identified' }, { status: 400 });
    }

    // Add token if not already present
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { fcmTokens: token.trim() },
    });

    return NextResponse.json({
      success: true,
      message: 'FCM device token registered successfully',
    });
  } catch (error: any) {
    console.error('Error registering FCM token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notifications/token - Unregister FCM device token on logout
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
    }

    if (user?.userId) {
      await User.findByIdAndUpdate(user.userId, {
        $pull: { fcmTokens: token.trim() },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'FCM token unregistered successfully',
    });
  } catch (error: any) {
    console.error('Error unregistering FCM token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
