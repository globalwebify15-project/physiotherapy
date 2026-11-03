'use client';

import React, { useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from './ToastProvider';

export default function CmsSubmitButton({
  label = 'Save Settings',
  successTitle = 'Settings Saved',
  successMsg = 'CMS configuration updated successfully.',
}: {
  label?: string;
  successTitle?: string;
  successMsg?: string;
}) {
  const { pending } = useFormStatus();
  const toast = useToast();
  const prevPending = useRef(pending);

  useEffect(() => {
    if (prevPending.current && !pending) {
      toast.success(successTitle, successMsg);
    }
    prevPending.current = pending;
  }, [pending, successTitle, successMsg, toast]);

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span>Saving Changes...</span>
        </>
      ) : (
        <>
          <Save size={14} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

