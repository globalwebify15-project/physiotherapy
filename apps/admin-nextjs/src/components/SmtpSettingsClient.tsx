'use client';

import React, { useState } from 'react';
import { useToast } from './ToastProvider';
import {
  Mail,
  Send,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Users,
  Bell,
  FileText,
  Lock,
  Settings2,
  Check,
  Info
} from 'lucide-react';
import type { SmtpConfig, NotificationRecipientsConfig } from '@/utils/mailer';

interface SmtpSettingsClientProps {
  initialSmtp: SmtpConfig;
  initialRecipients: NotificationRecipientsConfig;
  onSaveSmtp: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  onSaveRecipients: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}

export default function SmtpSettingsClient({
  initialSmtp,
  initialRecipients,
  onSaveSmtp,
  onSaveRecipients,
}: SmtpSettingsClientProps) {
  const toast = useToast();

  // SMTP Settings State
  const [smtp, setSmtp] = useState<SmtpConfig>(initialSmtp);
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);

  // Recipient Settings State
  const [recipients, setRecipients] = useState<NotificationRecipientsConfig>(initialRecipients);
  const [emailsRaw, setEmailsRaw] = useState(initialRecipients.clinicAlertEmails.join(', '));
  const [phonesRaw, setPhonesRaw] = useState(initialRecipients.clinicAlertPhones.join(', '));
  const [isSavingRecipients, setIsSavingRecipients] = useState(false);

  // Live Test State
  const [testEmail, setTestEmail] = useState('admin@globalwebify.com');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    messageId?: string;
  }>({ status: 'idle', message: '' });

  // Handle Save SMTP
  const handleSmtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    try {
      const fd = new FormData();
      fd.append('host', smtp.host);
      fd.append('port', String(smtp.port));
      fd.append('secure', String(smtp.secure));
      fd.append('user', smtp.user);
      fd.append('pass', smtp.pass);
      fd.append('senderName', smtp.senderName);
      fd.append('senderEmail', smtp.senderEmail);
      fd.append('isEnabled', String(smtp.isEnabled));

      const res = await onSaveSmtp(fd);
      if (res.success) {
        toast.success('SMTP Settings Saved', 'Mail server parameters updated successfully.');
      } else {
        toast.error('Save Failed', res.message || 'Could not update SMTP settings.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed saving SMTP parameters.');
    } finally {
      setIsSavingSmtp(false);
    }
  };

  // Handle Save Recipients
  const handleRecipientsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRecipients(true);
    try {
      const fd = new FormData();
      fd.append('clinicAlertEmails', emailsRaw);
      fd.append('clinicAlertPhones', phonesRaw);
      fd.append('sendToPatientEmail', String(recipients.sendToPatientEmail));
      fd.append('sendToDoctorEmail', String(recipients.sendToDoctorEmail));
      fd.append('sendToClinicAdmin', String(recipients.sendToClinicAdmin));
      fd.append('sendToPatientSms', String(recipients.sendToPatientSms));
      fd.append('autoSendInvoiceOnPayment', String(recipients.autoSendInvoiceOnPayment));

      const res = await onSaveRecipients(fd);
      if (res.success) {
        toast.success('Recipients & Rules Saved', 'Multi-recipient notification targets updated.');
      } else {
        toast.error('Save Failed', res.message || 'Could not update notification rules.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed saving recipient parameters.');
    } finally {
      setIsSavingRecipients(false);
    }
  };

  // Live Test SMTP Connection
  const handleRunTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Invalid Email', 'Please enter a valid destination email address for testing.');
      return;
    }

    setIsTesting(true);
    setTestResult({ status: 'idle', message: 'Initiating SMTP handshake...' });

    try {
      const res = await fetch('/api/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: testEmail.trim(),
          config: smtp, // Test with current form values so unsaved changes can be tested
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          status: 'success',
          message: data.message || `Test email dispatched successfully to ${testEmail}!`,
          messageId: data.messageId,
        });
        toast.success('SMTP Test Passed', `Verification email dispatched to ${testEmail}`);
      } else {
        setTestResult({
          status: 'error',
          message: data.message || 'SMTP handshake failed. Please verify credentials.',
        });
        toast.error('SMTP Test Failed', data.message);
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err.message || 'Network error reaching SMTP test endpoint.',
      });
      toast.error('Testing Failed', err.message);
    } finally {
      setIsTesting(false);
    }
  };

  // Parsed chips for preview
  const parsedEmailChips = emailsRaw
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.includes('@'));

  const parsedPhoneChips = phonesRaw
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Top Banner / System Status */}
      <div className="bg-linear-to-r from-teal-900 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Mail size={220} />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 backdrop-blur-md border border-teal-400/30 rounded-full text-xs font-bold text-teal-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SMTP Notification & Invoicing Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            QuickPhysio24.com Mail Delivery Center
          </h2>
          <p className="text-teal-100/80 text-xs sm:text-sm leading-relaxed">
            Configure clinic SMTP mail servers, manage multi-recipient alert lists for doctors and management,
            and automate dispatch of booking confirmations and official tax invoices directly to patient inboxes.
          </p>
        </div>
      </div>

      {/* Grid: Left Column = SMTP Server Config + Live Test; Right Column = Multi-Recipient Target Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: SMTP Configuration & Live Test (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SMTP Credentials Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Server size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">SMTP Mail Server Credentials</h3>
                  <p className="text-slate-400 text-xs">Host, credentials, and TLS encryption protocol</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smtp.isEnabled}
                    onChange={(e) => setSmtp({ ...smtp, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
                <span className="text-xs font-bold text-slate-700">
                  {smtp.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSmtpSubmit} className="space-y-4">
              {/* Host and Port */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">SMTP Host / Server *</label>
                  <input
                    type="text"
                    required
                    value={smtp.host}
                    onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                    placeholder="e.g. smtp.gmail.com or mail.quickphysio24.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Port *</label>
                  <input
                    type="number"
                    required
                    value={smtp.port}
                    onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
                    placeholder="587"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Encryption selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Security & Encryption Protocol</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSmtp({ ...smtp, secure: false, port: 587 })}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition ${
                      !smtp.secure
                        ? 'bg-teal-50 border-teal-500 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {!smtp.secure && <Check size={14} className="text-teal-600" />}
                    TLS / STARTTLS (Port 587 - Gmail)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmtp({ ...smtp, secure: true, port: 465 })}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition ${
                      smtp.secure
                        ? 'bg-teal-50 border-teal-500 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {smtp.secure && <Check size={14} className="text-teal-600" />}
                    SSL Direct (Port 465)
                  </button>
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">SMTP Username / Email *</label>
                  <input
                    type="text"
                    required
                    value={smtp.user}
                    onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                    placeholder="contact@quickphysio24.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Password / App Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={smtp.pass}
                      onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                      placeholder="16-character App Password"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sender Name & Sender Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Sender Display Name *</label>
                  <input
                    type="text"
                    required
                    value={smtp.senderName}
                    onChange={(e) => setSmtp({ ...smtp, senderName: e.target.value })}
                    placeholder="QuickPhysio24.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Sender Email Address *</label>
                  <input
                    type="email"
                    required
                    value={smtp.senderEmail}
                    onChange={(e) => setSmtp({ ...smtp, senderEmail: e.target.value })}
                    placeholder="contact@quickphysio24.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Help Note for Gmail */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-bold">Using Gmail / Google Workspace?</strong>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Standard Google passwords will be blocked. Enable 2-Step Verification in Google Account,
                    then generate a 16-character <strong>App Password</strong> (under Security → App Passwords) and paste it above.
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSmtp}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  {isSavingSmtp ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Saving SMTP Configuration...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Save & Activate SMTP Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Interactive Live SMTP Test Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-400 flex items-center justify-center font-bold">
                <Send size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Live SMTP Test & Connection Diagnostic</h3>
                <p className="text-slate-400 text-xs">Verify handshake, TLS encryption, and deliverability</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Test your configuration in real-time. Antigravity will initiate an authentic TLS handshake with the SMTP host
              and dispatch an official test email to the recipient specified below.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to receive test message (e.g. admin@globalwebify.com)"
                className="flex-1 px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-400"
              />
              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting}
                className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition shrink-0"
              >
                {isTesting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Testing Handshake...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send Live Test Email
                  </>
                )}
              </button>
            </div>

            {/* Test Output Status Banner */}
            {testResult.status === 'success' && (
              <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-4 flex items-start gap-3 animate-fade-in text-emerald-200">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-emerald-300">✓ SMTP Handshake & Authentication Successful!</div>
                  <p className="text-emerald-200/90 leading-relaxed">{testResult.message}</p>
                  {testResult.messageId && (
                    <div className="font-mono text-[11px] text-emerald-400 mt-1">
                      Message-ID: {testResult.messageId}
                    </div>
                  )}
                </div>
              </div>
            )}

            {testResult.status === 'error' && (
              <div className="bg-rose-950/60 border border-rose-500/50 rounded-2xl p-4 flex items-start gap-3 animate-fade-in text-rose-200">
                <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-rose-300">✕ SMTP Verification Failed</div>
                  <p className="text-rose-200/90 leading-relaxed">{testResult.message}</p>
                  <p className="text-[11px] text-rose-300/80 mt-1">
                    Tip: Verify that the port matches your SSL setting (587 for TLS, 465 for SSL) and that your App Password has no spaces.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Recipient Configuration & Automated Notification Rules (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Multi-Recipient Alert Targets</h3>
                <p className="text-slate-400 text-xs">Manage management emails and automated triggers</p>
              </div>
            </div>

            <form onSubmit={handleRecipientsSubmit} className="space-y-5">
              {/* Clinic Alert Emails (Multiple) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail size={13} className="text-teal-600" />
                    Clinic Management Alert Emails (Multiple) *
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Comma-separated</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={emailsRaw}
                  onChange={(e) => setEmailsRaw(e.target.value)}
                  placeholder="contact@quickphysio24.com, admin@globalwebify.com, drrajnish@quickphysio24.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                {/* Active Chips Preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {parsedEmailChips.map((email, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold"
                    >
                      <Mail size={10} className="text-teal-600" />
                      {email}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  All booking alerts and invoice receipts will be automatically dispatched to every address in this list.
                </p>
              </div>

              {/* Clinic Alert Phone Numbers (Multiple) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Bell size={13} className="text-teal-600" />
                    Clinic Alert Phone Numbers (Multiple) *
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Comma-separated</span>
                </div>
                <input
                  type="text"
                  required
                  value={phonesRaw}
                  onChange={(e) => setPhonesRaw(e.target.value)}
                  placeholder="+919110912544, +919693233447"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                {/* Phone Chips Preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {parsedPhoneChips.map((phone, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-bold"
                    >
                      {phone}
                    </span>
                  ))}
                </div>
              </div>

              {/* Automated Rules Toggles */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Automated Event Dispatch Rules
                </h4>

                {/* Patient Booking Confirmation */}
                <label className="flex items-start gap-3 p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/70 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={recipients.sendToPatientEmail}
                    onChange={(e) => setRecipients({ ...recipients, sendToPatientEmail: e.target.checked })}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div>
                    <strong className="text-xs text-slate-800 block">Dispatch Email Confirmation to Patient</strong>
                    <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                      Sends branded appointment schedule summary and clinic guidelines directly to patient email.
                    </span>
                  </div>
                </label>

                {/* Assigned Doctor Booking Alert */}
                <label className="flex items-start gap-3 p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/70 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={recipients.sendToDoctorEmail}
                    onChange={(e) => setRecipients({ ...recipients, sendToDoctorEmail: e.target.checked })}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div>
                    <strong className="text-xs text-slate-800 block">Dispatch Booking Alert to Assigned Doctor</strong>
                    <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                      Notifies the assigned physiotherapist with patient clinical details, time slot, and address.
                    </span>
                  </div>
                </label>

                {/* Clinic Management Email Alert */}
                <label className="flex items-start gap-3 p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/70 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={recipients.sendToClinicAdmin}
                    onChange={(e) => setRecipients({ ...recipients, sendToClinicAdmin: e.target.checked })}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div>
                    <strong className="text-xs text-slate-800 block">Dispatch Alert to Multi-Recipient Management List</strong>
                    <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                      Sends concurrent notifications to all emails entered in the Clinic Management list above.
                    </span>
                  </div>
                </label>

                {/* In-App & SMS/Phone Alert */}
                <label className="flex items-start gap-3 p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/70 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={recipients.sendToPatientSms}
                    onChange={(e) => setRecipients({ ...recipients, sendToPatientSms: e.target.checked })}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div>
                    <strong className="text-xs text-slate-800 block">In-App Push & SMS Phone Notifications</strong>
                    <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                      Logs live push alerts to mobile devices and records SMS alert transactions.
                    </span>
                  </div>
                </label>

                {/* Auto Send Invoice on Payment */}
                <label className="flex items-start gap-3 p-3 bg-teal-50/50 hover:bg-teal-50 rounded-xl border border-teal-200/70 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={recipients.autoSendInvoiceOnPayment}
                    onChange={(e) => setRecipients({ ...recipients, autoSendInvoiceOnPayment: e.target.checked })}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div>
                    <strong className="text-xs text-teal-900 block flex items-center gap-1.5">
                      <FileText size={13} className="text-teal-700" />
                      Auto-Email Official Tax Invoice & Receipt
                    </strong>
                    <span className="text-[11px] text-teal-800/80 block leading-tight mt-0.5">
                      Automatically sends clinical tax invoice upon Razorpay capture or Pay at Clinic/Home settlement.
                    </span>
                  </div>
                </label>
              </div>

              {/* Save Recipients Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingRecipients}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  {isSavingRecipients ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Saving Targets & Rules...
                    </>
                  ) : (
                    <>
                      <Users size={16} />
                      Save Recipient Targets & Rules
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
