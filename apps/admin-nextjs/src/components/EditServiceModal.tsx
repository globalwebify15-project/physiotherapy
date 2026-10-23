'use client';

import React, { useState } from 'react';
import { Edit3, Trash2, X, Save, AlertTriangle } from 'lucide-react';

interface EditServiceModalProps {
  service: {
    _id: string;
    title: string;
    description: string;
    category: string;
    duration: number;
    pricingClinic: number;
    pricingHome: number;
    homeVisitAvailable: boolean;
    clinicVisitAvailable: boolean;
  };
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
}

export default function EditServiceModal({
  service,
  onUpdate,
  onDelete,
}: EditServiceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await onUpdate(formData);
    setLoading(false);
    setIsOpen(false);
  };

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await onDelete(formData);
    setLoading(false);
    setIsDeleting(false);
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-600 text-xs font-bold py-2 px-3 rounded-xl border border-slate-200/80 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Edit3 size={13} />
          Edit Service
        </button>
        <button
          onClick={() => {
            setIsDeleting(true);
            setIsOpen(true);
          }}
          className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200/80 transition-colors"
          title="Delete / Deactivate service"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {isDeleting ? 'Deactivate Service' : 'Edit Treatment Service'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  ID: {service._id.slice(-8)}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsDeleting(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {isDeleting ? (
              <form onSubmit={handleDelete} className="space-y-4">
                <input type="hidden" name="serviceId" value={service._id} />
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">Confirm Deactivation</h4>
                    <p className="text-xs text-rose-700/90 mt-1 leading-relaxed">
                      This will remove <strong>{service.title}</strong> from active offerings. Patients will no longer see or book this treatment.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleting(false);
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-sm shadow-rose-200 flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    {loading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <input type="hidden" name="serviceId" value={service._id} />

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Service Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={service.title}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    defaultValue={service.description}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      required
                      defaultValue={service.category}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Duration (Min)</label>
                    <input
                      type="number"
                      name="duration"
                      required
                      min="5"
                      defaultValue={service.duration}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Clinic Price (₹)</label>
                    <input
                      type="number"
                      name="pricingClinic"
                      required
                      defaultValue={service.pricingClinic}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Home Price (₹)</label>
                    <input
                      type="number"
                      name="pricingHome"
                      required
                      defaultValue={service.pricingHome}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Service Offerings</label>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="clinicVisitAvailable"
                      id="editClinicCheck"
                      defaultChecked={service.clinicVisitAvailable}
                      className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="editClinicCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                      Clinic Consultation Available
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="homeVisitAvailable"
                      id="editHomeCheck"
                      defaultChecked={service.homeVisitAvailable}
                      className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="editHomeCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                      Home Visit Available
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors shadow-sm shadow-teal-100 flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
