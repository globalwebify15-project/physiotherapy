'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  UserRound,
  Activity,
  FileText,
  CreditCard,
  Settings,
  Menu,
  X,
  Bell,
  Heart
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/admin/appointments', icon: CalendarDays },
  { name: 'Therapists', href: '/admin/therapists', icon: UserRound },
  { name: 'Services', href: '/admin/services', icon: Activity },
  { name: 'CMS Settings', href: '/admin/cms', icon: Settings },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm focus:outline-none"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Identity */}
        <div className="h-16 border-b border-slate-100 flex items-center px-6 gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Heart size={16} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-none">PhysioCare</h1>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admin Portal</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Staff Identity Block */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-slate-800 truncate">Super Admin</h2>
              <span className="text-xs text-slate-400 truncate block">admin@globalwebify.com</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {SIDEBAR_ITEMS.find((item) => pathname === item.href)?.name || 'PhysioCare Admin'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Administrator</span>
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm"
        />
      )}
    </div>
  );
}
