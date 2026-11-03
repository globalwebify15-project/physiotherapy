'use client';

import React, { useState, useMemo } from 'react';
import DirectoryToolbar from './DirectoryToolbar';
import { exportToCsv } from '@/utils/exportCsv';
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visitFilter, setVisitFilter] = useState('all');
  const [view, setView] = useState<'table' | 'cards'>('table');

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
    return appointments.filter((appt) => {
      // Status filter
      if (statusFilter !== 'all' && appt.status !== statusFilter) return false;

      // Visit filter
      if (visitFilter !== 'all' && appt.visitType !== visitFilter) return false;

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
  }, [appointments, search, statusFilter, visitFilter]);

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
      {/* Search, Filter & Export Toolbar */}
      <DirectoryToolbar
        label="Appointments Directory"
        totalCount={appointments.length}
        filteredCount={filteredAppointments.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by patient name, phone, service, date, or ref ID..."
        filterOptions={statusOptions}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterLabel="Status"
        secondaryFilterOptions={visitOptions}
        secondaryFilterValue={visitFilter}
        onSecondaryFilterChange={setVisitFilter}
        secondaryFilterLabel="Visit Type"
        onExport={handleExport}
        showViewToggle={true}
        view={view}
        onViewChange={setView}
      />

      {/* Directory Content */}
      {filteredAppointments.length === 0 ? (
        <div className="w-full bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center">
          <Calendar className="mx-auto text-slate-300 w-12 h-12 mb-4" />
          <h3 className="font-bold text-slate-800 text-lg">No matching appointments found</h3>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria or filter status.</p>
        </div>
      ) : view === 'table' ? (
        /* Full Width Table View */
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Visit & Ref</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Treatment Service</th>
                  <th className="py-3.5 px-4">Schedule (Date & Slot)</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Assigned Therapist</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredAppointments.map((appt: any) => (
                  <tr key={appt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md inline-block mb-1">
                        {appt.visitType.toUpperCase()}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono">
                        #{appt._id.toString().slice(-6)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{appt.patientId?.name || 'Unknown Patient'}</div>
                      {appt.visitType === 'home' && appt.address && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs" title={appt.address}>
                          {appt.address}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">
                      {appt.serviceId?.title || 'General Physiotherapy'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{appt.date}</div>
                      <div className="text-[11px] text-slate-400">{appt.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <form action={updateAppointment} className="flex items-center gap-1.5">
                        <input type="hidden" name="appointmentId" value={appt._id.toString()} />
                        <select
                          name="therapistId"
                          defaultValue={appt.therapistId?._id?.toString() || ''}
                          className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-teal-500 w-full"
                        >
                          <option value="">-- Assign Doctor --</option>
                          {therapists.map((t: any) => (
                            <option key={String(t._id)} value={String(t._id)}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors shrink-0 shadow-2xs"
                        >
                          Set
                        </button>
                      </form>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${getStatusStyle(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {appt.status !== 'completed' && appt.status !== 'cancelled' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <form action={updateAppointment}>
                            <input type="hidden" name="appointmentId" value={appt._id.toString()} />
                            <input type="hidden" name="status" value="completed" />
                            <button
                              type="submit"
                              title="Mark Completed"
                              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle size={12} />
                              Done
                            </button>
                          </form>
                          <form action={updateAppointment}>
                            <input type="hidden" name="appointmentId" value={appt._id.toString()} />
                            <input type="hidden" name="status" value="cancelled" />
                            <button
                              type="submit"
                              title="Cancel Appointment"
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <XCircle size={12} />
                              Cancel
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Full Width Cards View */
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((appt: any) => (
            <div
              key={appt._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-lg">
                      {appt.visitType.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      Ref: {appt._id.toString().slice(-6)}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${getStatusStyle(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2 text-slate-800">
                    <User size={15} className="text-slate-400" />
                    <span className="font-bold text-sm">{appt.patientId?.name || 'Unknown Patient'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={15} className="text-slate-400" />
                    <span>{appt.serviceId?.title || 'General Physiotherapy'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-slate-400" />
                    <span>{appt.date} @ {appt.timeSlot}</span>
                  </div>
                  {appt.visitType === 'home' && appt.address && (
                    <div className="flex items-start gap-2 pt-1">
                      <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
                      <span className="text-[11px] text-slate-500 leading-tight">{appt.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-slate-400">Assigned:</span>
                    <span className="font-bold text-slate-700">
                      {appt.therapistId?.name || 'Not assigned'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <form action={updateAppointment} className="flex items-center gap-1.5">
                  <input type="hidden" name="appointmentId" value={appt._id.toString()} />
                  <select
                    name="therapistId"
                    defaultValue={appt.therapistId?._id?.toString() || ''}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-teal-500 flex-1"
                  >
                    <option value="">-- Assign Doctor --</option>
                    {therapists.map((t: any) => (
                      <option key={String(t._id)} value={String(t._id)}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                  >
                    Assign
                  </button>
                </form>

                {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <form action={updateAppointment}>
                      <input type="hidden" name="appointmentId" value={appt._id.toString()} />
                      <input type="hidden" name="status" value="completed" />
                      <button
                        type="submit"
                        className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle size={13} />
                        Complete
                      </button>
                    </form>
                    <form action={updateAppointment}>
                      <input type="hidden" name="appointmentId" value={appt._id.toString()} />
                      <input type="hidden" name="status" value="cancelled" />
                      <button
                        type="submit"
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <XCircle size={13} />
                        Cancel
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

