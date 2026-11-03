'use client';

import React, { useState } from 'react';
import { Table, LayoutGrid } from 'lucide-react';

interface ViewSwitcherProps {
  defaultView?: 'table' | 'cards';
  tableView: React.ReactNode;
  cardView: React.ReactNode;
  totalCount?: number;
  label?: string;
}

export default function ViewSwitcher({
  defaultView = 'table',
  tableView,
  cardView,
  totalCount,
  label,
}: ViewSwitcherProps) {
  const [view, setView] = useState<'table' | 'cards'>(defaultView);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 px-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-xs font-bold text-slate-700">
              {label}
            </span>
          )}
          {typeof totalCount === 'number' && (
            <span className="text-[11px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200/70 px-2.5 py-0.5 rounded-full">
              {totalCount} Total
            </span>
          )}
        </div>

        {/* View mode toggle switch */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 ml-auto shrink-0">
          <button
            type="button"
            onClick={() => setView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-150 ${
              view === 'table'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Table size={14} className={view === 'table' ? 'text-teal-600' : 'text-slate-400'} />
            <span>Table View</span>
          </button>
          <button
            type="button"
            onClick={() => setView('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-150 ${
              view === 'cards'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid size={14} className={view === 'cards' ? 'text-teal-600' : 'text-slate-400'} />
            <span>Cards View</span>
          </button>
        </div>
      </div>

      {/* Render the active view */}
      {view === 'table' ? (
        <div className="animate-fade-in">{tableView}</div>
      ) : (
        <div className="animate-fade-in">{cardView}</div>
      )}
    </div>
  );
}

