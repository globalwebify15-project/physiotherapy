import React from 'react';
import { connectDB, Payment, Appointment, Patient, Service } from 'database';
import { revalidatePath } from 'next/cache';
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
    }
  }

  revalidatePath('/admin/payments');
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
        />
      </div>
    </div>
  );
}
