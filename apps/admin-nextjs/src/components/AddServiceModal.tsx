'use client';

import React, { useState } from 'react';
import { Plus, X, Activity, Building, MapPin, Loader2 } from 'lucide-react';
import { useToast } from './ToastProvider';

interface AddServiceModalProps {
  onAdd: (formData: FormData) => Promise<void>;
}

export default function AddServiceModal({ onAdd }: AddServiceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = (formData.get('title') as string) || 'Service';
      await onAdd(formData);
      toast.success('Service Added', `"${title}" has been successfully added to the catalog.`);
      setIsOpen(false);
    } catch (err: any) {
      toast.error('Add Failed', err?.message || 'Could not add service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm shadow-teal-600/20 shrink-0"
      >
        <Plus size={16} />
        <span>Add Service</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Add New Treatment Service</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">Configure clinical session details and rates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Post-Pregnancy Core Rehab"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Detailed clinical explanation of treatment protocols..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    required
                    placeholder="e.g. Neurological Rehabilitation"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    required
                    defaultValue={45}
                    min={10}
                    max={240}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Clinic Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="pricingClinic"
                    required
                    placeholder="800"
                    min={0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Home Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="pricingHome"
                    required
                    placeholder="1200"
                    min={0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Service Offerings
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      name="clinicVisitAvailable"
                      defaultChecked
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <Building size={14} className="text-teal-600" />
                    <span>Clinic Consultation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      name="homeVisitAvailable"
                      defaultChecked
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <MapPin size={14} className="text-emerald-600" />
                    <span>Home Visit</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm shadow-teal-600/20"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>Add Service</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

