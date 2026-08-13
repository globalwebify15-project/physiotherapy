import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from 'database';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Ensure role is admin/superadmin/receptionist/therapist
    const staffRoles = ['admin', 'superadmin', 'receptionist', 'therapist'];
    if (!staffRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Access denied: not staff role' }, { status: 403 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: 'Credentials not configured for this user' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Error logging in admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
