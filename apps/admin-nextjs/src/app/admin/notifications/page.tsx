import React from 'react';
import { connectDB, Notification, User, Patient, CMS } from 'database';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/utils/notifications';
import { getAdminSession } from '@/utils/auth';
import { getSmtpConfig, getNotificationRecipients } from '@/utils/mailer';
import NotificationsCenterManager from '@/components/NotificationsCenterManager';

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

// Server Action to update SMTP configuration (Super Admin & Admin only)
async function saveSmtpSettingsAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  'use server';
  const session = await getAdminSession();
  if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
    return { success: false, message: 'Unauthorized: Only Super Admin and Admin can update SMTP settings.' };
  }

  const host = (formData.get('host') as string)?.trim();
  const port = Number(formData.get('port')) || 587;
  const secure = formData.get('secure') === 'true';
  const user = (formData.get('user') as string)?.trim();
  const pass = (formData.get('pass') as string)?.trim();
  const senderName = (formData.get('senderName') as string)?.trim() || 'QuickPhysio24.com';
  const senderEmail = (formData.get('senderEmail') as string)?.trim() || user;
  const isEnabled = formData.get('isEnabled') === 'true';

  await connectDB();
  await CMS.findOneAndUpdate(
    { key: 'smtp_settings' },
    {
      key: 'smtp_settings',
      content: { host, port, secure, user, pass, senderName, senderEmail, isEnabled },
    },
    { upsert: true, new: true }
  );

  revalidatePath('/admin/notifications');
  revalidatePath('/admin/cms');
  return { success: true, message: 'SMTP settings updated successfully.' };
}

// Server Action to update Multi-Recipient Rules (Super Admin & Admin only)
async function saveNotificationRecipientsAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  'use server';
  const session = await getAdminSession();
  if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
    return { success: false, message: 'Unauthorized: Only Super Admin and Admin can update notification rules.' };
  }

  const rawEmails = (formData.get('clinicAlertEmails') as string) || '';
  const rawPhones = (formData.get('clinicAlertPhones') as string) || '';

  const clinicAlertEmails = rawEmails
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.includes('@'));

  const clinicAlertPhones = rawPhones
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const sendToPatientEmail = formData.get('sendToPatientEmail') === 'true';
  const sendToDoctorEmail = formData.get('sendToDoctorEmail') === 'true';
  const sendToClinicAdmin = formData.get('sendToClinicAdmin') === 'true';
  const sendToPatientSms = formData.get('sendToPatientSms') === 'true';
  const autoSendInvoiceOnPayment = formData.get('autoSendInvoiceOnPayment') === 'true';

  await connectDB();
  await CMS.findOneAndUpdate(
    { key: 'notification_recipients' },
    {
      key: 'notification_recipients',
      content: {
        clinicAlertEmails,
        clinicAlertPhones,
        sendToPatientEmail,
        sendToDoctorEmail,
        sendToClinicAdmin,
        sendToPatientSms,
        autoSendInvoiceOnPayment,
      },
    },
    { upsert: true, new: true }
  );

  revalidatePath('/admin/notifications');
  revalidatePath('/admin/cms');
  return { success: true, message: 'Notification recipient targets & rules saved.' };
}

export default async function NotificationsPage() {
  await connectDB();

  const [notifications, patients, smtpConfig, recipientsConfig, session] = await Promise.all([
    Notification.find()
      .populate({ path: 'userId', model: User })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    Patient.find()
      .populate({ path: 'userId', model: User })
      .sort({ name: 1 })
      .lean(),
    getSmtpConfig(),
    getNotificationRecipients(),
    getAdminSession(),
  ]);

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <NotificationsCenterManager
        notifications={JSON.parse(JSON.stringify(notifications))}
        patients={JSON.parse(JSON.stringify(patients))}
        smtpConfig={JSON.parse(JSON.stringify(smtpConfig))}
        recipientsConfig={JSON.parse(JSON.stringify(recipientsConfig))}
        userRole={session?.role}
        onBroadcast={broadcastNotificationAction}
        onSaveSmtp={saveSmtpSettingsAction}
        onSaveRecipients={saveNotificationRecipientsAction}
      />
    </div>
  );
}
