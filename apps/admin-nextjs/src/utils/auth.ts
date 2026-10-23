import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'physiotherapy_jwt_secret_key_change_me_in_production';

export interface AdminSession {
  userId: string;
  email?: string;
  mobile?: string;
  role: 'superadmin' | 'admin' | 'receptionist' | 'therapist';
}

export function signAdminToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession;
  } catch (err) {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
