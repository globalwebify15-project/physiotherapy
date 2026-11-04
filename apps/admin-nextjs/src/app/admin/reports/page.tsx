import React from 'react';
import { connectDB, Payment, Appointment, Patient, Therapist, Service, User } from 'database';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/utils/auth';
import { IndianRupee, CalendarCheck, Users } from 'lucide-react';
import ReportsDirectoryClient from '@/components/ReportsDirectoryClient';

export const revalidate = 0; // Dynamic fetch

export default async function ReportsPage() {
  const session = await getAdminSession();
  if (session?.role !== 'superadmin' && session?.role !== 'admin') {
    redirect('/admin/dashboard?denied=admin_only');
  }

  await connectDB();

  // Concurrently fetch all report streams using optimized aggregation and lean queries
  const [
    payments,
    appointments,
    therapists,
    therapistApptAgg,
    patients,
    patientApptAgg
  ] = await Promise.all([
    Payment.find({ status: 'paid' })
      .populate({
        path: 'appointmentId',
        model: Appointment,
        populate: [
          { path: 'patientId', model: Patient },
          { path: 'serviceId', model: Service },
        ],
      })
      .sort({ createdAt: -1 })
      .lean(),
    Appointment.find()
      .populate({ path: 'patientId', model: Patient })
      .populate({ path: 'serviceId', model: Service })
      .populate({ path: 'therapistId', model: Therapist })
      .sort({ date: -1, timeSlot: -1 })
      .lean(),
    Therapist.find().sort({ name: 1 }).lean(),
    Appointment.aggregate([
      {
        $group: {
          _id: '$therapistId',
          totalBookings: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]),
    Patient.find()
      .populate({ path: 'userId', model: User })
      .sort({ createdAt: -1 })
      .lean(),
    Appointment.aggregate([
      {
        $group: {
          _id: '$patientId',
          apptCount: { $sum: 1 },
          lastVisitDate: { $max: '$date' },
        },
      },
    ]),
  ]);

  // 1. Revenue Report Data
  const revenueRows = payments.map((p: any) => {
    const appt = p.appointmentId;
    return {
      'Transaction ID': p.razorpayPaymentId || 'N/A',
      'Order ID': p.razorpayOrderId || 'N/A',
      'Patient Name': appt?.patientId?.name || 'Unknown',
      'Treatment Service': appt?.serviceId?.title || 'General Therapy',
      'Visit Type': appt?.visitType || 'clinic',
      'Amount (INR)': p.amount,
      'Payment Date': p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : 'N/A',
      'Status': (p.status || 'paid').toUpperCase(),
    };
  });

  // 2. Appointment Report Data
  const appointmentRows = appointments.map((a: any) => ({
    'Appointment ID': a._id.toString().slice(-6),
    'Patient Name': a.patientId?.name || 'Unknown',
    'Service': a.serviceId?.title || 'General Physiotherapy',
    'Therapist': a.therapistId?.name ? `Dr. ${a.therapistId.name}` : 'Unassigned',
    'Date': a.date,
    'Time Slot': a.timeSlot,
    'Visit Type': a.visitType,
    'Status': (a.status || 'pending').toUpperCase(),
    'Address': a.address || 'Clinic Visit',
  }));

  // 3. Therapist Performance Data
  const thMap = new Map(
    therapistApptAgg.map((item: any) => [
      item._id ? item._id.toString() : '',
      { totalBookings: item.totalBookings || 0, completedSessions: item.completedSessions || 0 },
    ])
  );

  const therapistRows = therapists.map((t: any) => {
    const stats = thMap.get(t._id.toString()) || { totalBookings: 0, completedSessions: 0 };
    return {
      'Therapist Name': t.name,
      'Email': t.email,
      'Mobile': t.mobile,
      'Specialization': (t.specialization || []).join(', '),
      'Experience (Years)': t.experience,
      'Avg Rating': t.ratingAverage || 5,
      'Total Bookings': stats.totalBookings,
      'Completed Sessions': stats.completedSessions,
    };
  });

  // 4. Patient Registry Report Data
  const ptMap = new Map(
    patientApptAgg.map((item: any) => [
      item._id ? item._id.toString() : '',
      { apptCount: item.apptCount || 0, lastVisitDate: item.lastVisitDate || 'None' },
    ])
  );

  const patientRows = patients.map((p: any) => {
    const stats = ptMap.get(p._id.toString()) || { apptCount: 0, lastVisitDate: 'None' };
    return {
      'Patient ID': p._id.toString().slice(-6),
      'Full Name': p.name,
      'Mobile Number': p.userId?.mobile || 'N/A',
      'Gender': p.gender || 'Not specified',
      'Date of Birth': p.dob ? new Date(p.dob).toISOString().split('T')[0] : 'N/A',
      'Emergency Contact': p.emergencyContact?.phone ? `${p.emergencyContact.name} (${p.emergencyContact.phone})` : 'N/A',
      'Medical Conditions': (p.medicalHistory || []).join('; ') || 'None reported',
      'Total Bookings': stats.apptCount,
      'Last Visit Date': stats.lastVisitDate,
      'Registered On': p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : 'N/A',
    };
  });

  const totalRevenueSum = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports & Business Analytics</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Historical ledger transactions, operational logs, custom date ranges, and analytics datasets.
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Realized Revenue</span>
            <span className="text-2xl font-black text-slate-800 block mt-0.5">₹{totalRevenueSum.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings Recorded</span>
            <span className="text-2xl font-black text-slate-800 block mt-0.5">{appointments.length} Visits</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <CalendarCheck size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Practitioners</span>
            <span className="text-2xl font-black text-slate-800 block mt-0.5">{therapists.length} Doctors</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* Full Reports Directory Client with Historical View, Date Range, Filter, and Custom Export */}
      <div className="w-full">
        <ReportsDirectoryClient
          revenueRows={revenueRows}
          appointmentRows={appointmentRows}
          therapistRows={therapistRows}
          patientRows={patientRows}
          totalRevenueSum={totalRevenueSum}
        />
      </div>
    </div>
  );
}
