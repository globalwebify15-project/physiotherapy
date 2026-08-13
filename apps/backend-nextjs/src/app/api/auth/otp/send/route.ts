import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from 'database';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { mobile } = await request.json();

    if (!mobile || typeof mobile !== 'string') {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    // Standard local check or bypass: generate a 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Log the OTP professionally in local console (in production, integrate Twilio/MSG91/etc)
    console.log(`[SMS OTP GATEWAY] Sending OTP ${otp} to mobile: ${mobile}`);

    // Return the OTP in body for ease of development/testing, alongside a success indicator
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully (Test mode)',
      otp: otp, // In production, omit this field!
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
