import React from 'react';
import { connectDB, Notification, User, Patient } from 'database';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/utils/notifications';
import { 
  Bell, 
  Send, 
  Megaphone, 
  Clock, 
  CheckCheck, 
  AlertCircle,
  Users,
  ShieldCheck
} from 'lucide-react';

export const revalidate = 0; // Dynamic fetch

// Server Action to broadcast a push notification to patients
async function broadcastNotificationAction(formData: FormData) {
  'use server';
  const title = formData.get('title') as string;
  const body = formData.get('body') as string;
  const targetType = formData.get('targetType') as string; // 'all' or specific userId
  const notifType = (formData.get('type') as string) || 'announcement';

  if (!title || !body) return;

  await connectDB();

  try {
    if (targetType === 'all') {
      const patientUsers = await User.find({ role: 'patient' });
      for (const u of patientUsers) {
        await createNotification(u._id, title, body, notifType as any);
      }
    } else {
      await createNotification(targetType, title, body, notifType as any);
    }
  } catch (err) {
    console.error('[BROADCAST NOTIFICATION ACTION ERROR]:', err);
  }

  revalidatePath('/admin/notifications');
}

export default async function NotificationsPage() {
  await connectDB();

  // Fetch recent dispatched notifications populated with user / patient info
  const notifications = await Notification.find()
    .populate({ path: 'userId', model: User })
    .sort({ createdAt: -1 })
    .limit(50);

  // Fetch all patients for target dropdown
  const patients = await Patient.find().populate({ path: 'userId', model: User }).sort({ name: 1 });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-purple-50 text-purple-700 border-purple-200/60';
      case 'booking_alert':
        return 'bg-teal-50 text-teal-700 border-teal-200/60';
      case 'payment_alert':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'reminder':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Notification & Alert Center</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Broadcast clinical alerts, appointment reminders, and promotional notices directly to mobile patients.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left 1 Column: Broadcast Composer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm self-start space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Megaphone size={18} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Broadcast Message</h3>
          </div>

          <form action={broadcastNotificationAction} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Recipient Target
              </label>
              <select 
                name="targetType" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
              >
                <option value="all">📢 All Registered Patients (Broadcast)</option>
                {patients.map((p) => (
                  <option key={p._id} value={p.userId?._id?.toString() || p.userId?.toString()}>
                    👤 {p.name} ({p.userId?.mobile || 'Patient'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Notification Category
              </label>
              <select 
                name="type" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
              >
                <option value="announcement">Announcement / Clinic Update</option>
                <option value="reminder">Appointment Reminder</option>
                <option value="booking_alert">Booking Confirmation Notice</option>
                <option value="payment_alert">Payment Receipt Alert</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Notification Title
              </label>
              <input 
                type="text" 
                name="title" 
                required 
                placeholder="e.g. Clinic Holiday / Free Posture Checkup" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Message Body
              </label>
              <textarea 
                name="body" 
                required 
                rows={4}
                placeholder="Type the message content that will appear on the patient's device..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors shadow-md shadow-teal-100"
            >
              <Send size={16} />
              Dispatch Notification
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Dispatched History Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dispatched Log</span>
              <span className="text-xs font-bold text-slate-500 bg-slate-150 px-2.5 py-1 rounded-lg border border-slate-200/30">
                {notifications.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/10">
                    <th className="p-4">Notification Title & Content</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Dispatched At</th>
                    <th className="p-4">Read</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-600">
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                        <Bell className="mx-auto w-12 h-12 text-slate-200 mb-4" />
                        No notifications sent yet.
                      </td>
                    </tr>
                  ) : (
                    notifications.map((notif: any) => (
                      <tr key={notif._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 max-w-xs">
                          <div className="font-bold text-slate-800 text-xs">{notif.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.body}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wider ${getTypeBadge(notif.type)}`}>
                            {notif.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-semibold text-slate-700">
                          {notif.userId?.mobile || 'Patient'}
                        </td>
                        <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4">
                          {notif.isRead ? (
                            <span className="text-emerald-600 flex items-center gap-1 text-xs font-semibold">
                              <CheckCheck size={14} /> Read
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">
                              Sent
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
