import React from 'react';
import { connectDB, Appointment, Therapist, Patient, Service, Notification } from 'database';
import { revalidatePath } from 'next/cache';
import AppointmentsDirectoryClient from '@/components/AppointmentsDirectoryClient';
import { Clock, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

export const revalidate = 0; // Dynamic fetch

// Server Action to update appointment status or assign therapist
async function updateAppointment(formData: FormData) {
  'use server';
  const appointmentId = formData.get('appointmentId') as string;
  const status = formData.get('status') as string;
  const therapistId = formData.get('therapistId') as string;

  await connectDB();
  const appointment = await Appointment.findById(appointmentId);
  
  if (appointment) {
    if (status) {
      appointment.status = status;
      appointment.statusTimeline.push({
        status: status as any,
        note: `Status updated via Admin Panel.`,
      });
    }
    if (therapistId) {
      appointment.therapistId = therapistId;
      if (appointment.status === 'pending') {
        appointment.status = 'assigned';
      }
      appointment.statusTimeline.push({
        status: appointment.status,
        note: `Therapist assigned via Admin Panel.`,
      });
    }
    await appointment.save();

    // Dispatch Notifications directly via Mongoose model
    try {
      const patient = await Patient.findById(appointment.patientId);
      if (patient) {
        if (therapistId) {
          const therapist = await Therapist.findById(therapistId);
          if (therapist) {
            await Notification.create({
              userId: patient.userId,
              title: 'Therapist Assigned',
              body: `Dr. ${therapist.name} has been assigned to your appointment on ${appointment.date}.`,
              type: 'booking_alert',
              metadata: { appointmentId: appointment._id }
            });
            console.log(`[ADMIN PORTAL NOTIFICATION] Therapist assigned notification dispatched to patient ${patient.name}`);
          }
        } else if (status) {
          const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
          await Notification.create({
            userId: patient.userId,
            title: `Appointment ${formattedStatus}`,
            body: `Your appointment status has been updated to "${status}" via the Admin Panel.`,
            type: 'booking_alert',
            metadata: { appointmentId: appointment._id }
          });
          console.log(`[ADMIN PORTAL NOTIFICATION] Status update notification dispatched to patient ${patient.name}`);
        }
      }
    } catch (notifErr) {
      console.error('Failed to create notification from server action:', notifErr);
    }
  }
  revalidatePath('/admin/appointments');
}

export default async function AppointmentsPage() {
  await connectDB();

  // Fetch appointments and therapists concurrently
  const [appointments, therapists] = await Promise.all([
    Appointment.find()
      .populate({ path: 'patientId', model: Patient })
      .populate({ path: 'serviceId', model: Service })
      .populate({ path: 'therapistId', model: Therapist })
      .sort({ date: -1, timeSlot: -1 })
      .lean(),
    Therapist.find({ isActive: true }).sort({ name: 1 }).lean(),
  ]);

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const activeCount = appointments.filter(a => a.status === 'in-progress' || a.status === 'assigned' || a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const totalCount = appointments.length;

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointment Management</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Monitor visits, manage schedules, assign therapists, and update appointment states.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Action</p>
            <p className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Active Visits</p>
            <p className="text-2xl font-black text-blue-700 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Full-width Appointments Directory with Search, Filters, CSV Export & Modals */}
      <div className="w-full">
        <AppointmentsDirectoryClient
          appointments={JSON.parse(JSON.stringify(appointments))}
          therapists={JSON.parse(JSON.stringify(therapists))}
          updateAppointment={updateAppointment}
        />
      </div>
    </div>
  );
}
