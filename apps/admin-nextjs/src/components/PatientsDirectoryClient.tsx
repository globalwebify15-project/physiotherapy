'use client';

import React, { useState, useMemo } from 'react';
import DirectoryToolbar from './DirectoryToolbar';
import ExportModal, { ColumnDef } from './ExportModal';
import { exportToCsv } from '@/utils/exportCsv';
import { useToast } from './ToastProvider';
import { 
  Users, 
  Phone, 
  MapPin, 
  Calendar, 
  HeartHandshake, 
  FileText,
  UserCheck
} from 'lucide-react';

interface PatientsDirectoryClientProps {
  patients: any[];
  statsMapData: Record<string, { appointmentCount: number; lastAppointmentDate: string | null }>;
  updatePatientNotes: (formData: FormData) => Promise<void>;
}

export default function PatientsDirectoryClient({
  patients,
  statsMapData,
  updatePatientNotes,
}: PatientsDirectoryClientProps) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [visitFilter, setVisitFilter] = useState('all');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const genderOptions = [
    { label: 'Male Patients', value: 'male' },
    { label: 'Female Patients', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const visitOptions = [
    { label: 'Frequent Patients (≥1 Visits)', value: 'visited' },
    { label: 'New / 0 Visits', value: 'new' },
  ];

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const stats = statsMapData[patient._id] || { appointmentCount: 0, lastAppointmentDate: null };

      // Gender filter
      if (genderFilter !== 'all' && (patient.gender || '').toLowerCase() !== genderFilter) {
        return false;
      }

      // Visit filter
      if (visitFilter === 'visited' && stats.appointmentCount === 0) return false;
      if (visitFilter === 'new' && stats.appointmentCount > 0) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const name = (patient.name || '').toLowerCase();
        const phone = (patient.userId?.mobile || patient.emergencyContact?.phone || '').toLowerCase();
        const emName = (patient.emergencyContact?.name || '').toLowerCase();
        const history = (patient.medicalHistory || []).join(' ').toLowerCase();
        const address = (patient.savedAddresses || []).join(' ').toLowerCase();

        if (
          !name.includes(q) &&
          !phone.includes(q) &&
          !emName.includes(q) &&
          !history.includes(q) &&
          !address.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [patients, statsMapData, search, genderFilter, visitFilter]);

  const handleExport = () => {
    const exportRows = filteredPatients.map((p) => {
      const stats = statsMapData[p._id] || { appointmentCount: 0, lastAppointmentDate: null };
      const age = p.dob 
        ? Math.floor((new Date().getTime() - new Date(p.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 'N/A';
      return {
        'Patient Name': p.name || 'Unnamed',
        'Gender': p.gender || 'N/A',
        'Age': age,
        'Phone Number': p.userId?.mobile || p.emergencyContact?.phone || 'N/A',
        'Emergency Contact': p.emergencyContact ? `${p.emergencyContact.name} (${p.emergencyContact.phone})` : 'None',
        'Primary Address': (p.savedAddresses && p.savedAddresses[0]) || 'Not set',
        'Total Visits': stats.appointmentCount,
        'Last Visit': stats.lastAppointmentDate || 'No visits',
        'Medical History': (p.medicalHistory || []).join('; ') || 'None',
      };
    });

    exportToCsv(`Patients_Directory`, exportRows);
    toast.success('Export Complete', `Downloaded ${exportRows.length} patient records.`);
  };

  const exportColumns: ColumnDef[] = [
    { key: 'name', label: 'Patient Name', accessor: (p) => p.name || 'Unnamed' },
    { key: 'gender', label: 'Gender', accessor: (p) => p.gender || 'N/A' },
    { 
      key: 'age', 
      label: 'Age', 
      accessor: (p) => p.dob ? Math.floor((new Date().getTime() - new Date(p.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A' 
    },
    { key: 'phone', label: 'Phone Number', accessor: (p) => p.userId?.mobile || p.emergencyContact?.phone || 'N/A' },
    { key: 'emergency', label: 'Emergency Contact', accessor: (p) => p.emergencyContact ? `${p.emergencyContact.name} (${p.emergencyContact.phone})` : 'None' },
    { key: 'address', label: 'Primary Address', accessor: (p) => (p.savedAddresses && p.savedAddresses[0]) || 'Not set' },
    { key: 'visits', label: 'Total Visits', accessor: (p) => statsMapData[p._id]?.appointmentCount || 0 },
    { key: 'lastVisit', label: 'Last Visit Date', accessor: (p) => statsMapData[p._id]?.lastAppointmentDate || 'Never' },
    { key: 'history', label: 'Clinical History', accessor: (p) => (p.medicalHistory || []).join('; ') || 'None' },
  ];

  const handleSaveNote = async (formData: FormData, patientName: string) => {
    try {
      await updatePatientNotes(formData);
      toast.success('Clinical Note Saved', `Recorded clinical note for ${patientName}.`);
    } catch (err: any) {
      toast.error('Save Failed', err?.message || 'Could not save note.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter, Export & View Toggle Toolbar */}
      <DirectoryToolbar
        label="Patients Directory"
        totalCount={patients.length}
        filteredCount={filteredPatients.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, phone, emergency contact, notes..."
        filterOptions={genderOptions}
        filterValue={genderFilter}
        onFilterChange={setGenderFilter}
        filterLabel="Gender"
        secondaryFilterOptions={visitOptions}
        secondaryFilterValue={visitFilter}
        onSecondaryFilterChange={setVisitFilter}
        secondaryFilterLabel="Visits"
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
        title="Export Patient Directory CSV with Custom Values"
        data={patients}
        dateField="createdAt"
        availableColumns={exportColumns}
        filename="Patients_Report"
      />

      {/* Directory Content */}
      {view === 'table' ? (
        filteredPatients.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
            <Users className="mx-auto text-slate-300 w-12 h-12 mb-4" />
            <h3 className="font-bold text-slate-800 text-lg">No matching patient records found</h3>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Visits</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Emergency Contact</th>
                    <th className="py-3.5 px-4">Primary Address</th>
                    <th className="py-3.5 px-4">Last Visit</th>
                    <th className="py-3.5 px-4 min-w-[240px]">Medical Notes & Diagnosis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPatients.map((patient: any) => {
                    const stats = statsMapData[patient._id] || { appointmentCount: 0, lastAppointmentDate: null };
                    const userPhone = patient.userId?.mobile || patient.emergencyContact?.phone || 'N/A';
                    const age = patient.dob 
                      ? Math.floor((new Date().getTime() - new Date(patient.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                      : null;

                    return (
                      <tr key={patient._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-xs border border-teal-100 uppercase shrink-0">
                              {patient.name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{patient.name}</div>
                              <div className="text-[10px] text-slate-400 capitalize">
                                {patient.gender || 'Unknown'} {age ? `• ${age} yrs` : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-teal-50 text-teal-700 text-[11px] font-extrabold px-2 py-0.5 rounded-md border border-teal-100">
                            {stats.appointmentCount}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">{userPhone}</span>
                        </td>
                        <td className="py-3 px-4">
                          {patient.emergencyContact ? (
                            <div>
                              <div className="font-semibold text-slate-800">{patient.emergencyContact.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {patient.emergencyContact.phone} ({patient.emergencyContact.relation || 'Contact'})
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300 italic">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {patient.savedAddresses && patient.savedAddresses.length > 0 ? (
                            <span className="truncate max-w-[200px] block" title={patient.savedAddresses[0]}>
                              {patient.savedAddresses[0]}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic">Not set</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {stats.lastAppointmentDate || 'No visits yet'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1.5">
                            {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {patient.medicalHistory.map((note: string, idx: number) => (
                                  <span 
                                    key={idx} 
                                    className="bg-slate-100 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200"
                                  >
                                    {note}
                                  </span>
                                ))}
                              </div>
                            )}
                            <form
                              action={async (fd) => {
                                await handleSaveNote(fd, patient.name || 'patient');
                              }}
                              className="flex items-center gap-1"
                            >
                              <input type="hidden" name="patientId" value={patient._id.toString()} />
                              <input 
                                type="text" 
                                name="medicalNote" 
                                placeholder="+ add clinical note..." 
                                required
                                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-[10px] text-slate-700 focus:outline-none focus:border-teal-500 w-full"
                              />
                              <button 
                                type="submit" 
                                className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors shrink-0 cursor-pointer"
                              >
                                Save
                              </button>
                            </form>
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
        filteredPatients.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
            <Users className="mx-auto text-slate-300 w-12 h-12 mb-4" />
            <h3 className="font-bold text-slate-800 text-lg">No matching patient records found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPatients.map((patient: any) => {
              const stats = statsMapData[patient._id] || { appointmentCount: 0, lastAppointmentDate: null };
              const userPhone = patient.userId?.mobile || patient.emergencyContact?.phone || 'N/A';
              const age = patient.dob 
                ? Math.floor((new Date().getTime() - new Date(patient.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                : null;

              return (
                <div 
                  key={patient._id} 
                  className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-700 font-extrabold text-base">
                          {patient.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-base leading-tight">{patient.name}</h3>
                          <p className="text-xs text-slate-400 capitalize mt-0.5">
                            {patient.gender || 'Unknown'} {age ? `• ${age} yrs` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <UserCheck size={10} />
                          {stats.appointmentCount} Visits
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="bg-slate-50/70 rounded-xl p-3 space-y-2 text-xs border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800">{userPhone}</span>
                      </div>
                      
                      {patient.emergencyContact && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <HeartHandshake size={13} className="text-rose-400 shrink-0" />
                          <span>
                            <strong className="text-slate-700">{patient.emergencyContact.name}</strong> ({patient.emergencyContact.relation || 'Emergency'}): {patient.emergencyContact.phone}
                          </span>
                        </div>
                      )}

                      {patient.savedAddresses && patient.savedAddresses.length > 0 && (
                        <div className="flex items-start gap-2 text-slate-600">
                          <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{patient.savedAddresses[0]}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-slate-500 text-[11px] pt-1 border-t border-slate-200/50">
                        <Calendar size={12} className="text-slate-400" />
                        <span>Last appointment: <strong>{stats.lastAppointmentDate || 'Never'}</strong></span>
                      </div>
                    </div>

                    {/* Medical History */}
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        <FileText size={12} />
                        Clinical History & Conditions
                      </div>
                      {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {patient.medicalHistory.map((history: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="bg-teal-50/60 text-teal-800 border border-teal-100/80 text-[10px] font-medium px-2 py-0.5 rounded-md"
                            >
                              {history}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No historical diagnoses logged</p>
                      )}
                    </div>
                  </div>

                  {/* Add note form */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <form
                      action={async (fd) => {
                        await handleSaveNote(fd, patient.name || 'patient');
                      }}
                      className="flex gap-2"
                    >
                      <input type="hidden" name="patientId" value={patient._id.toString()} />
                      <input 
                        type="text" 
                        name="medicalNote" 
                        placeholder="Add clinical note..." 
                        required
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 w-full"
                      />
                      <button 
                        type="submit" 
                        className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
