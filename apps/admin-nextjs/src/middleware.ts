import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getJwtRole(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(base64);
    const parsed = JSON.parse(jsonStr);
    return parsed.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_token')?.value;

  // Root redirect
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Unauthenticated protection for all /admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const role = getJwtRole(token);
    if (!role) {
      const loginUrl = new URL('/login', request.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('admin_token');
      return res;
    }

    // Role-Based Access Control (RBAC) Protections:
    
    // 1. Staff & Roles (RBAC) - Strictly Super Admin only
    if (pathname.startsWith('/admin/roles')) {
      if (role !== 'superadmin') {
        return NextResponse.redirect(new URL('/admin/dashboard?denied=superadmin_only', request.url));
      }
    }

    // 2. CMS Settings - Super Admin & Admin only
    if (pathname.startsWith('/admin/cms')) {
      if (role !== 'superadmin' && role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard?denied=admin_only', request.url));
      }
    }

    // 3. Reports & Financial Export - Super Admin & Admin only
    if (pathname.startsWith('/admin/reports')) {
      if (role !== 'superadmin' && role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard?denied=admin_only', request.url));
      }
    }

    // 4. Therapists Onboarding/Schedule Management - Super Admin & Admin only
    if (pathname.startsWith('/admin/therapists')) {
      if (role !== 'superadmin' && role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard?denied=admin_only', request.url));
      }
    }

    // 5. Payment Records & Fee Settlement - Super Admin, Admin & Receptionist only
    if (pathname.startsWith('/admin/payments')) {
      if (role !== 'superadmin' && role !== 'admin' && role !== 'receptionist') {
        return NextResponse.redirect(new URL('/admin/dashboard?denied=restricted', request.url));
      }
    }
  }

  // If attempting to access /login while already logged in
  if (pathname === '/login') {
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/login'],
};
