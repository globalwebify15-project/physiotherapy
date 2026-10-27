import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Notification } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const isReadParam = url.searchParams.get('isRead');

    const filter: any = { userId: user.userId };
    if (isReadParam !== null) {
      filter.isRead = isReadParam === 'true';
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });

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
    const { User } = await import('database');
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

