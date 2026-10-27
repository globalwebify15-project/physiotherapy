import React from 'react';
import { connectDB, Payment, Appointment, Patient, Therapist, Service, User } from 'database';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  CalendarCheck, 
  Users, 
  Activity, 
  IndianRupee,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import ReportDownloader from '@/components/ReportDownloader';

export const revalidate = 0; // Dynamic fetch

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  await connectDB();

  const resolvedParams = searchParams ? await searchParams : {};
  const currentType = resolvedParams?.type || 'revenue';

  // 1. Revenue Report Data
  const payments = await Payment.find({ status: 'paid' })
    .populate({
      path: 'appointmentId',
      model: Appointment,
      populate: [
        { path: 'patientId', model: Patient },
        { path: 'serviceId', model: Service },
      ],
    })
    .sort({ createdAt: -1 });

  const revenueRows = payments.map((p: any) => {
    const appt = p.appointmentId;
    return {
      'Transaction ID': p.razorpayPaymentId || 'N/A',
      'Order ID': p.razorpayOrderId || 'N/A',
      'Patient Name': appt?.patientId?.name || 'Unknown',
      'Treatment Service': appt?.serviceId?.title || 'General Therapy',
      'Visit Type': appt?.visitType || 'clinic',
      'Amount (INR)': p.amount,
      'Payment Date': new Date(p.createdAt).toISOString().split('T')[0],
      'Status': p.status,
    };
  });

  // 2. Appointment Report Data
  const appointments = await Appointment.find()
    .populate({ path: 'patientId', model: Patient })
    .populate({ path: 'serviceId', model: Service })
    .populate({ path: 'therapistId', model: Therapist })
    .sort({ date: -1, timeSlot: -1 });

  const appointmentRows = appointments.map((a: any) => ({
    'Appointment ID': a._id.toString(),
    'Patient Name': a.patientId?.name || 'Unknown',
    'Service': a.serviceId?.title || 'Unknown',
    'Therapist': a.therapistId?.name || 'Unassigned',
    'Date': a.date,
    'Time Slot': a.timeSlot,
    'Visit Type': a.visitType,
    'Status': a.status,
    'Address': a.address || 'Clinic Visit',
  }));

  // 3. Therapist Performance Data
  const therapists = await Therapist.find().sort({ name: 1 });
  const therapistRows = await Promise.all(
    therapists.map(async (t: any) => {
      const totalBookings = await Appointment.countDocuments({ therapistId: t._id });
      const completed = await Appointment.countDocuments({ therapistId: t._id, status: 'completed' });
      return {
        'Therapist Name': t.name,
        'Email': t.email,
        'Mobile': t.mobile,
        'Specialization': (t.specialization || []).join(', '),
        'Experience (Years)': t.experience,
        'Avg Rating': t.ratingAverage,
        'Total Bookings': totalBookings,
        'Completed Sessions': completed,
      };
    })
  );

  // 4. Patient Registry Report Data
  const patients = await Patient.find()
    .populate({ path: 'userId', model: User })
    .sort({ createdAt: -1 });

  const patientRows = await Promise.all(
    patients.map(async (p: any) => {
      const apptCount = await Appointment.countDocuments({ patientId: p._id });
      const lastAppt = await Appointment.findOne({ patientId: p._id }).sort({ date: -1 });
      return {
        'Patient ID': p._id.toString().slice(-6),
        'Full Name': p.name,
        'Mobile Number': p.userId?.mobile || 'N/A',
        'Gender': p.gender || 'Not specified',
        'Date of Birth': p.dob ? new Date(p.dob).toISOString().split('T')[0] : 'N/A',
        'Emergency Contact': p.emergencyContact?.phone ? `${p.emergencyContact.name} (${p.emergencyContact.phone})` : 'N/A',
        'Medical Conditions': (p.medicalHistory || []).join('; ') || 'None reported',
        'Total Bookings': apptCount,
        'Last Visit Date': lastAppt?.date || 'None',
        'Registered On': p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : 'N/A',
      };
    })
  );

  // Active data selection
  let activeData: any[] = [];
  let reportTitle = '';
  let filename = '';

  if (currentType === 'revenue') {
    activeData = revenueRows;
    reportTitle = 'Revenue & Financial Transactions Report';
    filename = 'Revenue_Report';
  } else if (currentType === 'appointments') {
    activeData = appointmentRows;
    reportTitle = 'Clinic & Home Appointments Log';
    filename = 'Appointments_Report';
  } else if (currentType === 'therapists') {
    activeData = therapistRows;
    reportTitle = 'Therapist Productivity & Rating Report';
    filename = 'Therapists_Report';
  } else if (currentType === 'patients') {
    activeData = patientRows;
    reportTitle = 'Registered Patient Directory Report';
    filename = 'Patients_Report';
  }

  // Summary Metrics
  const totalRevenueSum = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Business Analytics</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Generate and export ledger transactions, operational logs, and practitioner performance datasets.
          </p>
        </div>

        {/* Download CSV button */}
        <ReportDownloader
          filename={filename}
          data={activeData}
          buttonText={`Export ${filename.replace('_', ' ')} (CSV)`}
        />
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Realized Revenue</span>
            <span className="text-2xl font-extrabold text-slate-800 block mt-1">₹{totalRevenueSum.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Bookings Recorded</span>
            <span className="text-2xl font-extrabold text-slate-800 block mt-1">{appointments.length} Visits</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CalendarCheck size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Practitioners</span>
            <span className="text-2xl font-extrabold text-slate-800 block mt-1">{therapists.length} Doctors</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/reports?type=revenue"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                currentType === 'revenue'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-100'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              💰 Revenue Ledger ({revenueRows.length})
            </Link>
            <Link
              href="/admin/reports?type=appointments"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                currentType === 'appointments'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-100'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              📅 Appointments Log ({appointmentRows.length})
            </Link>
            <Link
              href="/admin/reports?type=therapists"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                currentType === 'therapists'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-100'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              🩺 Therapist Performance ({therapistRows.length})
            </Link>
            <Link
              href="/admin/reports?type=patients"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                currentType === 'patients'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-100'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              👤 Patient Registry ({patientRows.length})
            </Link>
          </div>

          <div className="text-xs font-bold text-slate-400">
            Showing {activeData.length} records
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          {activeData.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              <FileSpreadsheet className="mx-auto w-12 h-12 text-slate-200 mb-3" />
              No records available for this report type.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                  {Object.keys(activeData[0]).map((header) => (
                    <th key={header} className="p-3.5">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-600">
                {activeData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    {Object.values(row).map((val: any, valIdx) => (
                      <td key={valIdx} className="p-3.5 whitespace-nowrap">
                        {typeof val === 'number' && val > 99 ? val.toLocaleString('en-IN') : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
