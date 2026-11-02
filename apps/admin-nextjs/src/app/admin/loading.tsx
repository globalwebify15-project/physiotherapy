import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse p-1">
      {/* Top Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200/80 rounded-xl"></div>
          <div className="h-4 w-96 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-10 w-36 bg-slate-100 rounded-xl"></div>
      </div>

      {/* Hero / Banner Skeleton */}
      <div className="h-40 w-full rounded-3xl bg-gradient-to-r from-teal-900/40 via-teal-800/30 to-emerald-900/40 border border-teal-500/10 flex items-center px-8">
        <div className="space-y-3 w-1/2">
          <div className="h-6 w-48 bg-teal-400/20 rounded-lg"></div>
          <div className="h-4 w-72 bg-teal-300/10 rounded-md"></div>
        </div>
      </div>

      {/* 4 KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-slate-100"></div>
              <div className="w-12 h-5 rounded-full bg-slate-100"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-100 rounded"></div>
              <div className="h-7 w-32 bg-slate-200/80 rounded-lg"></div>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content Area Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column (Chart / Table) */}
        <div className="xl:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="h-5 w-40 bg-slate-200/80 rounded"></div>
            <div className="h-8 w-24 bg-slate-100 rounded-lg"></div>
          </div>
          <div className="h-72 w-full bg-slate-50 rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Right Column (Side List / Quick Actions) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm space-y-4">
          <div className="h-5 w-32 bg-slate-200/80 rounded mb-4"></div>
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="p-3 rounded-xl bg-slate-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200"></div>
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-28 bg-slate-200 rounded"></div>
                <div className="h-2.5 w-40 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

