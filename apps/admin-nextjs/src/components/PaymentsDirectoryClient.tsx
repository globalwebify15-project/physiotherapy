'use client';

import React, { useState, useMemo } from 'react';
import DirectoryToolbar from './DirectoryToolbar';
import ExportModal, { ColumnDef } from './ExportModal';
import { exportToCsv } from '@/utils/exportCsv';
import { useToast } from './ToastProvider';
import { 
  CreditCard, 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  HelpCircle, 
  IndianRupee, 
  Receipt,
  User,
  Calendar,
  Building,
  Home,
  FileText,
  Send,
  Printer,
  X,
  ShieldCheck,
  Check
} from 'lucide-react';

interface PaymentsDirectoryClientProps {
  payments: any[];
  processRefundAction: (formData: FormData) => Promise<void>;
  sendInvoiceReceiptAction?: (formData: FormData) => Promise<void>;
  markPaidAndSendReceiptAction?: (formData: FormData) => Promise<void>;
}

export default function PaymentsDirectoryClient({
  payments,
  processRefundAction,
  sendInvoiceReceiptAction,
  markPaidAndSendReceiptAction,
}: PaymentsDirectoryClientProps) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visitFilter, setVisitFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { label: 'Paid / Captured', value: 'paid' },
    { label: 'Refunded', value: 'refunded' },
    { label: 'Pending / Pay at Clinic', value: 'pending' },
    { label: 'Failed', value: 'failed' },
  ];

  const visitOptions = [
    { label: 'In-Clinic Consultations', value: 'clinic' },
    { label: 'Home Visits', value: 'home' },
  ];

  const filteredPayments = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return payments.filter((pay) => {
      const appt = pay.appointmentId as any;

      // Status filter
      if (statusFilter !== 'all' && pay.status !== statusFilter) return false;

      // Visit filter
      if (visitFilter !== 'all' && (appt?.visitType || 'clinic') !== visitFilter) return false;

      // Datewise filter
      if (dateFilter !== 'all') {
        const payDate = pay.createdAt ? new Date(pay.createdAt).toISOString().slice(0, 10) : '';
        if (dateFilter === 'today' && payDate !== todayStr) return false;
        if (dateFilter === 'yesterday') {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          if (payDate !== y.toISOString().slice(0, 10)) return false;
        }
        if (dateFilter === 'last7') {
          const past7 = new Date();
          past7.setDate(past7.getDate() - 7);
          const past7Str = past7.toISOString().slice(0, 10);
          if (payDate < past7Str || payDate > todayStr) return false;
        }
        if (dateFilter === 'thisMonth') {
          if (!payDate.startsWith(todayStr.slice(0, 7))) return false;
        }
        if (dateFilter === 'custom') {
          if (customStart && payDate < customStart) return false;
          if (customEnd && payDate > customEnd) return false;
        }
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const txId = (pay.razorpayPaymentId || '').toLowerCase();
        const orderId = (pay.razorpayOrderId || '').toLowerCase();
        const pName = (appt?.patientId?.name || '').toLowerCase();
        const sTitle = (appt?.serviceId?.title || '').toLowerCase();
        const amt = (pay.amount || '').toString();

        if (
          !txId.includes(q) &&
          !orderId.includes(q) &&
          !pName.includes(q) &&
          !sTitle.includes(q) &&
          !amt.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [payments, search, statusFilter, visitFilter, dateFilter, customStart, customEnd]);

  const handleExport = () => {
    const exportRows = filteredPayments.map((pay) => {
      const appt = pay.appointmentId as any;
      return {
        'Transaction ID': pay.razorpayPaymentId || 'N/A',
        'Order ID': pay.razorpayOrderId || 'N/A',
        'Patient Name': appt?.patientId?.name || 'Unknown Patient',
        'Service': appt?.serviceId?.title || 'General Consultation',
        'Visit Type': (appt?.visitType || 'clinic').toUpperCase(),
        'Amount (INR)': pay.amount,
        'Paid On': pay.createdAt ? new Date(pay.createdAt).toISOString().split('T')[0] : 'N/A',
        'Status': pay.status.toUpperCase(),
      };
    });

    exportToCsv(`Payments_Directory`, exportRows);
    toast.success('Export Complete', `Downloaded ${exportRows.length} payment records.`);
  };

  const exportColumns: ColumnDef[] = [
    { key: 'txId', label: 'Transaction ID', accessor: (p) => p.razorpayPaymentId || 'N/A' },
    { key: 'orderId', label: 'Order ID', accessor: (p) => p.razorpayOrderId || 'N/A' },
    { key: 'patient', label: 'Patient Name', accessor: (p) => (p.appointmentId as any)?.patientId?.name || 'Unknown Patient' },
    { key: 'service', label: 'Service / Treatment', accessor: (p) => (p.appointmentId as any)?.serviceId?.title || 'General Consultation' },
    { key: 'visitType', label: 'Visit Type', accessor: (p) => ((p.appointmentId as any)?.visitType || 'clinic').toUpperCase() },
    { key: 'amount', label: 'Amount (INR)', accessor: (p) => p.amount },
    { key: 'paidOn', label: 'Paid Date', accessor: (p) => p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : 'N/A' },
    { key: 'status', label: 'Payment Status', accessor: (p) => p.status.toUpperCase() },
  ];

  const handleRefundSubmit = async (formData: FormData, patientName: string, amount: number) => {
    try {
      setIsSubmitting(true);
      await processRefundAction(formData);
      toast.success('Refund Processed', `Full refund of ₹${amount} issued for ${patientName}.`);
    } catch (err: any) {
      toast.error('Refund Failed', err?.message || 'Could not process refund.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReceipt = async (paymentId: string, patientName: string, amount: number) => {
    if (!sendInvoiceReceiptAction) return;
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append('paymentId', paymentId);
      await sendInvoiceReceiptAction(fd);
      toast.success('Receipt Dispatched', `Official clinical invoice (₹${amount}) sent to ${patientName} via Push Notification.`);
    } catch (err: any) {
      toast.error('Dispatch Failed', err?.message || 'Could not send invoice receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkPaid = async (paymentId: string, patientName: string, amount: number, mode = 'Cash / UPI') => {
    if (!markPaidAndSendReceiptAction) return;
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append('paymentId', paymentId);
      fd.append('paymentMode', mode);
      await markPaidAndSendReceiptAction(fd);
      toast.success('Payment Received', `Marked ₹${amount} as collected from ${patientName}. Receipt generated!`);
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Could not mark payment as received.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
            <CheckCircle2 size={11} />
            Paid
          </span>
        );
      case 'refunded':
        return (
          <span className="bg-purple-50 text-purple-700 border border-purple-200/60 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
            <RotateCcw size={11} />
            Refunded
          </span>
        );
      case 'failed':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
            <XCircle size={11} />
            Failed
          </span>
        );
      case 'pending':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
            <HelpCircle size={11} />
            Pending
          </span>
        );
      default:
        return (
          <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search, Date Filter, Status & Visit Filter, and Export Toolbar */}
      <DirectoryToolbar
        label="Payments & Invoices"
        totalCount={payments.length}
        filteredCount={filteredPayments.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by transaction ID, order ID, patient, service..."
        showDateFilter={true}
        dateFilterValue={dateFilter}
        onDateFilterChange={setDateFilter}
        customStartDate={customStart}
        onCustomStartDateChange={setCustomStart}
        customEndDate={customEnd}
        onCustomEndDateChange={setCustomEnd}
        filterOptions={statusOptions}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterLabel="Status"
        secondaryFilterOptions={visitOptions}
        secondaryFilterValue={visitFilter}
        onSecondaryFilterChange={setVisitFilter}
        secondaryFilterLabel="Visit Type"
        onExport={handleExport}
        onCustomExport={() => setIsExportModalOpen(true)}
        showViewToggle={true}
        view={view}
        onViewChange={setView}
      />

      {/* Custom Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Payments CSV with Custom Date & Column Filter"
        data={payments}
        dateField="createdAt"
        availableColumns={exportColumns}
        filename="Payments_Report"
      />

      {/* Directory Content */}
      {view === 'table' ? (
        filteredPayments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
            <CreditCard className="mx-auto text-slate-300 w-12 h-12 mb-4" />
            <h3 className="font-bold text-slate-800 text-lg">No payment records found</h3>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search query, dates, or status filter.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Transaction / Order Details</th>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Service & Visit Type</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Paid On</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPayments.map((pay: any) => {
                    const appt = pay.appointmentId as any;
                    const patientName = appt?.patientId?.name || 'this patient';

                    return (
                      <tr key={pay._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-800 font-bold text-xs">
                            {pay.razorpayPaymentId || 'N/A (Pending)'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Order: {pay.razorpayOrderId || 'Manual / Direct'}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <User size={13} className="text-teal-600" />
                            <span>{appt?.patientId?.name || 'Unknown Patient'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">
                            {appt?.serviceId?.title || 'General Consultation'}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            {appt?.visitType === 'home' ? (
                              <span className="flex items-center gap-0.5 text-blue-600 font-bold">
                                <Home size={10} /> Home Visit
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-teal-600 font-bold">
                                <Building size={10} /> In-Clinic
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 text-sm">
                            ₹{pay.amount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {pay.createdAt ? new Date(pay.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          {renderStatusBadge(pay.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* View / Print Invoice */}
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(pay)}
                              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                              title="Preview Official Clinical Invoice"
                            >
                              <FileText size={11} className="text-teal-600" />
                              Invoice
                            </button>

                            {/* If Paid: Option to Send Receipt via Push Alert */}
                            {pay.status === 'paid' && (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleSendReceipt(pay._id.toString(), patientName, pay.amount)}
                                className={`${
                                  pay.receiptSent
                                    ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700'
                                    : 'bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700'
                                } text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50`}
                                title={pay.receiptSent ? 'Receipt already sent. Click to resend.' : 'Send push notification with invoice to patient'}
                              >
                                {pay.receiptSent ? <Check size={11} className="text-emerald-600" /> : <Send size={11} />}
                                {pay.receiptSent ? 'Resend' : 'Send'}
                              </button>
                            )}

                            {/* If Pending (Pay at Clinic / Home): Mark Received & Confirm */}
                            {pay.status === 'pending' && (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                  if (confirm(`Confirm receipt of ₹${pay.amount} for ${patientName}? This will confirm the appointment and issue an official invoice receipt.`)) {
                                    handleMarkPaid(pay._id.toString(), patientName, pay.amount, appt?.visitType === 'home' ? 'Home Cash / UPI' : 'Clinic Desk Cash / UPI');
                                  }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 size={11} />
                                Receive ₹{pay.amount}
                              </button>
                            )}

                            {/* Refund Button for Paid Payments */}
                            {pay.status === 'paid' && (
                              <form
                                action={async (fd) => {
                                  await handleRefundSubmit(fd, patientName, pay.amount);
                                }}
                                className="inline-block"
                              >
                                <input type="hidden" name="paymentId" value={pay._id.toString()} />
                                <button
                                  type="submit"
                                  disabled={isSubmitting}
                                  onClick={(e) => {
                                    if (!confirm(`Are you sure you want to mark a full refund of ₹${pay.amount} for ${patientName}?`)) {
                                      e.preventDefault();
                                    }
                                  }}
                                  className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  <RotateCcw size={11} />
                                  Refund
                                </button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Cards View */
        filteredPayments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
            <CreditCard className="mx-auto text-slate-300 w-12 h-12 mb-4" />
            <h3 className="font-bold text-slate-800 text-lg">No payment records found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPayments.map((pay: any) => {
              const appt = pay.appointmentId as any;
              const patientName = appt?.patientId?.name || 'this patient';

              return (
                <div 
                  key={pay._id}
                  className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transaction ID</span>
                        <h4 className="font-mono text-slate-800 font-bold text-xs truncate max-w-[180px]">
                          {pay.razorpayPaymentId || 'Pending'}
                        </h4>
                      </div>
                      {renderStatusBadge(pay.status)}
                    </div>

                    {/* Patient & Service */}
                    <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Patient:</span>
                        <strong className="text-slate-800">{appt?.patientId?.name || 'Unknown Patient'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Treatment:</span>
                        <span className="text-teal-700 font-bold truncate max-w-[160px]">{appt?.serviceId?.title || 'General Consultation'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Visit Type:</span>
                        <span className="font-semibold text-slate-700 capitalize">{appt?.visitType || 'clinic'}</span>
                      </div>
                    </div>

                    {/* Amount & Date */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Total Paid</span>
                        <span className="text-xl font-extrabold text-slate-900">₹{pay.amount}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-medium block">Date</span>
                        <span className="text-xs font-semibold text-slate-600">
                          {pay.createdAt ? new Date(pay.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(pay)}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText size={13} className="text-teal-600" />
                      View Invoice
                    </button>

                    <div className="flex items-center gap-2">
                      {pay.status === 'paid' && (
                        <>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleSendReceipt(pay._id.toString(), patientName, pay.amount)}
                            className={`${
                              pay.receiptSent
                                ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700'
                                : 'bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700'
                            } text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50`}
                          >
                            {pay.receiptSent ? <Check size={13} className="text-emerald-600" /> : <Send size={13} />}
                            {pay.receiptSent ? 'Receipt Sent' : 'Send Push Receipt'}
                          </button>

                          <form
                            action={async (fd) => {
                              await handleRefundSubmit(fd, patientName, pay.amount);
                            }}
                          >
                            <input type="hidden" name="paymentId" value={pay._id.toString()} />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              onClick={(e) => {
                                if (!confirm(`Are you sure you want to mark a full refund of ₹${pay.amount} for ${patientName}?`)) {
                                  e.preventDefault();
                                }
                              }}
                              className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw size={13} />
                              Refund
                            </button>
                          </form>
                        </>
                      )}

                      {pay.status === 'pending' && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            if (confirm(`Confirm receipt of ₹${pay.amount} for ${patientName}? This will confirm appointment and issue invoice receipt.`)) {
                              handleMarkPaid(pay._id.toString(), patientName, pay.amount, appt?.visitType === 'home' ? 'Home Cash / UPI' : 'Clinic Desk Cash / UPI');
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 size={13} />
                          Receive & Confirm ₹{pay.amount}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Official Clinical Invoice & Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-6">
            {/* Modal Actions Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="text-teal-400" size={20} />
                <span className="font-bold text-sm">Official Clinical Tax Invoice & Receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer size={13} />
                  Print / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="p-8 space-y-6 text-slate-800" id="printable-invoice">
              {/* Clinic Letterhead */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-sm">QP</span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Dr. Bariyar's Physiotherapy & Rehabilitation Center</h2>
                  </div>
                  <p className="text-xs text-teal-700 font-bold mt-1">
                    MIAP Certified • JSCPT Registered • Government Recognized Center
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ashok Nagar Rd No 1, opp. Overhead Water Tank, Ranchi, Jharkhand 834002
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Helpline: +91 91109 12544 | Email: contact@QuickPhysio24.com
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-xs font-black uppercase tracking-wider">
                    {selectedInvoice.status === 'paid' ? 'Paid & Verified' : selectedInvoice.status.toUpperCase()}
                  </span>
                  <div className="mt-2 text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Invoice No.</div>
                    <div className="font-mono text-sm font-extrabold text-slate-900">
                      INV-{selectedInvoice._id.toString().slice(-6).toUpperCase()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Date</div>
                    <div className="text-xs font-semibold text-slate-700">
                      {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient & Booking Details */}
              {(() => {
                const invAppt = selectedInvoice.appointmentId as any;
                const invPatient = invAppt?.patientId;
                const invService = invAppt?.serviceId;
                const invTherapist = invAppt?.therapistId;

                return (
                  <>
                    <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billed To (Patient)</span>
                        <div className="font-extrabold text-slate-900 text-sm mt-0.5">{invPatient?.name || 'Registered Patient'}</div>
                        <div className="text-slate-600 mt-0.5">Mobile: {invPatient?.mobile || invAppt?.mobile || 'N/A'}</div>
                        <div className="text-slate-500 mt-0.5">
                          {invAppt?.visitType === 'home'
                            ? `Home Address: ${invAppt?.address || 'Provided upon visit'}`
                            : 'Visit: In-Clinic Consultation (Ashok Nagar)'}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Details</span>
                        <div className="font-bold text-slate-800 mt-0.5">Assigned Specialist: {invTherapist?.name || 'Dr. Rajnish Bariyar'}</div>
                        <div className="text-slate-600 mt-0.5">Appointment Date: {invAppt?.date || 'N/A'} ({invAppt?.timeSlot || '10:00 AM'})</div>
                        <div className="text-slate-600 mt-0.5">Razorpay Order ID: <span className="font-mono">{selectedInvoice.razorpayOrderId || 'N/A'}</span></div>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-4">Treatment / Service</th>
                            <th className="py-2.5 px-4">Session Type</th>
                            <th className="py-2.5 px-4">Duration</th>
                            <th className="py-2.5 px-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-3 px-4 font-bold text-slate-800">
                              {invService?.title || 'Physiotherapy Consultation & Rehabilitation'}
                            </td>
                            <td className="py-3 px-4 text-slate-600 capitalize">
                              {invAppt?.visitType === 'home' ? 'Home Visit' : 'Clinic Visit'}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              45-60 Mins
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900">
                              ₹{selectedInvoice.amount}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Totals & Signature */}
                    <div className="flex items-end justify-between pt-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <ShieldCheck size={16} />
                          <span>Computer Generated Official Digital Receipt</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          This receipt is official confirmation of clinical treatment fees received.
                        </p>
                      </div>

                      <div className="w-56 space-y-1.5 text-xs text-right">
                        <div className="flex justify-between text-slate-500">
                          <span>Subtotal:</span>
                          <span>₹{selectedInvoice.amount}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Tax / GST:</span>
                          <span>₹0 (Healthcare Exempt)</span>
                        </div>
                        <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                          <span>Total Paid:</span>
                          <span className="text-teal-700">₹{selectedInvoice.amount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action inside Modal */}
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700 transition"
                      >
                        Close Preview
                      </button>

                      {selectedInvoice.status === 'paid' && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={async () => {
                            await handleSendReceipt(
                              selectedInvoice._id.toString(),
                              invPatient?.name || 'Patient',
                              selectedInvoice.amount
                            );
                            setSelectedInvoice(null);
                          }}
                          className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                        >
                          <Send size={13} />
                          Send Push Alert with Invoice to Patient
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
