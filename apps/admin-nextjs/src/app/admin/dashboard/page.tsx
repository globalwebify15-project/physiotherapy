import React from 'react';
import { connectDB, Patient, Appointment, Therapist, Payment, Service } from 'database';
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  Activity, 
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import DashboardCharts from '@/components/DashboardCharts';

export const revalidate = 0; // Disable caching to fetch real-time updates

export default async function DashboardPage() {
  await connectDB();

  // 1. Core KPIs
  const totalPatients = await Patient.countDocuments();
  const totalAppointments = await Appointment.countDocuments();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyAppointments = await Appointment.countDocuments({ date: todayStr });
  
  // Calculate total revenue from paid payments
  const paidPayments = await Payment.find({ status: 'paid' });
  const revenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);

  const activeTherapists = await Therapist.countDocuments({ isActive: true });

  // 2. Fetch past 7 days charts data
  const chartsData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const count = await Appointment.countDocuments({ date: dateStr });
    
    // Find payments created on this specific day
    const dayPayments = await Payment.find({
      status: 'paid',
      createdAt: {
        $gte: new Date(dateStr + 'T00:00:00.000Z'),
        $lte: new Date(dateStr + 'T23:59:59.999Z'),
      },
    });
    const dayRevenue = dayPayments.reduce((sum, p) => sum + p.amount, 0);

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
    .limit(5);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-200/50';
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200/50';
      case 'assigned':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200/50';
      case 'in-progress':
        return 'bg-blue-50 text-blue-600 border-blue-200/50';
      case 'completed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-200/50';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-indigo-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">System Status Summary</h1>
          <p className="text-indigo-100 mt-1 font-medium text-sm lg:text-base">
            Welcome back! Here is what is happening at the clinic today.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold self-start md:self-auto flex items-center gap-2">
          <Clock size={16} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Patients Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">Total Patients</span>
            <span className="text-3xl font-extrabold text-slate-800 block">{totalPatients}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Users size={24} />
          </div>
        </div>

        {/* Appointments Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
            <span className="text-3xl font-extrabold text-slate-800 block">{totalAppointments}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Calendar size={24} />
          </div>
        </div>

        {/* Daily Appointments Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">Today's Bookings</span>
            <span className="text-3xl font-extrabold text-slate-800 block">{dailyAppointments}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Clock size={24} />
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-3xl font-extrabold text-slate-800 block">₹{revenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <IndianRupee size={24} />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts data={chartsData} />

      {/* Recent Activity & Quick Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Recent Appointments</h3>
              <p className="text-sm text-slate-400 font-medium">Latest booking requests and confirmations</p>
            </div>
            <Link 
              href="/admin/appointments" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
            >
              View All 
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Therapist</th>
                  <th className="pb-3">Date/Time</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-600">
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No appointments booked yet.
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((appt: any) => (
                    <tr key={appt._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pr-2 font-semibold text-slate-800">
                        {appt.patientId?.name || 'Unknown Patient'}
                      </td>
                      <td className="py-3.5 pr-2">
                        {appt.serviceId?.title || 'General Therapy'}
                      </td>
                      <td className="py-3.5 pr-2 text-slate-500">
                        {appt.therapistId?.name || (
                          <span className="text-amber-500 font-semibold italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-2 text-slate-500">
                        <div>{appt.date}</div>
                        <div className="text-xs text-slate-400">{appt.timeSlot}</div>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusBadgeColor(appt.status)}`}>
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

        {/* Quick Insights Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Clinic Performance</h3>
            <p className="text-sm text-slate-400 font-medium mb-6">Key operational indicators</p>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Active Staff</h4>
                    <p className="text-xs text-slate-400">Therapists currently active</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-slate-800">{activeTherapists} / {activeTherapists}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Transaction Status</h4>
                    <p className="text-xs text-slate-400">Total orders captured</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-slate-800">{paidPayments.length} paid</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/30">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Quick Note</h4>
            <p className="text-xs text-indigo-600/90 mt-1 leading-relaxed">
              Appointments showing as <span className="font-semibold text-amber-600">Pending</span> require a therapist assignment or manual verification once payment is recorded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
