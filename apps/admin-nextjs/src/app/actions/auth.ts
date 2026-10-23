'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { connectDB, User } from 'database';
import { signAdminToken } from '@/utils/auth';

export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  try {
    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return { error: 'Invalid email or password.' };
    }

    const staffRoles = ['admin', 'superadmin', 'receptionist', 'therapist'];
    if (!staffRoles.includes(user.role)) {
      return { error: 'Access restricted: Staff or Administrator account required.' };
    }

    if (!user.passwordHash) {
      return { error: 'Account password not configured. Please contact Super Admin.' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { error: 'Invalid email or password.' };
    }

    const token = signAdminToken({
      userId: user._id.toString(),
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (err: any) {
    console.error('Login action error:', err);
    return { error: 'Authentication failed. Please verify database connection.' };
  }

  redirect('/admin/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/login');
}
