'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Calendar, IndianRupee, TrendingUp, Sparkles } from 'lucide-react';

interface ChartDataItem {
  date: string;
  bookings: number;
  revenue: number;
}

interface DashboardChartsProps {
  data: ChartDataItem[];
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  // Format Date for chart label (e.g. "2026-08-08" -> "08 Aug")
  const formatDateLabel = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      return dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    } catch (e) {
      return dateStr;
    }
  };

  const totalBookings = data.reduce((acc, curr) => acc + curr.bookings, 0);
  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Bookings Area Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Calendar size={16} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
                  7-Day Booking Trends
                </span>
                <p className="text-lg font-extrabold text-slate-800 tracking-tight">Appointments Volume</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold block">Total 7-Days</span>
            <span className="text-base font-extrabold text-teal-700">{totalBookings} Bookings</span>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBookingsTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateLabel} 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '16px', 
                  border: '1px solid #ccfbf1',
                  boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.15)',
                  fontSize: '12px',
                  fontWeight: '600'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="bookings" 
                stroke="#0f766e" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBookingsTeal)" 
                name="Appointments"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <IndianRupee size={16} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  7-Day Financial Flow
                </span>
                <p className="text-lg font-extrabold text-slate-800 tracking-tight">Realized Revenue</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold block">Total 7-Days</span>
            <span className="text-base font-extrabold text-emerald-700">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenueEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateLabel} 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '16px', 
                  border: '1px solid #d1fae5',
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)',
                  fontSize: '12px',
                  fontWeight: '600'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#059669" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenueEmerald)" 
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
