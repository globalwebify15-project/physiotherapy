'use client';

import React, { useState } from 'react';
import { saveOnboardingConfigAction } from '@/app/actions/onboarding';
import { useToast } from './ToastProvider';
import {
  Smartphone,
  Save,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Tag,
  Stethoscope,
  Layers,
} from 'lucide-react';

export interface OnboardingSlide {
  iconKey: string;
  colorHex: string;
  title: string;
  desc: string;
}

export interface OnboardingConfig {
  brandShortCode: string;
  brandName: string;
  ratingBadge: string;
  experienceBadge: string;
  clinicSubtitle: string;
  promoPillText: string;
  showPromoPill: boolean;
  headline: string;
  subtitle: string;
  doctorInitials: string;
  doctorNames: string;
  doctorCredentials: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  slides: OnboardingSlide[];
}

export const DEFAULT_ONBOARDING_CONFIG: OnboardingConfig = {
  brandShortCode: 'QP',
  brandName: 'QuickPhysio24.com',
  ratingBadge: '4.9 (350+ Cases)',
  experienceBadge: '16+ Yrs Experience',
  clinicSubtitle: 'Synergy Global Hospital, Bariatu, Ranchi',
  promoPillText: 'Flat 25% OFF on 5-Session Rehab Packages',
  showPromoPill: true,
  headline: 'Expert Physiotherapy\n& Home Doctor Care',
  subtitle:
    'Painless mobility, stroke paralysis recovery, and certified 24/7 caretakers at your doorstep in Ranchi.',
  doctorInitials: 'DR',
  doctorNames: 'Dr. Rajnish Bariyar & Dr. Priyanka Bariyar',
  doctorCredentials: 'BPT, MIAP, JSCPT • 16+ Years Clinical Excellence',
  primaryCtaText: 'Get Started / शुरू करें',
  secondaryCtaText: 'I already have an account',
  slides: [
    {
      iconKey: 'home_care',
      colorHex: '#0F766E',
      title: 'Doorstep Home Care in 60 Mins',
      desc: 'Senior licensed physiotherapists visit your residence across Ranchi with portable electrotherapy & recovery kits.',
    },
    {
      iconKey: 'clinic_rehab',
      colorHex: '#2563EB',
      title: 'In-Clinic Advanced Rehabilitation',
      desc: 'Modern spine decompression, chiropractic adjustments, Class-IV laser & neuro rehab at our Bariatu hospital center.',
    },
    {
      iconKey: 'caretaker',
      colorHex: '#D97706',
      title: '24/7 Caretakers & Nursing Support',
      desc: 'Compassionate, verified bedside assistance for elderly, bedridden, and post-surgery patients in 2, 12, or 24-hr shifts.',
    },
  ],
};

const ICON_OPTIONS = [
  { value: 'home_care', label: 'Home Visit (Home Icon)' },
  { value: 'clinic_rehab', label: 'Hospital / Clinic (Medical Icon)' },
  { value: 'caretaker', label: 'Care & Nursing (Support Icon)' },
  { value: 'rehab', label: 'Mobility & Recovery (Physio Icon)' },
  { value: 'verified', label: 'Certified Care (Shield Icon)' },
  { value: 'schedule', label: 'Quick Scheduling (Clock Icon)' },
];

const COLOR_OPTIONS = [
  { value: '#0F766E', label: 'Clinical Teal (#0F766E)' },
  { value: '#2563EB', label: 'Medical Blue (#2563EB)' },
  { value: '#D97706', label: 'Warm Amber (#D97706)' },
  { value: '#059669', label: 'Recovery Emerald (#059669)' },
  { value: '#7C3AED', label: 'Neuro Violet (#7C3AED)' },
];

export default function OnboardingConfigEditor({
  initialConfig,
}: {
  initialConfig?: Partial<OnboardingConfig> | null;
}) {
  const toast = useToast();
  const [config, setConfig] = useState<OnboardingConfig>({
    ...DEFAULT_ONBOARDING_CONFIG,
    ...(initialConfig || {}),
    slides:
      Array.isArray(initialConfig?.slides) && initialConfig!.slides.length > 0
        ? initialConfig!.slides
        : DEFAULT_ONBOARDING_CONFIG.slides,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSlideChange = (index: number, field: keyof OnboardingSlide, value: string) => {
    setConfig((prev) => {
      const nextSlides = [...prev.slides];
      nextSlides[index] = { ...nextSlides[index], [field]: value };
      return { ...prev, slides: nextSlides };
    });
  };

  const handleAddSlide = () => {
    setConfig((prev) => ({
      ...prev,
      slides: [
        ...prev.slides,
        {
          iconKey: 'rehab',
          colorHex: '#0F766E',
          title: 'New Care Highlight',
          desc: 'Describe key benefit or specialized clinical service for patients.',
        },
      ],
    }));
  };

  const handleDeleteSlide = (index: number) => {
    if (config.slides.length <= 1) {
      toast.error('At Least One Slide Required', 'Onboarding must keep at least 1 highlight slide.');
      return;
    }
    setConfig((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, idx) => idx !== index),
    }));
  };

  const handleRestoreDefaults = () => {
    setConfig(DEFAULT_ONBOARDING_CONFIG);
    toast.success('Defaults Loaded', 'Click "Save Onboarding Screen" to publish defaults to the app.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveOnboardingConfigAction(config);
      if (res.success) {
        toast.success(
          'Onboarding Updated',
          'Live mobile welcome & onboarding screen synced with MongoDB CMS.'
        );
      } else {
        toast.error('Save Failed', res.error || 'Unable to save onboarding configuration.');
      }
    } catch (err: any) {
      toast.error('Error', err?.message || 'Unexpected error saving onboarding screen.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Smartphone size={22} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg">
              Mobile App Onboarding &amp; Welcome Screen (CMS)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Dynamically control the app&apos;s opening hero card, promotional badge, feature slides, doctor bar, and CTA labels.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRestoreDefaults}
          className="text-[11px] font-bold text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles size={13} className="text-amber-500" />
          Reset Defaults
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Hero Card & Copy */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={14} className="text-teal-600" /> Hero Card &amp; Main Headline
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Logo Monogram
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={config.brandShortCode}
                  onChange={(e) => setConfig({ ...config, brandShortCode: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Brand Title
                </label>
                <input
                  type="text"
                  value={config.brandName}
                  onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Top Left Rating Badge
                </label>
                <input
                  type="text"
                  value={config.ratingBadge}
                  onChange={(e) => setConfig({ ...config, ratingBadge: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Top Right Experience Badge
                </label>
                <input
                  type="text"
                  value={config.experienceBadge}
                  onChange={(e) => setConfig({ ...config, experienceBadge: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Hero Clinic Location Line
              </label>
              <input
                type="text"
                value={config.clinicSubtitle}
                onChange={(e) => setConfig({ ...config, clinicSubtitle: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Hero Promotional Pill Text
                </label>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showPromoPill}
                    onChange={(e) => setConfig({ ...config, showPromoPill: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  Show Offer Pill
                </label>
              </div>
              <input
                type="text"
                value={config.promoPillText}
                onChange={(e) => setConfig({ ...config, promoPillText: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Main Headline (supports line break)
              </label>
              <textarea
                rows={2}
                value={config.headline}
                onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Welcome Subtitle
              </label>
              <textarea
                rows={2}
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>
          </div>

          {/* Right: Doctor Bar, CTAs & Feature Slides */}
          <div className="space-y-5">
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 space-y-3.5">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope size={14} className="text-teal-600" /> Doctor Credential Bar &amp; Buttons
              </h4>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Badge
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={config.doctorInitials}
                    onChange={(e) => setConfig({ ...config, doctorInitials: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Clinical Directors Names
                  </label>
                  <input
                    type="text"
                    value={config.doctorNames}
                    onChange={(e) => setConfig({ ...config, doctorNames: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Credentials &amp; Experience Line
                </label>
                <input
                  type="text"
                  value={config.doctorCredentials}
                  onChange={(e) => setConfig({ ...config, doctorCredentials: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    New User Button Label
                  </label>
                  <input
                    type="text"
                    value={config.primaryCtaText}
                    onChange={(e) => setConfig({ ...config, primaryCtaText: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Existing User Link Label
                  </label>
                  <input
                    type="text"
                    value={config.secondaryCtaText}
                    onChange={(e) => setConfig({ ...config, secondaryCtaText: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Slides List */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-teal-600" /> Value Highlight Slides ({config.slides.length})
                </h4>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Add Slide
                </button>
              </div>

              <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
                {config.slides.map((slide, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-teal-700 uppercase">
                        Slide #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                        title="Remove Slide"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={slide.iconKey}
                        onChange={(e) => handleSlideChange(idx, 'iconKey', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={slide.colorHex}
                        onChange={(e) => handleSlideChange(idx, 'colorHex', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
                      >
                        {COLOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => handleSlideChange(idx, 'title', e.target.value)}
                      placeholder="Slide Title"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                    />

                    <textarea
                      rows={2}
                      value={slide.desc}
                      onChange={(e) => handleSlideChange(idx, 'desc', e.target.value)}
                      placeholder="Slide Description"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isSaving ? 'Publishing...' : 'Save Onboarding Screen'}
          </button>
        </div>
      </form>
    </div>
  );
}

