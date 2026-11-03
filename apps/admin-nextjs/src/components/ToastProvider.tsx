'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string, duration?: number) => void;
    error: (title: string, message?: string, duration?: number) => void;
    info: (title: string, message?: string, duration?: number) => void;
    warning: (title: string, message?: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Helper function to dispatch toast from anywhere (even non-hook functions)
export function showToast(type: ToastType, title: string, message?: string, duration?: number) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('app-toast', {
      detail: { type, title, message, duration },
    });
    window.dispatchEvent(event);
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen to custom window events so non-React/server action wrappers can trigger toasts
  useEffect(() => {
    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<{
        type: ToastType;
        title: string;
        message?: string;
        duration?: number;
      }>;
      if (customEvent.detail) {
        addToast(
          customEvent.detail.type,
          customEvent.detail.title,
          customEvent.detail.message,
          customEvent.detail.duration
        );
      }
    };

    window.addEventListener('app-toast', handleCustomToast);
    return () => window.removeEventListener('app-toast', handleCustomToast);
  }, [addToast]);

  const toastMethods = {
    success: (title: string, message?: string, duration?: number) =>
      addToast('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      addToast('error', title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      addToast('info', title, message, duration),
    warning: (title: string, message?: string, duration?: number) =>
      addToast('warning', title, message, duration),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods, removeToast }}>
      {children}

      {/* Floating Toast Container */}
      <aside 
        aria-label="Notification Alerts"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((t) => {
          let bgClass = 'bg-white border-slate-200 text-slate-800';
          let icon = <Info className="text-teal-600 shrink-0" size={18} />;
          let barClass = 'bg-teal-500';

          if (t.type === 'success') {
            bgClass = 'bg-white border-emerald-200 text-slate-900';
            icon = <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />;
            barClass = 'bg-emerald-500';
          } else if (t.type === 'error') {
            bgClass = 'bg-white border-rose-200 text-slate-900';
            icon = <AlertCircle className="text-rose-600 shrink-0" size={18} />;
            barClass = 'bg-rose-500';
          } else if (t.type === 'warning') {
            bgClass = 'bg-white border-amber-200 text-slate-900';
            icon = <AlertTriangle className="text-amber-500 shrink-0" size={18} />;
            barClass = 'bg-amber-500';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-2xl border shadow-xl p-3.5 flex items-start gap-3 transition-all duration-300 relative overflow-hidden backdrop-blur-xs animate-slide-in-right ${bgClass}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-black tracking-tight">{t.title}</p>
                {t.message && (
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-0.5 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
              {/* Progress line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 opacity-60 ${barClass}`}
              />
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if used outside of ToastProvider
    return {
      success: (title: string, message?: string) => showToast('success', title, message),
      error: (title: string, message?: string) => showToast('error', title, message),
      info: (title: string, message?: string) => showToast('info', title, message),
      warning: (title: string, message?: string) => showToast('warning', title, message),
    };
  }
  return context.toast;
}

