import React from 'react';
import { connectDB, Payment, Appointment, Patient, Service } from 'database';
import { revalidatePath } from 'next/cache';
import { 
  CreditCard, 
  Search, 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  RotateCcw,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  Receipt
} from 'lucide-react';
import ReportDownloader from '@/components/ReportDownloader';

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
    .sort({ createdAt: -1 });

  // Calculate Metrics
  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'refunded')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const successfulCount = payments.filter((p) => p.status === 'paid').length;
  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  const exportData = payments.map((pay: any) => {
    const appt = pay.appointmentId as any;
    return {
      'Transaction ID': pay.razorpayPaymentId || 'N/A',
      'Order ID': pay.razorpayOrderId || 'N/A',
      'Patient Name': appt?.patientId?.name || 'Unknown Patient',
      'Service': appt?.serviceId?.title || 'N/A',
      'Visit Type': appt?.visitType || 'clinic',
      'Amount (INR)': pay.amount,
      'Paid On': pay.createdAt ? new Date(pay.createdAt).toISOString().split('T')[0] : 'N/A',
      'Status': pay.status,
    };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 size={12} />
            Paid
          </span>
        );
      case 'refunded':
        return (
          <span className="bg-purple-50 text-purple-700 border border-purple-200/50 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <RotateCcw size={12} />
            Refunded
          </span>
        );
      case 'failed':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200/50 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle size={12} />
            Failed
          </span>
        );
      case 'pending':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200/50 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <HelpCircle size={12} />
            Pending
          </span>
        );
      default:
        return (
          <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CreditCard className="text-teal-600" size={26} />
            Payment Records & Razorpay Transactions
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Track patient transactions, gateway order IDs, and process clinical refunds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ReportDownloader filename="QuickPhysio_Payments" data={exportData} buttonText="Export Transactions" />
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <IndianRupee size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Realized Revenue</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black">
            <Receipt size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paid Bookings</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{successfulCount} Transactions</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <HelpCircle size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pay at Clinic / Pending</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{pendingCount} Orders</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
            <RotateCcw size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Refunded</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">₹{totalRefunded.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                <th className="p-4 pl-6">Transaction / Order Details</th>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Service & Visit Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Paid On</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                    <CreditCard className="mx-auto w-12 h-12 text-slate-200 mb-4" />
                    No payment records created yet.
                  </td>
                </tr>
              ) : (
                payments.map((pay: any) => {
                  const appt = pay.appointmentId as any;
                  return (
                    <tr key={pay._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800">
                        <div className="text-xs truncate max-w-[200px]" title={pay.razorpayPaymentId || pay.razorpayOrderId}>
                          {pay.razorpayPaymentId || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold tracking-wide">
                          Order: {pay.razorpayOrderId ? pay.razorpayOrderId.slice(-10) : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {appt?.patientId?.name || (
                          <span className="text-slate-400 italic">Unknown Patient</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700">
                          {appt?.serviceId?.title || 'N/A'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 uppercase ${
                          appt?.visitType === 'home' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : 'bg-teal-50 text-teal-700 border border-teal-200/60'
                        }`}>
                          {appt?.visitType || 'clinic'}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">
                        ₹{(pay.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={13} />
                          {pay.createdAt ? new Date(pay.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(pay.status)}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {pay.status === 'paid' ? (
                          <form action={processRefundAction} className="inline-block">
                            <input type="hidden" name="paymentId" value={pay._id.toString()} />
                            <input type="hidden" name="reason" value="Patient cancellation or schedule conflict" />
                            <button
                              type="submit"
                              className="text-[11px] font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/60 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                              title="Process Refund"
                            >
                              <RotateCcw size={11} />
                              <span>Refund</span>
                            </button>
                          </form>
                        ) : (
                          <span className="text-[11px] text-slate-300 font-semibold">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
