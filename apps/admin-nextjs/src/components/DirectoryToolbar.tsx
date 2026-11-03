'use client';

import React from 'react';
import { Search, X, Download, Table, LayoutGrid, Filter, Calendar, Settings2 } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface DirectoryToolbarProps {
  label?: string;
  totalCount: number;
  filteredCount?: number;
  
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;

  // Primary Filter (e.g. Category or Status)
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (val: string) => void;
  filterLabel?: string;

  // Secondary Filter (optional, e.g. Visit Type or Role)
  secondaryFilterOptions?: FilterOption[];
  secondaryFilterValue?: string;
  onSecondaryFilterChange?: (val: string) => void;
  secondaryFilterLabel?: string;

  // Date Filter (optional, e.g. for Appointments, Payments)
  showDateFilter?: boolean;
  dateFilterValue?: string;
  onDateFilterChange?: (val: string) => void;
  customStartDate?: string;
  onCustomStartDateChange?: (val: string) => void;
  customEndDate?: string;
  onCustomEndDateChange?: (val: string) => void;

  // Export
  onExport?: () => void;
  onCustomExport?: () => void;
  exportLabel?: string;

  // Action Button (e.g. Add Modal)
  actionButton?: React.ReactNode;

  // View Switcher (Table / Cards)
  showViewToggle?: boolean;
  view?: 'table' | 'cards';
  onViewChange?: (view: 'table' | 'cards') => void;
}

export default function DirectoryToolbar({
  label,
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterOptions,
  filterValue,
  onFilterChange,
  filterLabel = 'Filter',
  secondaryFilterOptions,
  secondaryFilterValue,
  onSecondaryFilterChange,
  secondaryFilterLabel = 'Type',
  showDateFilter = false,
  dateFilterValue = 'all',
  onDateFilterChange,
  customStartDate = '',
  onCustomStartDateChange,
  customEndDate = '',
  onCustomEndDateChange,
  onExport,
  onCustomExport,
  exportLabel = 'Export CSV',
  actionButton,
  showViewToggle = true,
  view = 'table',
  onViewChange,
}: DirectoryToolbarProps) {
  const isFiltered = (filterValue && filterValue !== 'all') || 
                     (secondaryFilterValue && secondaryFilterValue !== 'all') || 
                     (showDateFilter && dateFilterValue !== 'all') ||
                     searchQuery.trim().length > 0;

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
      {/* Top Row: Title, Counts, Add Action, View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {label && (
            <h2 className="text-sm font-extrabold text-slate-800">
              {label}
            </h2>
          )}
          <span className="text-[11px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200/70 px-2.5 py-0.5 rounded-full">
            {typeof filteredCount === 'number' && filteredCount !== totalCount
              ? `Showing ${filteredCount} of ${totalCount}`
              : `${totalCount} Total`}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                if (onFilterChange) onFilterChange('all');
                if (onSecondaryFilterChange) onSecondaryFilterChange('all');
                if (onDateFilterChange) onDateFilterChange('all');
                if (onCustomStartDateChange) onCustomStartDateChange('');
                if (onCustomEndDateChange) onCustomEndDateChange('');
              }}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Right side controls: Action Button, Export, View Toggle */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {actionButton}

          {/* Export button (or Custom Export modal trigger) */}
          {(onExport || onCustomExport) && (
            <div className="inline-flex items-center rounded-xl bg-slate-100 border border-slate-200 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={onCustomExport || onExport}
                title="Download CSV report (Custom dates & columns)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
              >
                <Download size={14} className="text-slate-500" />
                <span>{exportLabel}</span>
              </button>
              {onCustomExport && onExport && (
                <button
                  type="button"
                  onClick={onCustomExport}
                  title="Configure custom dates & column values for export"
                  className="px-2 py-1.5 border-l border-slate-200 text-slate-500 hover:text-teal-700 hover:bg-slate-200/50 rounded-r-lg transition-colors cursor-pointer"
                >
                  <Settings2 size={13} />
                </button>
              )}
            </div>
          )}

          {showViewToggle && onViewChange && (
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => onViewChange('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                  view === 'table'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Table size={13} className={view === 'table' ? 'text-teal-600' : 'text-slate-400'} />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => onViewChange('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                  view === 'cards'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid size={13} className={view === 'cards' ? 'text-teal-600' : 'text-slate-400'} />
                <span>Cards</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Search Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-100 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Date Filter (Appointments & Payments) */}
        {showDateFilter && onDateFilterChange && (
          <div className="flex items-center gap-2">
            <div className="relative shrink-0 flex items-center">
              <Calendar size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
              <select
                value={dateFilterValue}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200/80 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white cursor-pointer"
              >
                <option value="all">📅 All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7">Last 7 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Range...</option>
              </select>
            </div>

            {dateFilterValue === 'custom' && (
              <div className="flex items-center gap-1.5 animate-fade-in">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => onCustomStartDateChange && onCustomStartDateChange(e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                  title="Start Date"
                />
                <span className="text-slate-400 text-xs font-bold">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => onCustomEndDateChange && onCustomEndDateChange(e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                  title="End Date"
                />
              </div>
            )}
          </div>
        )}

        {/* Primary Filter Dropdown */}
        {filterOptions && onFilterChange && (
          <div className="relative shrink-0">
            <select
              value={filterValue || 'all'}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white cursor-pointer"
            >
              <option value="all">All {filterLabel}s</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Secondary Filter Dropdown */}
        {secondaryFilterOptions && onSecondaryFilterChange && (
          <div className="relative shrink-0">
            <select
              value={secondaryFilterValue || 'all'}
              onChange={(e) => onSecondaryFilterChange(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white cursor-pointer"
            >
              <option value="all">All {secondaryFilterLabel}s</option>
              {secondaryFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
