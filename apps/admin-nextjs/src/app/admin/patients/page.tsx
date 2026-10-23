import React from 'react';
import { connectDB, Patient, Appointment, User } from 'database';
import { revalidatePath } from 'next/cache';
import { 
  Users, 
  Search, 
  Calendar, 
  Phone, 
  HeartHandshake, 
  MapPin, 
  Activity, 
  Clock, 
  FileText,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const revalidate = 0; // Real-time dynamic fetch

// Server Action to update patient medical history or emergency contact notes
async function updatePatientNotes(formData: FormData) {
  'use server';
  const patientId = formData.get('patientId') as string;
  const newMedicalNote = formData.get('medicalNote') as string;

  if (!patientId) return;

  await connectDB();
  const patient = await Patient.findById(patientId);
  if (patient && newMedicalNote && newMedicalNote.trim().length > 0) {
    if (!patient.medicalHistory) {
      patient.medicalHistory = [];
    }
    patient.medicalHistory.push(newMedicalNote.trim());
    await patient.save();
  }

  revalidatePath('/admin/patients');
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>;
}) {
  await connectDB();

  const resolvedParams = searchParams ? await searchParams : {};
  const searchQuery = resolvedParams?.search || '';

  // Query filter
  const filter: any = {};
  if (searchQuery.trim()) {
    filter.$or = [
      { name: { $regex: searchQuery.trim(), $options: 'i' } },
      { 'emergencyContact.phone': { $regex: searchQuery.trim(), $options: 'i' } },
    ];
  }

  // Fetch real patient records populated with User account
  const patients = await Patient.find(filter)
    .populate({ path: 'userId', model: User })
    .sort({ createdAt: -1 });

  // Get total appointment count for each patient
  const patientStats = await Promise.all(
    patients.map(async (p) => {
      const count = await Appointment.countDocuments({ patientId: p._id });
      const lastAppt = await Appointment.findOne({ patientId: p._id }).sort({ date: -1 });
      return {
        id: p._id.toString(),
        appointmentCount: count,
        lastAppointmentDate: lastAppt?.date || null,
      };
    })
  );

  const statsMap = new Map(patientStats.map((s) => [s.id, s]));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Directory & Medical Records</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Real-time directory of registered patients, emergency contacts, medical history, and visit records.
          </p>
        </div>
        
        {/* Search Bar */}
        <form method="GET" className="flex items-center gap-2">
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input 
              type="text" 
              name="search" 
              defaultValue={searchQuery}
              placeholder="Search by patient name or phone..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-sm"
            />
          </div>
          <button 
            type="submit" 
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-teal-100"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {patients.length === 0 ? (
          <div className="lg:col-span-3 bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
            <Users className="mx-auto text-slate-300 w-12 h-12 mb-4" />
            <h3 className="font-bold text-slate-800 text-lg">No patient records found</h3>
            <p className="text-slate-400 text-sm mt-1">
              {searchQuery ? `No results matching "${searchQuery}".` : 'Patients who register or book appointments will appear here.'}
            </p>
          </div>
        ) : (
          patients.map((patient: any) => {
            const stats = statsMap.get(patient._id.toString());
            const userPhone = patient.userId?.mobile || patient.emergencyContact?.phone || 'N/A';
            const age = patient.dob 
              ? Math.floor((new Date().getTime() - new Date(patient.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
              : null;

            return (
              <div 
                key={patient._id} 
                className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Avatar & Name */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-base border border-teal-100 uppercase">
                        {patient.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base leading-snug">{patient.name}</h3>
                        <span className="text-xs font-semibold text-slate-400 capitalize">
                          {patient.gender || 'Unknown'} {age ? `• ${age} yrs` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="bg-teal-50 text-teal-700 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-teal-100/60">
                      {stats?.appointmentCount || 0} Visits
                    </span>
                  </div>

                  {/* Contact info list */}
                  <div className="space-y-2 text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-teal-600" />
                      <span className="font-semibold text-slate-700">{userPhone}</span>
                    </div>

                    {patient.emergencyContact && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <HeartHandshake size={14} className="text-rose-500" />
                        <span>
                          Emergency: <strong className="text-slate-700">{patient.emergencyContact.name}</strong> ({patient.emergencyContact.relation || 'Contact'}) • {patient.emergencyContact.phone}
                        </span>
                      </div>
                    )}

                    {patient.savedAddresses && patient.savedAddresses.length > 0 && (
                      <div className="flex items-start gap-2 text-slate-500">
                        <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="truncate">{patient.savedAddresses[0]}</span>
                      </div>
                    )}

                    {stats?.lastAppointmentDate && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={14} />
                        <span>Last visited on {stats.lastAppointmentDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Medical History Tags */}
                  {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Medical History / Diagnosis
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {patient.medicalHistory.map((note: string, idx: number) => (
                          <span 
                            key={idx} 
                            className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Medical Note Action */}
                <form action={updatePatientNotes} className="pt-3 border-t border-slate-100 flex gap-2">
                  <input type="hidden" name="patientId" value={patient._id.toString()} />
                  <input 
                    type="text" 
                    name="medicalNote" 
                    placeholder="Add clinical note..." 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-500"
                  />
                  <button 
                    type="submit" 
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    + Note
                  </button>
                </form>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
