'use client';

import React, { useState, useMemo } from 'react';
import DirectoryToolbar from './DirectoryToolbar';
import AddTherapistModal from './AddTherapistModal';
import EditTherapistModal from './EditTherapistModal';
import { exportToCsv } from '@/utils/exportCsv';
import { UserRound, Star, Mail, Phone, CalendarDays, GraduationCap } from 'lucide-react';

interface TherapistsDirectoryClientProps {
  therapists: any[];
  onAdd: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
}

export default function TherapistsDirectoryClient({
  therapists,
  onAdd,
  onUpdate,
  onDelete,
}: TherapistsDirectoryClientProps) {
  const [search, setSearch] = useState('');
  const [expFilter, setExpFilter] = useState('all');
  const [view, setView] = useState<'table' | 'cards'>('table');

  const experienceOptions = [
    { label: '10+ Years Experience', value: '10plus' },
    { label: '5+ Years Experience', value: '5plus' },
    { label: 'Under 5 Years', value: 'under5' },
  ];

  const filteredTherapists = useMemo(() => {
    return therapists.filter((t) => {
      // Experience filter
      const exp = Number(t.experience) || 0;
      if (expFilter === '10plus' && exp < 10) return false;
      if (expFilter === '5plus' && exp < 5) return false;
      if (expFilter === 'under5' && exp >= 5) return false;

      // Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = (t.name || '').toLowerCase().includes(q);
        const emailMatch = (t.email || '').toLowerCase().includes(q);
        const mobileMatch = (t.mobile || '').toLowerCase().includes(q);
        const qualMatch = (t.qualification || '').toLowerCase().includes(q);
        const specMatch = Array.isArray(t.specialization) && t.specialization.some((s: string) => (s || '').toLowerCase().includes(q));
        if (!nameMatch && !emailMatch && !mobileMatch && !qualMatch && !specMatch) return false;
      }

      return true;
    });
  }, [therapists, search, expFilter]);

  const handleExport = () => {
    const exportRows = filteredTherapists.map((t) => ({
      'Practitioner Name': t.name,
      'Qualification': t.qualification,
      'Experience (Years)': t.experience,
      'Rating Average': t.ratingAverage || 5,
      'Mobile Phone': t.mobile,
      'Email Address': t.email,
      'Working Hours': `${t.workingHours?.start || '09:00'} - ${t.workingHours?.end || '19:00'}`,
      'Specializations': Array.isArray(t.specialization) ? t.specialization.join(', ') : '',
    }));
    exportToCsv('Clinic_Physiotherapists', exportRows);
  };

  return (
    <div className="w-full space-y-4">
      {/* Search, Filter, Export & Onboard Modal Toolbar */}
      <DirectoryToolbar
        label="Therapists & Specialists"
        totalCount={therapists.length}
        filteredCount={filteredTherapists.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search doctors by name, qualification, mobile or specialization..."
        filterOptions={experienceOptions}
        filterValue={expFilter}
        onFilterChange={setExpFilter}
        filterLabel="Experience"
        onExport={handleExport}
        actionButton={<AddTherapistModal onAdd={onAdd} />}
        showViewToggle={true}
        view={view}
        onViewChange={setView}
      />

      {/* Directory Content (Full Width) */}
      {filteredTherapists.length === 0 ? (
        <div className="w-full bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center">
          <UserRound className="mx-auto text-slate-300 w-12 h-12 mb-4" />
          <h3 className="font-bold text-slate-800 text-lg">No matching doctors found</h3>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria or filter.</p>
        </div>
      ) : view === 'table' ? (
        /* Table View */
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Clinical Practitioner</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Contact Lines</th>
                  <th className="py-3.5 px-4">Working Hours</th>
                  <th className="py-3.5 px-4">Clinical Specialization</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTherapists.map((therapist: any) => (
                  <tr key={therapist._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {therapist.profilePhoto ? (
                          <img
                            src={therapist.profilePhoto}
                            alt={therapist.name}
                            className="w-10 h-10 rounded-full object-cover object-top border border-teal-500/20 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-extrabold text-sm border border-teal-100 shrink-0">
                            {therapist.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{therapist.name}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[220px]" title={therapist.qualification}>
                            {therapist.qualification}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 text-xs">{therapist.experience} yrs</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/50 px-2 py-0.5 rounded-md text-[11px] font-bold">
                        <Star size={11} fill="currentColor" className="text-amber-500" />
                        {therapist.ratingAverage || 5}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-semibold">{therapist.mobile}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[170px]">{therapist.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600">
                      {therapist.workingHours?.start || '09:00'} - {therapist.workingHours?.end || '19:00'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {therapist.specialization && therapist.specialization.slice(0, 3).map((spec: string, idx: number) => (
                          <span key={idx} className="text-[9px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded">
                            {spec}
                          </span>
                        ))}
                        {therapist.specialization && therapist.specialization.length > 3 && (
                          <span className="text-[9px] text-slate-400 font-bold">+{therapist.specialization.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <EditTherapistModal
                        therapist={{
                          _id: therapist._id.toString(),
                          name: String(therapist.name),
                          email: String(therapist.email),
                          mobile: String(therapist.mobile),
                          qualification: String(therapist.qualification),
                          experience: Number(therapist.experience),
                          specialization: therapist.specialization ? Array.from(therapist.specialization).map(String) : [],
                          workingHours: {
                            start: String(therapist.workingHours?.start || '09:00'),
                            end: String(therapist.workingHours?.end || '19:00'),
                          },
                          ratingAverage: Number(therapist.ratingAverage || 5),
                          profilePhoto: therapist.profilePhoto ? String(therapist.profilePhoto) : undefined,
                        }}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View (Full Width Grid) */
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist: any) => (
            <div
              key={therapist._id.toString()}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {therapist.profilePhoto ? (
                      <img
                        src={therapist.profilePhoto}
                        alt={therapist.name}
                        className="w-12 h-12 rounded-full object-cover object-top border-2 border-teal-500/20 shadow-xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-extrabold text-base border border-teal-100">
                        {therapist.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 text-base leading-snug">{therapist.name}</h4>
                      <span className="text-xs font-semibold text-slate-400">Experience: {therapist.experience} years</span>
                    </div>
                  </div>
                  <div className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-200/30 flex items-center gap-1 text-xs font-bold shrink-0">
                    <Star size={12} fill="currentColor" />
                    {therapist.ratingAverage || 5}
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-slate-400" />
                    <span className="text-xs text-slate-600 truncate block">{therapist.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-slate-400" />
                    <span>{therapist.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-slate-400" />
                    <span>{therapist.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-slate-400" />
                    <span>
                      Hrs: {therapist.workingHours?.start || '09:00'} - {therapist.workingHours?.end || '19:00'}
                    </span>
                  </div>
                </div>
              </div>

              {therapist.specialization && therapist.specialization.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {therapist.specialization.map((spec: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-2">
                <EditTherapistModal
                  therapist={{
                    _id: therapist._id.toString(),
                    name: String(therapist.name),
                    email: String(therapist.email),
                    mobile: String(therapist.mobile),
                    qualification: String(therapist.qualification),
                    experience: Number(therapist.experience),
                    specialization: therapist.specialization ? Array.from(therapist.specialization).map(String) : [],
                    workingHours: {
                      start: String(therapist.workingHours?.start || '09:00'),
                      end: String(therapist.workingHours?.end || '19:00'),
                    },
                    ratingAverage: Number(therapist.ratingAverage || 5),
                    profilePhoto: therapist.profilePhoto ? String(therapist.profilePhoto) : undefined,
                  }}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

