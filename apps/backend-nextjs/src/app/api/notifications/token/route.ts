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

    if (!targetUserId && mobile) {
      const cleanMobile = mobile.toString().replace(/^\+91/, '').trim();
      const dbUser = await User.findOne({
        $or: [{ mobile: cleanMobile }, { mobile: `+91${cleanMobile}` }, { mobile }]
      });
      if (dbUser) {
        targetUserId = dbUser._id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
    }

    await User.findByIdAndUpdate(user.userId, {
      $pull: { fcmTokens: token },
    });

    return NextResponse.json({
      success: true,
      message: 'FCM token removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing FCM token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
