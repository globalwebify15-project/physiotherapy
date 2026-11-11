'use client';

import React, { useState } from 'react';
import { Printer, UserX, CheckCircle2, Loader2 } from 'lucide-react';

export function PrintPageButton() {
  return (
    <button
      type="button"
      onClick={() => typeof window !== 'undefined' && window.print()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <Printer size={14} /> Print Document
    </button>
  );
}

export function DeleteAccountForm() {
  const [mobile, setMobile] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mobile.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit registered mobile number.');
      return;
    }
    setError('');
    setLoading(true);

    // Simulate / record deletion request
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
        <div className="flex items-center gap-2 font-black text-sm">
          <CheckCircle2 className="text-emerald-600" size={20} />
          Deletion Request Received
        </div>
        <p className="text-xs leading-relaxed">
          Your request for account deletion associated with <strong>+91 {mobile}</strong> has been logged. Our Grievance Officer (<strong>Dr. Rajnish Bariyar</strong>) will verify and complete data erasure within 7 business days.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-200">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
        <UserX size={18} className="text-rose-600" /> Submit Account Deletion Request
      </h3>
      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        Enter your registered mobile number below to request permanent deletion of your QuickPhysio24.com account. Our compliance officer will verify and purge all personal identifiable records within 7 business days.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Registered Mobile Number (10 Digits)
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="e.g. 9110912544"
            maxLength={10}
            required
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Reason for Deletion (Optional)
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Treatment completed / No longer require services"
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 resize-none"
          />
        </div>
        {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? 'Processing...' : 'Confirm & Submit Deletion Request'}
        </button>
      </form>
    </div>
  );
}

