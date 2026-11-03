'use client';

import React, { useState } from 'react';
import { Plus, X, UserRound, Camera, Loader2 } from 'lucide-react';

interface AddTherapistModalProps {
  onAdd: (formData: FormData) => Promise<void>;
}

export default function AddTherapistModal({ onAdd }: AddTherapistModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await onAdd(formData);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
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
        <span>Onboard Therapist</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <UserRound size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Onboard Clinical Specialist</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">Doctor credentials, qualifications & schedule</p>
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
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="rajesh@quickphysio24.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Mobile *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    placeholder="+91 91109 12544"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Qualification *
                </label>
                <input
                  type="text"
                  name="qualification"
                  required
                  placeholder="e.g. MPT (Sports Medicine), BPT, MIAP"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    required
                    defaultValue={5}
                    min={0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Working Days
                  </label>
                  <input
                    type="text"
                    name="workingDays"
                    defaultValue="Mon - Sun (Daily)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Specializations (Comma Separated)
                </label>
                <input
                  type="text"
                  name="specialization"
                  placeholder="Stroke Rehab, Pediatric, Spine Care, Dry Needling"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Profile Photo Upload */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Profile Photo
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="profileImage"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer focus:outline-none focus:border-teal-500"
                  />
                </div>
                <p className="text-[10px] text-teal-700 font-semibold mt-1">
                  ⚡ Image is automatically compressed & converted to high-speed <strong>.webp</strong>.
                </p>
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
                  <span>Onboard Therapist</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

