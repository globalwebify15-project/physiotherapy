import React from 'react';
import { connectDB, Notification, User, Patient } from 'database';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/utils/notifications';
import NotificationsDirectoryClient from '@/components/NotificationsDirectoryClient';

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

  // Concurrently fetch recent dispatched notifications and patient target list
  const [notifications, patients] = await Promise.all([
    Notification.find()
      .populate({ path: 'userId', model: User })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    Patient.find()
      .populate({ path: 'userId', model: User })
      .sort({ name: 1 })
      .lean(),
  ]);

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Notification & Alert Center</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Broadcast clinical alerts, appointment reminders, and promotional notices directly to mobile patients.
        </p>
      </div>

      {/* Full-width Dispatched Notifications Directory with Search, Filters, CSV Export & Broadcast Modal */}
      <NotificationsDirectoryClient
        notifications={JSON.parse(JSON.stringify(notifications))}
        patients={JSON.parse(JSON.stringify(patients))}
        onBroadcast={broadcastNotificationAction}
      />
    </div>
  );
}
