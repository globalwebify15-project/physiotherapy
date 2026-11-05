'use client';

import React, { useState } from 'react';
import { Megaphone, Mail, Settings2, Bell, ShieldCheck } from 'lucide-react';
import NotificationsDirectoryClient from './NotificationsDirectoryClient';
import SmtpSettingsClient from './SmtpSettingsClient';
import type { SmtpConfig, NotificationRecipientsConfig } from '@/utils/mailer';

interface NotificationsCenterManagerProps {
  notifications: any[];
  patients: any[];
  smtpConfig: SmtpConfig;
  recipientsConfig: NotificationRecipientsConfig;
  userRole?: string;
  onBroadcast: (formData: FormData) => Promise<void>;
  onSaveSmtp: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  onSaveRecipients: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}

export default function NotificationsCenterManager({
  notifications,
  patients,
  smtpConfig,
  recipientsConfig,
  userRole,
  onBroadcast,
  onSaveSmtp,
  onSaveRecipients,
}: NotificationsCenterManagerProps) {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'smtp'>('broadcast');

  const canConfigureSmtp = userRole === 'superadmin' || userRole === 'admin' || !userRole;

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Tab Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Megaphone size={22} />
            </span>
            Notification & Delivery Center
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Manage broadcast push alerts, clinic mail servers, and automated multi-recipient notification rules.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'broadcast'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell size={14} className={activeTab === 'broadcast' ? 'text-teal-600' : 'text-slate-400'} />
            Push Alerts &amp; Logs
            <span className="px-1.5 py-0.2 bg-teal-50 text-teal-700 rounded-full text-[10px] font-black border border-teal-200">
              {notifications.length}
            </span>
          </button>

          {canConfigureSmtp && (
            <button
              type="button"
              onClick={() => setActiveTab('smtp')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                activeTab === 'smtp'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail size={14} className={activeTab === 'smtp' ? 'text-teal-600' : 'text-slate-400'} />
              SMTP &amp; Delivery Engine
              <span className={`w-2 h-2 rounded-full ${smtpConfig.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </button>
          )}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'broadcast' && (
        <NotificationsDirectoryClient
          notifications={notifications}
          patients={patients}
          onBroadcast={onBroadcast}
        />
      )}

      {activeTab === 'smtp' && canConfigureSmtp && (
        <SmtpSettingsClient
          initialSmtp={smtpConfig}
          initialRecipients={recipientsConfig}
          onSaveSmtp={onSaveSmtp}
          onSaveRecipients={onSaveRecipients}
        />
      )}
    </div>
  );
}

