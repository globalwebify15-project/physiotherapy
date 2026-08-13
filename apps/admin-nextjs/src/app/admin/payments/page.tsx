import React from 'react';
import { connectDB, Payment, Appointment, Patient, Service } from 'database';
import { 
  CreditCard, 
  Search, 
  Download, 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  HelpCircle 
} from 'lucide-react';

export const revalidate = 0; // Dynamic fetch

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 size={12} />
            Paid
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payment Transactions</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Track patient transactions, Razorpay order states, and verify capture statistics.
          </p>
        </div>
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 self-start sm:self-auto shadow-md shadow-indigo-100 transition-colors"
          title="Export CSV logs to local desktop"
        >
          <Download size={16} />
          Export Ledger (CSV)
        </button>
      </div>

      {/* Main Table view */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction Ledger</span>
          <span className="text-xs font-bold text-slate-500 bg-slate-150 px-2.5 py-1 rounded-lg border border-slate-200/30">
            {payments.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/10">
                <th className="p-4">Txn/Order ID</th>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Treatment</th>
                <th className="p-4">Amt</th>
                <th className="p-4">Paid On</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-600">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                    <CreditCard className="mx-auto w-12 h-12 text-slate-200 mb-4" />
                    No payments record created yet.
                  </td>
                </tr>
              ) : (
                payments.map((pay: any) => {
                  const appt = pay.appointmentId as any;
                  return (
                    <tr key={pay._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">
                        <div className="text-sm truncate max-w-[200px]" title={pay.razorpayPaymentId || pay.razorpayOrderId}>
                          {pay.razorpayPaymentId || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Order: {pay.razorpayOrderId.slice(-8)}
                        </div>
                      </td>
                      <td className="p-4">
                        {appt?.patientId?.name || (
                          <span className="text-slate-400 italic">Unknown Patient</span>
                        )}
                      </td>
                      <td className="p-4">
                        {appt?.serviceId?.title || (
                          <span className="text-slate-400 italic">N/A</span>
                        )}
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded ml-2 uppercase">
                          {appt?.visitType}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        ₹{pay.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-slate-400 font-semibold text-xs">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={12} />
                          {pay.createdAt.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(pay.status)}
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
