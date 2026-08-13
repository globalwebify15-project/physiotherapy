import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, Patient } from 'database';
import { signAccessToken, signRefreshToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { mobile, otp } = await request.json();

    if (!mobile || !otp) {
      return NextResponse.json({ error: 'Mobile number and OTP are required' }, { status: 400 });
    }

    // Basic OTP validation bypass for development (accept any 6-digit code or specific code)
    if (otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 });
    }

    // Find or create User
    let user = await User.findOne({ mobile });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        mobile,
        role: 'patient',
        isActive: true,
      });
    }

    // Check if Patient profile exists
    let patient = await Patient.findOne({ userId: user._id });
    if (!patient) {
      // Create a skeleton patient profile
      patient = await Patient.create({
        userId: user._id,
        name: `Patient (${mobile.slice(-4)})`,
        gender: 'other',
        dob: new Date('2000-01-01'),
        emergencyContact: {
          name: 'Emergency Contact',
          phone: mobile,
          relation: 'Self',
        },
        savedAddresses: [],
      });
    }

    // Generate JWT payload
    const payload = {
      userId: user._id.toString(),
      mobile: user.mobile,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      isNewUser,
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
      },
      patient: {
        id: patient._id,
        name: patient.name,
      },
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
