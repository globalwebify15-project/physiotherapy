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
