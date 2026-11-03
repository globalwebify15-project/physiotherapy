'use client';

import React, { useState, useMemo } from 'react';
import DirectoryToolbar from './DirectoryToolbar';
import AddServiceModal from './AddServiceModal';
import EditServiceModal from './EditServiceModal';
import { exportToCsv } from '@/utils/exportCsv';
import { Activity, Clock, Building, MapPin } from 'lucide-react';

interface ServicesDirectoryClientProps {
  services: any[];
  onAdd: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
}

export default function ServicesDirectoryClient({
  services,
  onAdd,
  onUpdate,
  onDelete,
}: ServicesDirectoryClientProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [offeringFilter, setOfferingFilter] = useState('all');
  const [view, setView] = useState<'table' | 'cards'>('table');

  // Unique categories for filter
  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));
    return cats.map((c) => ({ label: c, value: c }));
  }, [services]);

  const offeringOptions = [
    { label: 'Clinic Visits Only', value: 'clinic' },
    { label: 'Home Visits Only', value: 'home' },
  ];

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      // Category filter
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;

      // Offering filter
      if (offeringFilter === 'clinic' && !s.clinicVisitAvailable) return false;
      if (offeringFilter === 'home' && !s.homeVisitAvailable) return false;

      // Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = (s.title || '').toLowerCase().includes(q);
        const descMatch = (s.description || '').toLowerCase().includes(q);
        const catMatch = (s.category || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [services, search, categoryFilter, offeringFilter]);

  const handleExport = () => {
    const exportRows = filteredServices.map((s) => ({
      'Service Title': s.title,
      'Category': s.category,
      'Duration (Minutes)': s.duration,
      'Clinic Price (INR)': s.clinicVisitAvailable ? s.pricingClinic : 'N/A',
      'Home Price (INR)': s.homeVisitAvailable ? s.pricingHome : 'N/A',
      'Clinic Visit': s.clinicVisitAvailable ? 'Yes' : 'No',
      'Home Visit': s.homeVisitAvailable ? 'Yes' : 'No',
      'Description': s.description,
    }));
    exportToCsv('Physiotherapy_Services', exportRows);
  };

  return (
    <div className="w-full space-y-4">
      {/* Search, Filter, Export & Add Service Toolbar */}
      <DirectoryToolbar
        label="Services Catalog"
        totalCount={services.length}
        filteredCount={filteredServices.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search services by title, clinical category or description..."
        filterOptions={categoryOptions}
        filterValue={categoryFilter}
        onFilterChange={setCategoryFilter}
        filterLabel="Category"
        secondaryFilterOptions={offeringOptions}
        secondaryFilterValue={offeringFilter}
        onSecondaryFilterChange={setOfferingFilter}
        secondaryFilterLabel="Offering"
        onExport={handleExport}
        actionButton={<AddServiceModal onAdd={onAdd} />}
        showViewToggle={true}
        view={view}
        onViewChange={setView}
      />

      {/* Directory Content (Full Width) */}
      {filteredServices.length === 0 ? (
        <div className="w-full bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center">
          <Activity className="mx-auto text-slate-300 w-12 h-12 mb-4" />
          <h3 className="font-bold text-slate-800 text-lg">No matching treatments found</h3>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search terms or filters.</p>
        </div>
      ) : view === 'table' ? (
        /* Table View */
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Treatment Service & Category</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Clinic Rate</th>
                  <th className="py-3.5 px-4">Home Rate</th>
                  <th className="py-3.5 px-4">Consultation Options</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredServices.map((service: any) => (
                  <tr key={service._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 text-sm">{service.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                          {service.category}
                        </span>
                        <span className="text-[11px] text-slate-400 line-clamp-1 max-w-md" title={service.description}>
                          {service.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-[11px]">
                        <Clock size={11} className="text-slate-400" />
                        {service.duration} mins
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm">
                        {service.clinicVisitAvailable ? `₹${service.pricingClinic}` : <span className="text-slate-300 font-normal">N/A</span>}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm">
                        {service.homeVisitAvailable ? `₹${service.pricingHome}` : <span className="text-slate-300 font-normal">N/A</span>}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {service.clinicVisitAvailable && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                            <Building size={11} /> Clinic Consultation
                          </span>
                        )}
                        {service.homeVisitAvailable && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                            <MapPin size={11} /> Home Visit
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <EditServiceModal
                        service={{
                          _id: service._id.toString(),
                          title: String(service.title),
                          description: String(service.description),
                          category: String(service.category),
                          duration: Number(service.duration),
                          pricingClinic: Number(service.pricingClinic),
                          pricingHome: Number(service.pricingHome),
                          homeVisitAvailable: Boolean(service.homeVisitAvailable),
                          clinicVisitAvailable: Boolean(service.clinicVisitAvailable),
                        }}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View (Full Width Grid) */
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service: any) => (
            <div
              key={service._id.toString()}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    {service.category}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                    <Clock size={12} />
                    {service.duration} mins
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-base leading-snug">{service.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 font-medium">{service.description}</p>
              </div>

              <div>
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Building size={14} className={service.clinicVisitAvailable ? 'text-teal-600' : 'text-slate-300'} />
                      <span>Clinic: {service.clinicVisitAvailable ? `₹${service.pricingClinic}` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className={service.homeVisitAvailable ? 'text-emerald-600' : 'text-slate-300'} />
                      <span>Home: {service.homeVisitAvailable ? `₹${service.pricingHome}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <EditServiceModal
                  service={{
                    _id: service._id.toString(),
                    title: String(service.title),
                    description: String(service.description),
                    category: String(service.category),
                    duration: Number(service.duration),
                    pricingClinic: Number(service.pricingClinic),
                    pricingHome: Number(service.pricingHome),
                    homeVisitAvailable: Boolean(service.homeVisitAvailable),
                    clinicVisitAvailable: Boolean(service.clinicVisitAvailable),
                  }}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

