'use client';

import React from 'react';
import { Search, X, Download, Table, LayoutGrid, Filter } from 'lucide-react';

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

  // Export
  onExport?: () => void;
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
  onExport,
  exportLabel = 'Export CSV',
  actionButton,
  showViewToggle = true,
  view = 'table',
  onViewChange,
}: DirectoryToolbarProps) {
  const isFiltered = (filterValue && filterValue !== 'all') || 
                     (secondaryFilterValue && secondaryFilterValue !== 'all') || 
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
              }}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Right side controls: Action Button, Export, View Toggle */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {actionButton}

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              title="Download filtered CSV"
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition-colors shadow-2xs shrink-0"
            >
              <Download size={14} className="text-slate-500" />
              <span>{exportLabel}</span>
            </button>
          )}

          {showViewToggle && onViewChange && (
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => onViewChange('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-150 ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-150 ${
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-100">
        {/* Search Input */}
        <div className="relative flex-1">
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
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Primary Filter Dropdown */}
        {filterOptions && onFilterChange && (
          <div className="relative shrink-0">
            <select
              value={filterValue || 'all'}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white"
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
              className="w-full sm:w-auto bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white"
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

