'use client';

import React, { useState, useMemo } from 'react';
import { X, Download, Calendar, Filter, CheckSquare, Square, FileSpreadsheet } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';
import { useToast } from './ToastProvider';

export interface ColumnDef {
  key: string;
  label: string;
  accessor?: (row: any) => any;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  dateField?: string; // key in data row, e.g. 'date' or 'createdAt'
  availableColumns: ColumnDef[];
  filename: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  title,
  data,
  dateField,
  availableColumns,
  filename,
}: ExportModalProps) {
  const toast = useToast();
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    availableColumns.map((c) => c.key)
  );

  // Compute filtered dataset based on date selection
  const filteredData = useMemo(() => {
    if (!dateField || datePreset === 'all') return data;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const getRowDate = (row: any): string => {
      const val = row[dateField];
      if (!val) return '';
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        return val.slice(0, 10);
      }
      try {
        return new Date(val).toISOString().slice(0, 10);
      } catch {
        return '';
      }
    };

    if (datePreset === 'today') {
      return data.filter((row) => getRowDate(row) === todayStr);
    }

    if (datePreset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().slice(0, 10);
      return data.filter((row) => getRowDate(row) === yStr);
    }

    if (datePreset === 'last7') {
      const past7 = new Date();
      past7.setDate(past7.getDate() - 7);
      const past7Str = past7.toISOString().slice(0, 10);
      return data.filter((row) => {
        const d = getRowDate(row);
        return d >= past7Str && d <= todayStr;
      });
    }

    if (datePreset === 'thisMonth') {
      const monthPrefix = todayStr.slice(0, 7); // 'YYYY-MM'
      return data.filter((row) => getRowDate(row).startsWith(monthPrefix));
    }

    if (datePreset === 'custom') {
      return data.filter((row) => {
        const d = getRowDate(row);
        if (!d) return false;
        if (customStart && d < customStart) return false;
        if (customEnd && d > customEnd) return false;
        return true;
      });
    }

    return data;
  }, [data, dateField, datePreset, customStart, customEnd]);

  if (!isOpen) return null;

  const toggleColumn = (key: string) => {
    if (selectedColumns.includes(key)) {
      if (selectedColumns.length === 1) return; // Must keep at least 1 column
      setSelectedColumns(selectedColumns.filter((k) => k !== key));
    } else {
      setSelectedColumns([...selectedColumns, key]);
    }
  };

  const selectAll = () => {
    setSelectedColumns(availableColumns.map((c) => c.key));
  };

  const handleDownload = () => {
    if (filteredData.length === 0) {
      toast.warning('No Records', 'There are no records matching your selected date criteria to export.');
      return;
    }

    const exportRows = filteredData.map((row) => {
      const record: Record<string, any> = {};
      availableColumns.forEach((col) => {
        if (selectedColumns.includes(col.key)) {
          record[col.label] = col.accessor ? col.accessor(row) : row[col.key];
        }
      });
      return record;
    });

    exportToCsv(filename, exportRows);
    toast.success('Export Successful', `Exported ${exportRows.length} records to ${filename}.csv`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Custom CSV Export</h3>
              <p className="text-[11px] text-slate-400 font-semibold">{title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Date Range Selection (if dateField is provided) */}
          {dateField && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Calendar size={13} className="text-teal-600" />
                Select Date Range
              </label>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { id: 'all', label: 'All Dates' },
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'last7', label: 'Last 7 Days' },
                  { id: 'thisMonth', label: 'This Month' },
                  { id: 'custom', label: 'Custom Range' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDatePreset(item.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                      datePreset === item.id
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {datePreset === 'custom' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Column / Field Customization */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Filter size={13} className="text-teal-600" />
                Select Export Values / Columns ({selectedColumns.length}/{availableColumns.length})
              </label>
              <button
                type="button"
                onClick={selectAll}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-700"
              >
                Select All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 max-h-48 overflow-y-auto">
              {availableColumns.map((col) => {
                const isSelected = selectedColumns.includes(col.key);
                return (
                  <div
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-white text-slate-800 shadow-2xs border border-teal-100'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare size={14} className="text-teal-600 shrink-0" />
                    ) : (
                      <Square size={14} className="text-slate-300 shrink-0" />
                    )}
                    <span className="truncate">{col.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Summary Box */}
          <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-teal-900">Ready to export</p>
              <p className="text-xs text-teal-700 font-medium">
                {filteredData.length} records matching criteria • {selectedColumns.length} columns selected
              </p>
            </div>
            <span className="text-lg font-black text-teal-700">
              {filteredData.length}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={filteredData.length === 0}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-teal-600/20 disabled:opacity-50"
          >
            <Download size={14} />
            <span>Download CSV ({filteredData.length})</span>
          </button>
        </div>

      </div>
    </div>
  );
}

