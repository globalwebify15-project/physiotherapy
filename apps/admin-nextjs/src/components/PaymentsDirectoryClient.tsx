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
  Home
} from 'lucide-react';

interface PaymentsDirectoryClientProps {
  payments: any[];
  processRefundAction: (formData: FormData) => Promise<void>;
}

export default function PaymentsDirectoryClient({
  payments,
  processRefundAction,
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
      await processRefundAction(formData);
      toast.success('Refund Processed', `Full refund of ₹${amount} issued for ${patientName}.`);
    } catch (err: any) {
      toast.error('Refund Failed', err?.message || 'Could not process refund.');
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
                          {pay.status === 'paid' ? (
                            <form
                              action={async (fd) => {
                                await handleRefundSubmit(fd, patientName, pay.amount);
                              }}
                              className="inline-block"
                            >
                              <input type="hidden" name="paymentId" value={pay._id.toString()} />
                              <button
                                type="submit"
                                onClick={(e) => {
                                  if (!confirm(`Are you sure you want to mark a full refund of ₹${pay.amount} for ${patientName}?`)) {
                                    e.preventDefault();
                                  }
                                }}
                                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <RotateCcw size={11} />
                                Refund
                              </button>
                            </form>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic">No action</span>
                          )}
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

                  {/* Footer / Refund action */}
                  {pay.status === 'paid' && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                      <form
                        action={async (fd) => {
                          await handleRefundSubmit(fd, patientName, pay.amount);
                        }}
                      >
                        <input type="hidden" name="paymentId" value={pay._id.toString()} />
                        <button
                          type="submit"
                          onClick={(e) => {
                            if (!confirm(`Are you sure you want to mark a full refund of ₹${pay.amount} for ${patientName}?`)) {
                              e.preventDefault();
                            }
                          }}
                          className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          Issue Full Refund
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
