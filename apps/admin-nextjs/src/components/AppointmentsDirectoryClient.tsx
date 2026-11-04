'use client';

import React, { useState, useMemo } from 'react';
import DirectoryToolbar from './DirectoryToolbar';
import ExportModal, { ColumnDef } from './ExportModal';
import { exportToCsv } from '@/utils/exportCsv';
import { useToast } from './ToastProvider';
import { Calendar, User, Briefcase, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

interface AppointmentsDirectoryClientProps {
  appointments: any[];
  therapists: any[];
  updateAppointment: (formData: FormData) => Promise<void>;
}

export default function AppointmentsDirectoryClient({
  appointments,
  therapists,
  updateAppointment,
}: AppointmentsDirectoryClientProps) {
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
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const visitOptions = [
    { label: 'In-Clinic Consultations', value: 'clinic' },
    { label: 'Home Visits', value: 'home' },
  ];

  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return appointments.filter((appt) => {
      // Status filter
      if (statusFilter !== 'all' && appt.status !== statusFilter) return false;

      // Visit filter
      if (visitFilter !== 'all' && appt.visitType !== visitFilter) return false;

      // Datewise filter
      if (dateFilter !== 'all') {
        const apptDate = appt.date || '';
        if (dateFilter === 'today' && apptDate !== todayStr) return false;
        if (dateFilter === 'yesterday') {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          if (apptDate !== y.toISOString().slice(0, 10)) return false;
        }
        if (dateFilter === 'last7') {
          const past7 = new Date();
          past7.setDate(past7.getDate() - 7);
          const past7Str = past7.toISOString().slice(0, 10);
          if (apptDate < past7Str || apptDate > todayStr) return false;
        }
        if (dateFilter === 'thisMonth') {
          if (!apptDate.startsWith(todayStr.slice(0, 7))) return false;
        }
        if (dateFilter === 'custom') {
          if (customStart && apptDate < customStart) return false;
          if (customEnd && apptDate > customEnd) return false;
        }
      }

      // Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const pName = (appt.patientId?.name || '').toLowerCase();
        const sTitle = (appt.serviceId?.title || '').toLowerCase();
        const tName = (appt.therapistId?.name || '').toLowerCase();
        const idMatch = (appt._id || '').toLowerCase().includes(q);
        const dateMatch = (appt.date || '').toLowerCase().includes(q);
        const slotMatch = (appt.timeSlot || '').toLowerCase().includes(q);
        const addrMatch = (appt.address || '').toLowerCase().includes(q);
        if (
          !pName.includes(q) &&
          !sTitle.includes(q) &&
          !tName.includes(q) &&
          !idMatch &&
          !dateMatch &&
          !slotMatch &&
          !addrMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, search, statusFilter, visitFilter, dateFilter, customStart, customEnd]);

  // Quick export
  const handleExport = () => {
    const exportRows = filteredAppointments.map((a) => ({
      'Reference ID': a._id?.slice(-6) || 'N/A',
      'Visit Type': (a.visitType || 'clinic').toUpperCase(),
      'Patient Name': a.patientId?.name || 'Unknown Patient',
      'Service': a.serviceId?.title || 'General Physiotherapy',
      'Date': a.date || 'N/A',
      'Time Slot': a.timeSlot || 'N/A',
      'Assigned Therapist': a.therapistId?.name || 'Unassigned',
      'Address': a.visitType === 'home' ? (a.address || 'N/A') : 'Clinic',
      'Status': a.status || 'pending',
    }));
    exportToCsv('Appointments_Directory', exportRows);
    toast.success('Export Complete', `Downloaded ${exportRows.length} appointments.`);
  };

  // Export Modal column definitions
  const exportColumns: ColumnDef[] = [
    { key: 'refId', label: 'Reference ID', accessor: (a) => a._id?.slice(-6) || 'N/A' },
    { key: 'patient', label: 'Patient Name', accessor: (a) => a.patientId?.name || 'Unknown Patient' },
    { key: 'service', label: 'Service', accessor: (a) => a.serviceId?.title || 'General Physiotherapy' },
    { key: 'therapist', label: 'Assigned Therapist', accessor: (a) => a.therapistId?.name || 'Unassigned' },
    { key: 'visitType', label: 'Visit Type', accessor: (a) => (a.visitType || 'clinic').toUpperCase() },
    { key: 'date', label: 'Appointment Date', accessor: (a) => a.date || 'N/A' },
    { key: 'timeSlot', label: 'Time Slot', accessor: (a) => a.timeSlot || 'N/A' },
    { key: 'address', label: 'Address / Location', accessor: (a) => a.visitType === 'home' ? (a.address || 'N/A') : 'In-Clinic' },
    { key: 'status', label: 'Status', accessor: (a) => (a.status || 'pending').toUpperCase() },
  ];

  const handleActionSubmit = async (formData: FormData, successMsg: string) => {
    try {
      await updateAppointment(formData);
      toast.success('Appointment Updated', successMsg);
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Could not update appointment.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'assigned':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search, Date Filter, Status & Visit Filters, and Export Toolbar */}
      <DirectoryToolbar
        label="Appointments Directory"
        totalCount={appointments.length}
        filteredCount={filteredAppointments.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by patient name, phone, service, date, or ref ID..."
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
        title="Export Appointments CSV with Custom Date & Column Filter"
        data={appointments}
        dateField="date"
        availableColumns={exportColumns}
        filename="Appointments_Report"
      />

      {/* Directory Content */}
      {filteredAppointments.length === 0 ? (
        <div className="w-full bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center">
          <Calendar className="mx-auto text-slate-300 w-12 h-12 mb-4" />
          <h3 className="font-bold text-slate-800 text-lg">No matching appointments found</h3>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria, dates, or filter status.</p>
        </div>
      ) : view === 'table' ? (
        /* Table View */
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Visit & Ref</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Assigned Therapist</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredAppointments.map((appt: any) => {
                  const patient = appt.patientId;
                  const service = appt.serviceId;
                  const therapist = appt.therapistId;
                  const isHomeVisit = appt.visitType === 'home';

                  return (
                    <tr key={appt._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isHomeVisit ? 'bg-blue-500' : 'bg-teal-500'
                            }`}
                          />
                          <span className="font-bold text-slate-800 uppercase text-[11px]">
                            {appt.visitType || 'clinic'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          #{appt._id.slice(-6)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{patient?.name || 'Walk-in Patient'}</div>
                        <div className="text-[10px] text-slate-400">{patient?.gender || 'N/A'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{service?.title || 'General Physio'}</div>
                        <div className="text-[10px] text-slate-400 font-medium">₹{appt.fee || service?.pricingClinic || 0}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{appt.date}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{appt.timeSlot}</div>
                      </td>

                      <td className="py-3 px-4">
                        <form
                          action={async (fd) => {
                            await handleActionSubmit(fd, 'Assigned therapist successfully.');
                          }}
                          className="flex items-center gap-1.5"
                        >
                          <input type="hidden" name="appointmentId" value={appt._id} />
                          <select
                            name="therapistId"
                            defaultValue={therapist?._id || ''}
                            className="bg-slate-50 border border-slate-200/90 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-teal-500 w-full"
                          >
                            <option value="">-- Assign Doctor --</option>
                            {therapists.map((t: any) => (
                              <option key={t._id} value={t._id}>
                                Dr. {t.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            title="Save Assignment"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold px-2 py-1 rounded-md transition-colors shrink-0 cursor-pointer"
                          >
                            Assign
                          </button>
                        </form>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wide inline-block ${getStatusStyle(
                            appt.status
                          )}`}
                        >
                          {appt.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {appt.status === 'pending' && (
                            <form
                              action={async (fd) => {
                                await handleActionSubmit(fd, 'Appointment confirmed.');
                              }}
                            >
                              <input type="hidden" name="appointmentId" value={appt._id} />
                              <input type="hidden" name="status" value="confirmed" />
                              <button
                                type="submit"
                                title="Confirm Appointment"
                                className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/60 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <CheckCircle size={11} /> Confirm
                              </button>
                            </form>
                          )}
                          {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                            <>
                              <form
                                action={async (fd) => {
                                  await handleActionSubmit(fd, 'Appointment marked as completed.');
                                }}
                              >
                                <input type="hidden" name="appointmentId" value={appt._id} />
                                <input type="hidden" name="status" value="completed" />
                                <button
                                  type="submit"
                                  title="Mark Completed"
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 p-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  <CheckCircle size={13} />
                                </button>
                              </form>

                              <form
                                action={async (fd) => {
                                  await handleActionSubmit(fd, 'Appointment cancelled.');
                                }}
                              >
                                <input type="hidden" name="appointmentId" value={appt._id} />
                                <input type="hidden" name="status" value="cancelled" />
                                <button
                                  type="submit"
                                  title="Cancel Appointment"
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 p-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  <XCircle size={13} />
                                </button>
                              </form>
                            </>
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
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAppointments.map((appt: any) => {
            const patient = appt.patientId;
            const service = appt.serviceId;
            const therapist = appt.therapistId;
            const isHomeVisit = appt.visitType === 'home';

            return (
              <div
                key={appt._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono block">
                        #{appt._id.slice(-6)}
                      </span>
                      <h4 className="font-extrabold text-slate-800 text-base leading-tight mt-0.5">
                        {patient?.name || 'Walk-in Patient'}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isHomeVisit ? 'bg-blue-500' : 'bg-teal-500'
                          }`}
                        />
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                          {appt.visitType || 'clinic'} visit
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wide ${getStatusStyle(
                        appt.status
                      )}`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <div className="bg-slate-50/70 rounded-2xl p-3 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Service:</span>
                      <strong className="text-slate-800">{service?.title || 'General Physio'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Slot:</span>
                      <span className="font-bold text-teal-700">
                        {appt.date} • {appt.timeSlot}
                      </span>
                    </div>
                    {isHomeVisit && appt.address && (
                      <div className="flex items-start gap-1.5 text-slate-600 pt-1 border-t border-slate-200/40">
                        <MapPin size={12} className="text-blue-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] line-clamp-1">{appt.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Assign Doctor */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Assigned Doctor
                    </label>
                    <form
                      action={async (fd) => {
                        await handleActionSubmit(fd, 'Assigned therapist successfully.');
                      }}
                      className="flex gap-2"
                    >
                      <input type="hidden" name="appointmentId" value={appt._id} />
                      <select
                        name="therapistId"
                        defaultValue={therapist?._id || ''}
                        className="bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 w-full"
                      >
                        <option value="">-- Unassigned --</option>
                        {therapists.map((t: any) => (
                          <option key={t._id} value={t._id}>
                            Dr. {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        Set
                      </button>
                    </form>
                  </div>
                </div>

                {/* Footer Actions */}
                {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    {appt.status === 'pending' && (
                      <form
                        action={async (fd) => {
                          await handleActionSubmit(fd, 'Appointment confirmed.');
                        }}
                      >
                        <input type="hidden" name="appointmentId" value={appt._id} />
                        <input type="hidden" name="status" value="confirmed" />
                        <button
                          type="submit"
                          className="bg-teal-50 hover:bg-teal-100 border border-teal-200/60 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle size={13} />
                          Confirm
                        </button>
                      </form>
                    )}
                    <form
                      action={async (fd) => {
                        await handleActionSubmit(fd, 'Appointment marked as completed.');
                      }}
                    >
                      <input type="hidden" name="appointmentId" value={appt._id} />
                      <input type="hidden" name="status" value="completed" />
                      <button
                        type="submit"
                        className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCircle size={13} />
                        Complete
                      </button>
                    </form>

                    <form
                      action={async (fd) => {
                        await handleActionSubmit(fd, 'Appointment cancelled.');
                      }}
                    >
                      <input type="hidden" name="appointmentId" value={appt._id} />
                      <input type="hidden" name="status" value="cancelled" />
                      <button
                        type="submit"
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-200/60 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <XCircle size={13} />
                        Cancel
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
