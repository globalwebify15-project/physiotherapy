'use client';

import React, { useActionState, useState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { 
  HeartPulse, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fillDemoCredentials = () => {
    setEmail('admin@globalwebify.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex items-center justify-center p-4 selection:bg-teal-500 selection:text-white">
      {/* Background ambient glowing shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-teal-950/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white shadow-lg shadow-teal-600/30 mb-4 transform hover:rotate-6 transition-transform">
              <HeartPulse size={34} strokeWidth={2.2} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              QuickPhysio <span className="text-teal-600">Admin</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Physiotherapy Clinic Management Portal
            </p>
          </div>

          {/* Error Message */}
          {state?.error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 text-rose-700 text-xs font-medium animate-shake">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Login Form */}
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@globalwebify.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none text-sm text-slate-800 font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none text-sm text-slate-800 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-sm tracking-wide shadow-lg shadow-teal-700/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 active:scale-[0.99]"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Access Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200/50 text-teal-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors group"
            >
              <Sparkles size={14} className="text-teal-600 group-hover:rotate-12 transition-transform" />
              <span>Click to auto-fill default Admin credentials</span>
            </button>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>Role-Based Access Control (RBAC) Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
