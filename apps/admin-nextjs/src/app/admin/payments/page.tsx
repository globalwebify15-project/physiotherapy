import React from 'react';
import { connectDB, Payment, Appointment, Patient, Service } from 'database';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/utils/notifications';
import { sendPaymentInvoiceEmail, sendBookingConfirmationEmails } from '@/utils/mailer';
import { 
  CreditCard, 
  IndianRupee, 
  Receipt,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import PaymentsDirectoryClient from '@/components/PaymentsDirectoryClient';

export const revalidate = 0; // Dynamic fetch

// Server Action: Process or Record a Refund
async function processRefundAction(formData: FormData) {
  'use server';
  const paymentId = formData.get('paymentId') as string;
  const reason = (formData.get('reason') as string) || 'Patient requested refund';

  if (!paymentId) return;

  await connectDB();
  const payment = await Payment.findById(paymentId);
  if (!payment) return;

  payment.status = 'refunded';
  if (!payment.history) payment.history = [];
  payment.history.push({
    status: 'refunded',
    note: `Refund marked: ${reason}`,
    timestamp: new Date(),
  });

  await payment.save();

  // If appointment exists, update timeline
  if (payment.appointmentId) {
    const appt = await Appointment.findById(payment.appointmentId);
    if (appt) {
      if (!appt.statusTimeline) appt.statusTimeline = [];
      appt.statusTimeline.push({
        status: appt.status,
        note: `Payment refunded (₹${payment.amount}). Reason: ${reason}`,
        timestamp: new Date(),
      });
      await appt.save();

      // Notify patient of processed refund
      try {
        const patient = await Patient.findById(appt.patientId);
        if (patient?.userId) {
          await createNotification(
            patient.userId,
            `Refund Processed (₹${payment.amount})`,
            `A refund of ₹${payment.amount} has been approved and issued to your original payment method.`,
            'payment_alert',
            { paymentId: payment._id.toString(), appointmentId: appt._id.toString() }
          );
        }
      } catch (err) {
        console.error('Notification error on refund:', err);
      }
    }
  }

  revalidatePath('/admin/payments');
  revalidatePath('/admin/appointments');
}

// Server Action: Send Official Invoice & Clinical Receipt to Patient
async function sendInvoiceReceiptAction(formData: FormData) {
  'use server';
  const paymentId = formData.get('paymentId') as string;
  if (!paymentId) return;

  await connectDB();
  const payment = await Payment.findById(paymentId).populate({
    path: 'appointmentId',
    model: Appointment,
    populate: [
      { path: 'patientId', model: Patient },
      { path: 'serviceId', model: Service }
    ]
  });

  if (!payment) return;

  const appt = payment.appointmentId as any;
  const patient = appt?.patientId;
  const service = appt?.serviceId;
  const serviceTitle = service?.title || 'Physiotherapy Consultation';
  const amount = payment.amount || 0;
  const invoiceNo = `INV-${payment._id.toString().slice(-6).toUpperCase()}`;

  payment.receiptSent = true;
  payment.receiptSentAt = new Date();
  if (!payment.history) payment.history = [];
  payment.history.push({
    status: payment.status,
    note: `Official receipt ${invoiceNo} generated & sent to patient.`,
    timestamp: new Date(),
  });
  await payment.save();

  if (patient?.userId) {
    try {
      await createNotification(
        patient.userId,
        `Official Receipt Issued (₹${amount})`,
        `Your clinical payment receipt for ${serviceTitle} has been verified and issued. Tap to view and save in the mobile app.`,
        'payment_alert',
        {
          paymentId: payment._id.toString(),
          appointmentId: appt?._id?.toString(),
          invoiceNo,
          amount,
          serviceTitle,
          date: new Date().toISOString(),
        }
      );
    } catch (err) {
      console.error('Error dispatching receipt notification:', err);
    }
  }

  // Automated Email Invoicing to Patient + Multi-Recipient Management List
  try {
    await sendPaymentInvoiceEmail({
      payment,
      appointment: appt,
      patient,
      therapist: appt?.therapistId,
      service,
    });
  } catch (emailErr) {
    console.warn('[Admin Receipt Email Error]:', emailErr);
  }

  revalidatePath('/admin/payments');
  revalidatePath('/admin/appointments');
}

// Server Action: Mark In-Person Payment Paid & Send Receipt (Pay at Clinic / Home)
async function markPaidAndSendReceiptAction(formData: FormData) {
  'use server';
  const paymentId = formData.get('paymentId') as string;
  const paymentMode = (formData.get('paymentMode') as string) || 'Cash / In-person UPI';
  if (!paymentId) return;

  await connectDB();
  const payment = await Payment.findById(paymentId).populate({
    path: 'appointmentId',
    model: Appointment,
    populate: [
      { path: 'patientId', model: Patient },
      { path: 'serviceId', model: Service }
    ]
  });

  if (!payment) return;

  payment.status = 'paid';
  payment.receiptSent = true;
  payment.receiptSentAt = new Date();
  const invoiceNo = `INV-${payment._id.toString().slice(-6).toUpperCase()}`;

  if (!payment.history) payment.history = [];
  payment.history.push({
    status: 'paid',
    note: `In-person payment received via ${paymentMode}. Receipt ${invoiceNo} issued.`,
    timestamp: new Date(),
  });
  await payment.save();

  const appt = payment.appointmentId as any;
  if (appt?._id) {
    const appointmentDoc = await Appointment.findById(appt._id);
    if (appointmentDoc) {
      if (appointmentDoc.status === 'pending') {
        appointmentDoc.status = 'confirmed';
      }
      if (!appointmentDoc.statusTimeline) appointmentDoc.statusTimeline = [];
      appointmentDoc.statusTimeline.push({
        status: appointmentDoc.status,
        note: `In-person payment (₹${payment.amount}) collected & verified by Admin.`,
        timestamp: new Date(),
      });
      await appointmentDoc.save();
    }
  }

  const patient = appt?.patientId;
  const service = appt?.serviceId;
  const serviceTitle = service?.title || 'Physiotherapy Consultation';
  const amount = payment.amount || 0;

  if (patient?.userId) {
    try {
      await createNotification(
        patient.userId,
        `Payment Received & Confirmed (₹${amount})`,
        `Payment of ₹${amount} received (${paymentMode}). Your appointment is confirmed and official receipt has been issued!`,
        'payment_alert',
        {
          paymentId: payment._id.toString(),
          appointmentId: appt?._id?.toString(),
          invoiceNo,
          amount,
          serviceTitle,
          date: new Date().toISOString(),
        }
      );
    } catch (err) {
      console.error('Error dispatching payment received alert:', err);
    }
  }

  // Automated Email Invoicing & Confirmation to Patient + Doctor + Management List
  try {
    await Promise.all([
      sendPaymentInvoiceEmail({
        payment,
        appointment: appt,
        patient,
        therapist: appt?.therapistId,
        service,
      }),
      sendBookingConfirmationEmails({
        appointment: appt,
        patient,
        therapist: appt?.therapistId,
        service,
        customNote: `In-person payment of ₹${payment.amount} confirmed via ${paymentMode}.`,
      }),
    ]);
  } catch (emailErr) {
    console.warn('[Admin Mark Paid Email Error]:', emailErr);
  }

  revalidatePath('/admin/payments');
  revalidatePath('/admin/appointments');
}

export default async function PaymentsPage() {
  await connectDB();

  // Fetch payments and populate appointment information (with patient and service)
  const payments = await Payment.find()
    .populate({
      path: 'appointmentId',
      model: Appointment,
      populate: [
        { path: 'patientId', model: Patient },
        { path: 'serviceId', model: Service }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();

  // Calculate Metrics
  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'refunded')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const successfulCount = payments.filter((p) => p.status === 'paid').length;
  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <CreditCard className="text-teal-600" size={26} />
          Payment Records & Razorpay Transactions
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Track patient transactions, gateway order IDs, and process clinical refunds.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <IndianRupee size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Realized Revenue</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black">
            <Receipt size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Bookings</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{successfulCount} Transactions</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <HelpCircle size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pay at Clinic / Pending</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{pendingCount} Orders</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
            <RotateCcw size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Refunded</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">₹{totalRefunded.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Full-width Payments Directory Client with Live Search, Status & Visit Filter, and CSV Export */}
      <div className="w-full">
        <PaymentsDirectoryClient
          payments={JSON.parse(JSON.stringify(payments))}
          processRefundAction={processRefundAction}
          sendInvoiceReceiptAction={sendInvoiceReceiptAction}
          markPaidAndSendReceiptAction={markPaidAndSendReceiptAction}
        />
      </div>
    </div>
  );
}
