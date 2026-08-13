import React from 'react';
import { connectDB, Appointment, Therapist, Patient, Service, Notification } from 'database';
import { revalidatePath } from 'next/cache';
import { 
  Calendar, 
  User, 
  MapPin, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

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

  // Fetch appointments, therapists, and patients
  const appointments = await Appointment.find()
    .populate({ path: 'patientId', model: Patient })
    .populate({ path: 'serviceId', model: Service })
    .populate({ path: 'therapistId', model: Therapist })
    .sort({ date: -1, timeSlot: -1 });

  const therapists = await Therapist.find({ isActive: true });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'assigned':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200/50';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Appointment Management</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Monitor visits, manage schedules, assign therapists, and update appointment states.
        </p>
      </div>

      {/* Main Appointments Feed Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Appointments List */}
        <div className="xl:col-span-2 space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
              <Calendar className="mx-auto text-slate-300 w-12 h-12 mb-4" />
              <h3 className="font-bold text-slate-800 text-lg">No appointments scheduled</h3>
              <p className="text-slate-400 text-sm mt-1">Bookings requested by patients will appear here.</p>
            </div>
          ) : (
            appointments.map((appt: any) => (
              <div 
                key={appt._id} 
                className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
              >
                {/* Top header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                      {appt.visitType.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      Ref: {appt._id.toString().slice(-6)}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusStyle(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>

                {/* Main detail columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium text-slate-600">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-800">
                      <User size={16} className="text-slate-400" />
                      <span className="font-bold">{appt.patientId?.name || 'Unknown Patient'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-slate-400" />
                      <span>{appt.serviceId?.title || 'General Physiotherapy'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" />
                      <span>{appt.date} @ {appt.timeSlot}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {appt.visitType === 'home' && appt.address && (
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-500 leading-tight">{appt.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Assigned Therapist:</span>
                      <span className="text-xs font-bold text-slate-700">
                        {appt.therapistId?.name || 'Not assigned'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin controls row */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  
                  {/* Form: Assign Therapist */}
                  <form action={updateAppointment} className="flex items-center gap-2 max-w-xs w-full">
                    <input type="hidden" name="appointmentId" value={appt._id.toString()} />
                    <select 
                      name="therapistId" 
                      defaultValue={appt.therapistId?._id?.toString() || ''}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-indigo-500 flex-1"
                    >
                      <option value="">-- Assign Therapist --</option>
                      {therapists.map((t) => (
                        <option key={t._id} value={t._id.toString()}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Assign
                    </button>
                  </form>

                  {/* Form Actions: Complete / Cancel */}
                  <div className="flex items-center gap-2">
                    {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                      <>
                        <form action={updateAppointment}>
                          <input type="hidden" name="appointmentId" value={appt._id.toString()} />
                          <input type="hidden" name="status" value="completed" />
                          <button 
                            type="submit" 
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle size={14} />
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
                            <XCircle size={14} />
                            Cancel
                          </button>
                        </form>
                      </>
                    )}
                  </div>

                </div>

              </div>
            ))
          )}
        </div>

        {/* Right 1 Column: Sidebar Widgets */}
        <div className="space-y-6">
          {/* Quick Stats Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-base mb-4">Operations Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-semibold text-slate-500">Pending Assignment</span>
                <span className="text-sm font-extrabold text-amber-600">
                  {appointments.filter(a => a.status === 'pending').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-semibold text-slate-500">Active Visits</span>
                <span className="text-sm font-extrabold text-blue-600">
                  {appointments.filter(a => a.status === 'in-progress' || a.status === 'assigned' || a.status === 'confirmed').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-semibold text-slate-500">Completed Sessions</span>
                <span className="text-sm font-extrabold text-emerald-600">
                  {appointments.filter(a => a.status === 'completed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Guidelines info card */}
          <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100/50 p-6 flex gap-3">
            <AlertCircle className="text-indigo-600 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-indigo-900">Therapist Scheduling Rules</h4>
              <p className="text-xs text-indigo-700/80 leading-relaxed">
                Before assigning a therapist, check their schedule availability on the Therapists tab. The portal validates slot conflicts automatically to avoid double-bookings.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
