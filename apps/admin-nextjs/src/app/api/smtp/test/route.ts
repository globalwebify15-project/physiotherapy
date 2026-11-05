import { NextRequest, NextResponse } from 'next/server';
import { testSmtpConnection } from '@/utils/mailer';
import { connectDB } from 'database';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { targetEmail, config } = body;

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid recipient email address for testing.' },
        { status: 400 }
      );
    }

    const result = await testSmtpConnection(targetEmail, config);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API SMTP TEST ERROR]:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal error verifying SMTP connection.' },
      { status: 500 }
    );
  }
}

