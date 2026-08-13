import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'physiotherapy_jwt_secret_key_change_me_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'physiotherapy_jwt_refresh_secret_key_change_me';

export interface TokenPayload {
  userId: string;
  mobile: string;
  role: 'patient' | 'admin' | 'superadmin' | 'receptionist' | 'therapist';
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getAuthenticatedUser(
  request: NextRequest,
  allowedRoles?: string[]
): Promise<TokenPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(decoded.role)) {
    return null;
  }

  return decoded;
}
