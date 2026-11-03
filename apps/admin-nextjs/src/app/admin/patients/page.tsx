import React from 'react';
import { connectDB, Patient, Appointment, User } from 'database';
import { revalidatePath } from 'next/cache';
import PatientsDirectoryClient from '@/components/PatientsDirectoryClient';
import { Users, UserPlus, CalendarCheck, ShieldAlert } from 'lucide-react';

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

export default async function PatientsPage() {
  await connectDB();

  // Fetch real patient records populated with User account and aggregate appointment stats concurrently
  const [patients, apptAgg] = await Promise.all([
    Patient.find()
      .populate({ path: 'userId', model: User })
      .sort({ createdAt: -1 })
      .lean(),
    Appointment.aggregate([
      {
        $group: {
          _id: '$patientId',
          appointmentCount: { $sum: 1 },
          lastAppointmentDate: { $max: '$date' },
        },
      },
    ]),
  ]);

  const statsMapData: Record<string, { appointmentCount: number; lastAppointmentDate: string | null }> = {};
  apptAgg.forEach((item: any) => {
    if (item._id) {
      statsMapData[item._id.toString()] = {
        appointmentCount: item.appointmentCount || 0,
        lastAppointmentDate: item.lastAppointmentDate || null,
      };
    }
  });

  const totalPatients = patients.length;
  const patientsWithVisits = Object.values(statsMapData).filter(s => s.appointmentCount > 0).length;
  const newPatients = totalPatients - patientsWithVisits;
  const emergencyCount = patients.filter(p => !!p.emergencyContact?.phone).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Patient Directory & Medical Records</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Real-time directory of registered patients, emergency contacts, medical history, and visit records.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Patients</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalPatients}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">Active Visitors</p>
            <p className="text-2xl font-black text-teal-700 mt-1">{patientsWithVisits}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <CalendarCheck size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">New Registrations</p>
            <p className="text-2xl font-black text-blue-700 mt-1">{newPatients}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
            <UserPlus size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">With Emergency Info</p>
            <p className="text-2xl font-black text-slate-700 mt-1">{emergencyCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      {/* Full-width Patients Directory Client with Live Search, Gender & Visit Filters, and CSV Export */}
      <div className="w-full">
        <PatientsDirectoryClient
          patients={JSON.parse(JSON.stringify(patients))}
          statsMapData={statsMapData}
          updatePatientNotes={updatePatientNotes}
        />
      </div>
    </div>
  );
}
