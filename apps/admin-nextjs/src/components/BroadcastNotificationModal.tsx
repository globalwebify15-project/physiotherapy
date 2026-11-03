'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Megaphone, X, Send, Bell, Loader2, Search, User, Check, Users } from 'lucide-react';
import { useToast } from './ToastProvider';

interface PatientOption {
  _id: string;
  name: string;
  userId?: { _id?: string; mobile?: string } | string;
}

interface BroadcastNotificationModalProps {
  patients: PatientOption[];
  onBroadcast: (formData: FormData) => Promise<void>;
}

export default function BroadcastNotificationModal({
  patients,
  onBroadcast,
}: BroadcastNotificationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Searchable Target State
  const [targetType, setTargetType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter patients by name or phone
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase().trim();
    return patients.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const mobile = typeof p.userId === 'object' && p.userId?.mobile ? p.userId.mobile.toLowerCase() : '';
      return name.includes(q) || mobile.includes(q);
    });
  }, [patients, searchQuery]);

  // Selected Target Details
  const selectedPatient = useMemo(() => {
    if (targetType === 'all') return null;
    return patients.find((p) => {
      const uId = typeof p.userId === 'object' && p.userId?._id ? p.userId._id.toString() : (p.userId ? String(p.userId) : String(p._id));
      return uId === targetType || String(p._id) === targetType;
    });
  }, [patients, targetType]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      // Guarantee selected targetType is included in formData
      formData.set('targetType', targetType);
      await onBroadcast(formData);
      toast.success(
        'Notification Dispatched',
        targetType === 'all'
          ? 'Push alert broadcast sent to all registered patients.'
          : `Alert sent to ${selectedPatient?.name || 'selected recipient'}.`
      );
      setIsOpen(false);
      setTargetType('all');
      setSearchQuery('');
    } catch (err: any) {
      toast.error('Dispatch Failed', err?.message || 'Could not send notification. Please try again.');
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
              
              {/* Searchable Combobox for Recipient Target */}
              <div className="relative" ref={dropdownRef}>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Recipient Target *
                </label>

                <input type="hidden" name="targetType" value={targetType} />

                {/* Selected Display / Search Input */}
                <div 
                  onClick={() => setIsDropdownOpen(true)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus-within:border-teal-500 focus-within:bg-white transition-all cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Search size={15} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder={
                        targetType === 'all'
                          ? '📢 All Patients (Broadcast) — Type to search specific patient...'
                          : `👤 ${selectedPatient?.name || 'Selected Patient'} — Type to search...`
                      }
                      className="bg-transparent border-none outline-none w-full text-xs font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {targetType !== 'all' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetType('all');
                        setSearchQuery('');
                      }}
                      className="text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 transition-colors"
                    >
                      Reset to All
                      <X size={12} />
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md shrink-0">
                      Broadcast
                    </span>
                  )}
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                    
                    {/* Option 1: Broadcast to All */}
                    <div
                      onClick={() => {
                        setTargetType('all');
                        setSearchQuery('');
                        setIsDropdownOpen(false);
                      }}
                      className={`p-3 flex items-center justify-between cursor-pointer hover:bg-teal-50/60 transition-colors ${
                        targetType === 'all' ? 'bg-teal-50/80' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-100/70 text-teal-700 flex items-center justify-center shrink-0">
                          <Users size={16} />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-800 text-xs">
                            📢 All Registered Patients (Broadcast)
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Dispatches notification to all {patients.length} mobile app users
                          </div>
                        </div>
                      </div>
                      {targetType === 'all' && (
                        <Check size={16} className="text-teal-600 shrink-0" />
                      )}
                    </div>

                    {/* Filtered Patient List */}
                    {filteredPatients.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No patients found matching &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      filteredPatients.map((p) => {
                        const uId = typeof p.userId === 'object' && p.userId?._id ? p.userId._id.toString() : (p.userId ? String(p.userId) : String(p._id));
                        const mobile = typeof p.userId === 'object' && p.userId?.mobile ? p.userId.mobile : '';
                        const isSelected = targetType === uId;

                        return (
                          <div
                            key={String(p._id)}
                            onClick={() => {
                              setTargetType(uId);
                              setSearchQuery('');
                              setIsDropdownOpen(false);
                            }}
                            className={`p-2.5 px-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                              isSelected ? 'bg-teal-50/60' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center shrink-0">
                                {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-800 text-xs truncate">
                                  {p.name}
                                </div>
                                {mobile && (
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {mobile}
                                  </div>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <Check size={14} className="text-teal-600 shrink-0" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Notification Category */}
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
                  <option value="booking_alert">Booking / Appointment Alert</option>
                  <option value="payment_alert">Payment / Invoice Alert</option>
                  <option value="exercise_prescription">Exercise / Treatment Prescription</option>
                </select>
              </div>

              {/* Notification Title */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Clinic Holiday Notice / Special Posture Camp"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Message Body *
                </label>
                <textarea
                  name="body"
                  required
                  rows={3}
                  placeholder="Type the message content that will appear on the patient's device..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-teal-600/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Dispatch Notification</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
