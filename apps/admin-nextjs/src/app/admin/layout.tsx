import React from 'react';
import { getAdminSession } from '@/utils/auth';
import AdminLayoutClient from '@/components/AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <AdminLayoutClient session={session}>
      {children}
    </AdminLayoutClient>
  );
}
