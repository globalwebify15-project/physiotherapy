import React from 'react';
import { connectDB, Patient, Appointment, Therapist, Payment, Service } from 'database';
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  Activity, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  PhoneCall, 
  Sparkles,
  MapPin,
  Building,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import DashboardCharts from '@/components/DashboardCharts';

export const revalidate = 0; // Live dynamic fetch

export default async function DashboardPage() {
  await connectDB();

  // 1. Core KPIs
  const totalPatients = await Patient.countDocuments();
  const totalAppointments = await Appointment.countDocuments();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyAppointments = await Appointment.countDocuments({ date: todayStr });
  
  // Calculate total revenue from paid payments
  const paidPayments = await Payment.find({ status: 'paid' }).lean();
  const revenue = paidPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  const activeTherapists = await Therapist.countDocuments({ isActive: true });
  const allTherapists = await Therapist.find({ isActive: true }).limit(2).lean();

  // 2. Fetch past 7 days charts data
  const chartsData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const count = await Appointment.countDocuments({ date: dateStr });
    
    const dayPayments = await Payment.find({
      status: 'paid',
      createdAt: {
        $gte: new Date(dateStr + 'T00:00:00.000Z'),
        $lte: new Date(dateStr + 'T23:59:59.999Z'),
      },
    }).lean();
    const dayRevenue = dayPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    chartsData.push({
      date: dateStr,
      bookings: count,
      revenue: dayRevenue,
    });
  }

  // 3. Fetch recent appointments
  const recentAppointments = await Appointment.find()
    .populate({ path: 'patientId', model: Patient })
    .populate({ path: 'serviceId', model: Service })
    .populate({ path: 'therapistId', model: Therapist })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'assigned':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Visual Hero Welcome Banner matching mobile APK Teal/Emerald aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-950 via-teal-800 to-emerald-900 p-7 lg:p-9 text-white shadow-xl shadow-teal-950/20 border border-teal-700/30">
        
        {/* Subtle Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 left-1/3 w-64 h-64 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold uppercase tracking-wider border border-teal-400/20">
              <Sparkles size={13} className="text-teal-300" />
              QuickPhysio24 Clinical Operations
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
              Dr. Bariyar&apos;s Physiotherapy Dashboard
            </h1>
            
            <p className="text-teal-100/90 font-medium text-xs lg:text-sm leading-relaxed">
              Real-time monitoring of patient registrations, home visit consultations, doctor allocations, and revenue flow.
            </p>
          </div>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs font-semibold flex items-center gap-2 text-white">
              <Clock size={15} className="text-teal-300" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            
            <div className="bg-emerald-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-400/30 text-[11px] font-bold text-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Clinic Hours: 9:00 AM – 7:00 PM (Active)
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid with Medical Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Patients */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Patients
            </span>
            <span className="text-3xl font-black text-slate-900 block">{totalPatients}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              <CheckCircle2 size={11} /> Verified Records
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-xs">
            <Users size={26} />
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Bookings
            </span>
            <span className="text-3xl font-black text-slate-900 block">{totalAppointments}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp size={11} /> All Time Visits
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs">
            <Calendar size={26} />
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Today&apos;s Bookings
            </span>
            <span className="text-3xl font-black text-slate-900 block">{dailyAppointments}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              <Clock size={11} /> Scheduled Today
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
            <Clock size={26} />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Realized Revenue
            </span>
            <span className="text-3xl font-black text-slate-900 block">₹{revenue.toLocaleString('en-IN')}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded-md">
              {paidPayments.length} Paid Invoices
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-700 group-hover:text-white transition-all duration-300 shadow-xs">
            <IndianRupee size={26} />
          </div>
        </div>

      </div>

      {/* Analytics Charts with Teal/Emerald Palettes */}
      <DashboardCharts data={chartsData} />

      {/* Recent Activity & Operational Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Appointments Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/70 shadow-sm p-6 lg:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Recent Appointments</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Live requested consultations & therapy visits</p>
              </div>
              <Link 
                href="/admin/appointments" 
                className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                View All Appointments
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3.5">Patient</th>
                    <th className="pb-3.5">Treatment & Mode</th>
                    <th className="pb-3.5">Assigned Doctor</th>
                    <th className="pb-3.5">Schedule</th>
                    <th className="pb-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-600">
                  {recentAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                        No appointments booked yet.
                      </td>
                    </tr>
                  ) : (
                    recentAppointments.map((appt: any) => (
                      <tr key={appt._id.toString()} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pr-2">
                          <div className="font-bold text-slate-900">{appt.patientId?.name || 'Unknown Patient'}</div>
                          <span className="text-[10px] text-slate-400 font-semibold">{appt.patientId?.userId?.mobile || ''}</span>
                        </td>
                        
                        <td className="py-3.5 pr-2">
                          <div className="text-slate-800 font-semibold truncate max-w-[170px]">{appt.serviceId?.title || 'Physiotherapy'}</div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 uppercase ${
                            appt.visitType === 'home' ? 'bg-emerald-50 text-emerald-700' : 'bg-teal-50 text-teal-700'
                          }`}>
                            {appt.visitType === 'home' ? <MapPin size={10} /> : <Building size={10} />}
                            {appt.visitType} Visit
                          </span>
                        </td>

                        <td className="py-3.5 pr-2 text-slate-600">
                          {appt.therapistId?.name ? (
                            <span className="font-semibold text-slate-800">{appt.therapistId.name}</span>
                          ) : (
                            <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 pr-2 text-slate-500 whitespace-nowrap">
                          <div className="font-semibold text-slate-700">{appt.date}</div>
                          <div className="text-[11px] text-slate-400">{appt.timeSlot}</div>
                        </td>

                        <td className="py-3.5 text-right">
                          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border inline-block capitalize ${getStatusBadge(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Clinic Performance & Doctor Quick Desk */}
        <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm p-6 lg:p-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Clinical Staff</h3>
              <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                {activeTherapists} Active
              </span>
            </div>

            {/* Doctors Info Cards */}
            <div className="space-y-3">
              {allTherapists.map((doc: any) => (
                <div key={doc._id.toString()} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-extrabold text-sm flex items-center justify-center border border-teal-200">
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-[11px] text-slate-400 leading-tight truncate max-w-[150px]">{doc.qualification}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    ★ {doc.ratingAverage || 5.0}
                  </span>
                </div>
              ))}
            </div>

            {/* Helpline Fast Link */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Emergency Patient Calling</span>
              <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-900 text-xs font-bold">
                  <PhoneCall size={16} className="text-teal-700" />
                  +91 91109 12544
                </div>
                <span className="text-[10px] text-teal-700 font-extrabold uppercase">Helpline</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50/50 rounded-2xl border border-teal-100/60 text-xs text-teal-800">
            <h4 className="font-bold flex items-center gap-1 text-teal-900">
              <Sparkles size={14} className="text-teal-600" /> Admin Fast-Track Tip
            </h4>
            <p className="mt-1 text-[11px] text-teal-700 leading-relaxed font-medium">
              Assign therapists to incoming <strong>Pending</strong> bookings to automatically send SMS & push notifications to patients.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
