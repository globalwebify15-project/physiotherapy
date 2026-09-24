import React from "react";
import Link from "next/link";
import { Download, Smartphone, ShieldCheck, HardDrive, CheckCircle } from "lucide-react";

export default function ApkDownloadPage() {
  const apkOptions = [
    {
      title: "Universal APK (Recommended)",
      filename: "app-release.apk",
      size: "21.4 MB",
      desc: "Works on all Android devices (arm64, armeabi-v7a, x86_64).",
      recommended: true,
      badge: "Universal Build",
    },
    {
      title: "ARM64-v8a APK",
      filename: "app-arm64-v8a-release.apk",
      size: "20.7 MB",
      desc: "Optimized for modern 64-bit Android smartphones & tablets.",
      recommended: false,
      badge: "64-bit Optimized",
    },
    {
      title: "ARMv7a APK",
      filename: "app-armeabi-v7a-release.apk",
      size: "18.0 MB",
      desc: "Optimized for older 32-bit Android smartphones & devices.",
      recommended: false,
      badge: "32-bit Legacy",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-teal-500/20">
            <Smartphone className="w-4 h-4" />
            Patient Mobile App
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Physiotherapy Platform APK Downloads
          </h1>
          <p className="mt-3 text-slate-400 text-base max-w-xl mx-auto">
            Download and install the Android APK directly on your device or emulator for testing and preview.
          </p>
        </div>

        {/* APK Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {apkOptions.map((item) => (
            <div
              key={item.filename}
              className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-200 ${
                item.recommended
                  ? "bg-slate-800/90 border-teal-500/50 shadow-lg shadow-teal-500/10"
                  : "bg-slate-800/50 border-slate-700/60 hover:border-slate-600"
              }`}
            >
              {item.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 text-[11px] font-bold px-3 py-0.5 rounded-full shadow-md">
                  RECOMMENDED
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-md">
                    {item.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    {item.size}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mb-2">{item.title}</h2>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">{item.desc}</p>
              </div>

              <a
                href={`/${item.filename}`}
                download={item.filename}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  item.recommended
                    ? "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20"
                    : "bg-slate-700 hover:bg-slate-600 text-white"
                }`}
              >
                <Download className="w-4 h-4" />
                Download APK
              </a>
            </div>
          ))}
        </div>

        {/* Installation Instructions */}
        <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Installation Instructions
          </h3>
          <ul className="text-xs text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
              <span>Download the Universal APK or your architecture-specific APK.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
              <span>If prompted by Android, enable <strong>&ldquo;Install Unknown Apps&rdquo;</strong> for your browser/file manager.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
              <span>Open the downloaded file to install and launch the Physiotherapy app.</span>
            </li>
          </ul>
        </div>

        {/* Footer Nav */}
        <div className="mt-8 text-center">
          <Link
            href="/admin/dashboard"
            className="text-xs text-slate-400 hover:text-teal-400 transition-colors underline"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
