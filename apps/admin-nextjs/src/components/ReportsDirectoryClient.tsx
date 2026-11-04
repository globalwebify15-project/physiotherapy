'use client';

import React, { useState, useMemo } from 'react';
import DirectoryToolbar from './DirectoryToolbar';
import ExportModal, { ColumnDef } from './ExportModal';
import { exportToCsv } from '@/utils/exportCsv';
import { useToast } from './ToastProvider';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  CalendarCheck, 
  Users, 
  IndianRupee, 
  Calendar,
  Building,
  Home,
  Clock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface ReportsDirectoryClientProps {
  revenueRows: any[];
  appointmentRows: any[];
  therapistRows: any[];
  patientRows: any[];
  totalRevenueSum: number;
}

export default function ReportsDirectoryClient({
  revenueRows,
  appointmentRows,
  therapistRows,
  patientRows,
  totalRevenueSum,
}: ReportsDirectoryClientProps) {
  const toast = useToast();
  const [stream, setStream] = useState<'revenue' | 'appointments' | 'therapists' | 'patients'>('revenue');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [secondaryFilter, setSecondaryFilter] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  // Active dataset
  const activeDataset = useMemo(() => {
    switch (stream) {
      case 'revenue':
        return revenueRows;
      case 'appointments':
        return appointmentRows;
      case 'therapists':
        return therapistRows;
      case 'patients':
        return patientRows;
      default:
        return revenueRows;
    }
  }, [stream, revenueRows, appointmentRows, therapistRows, patientRows]);

  // Date field mapping
  const dateFieldKey = useMemo(() => {
    switch (stream) {
      case 'revenue':
        return 'Payment Date';
      case 'appointments':
        return 'Date';
      case 'patients':
        return 'Registered On';
      default:
        return undefined;
    }
  }, [stream]);

  // Secondary Filter Options based on stream
  const secondaryFilterOptions = useMemo(() => {
    if (stream === 'revenue' || stream === 'appointments') {
      return [
        { label: 'In-Clinic Visits', value: 'clinic' },
        { label: 'Home Visits', value: 'home' },
      ];
    }
    if (stream === 'therapists') {
      return [
        { label: '5.0 Star Rated', value: '5star' },
        { label: '10+ Years Exp', value: '10plus' },
      ];
    }
    if (stream === 'patients') {
      return [
        { label: 'Frequent Visitors (≥1 appt)', value: 'hasBookings' },
        { label: 'New Patients (0 visits)', value: 'new' },
      ];
    }
    return [];
  }, [stream]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return activeDataset.filter((row) => {
      // Date filter
      if (dateFieldKey && dateFilter !== 'all') {
        const rowDate = (row[dateFieldKey] || '').toString().slice(0, 10);
        if (dateFilter === 'today' && rowDate !== todayStr) return false;
        if (dateFilter === 'yesterday') {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          if (rowDate !== y.toISOString().slice(0, 10)) return false;
        }
        if (dateFilter === 'last7') {
          const past7 = new Date();
          past7.setDate(past7.getDate() - 7);
          const past7Str = past7.toISOString().slice(0, 10);
          if (rowDate < past7Str || rowDate > todayStr) return false;
        }
        if (dateFilter === 'thisMonth') {
          if (!rowDate.startsWith(todayStr.slice(0, 7))) return false;
        }
        if (dateFilter === 'custom') {
          if (customStart && rowDate < customStart) return false;
          if (customEnd && rowDate > customEnd) return false;
        }
      }

      // Secondary filter
      if (secondaryFilter !== 'all') {
        if (stream === 'revenue' || stream === 'appointments') {
          const vt = (row['Visit Type'] || '').toLowerCase();
          if (vt !== secondaryFilter) return false;
        } else if (stream === 'therapists') {
          if (secondaryFilter === '5star' && Number(row['Avg Rating']) < 5) return false;
          if (secondaryFilter === '10plus' && Number(row['Experience (Years)']) < 10) return false;
        } else if (stream === 'patients') {
          const count = Number(row['Total Bookings']) || 0;
          if (secondaryFilter === 'hasBookings' && count === 0) return false;
          if (secondaryFilter === 'new' && count > 0) return false;
        }
      }

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const rowValues = Object.values(row).map((v) => String(v).toLowerCase()).join(' ');
        if (!rowValues.includes(q)) return false;
      }

      return true;
    });
  }, [activeDataset, dateFieldKey, dateFilter, customStart, customEnd, secondaryFilter, stream, search]);

  // Historical Monthly Breakdown Analytics
  const monthlyHistoricalStats = useMemo(() => {
    const monthlyRevenueMap: Record<string, { month: string; revenue: number; count: number }> = {};

    revenueRows.forEach((r) => {
      const d = r['Payment Date'];
      if (d && d !== 'N/A') {
        const monthKey = d.slice(0, 7); // 'YYYY-MM'
        if (!monthlyRevenueMap[monthKey]) {
          const dateObj = new Date(d);
          const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthlyRevenueMap[monthKey] = { month: monthLabel, revenue: 0, count: 0 };
        }
        monthlyRevenueMap[monthKey].revenue += Number(r['Amount (INR)']) || 0;
        monthlyRevenueMap[monthKey].count += 1;
      }
    });

    return Object.entries(monthlyRevenueMap)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6);
  }, [revenueRows]);

  // Dynamic Export Columns
  const exportColumns: ColumnDef[] = useMemo(() => {
    if (activeDataset.length === 0) return [];
    return Object.keys(activeDataset[0]).map((key) => ({
      key,
      label: key,
      accessor: (row) => row[key],
    }));
  }, [activeDataset]);

  const handleQuickExport = () => {
    if (filteredData.length === 0) {
      toast.warning('No Records', 'No matching records to export.');
      return;
    }
    const cleanStreamName = stream.charAt(0).toUpperCase() + stream.slice(1);
    exportToCsv(`${cleanStreamName}_Report`, filteredData);
    toast.success('Export Ready', `Downloaded ${filteredData.length} records.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Stream Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
        {[
          { id: 'revenue', label: '💰 Revenue Ledger', count: revenueRows.length },
          { id: 'appointments', label: '📅 Appointments Log', count: appointmentRows.length },
          { id: 'therapists', label: '🩺 Therapist Performance', count: therapistRows.length },
          { id: 'patients', label: '👤 Patient Registry', count: patientRows.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setStream(tab.id as any);
              setSearch('');
              setDateFilter('all');
              setSecondaryFilter('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
              stream === tab.id
                ? 'bg-white text-teal-700 shadow-sm shadow-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                stream === tab.id
                  ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                  : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Historical Breakdown Section (Toggleable) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <TrendingUp size={16} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Historical Business Breakdown</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Monthly realized earnings & appointment velocity</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            {showHistory ? 'Hide Historical Cards' : 'View Historical Trends'}
          </button>
        </div>

        {showHistory && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100 animate-fade-in">
            {monthlyHistoricalStats.length === 0 ? (
              <div className="col-span-full text-center text-xs text-slate-400 py-4">
                No historical payment data logged yet.
              </div>
            ) : (
              monthlyHistoricalStats.map(([monthKey, stat]) => (
                <div
                  key={monthKey}
                  className="bg-slate-50/70 hover:bg-teal-50/50 rounded-2xl p-3 border border-slate-200/70 transition-all text-left"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {stat.month}
                  </span>
                  <div className="text-base font-black text-slate-800 mt-1">
                    ₹{stat.revenue.toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-teal-700 font-bold mt-1">
                    <ArrowUpRight size={11} />
                    <span>{stat.count} Paid Bookings</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Directory Toolbar with Search, Date Range Filter, Secondary Filter, and Custom Export */}
      <DirectoryToolbar
        label={`${stream.charAt(0).toUpperCase() + stream.slice(1)} Dataset`}
        totalCount={activeDataset.length}
        filteredCount={filteredData.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${stream} by name, id, service, date, phone...`}
        showDateFilter={Boolean(dateFieldKey)}
        dateFilterValue={dateFilter}
        onDateFilterChange={setDateFilter}
        customStartDate={customStart}
        onCustomStartDateChange={setCustomStart}
        customEndDate={customEnd}
        onCustomEndDateChange={setCustomEnd}
        filterOptions={secondaryFilterOptions}
        filterValue={secondaryFilter}
        onFilterChange={setSecondaryFilter}
        filterLabel="Type"
        onExport={handleQuickExport}
        onCustomExport={() => setIsExportModalOpen(true)}
        showViewToggle={false}
      />

      {/* Custom Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={`Custom Export - ${stream.toUpperCase()} Report`}
        data={activeDataset}
        dateField={dateFieldKey}
        availableColumns={exportColumns}
        filename={`${stream}_analytics_export`}
      />

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              <FileSpreadsheet className="mx-auto w-12 h-12 text-slate-200 mb-3" />
              No records found matching your active search and date filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {Object.keys(filteredData[0]).map((header) => (
                    <th key={header} className="p-3.5 px-4 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    {Object.values(row).map((val: any, valIdx) => (
                      <td key={valIdx} className="p-3.5 px-4 whitespace-nowrap">
                        {typeof val === 'number' && val > 99
                          ? `₹${val.toLocaleString('en-IN')}`
                          : String(val ?? '')}
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

