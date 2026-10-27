'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  UserRound,
  Users,
  Activity,
  FileSpreadsheet,
  CreditCard,
  Settings,
  Menu,
  X,
  Bell,
  HeartPulse,
  Smartphone,
  MessageSquare,
  Megaphone,
  ShieldCheck,
  Radio,
  LogOut,
  UserCheck
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import type { AdminSession } from '@/utils/auth';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/admin/appointments', icon: CalendarDays },
  { name: 'Patients', href: '/admin/patients', icon: Users },
  { name: 'Therapists', href: '/admin/therapists', icon: UserRound },
  { name: 'Services', href: '/admin/services', icon: Activity },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Reviews & Feedback', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Notification Center', href: '/admin/notifications', icon: Megaphone },
  { name: 'Reports & Export', href: '/admin/reports', icon: FileSpreadsheet },
  { name: 'Staff & Roles (RBAC)', href: '/admin/roles', icon: ShieldCheck },
  { name: 'CMS Settings', href: '/admin/cms', icon: Settings },
  { name: 'Download App (APK)', href: '/apk', icon: Smartphone },
];

function getRoleDetails(role?: string) {
  switch (role) {
    case 'superadmin':
      return {
        label: 'Super Admin',
        initials: 'SA',
        bg: 'from-purple-600 to-indigo-600',
        badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: ShieldCheck,
      };
    case 'receptionist':
      return {
        label: 'Receptionist',
        initials: 'RC',
        bg: 'from-amber-600 to-orange-500',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: UserCheck,
      };
    case 'therapist':
      return {
        label: 'Therapist',
        initials: 'TH',
        bg: 'from-blue-600 to-teal-500',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Activity,
      };
    case 'admin':
    default:
      return {
        label: 'Administrator',
        initials: 'AD',
        bg: 'from-teal-600 to-emerald-600',
        badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
        icon: ShieldCheck,
      };
  }
}

export default function AdminLayoutClient({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: AdminSession | null;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roleMeta = getRoleDetails(session?.role);
  const userEmail = session?.email || session?.mobile || 'admin@quickphysio24.com';
  const RoleIcon = roleMeta.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-md text-teal-700 hover:bg-teal-50 transition-colors focus:outline-none"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Permanently Fixed Left Sidebar (Does NOT scroll with page) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col shadow-sm transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 border-b border-slate-100 flex items-center px-5 gap-3 bg-gradient-to-b from-teal-50/40 to-transparent">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
            <HeartPulse size={22} className="animate-pulse-slow" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-[15px] tracking-tight leading-none">
              QuickPhysio<span className="text-teal-600">24</span>.com
            </h1>
            <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-full mt-1 inline-block border border-teal-100">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Area (Internal scroll only) */}
        <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1.5 custom-scrollbar">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-800 font-bold border-l-4 border-teal-600 shadow-sm shadow-teal-600/10'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-teal-700'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-600'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Staff Identity Footer Card */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200/60 shadow-xs">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${roleMeta.bg} flex items-center justify-center text-white font-extrabold text-xs shadow-xs`}>
              <RoleIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 truncate">{roleMeta.label}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <span className="text-[11px] text-slate-400 truncate block" title={userEmail}>
                {userEmail}
              </span>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame (Offset by w-64 on desktop so sidebar is fixed) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-64">
        {/* Sticky Top Header Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {SIDEBAR_ITEMS.find((item) => pathname === item.href)?.name || 'QuickPhysio24.com'}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              <Radio size={12} className="animate-pulse" /> Live Clinic Sync
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/notifications"
              className="p-2 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-xl relative transition-colors"
              title="Notification Center"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white"></span>
            </Link>
            
            <div className="w-px h-5 bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full ${roleMeta.badgeBg} font-bold text-xs flex items-center justify-center border shadow-xs`}>
                {roleMeta.initials}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">{roleMeta.label}</span>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 rounded-xl border border-slate-200/80 transition-colors"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        />
      )}
    </div>
  );
}
