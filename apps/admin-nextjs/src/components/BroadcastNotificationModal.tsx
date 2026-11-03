'use client';

import React, { useState } from 'react';
import { Megaphone, X, Send, Bell, Loader2 } from 'lucide-react';

interface BroadcastNotificationModalProps {
  patients: {
    _id: string;
    name: string;
    userId?: { _id?: string; mobile?: string } | string;
  }[];
  onBroadcast: (formData: FormData) => Promise<void>;
}

export default function BroadcastNotificationModal({
  patients,
  onBroadcast,
}: BroadcastNotificationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await onBroadcast(formData);
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
        <Megaphone size={16} />
        <span>Broadcast Message</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Dispatch Notification Alert</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">Send push alerts and announcements to mobile devices</p>
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
                  Recipient Target *
                </label>
                <select
                  name="targetType"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  <option value="all">📢 All Registered Patients (Broadcast)</option>
                  {patients.map((p: any) => {
                    const uId = typeof p.userId === 'object' && p.userId?._id ? p.userId._id.toString() : (p.userId ? String(p.userId) : String(p._id));
                    const mobile = typeof p.userId === 'object' && p.userId?.mobile ? p.userId.mobile : '';
                    return (
                      <option key={String(p._id)} value={uId}>
                        👤 {p.name} {mobile ? `(${mobile})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Notification Category *
                </label>
                <select
                  name="type"
                  defaultValue="announcement"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  <option value="announcement">Announcement / Clinic Update</option>
                  <option value="booking_alert">Booking & Schedule Notice</option>
                  <option value="payment_alert">Invoice & Payment Reminder</option>
                  <option value="reminder">Health & Therapy Reminder</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Clinic Holiday Notice / Special Posture Camp"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Message Body *
                </label>
                <textarea
                  name="body"
                  required
                  rows={3}
                  placeholder="Type the message content that will appear on the patient's device..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
                />
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
                  <span>Dispatch Notification</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

