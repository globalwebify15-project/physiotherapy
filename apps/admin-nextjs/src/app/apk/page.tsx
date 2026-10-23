'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Smartphone, 
  ShieldCheck, 
  HardDrive, 
  CheckCircle, 
  QrCode, 
  Phone, 
  MessageCircle, 
  CalendarCheck, 
  Star,
  Activity,
  HeartPulse,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function ApkDownloadPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'downloads'>('preview');

  const apkOptions = [
    {
      title: 'Optimized Release APK (Recommended)',
      filename: 'Physio.apk',
      size: '21.4 MB',
      desc: 'Optimized 64-bit production release with R8 shrinking, Proguard, and obfuscation.',
      recommended: true,
      badge: 'Optimized (21.4 MB)',
    },
    {
      title: 'ARM64-v8a 64-bit Device Build',
      filename: 'app-arm64-v8a-release.apk',
      size: '21.4 MB',
      desc: 'Optimized specifically for modern 64-bit Android smartphones.',
      recommended: false,
      badge: '64-bit Fast',
    },
    {
      title: 'ARMv7a 32-bit Legacy',
      filename: 'app-armeabi-v7a-release.apk',
      size: '18.8 MB',
      desc: 'Ultra-lightweight build for older Android devices and tablets.',
      recommended: false,
      badge: 'Legacy 32-bit (18.8 MB)',
    },
    {
      title: 'Standard Release Mirror',
      filename: 'app-release.apk',
      size: '21.4 MB',
      desc: 'Mirror build for automated distribution and OTA updates.',
      recommended: false,
      badge: 'Release Mirror',
    },
  ];

  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://192.168.1.15:3001/app-release.apk";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-slate-100 p-4 sm:p-8 selection:bg-teal-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-500/20 mb-2">
              <Smartphone className="w-3.5 h-3.5" />
              Patient Mobile Application
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              QuickPhysio24 Android APK & Live App Preview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Test the mobile experience directly in your browser or install the compiled APK on any Android phone.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-bold transition-colors"
            >
              ← Admin Portal
            </Link>
            <a
              href="/app-release.apk"
              download="QuickPhysio24.apk"
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all"
            >
              <Download size={14} />
              <span>Download APK (21.4 MB)</span>
            </a>
          </div>
        </div>

        {/* Main Grid: Device Phone Mockup + Download Center */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Realistic Interactive Smartphone Mockup (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] bg-slate-950 rounded-[44px] p-3 shadow-2xl shadow-teal-950 border-[6px] border-slate-800 ring-1 ring-slate-700/50">
              {/* Phone Speaker & Dynamic Island Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
                <div className="w-10 h-1.5 rounded-full bg-slate-800" />
              </div>

              {/* Mobile Screen Surface */}
              <div className="w-full bg-slate-50 text-slate-800 rounded-[34px] overflow-hidden flex flex-col h-[620px] select-none text-left">
                
                {/* Status Bar */}
                <div className="pt-6 px-5 pb-2 flex justify-between items-center text-[10px] font-bold text-slate-500 bg-white">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <div className="w-4 h-2 rounded-sm border border-slate-400 relative">
                      <div className="w-2.5 h-full bg-teal-600 rounded-xs" />
                    </div>
                  </div>
                </div>

                {/* Mobile Header */}
                <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                      <HeartPulse size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">QuickPhysio24</h4>
                      <span className="text-[9px] text-teal-700 font-bold">Dr. Bariyar&apos;s Clinic</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-600">Online</span>
                  </div>
                </div>

                {/* Scrollable Mobile App Body */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar text-xs">
                  
                  {/* Hero Banner Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 text-white p-3.5 shadow-md shadow-teal-900/30 relative overflow-hidden">
                    <span className="bg-white/20 backdrop-blur-md text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5">
                      Clinic & Home Visits
                    </span>
                    <h5 className="font-extrabold text-xs text-white leading-tight">
                      Neuro & Spine Physiotherapy Specialists
                    </h5>
                    <p className="text-[10px] text-teal-100 mt-1 leading-snug">
                      Dr. Rajnish Bariyar & Dr. Priyanka Bariyar (16+ yrs experience)
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="bg-white text-teal-900 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        Book Slot
                      </div>
                      <span className="text-[9px] text-teal-200">Ranchi, Jharkhand</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="tel:+919110912544"
                      className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 text-slate-800"
                    >
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                        <Phone size={14} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold block leading-none">Call Doctor</span>
                        <span className="text-[9px] text-slate-400 truncate block mt-0.5">+91 91109 12544</span>
                      </div>
                    </a>

                    <a
                      href="https://wa.me/919693233447"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 text-slate-800"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <MessageCircle size={14} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold block leading-none">WhatsApp</span>
                        <span className="text-[9px] text-slate-400 truncate block mt-0.5">Chat Support</span>
                      </div>
                    </a>
                  </div>

                  {/* Featured Treatments */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[11px] text-slate-800">Specialized Therapies</span>
                      <span className="text-[10px] text-teal-700 font-bold">15+ Treatments</span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { title: 'Stroke & Paralysis Rehab', tag: 'Neuro', fee: '₹800' },
                        { title: 'Cervical & Lumbar Spondylosis', tag: 'Spine', fee: '₹650' },
                        { title: 'OA (Knee Pain) Protocol', tag: 'Joints', fee: '₹650' },
                        { title: 'Pediatric CP & Autism Rehab', tag: 'Pediatric', fee: '₹850' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-[9px]">
                              {idx + 1}
                            </div>
                            <div>
                              <span className="font-bold text-[10px] text-slate-800 block leading-none">{item.title}</span>
                              <span className="text-[9px] text-slate-400">{item.tag} Care</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold text-teal-700">{item.fee}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Direct Booking CTA */}
                  <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[10px] block text-white">Need a Home Visit?</span>
                      <span className="text-[9px] text-slate-400">Doctor visits your doorstep</span>
                    </div>
                    <div className="bg-teal-500 text-slate-950 font-black text-[9px] px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <span>Book ₹950</span>
                      <ArrowRight size={10} />
                    </div>
                  </div>

                </div>

                {/* Bottom App Bar Navigation */}
                <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center justify-around text-slate-400">
                  <div className="text-teal-700 flex flex-col items-center">
                    <Activity size={16} />
                    <span className="text-[9px] font-bold mt-0.5">Home</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CalendarCheck size={16} />
                    <span className="text-[9px] font-medium mt-0.5">Bookings</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Star size={16} />
                    <span className="text-[9px] font-medium mt-0.5">Reviews</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ShieldCheck size={16} />
                    <span className="text-[9px] font-medium mt-0.5">Profile</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Download Options, Scan QR Code & Install Instructions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Scan QR Code Box */}
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-xl flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white p-2.5 rounded-2xl shadow-md shrink-0">
                <img 
                  src={qrUrl} 
                  alt="Scan to Download APK" 
                  className="w-36 h-36 rounded-lg object-contain"
                />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <QrCode size={14} />
                  Scan to Install on Android
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Direct WiFi Install for Mobile
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Open your phone&apos;s camera or QR scanner while connected to WiFi to immediately download and install the build.
                </p>
                <div className="mt-3 text-[11px] font-mono text-teal-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50 inline-block">
                  http://192.168.1.15:3001/app-release.apk
                </div>
              </div>
            </div>

            {/* APK Builds Download Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {apkOptions.map((item) => (
                <div
                  key={item.filename}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                    item.recommended
                      ? 'bg-slate-800/90 border-teal-500/60 shadow-lg shadow-teal-500/10'
                      : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold text-teal-400 bg-teal-950/70 border border-teal-500/30 px-2 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <HardDrive size={13} className="text-slate-400" />
                        {item.size}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-snug mb-4">{item.desc}</p>
                  </div>

                  <a
                    href={`/${item.filename}`}
                    download={item.filename}
                    className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      item.recommended
                        ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    <Download size={14} />
                    <span>Download {item.filename}</span>
                  </a>
                </div>
              ))}
            </div>

            {/* Android Installation Safety Note */}
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                Quick Installation Steps on Android
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                1. Tap <strong>Download</strong> or scan the QR code above.<br />
                2. If Android displays <em>&ldquo;File might be harmful&rdquo;</em>, choose <strong>Download Anyway</strong> (standard for self-hosted developer builds).<br />
                3. Tap <strong>Open</strong> and allow <em>Install unknown apps</em> for your browser if prompted.<br />
                4. The QuickPhysio application will be ready on your home screen.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
