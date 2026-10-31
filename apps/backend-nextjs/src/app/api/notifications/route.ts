import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Notification, User } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    const url = new URL(request.url);
    const mobileParam = url.searchParams.get('mobile');
    const isReadParam = url.searchParams.get('isRead');

    let targetUserId = user?.userId;

    if (!targetUserId && mobileParam) {
      const cleanMobile = mobileParam.replace(/^\+91/, '').trim();
      const dbUser = await User.findOne({
        $or: [
          { mobile: cleanMobile },
          { mobile: `+91${cleanMobile}` },
          { mobile: mobileParam },
        ],
      });
      if (dbUser) {
        targetUserId = dbUser._id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Unauthorized or mobile required' }, { status: 401 });
    }

    const filter: any = { userId: targetUserId };
    if (isReadParam !== null) {
      filter.isRead = isReadParam === 'true';
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notifications - Create or broadcast notifications with FCM push
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { createNotification } = await import('@/utils/notifications');
    const body = await request.json();
    const { targetType, userId, title, body: msgBody, type, metadata } = body;

    if (!title || !msgBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    if (targetType === 'all') {
      const patientUsers = await User.find({ role: 'patient' });
      for (const u of patientUsers) {
        await createNotification(u._id, title, msgBody, type || 'announcement', metadata);
      }
      return NextResponse.json({ success: true, count: patientUsers.length });
    } else if (userId) {
      const notif = await createNotification(userId, title, msgBody, type || 'announcement', metadata);
      return NextResponse.json({ success: true, notification: notif });
    }

    return NextResponse.json({ error: 'targetType or userId is required' }, { status: 400 });
  } catch (error: any) {
    console.error('Error broadcasting notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
