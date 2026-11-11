'use client';

import React, { useState } from 'react';
import { saveCompliancePageAction } from '@/app/actions/compliance';
import { useToast } from './ToastProvider';
import {
  ShieldCheck,
  FileText,
  RotateCcw,
  PhoneCall,
  Info,
  Truck,
  AlertTriangle,
  UserX,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Building2,
  Sparkles,
} from 'lucide-react';

export interface CompliancePageConfig {
  key: string;
  label: string;
  slug: string;
  content: any;
}

const PAGE_METADATA = [
  { key: 'policy_privacy', label: 'Privacy Policy', slug: 'privacy', icon: ShieldCheck },
  { key: 'policy_terms', label: 'Terms & Conditions', slug: 'terms', icon: FileText },
  { key: 'policy_refund', label: 'Refund & Cancellation', slug: 'refund-policy', icon: RotateCcw },
  { key: 'policy_contact_us', label: 'Contact Us & Grievance', slug: 'contact-us', icon: PhoneCall },
  { key: 'policy_shipping_delivery', label: 'Service Delivery', slug: 'shipping-delivery-policy', icon: Truck },
  { key: 'policy_about_us', label: 'About Us', slug: 'about-us', icon: Info },
  { key: 'policy_medical_disclaimer', label: 'Medical Disclaimer', slug: 'medical-disclaimer', icon: AlertTriangle },
  { key: 'policy_delete_account', label: 'Delete Account', slug: 'delete-account', icon: UserX },
];

export default function CompliancePagesEditor({
  initialPages,
}: {
  initialPages: Record<string, any>;
}) {
  const toast = useToast();
  const [selectedKey, setSelectedKey] = useState<string>('policy_privacy');
  const [pagesState, setPagesState] = useState<Record<string, any>>(initialPages);
  const [isSaving, setIsSaving] = useState(false);

  const currentMeta = PAGE_METADATA.find((p) => p.key === selectedKey) || PAGE_METADATA[0];
  const currentData = pagesState[selectedKey] || {
    title: currentMeta.label,
    slug: currentMeta.slug,
    lastUpdated: 'November 10, 2026',
    badge: 'Official Legal Document',
    summary: '',
    businessName: 'QuickPhysio24.com',
    clinicAddress: 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009',
    supportEmail: 'contact@quickphysio24.com',
    supportPhone: '+91 91109 12544',
    grievanceOfficer: 'Dr. Rajnish Bariyar',
    sections: [],
  };

  const updateField = (field: string, value: any) => {
    setPagesState((prev) => ({
      ...prev,
      [selectedKey]: {
        ...currentData,
        [field]: value,
      },
    }));
  };

  const updateSection = (index: number, field: 'heading' | 'body', value: string) => {
    const sections = Array.isArray(currentData.sections) ? [...currentData.sections] : [];
    sections[index] = {
      ...sections[index],
      [field]: value,
    };
    updateField('sections', sections);
  };

  const addSection = () => {
    const sections = Array.isArray(currentData.sections) ? [...currentData.sections] : [];
    sections.push({
      heading: `${sections.length + 1}. New Policy Section`,
      body: 'Enter comprehensive clinical or regulatory policy details here...',
    });
    updateField('sections', sections);
  };

  const removeSection = (index: number) => {
    const sections = Array.isArray(currentData.sections) ? [...currentData.sections] : [];
    sections.splice(index, 1);
    updateField('sections', sections);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveCompliancePageAction(selectedKey, currentData);
      if (result.success) {
        toast.success(
          `${currentMeta.label} Saved`,
          `Public page /${currentMeta.slug} updated in real time.`
        );
      } else {
        toast.error('Save Failed', result.error || 'Could not update page.');
      }
    } catch (err: any) {
      toast.error('Error', err?.message || 'Unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Section Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-teal-50/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-teal-600 w-5 h-5" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Mandatory Compliance & Legal Pages Manager
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Razorpay & Store Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamically manage Privacy Policy, Terms, 7-Day Refund Policy, Contact Us, Service Delivery & Account Deletion pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`/${currentMeta.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition-colors"
          >
            <ExternalLink size={14} />
            View Live Page (/{currentMeta.slug})
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save {currentMeta.label}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Navigation Pills */}
        <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50 p-4 space-y-1.5">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Select Compliance Page
          </p>
          {PAGE_METADATA.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedKey(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                    : 'text-slate-600 hover:bg-white hover:text-teal-700 hover:shadow-xs'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={15} className={isSelected ? 'text-teal-200' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-teal-800 text-teal-100' : 'bg-slate-200/70 text-slate-500'
                }`}>
                  /{item.slug}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Form Editor */}
        <div className="lg:col-span-9 p-6 space-y-6">
          {/* Header & Entity Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Page Title
              </label>
              <input
                type="text"
                value={currentData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Compliance Badge
              </label>
              <input
                type="text"
                value={currentData.badge || ''}
                onChange={(e) => updateField('badge', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Last Updated Label
              </label>
              <input
                type="text"
                value={currentData.lastUpdated || ''}
                onChange={(e) => updateField('lastUpdated', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Executive Summary / Subtitle
            </label>
            <textarea
              rows={2}
              value={currentData.summary || ''}
              onChange={(e) => updateField('summary', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          {/* Registered Entity & Grievance Information */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={14} className="text-teal-600" /> Official Legal & Contact Metadata Displayed on Page
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Business / Legal Name
                </label>
                <input
                  type="text"
                  value={currentData.businessName || ''}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Grievance Officer Name
                </label>
                <input
                  type="text"
                  value={currentData.grievanceOfficer || ''}
                  onChange={(e) => updateField('grievanceOfficer', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={currentData.supportEmail || ''}
                  onChange={(e) => updateField('supportEmail', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Support Phone
                </label>
                <input
                  type="text"
                  value={currentData.supportPhone || ''}
                  onChange={(e) => updateField('supportPhone', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Physical Clinic Address
                </label>
                <input
                  type="text"
                  value={currentData.clinicAddress || ''}
                  onChange={(e) => updateField('clinicAddress', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              {selectedKey === 'policy_refund' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-teal-700 uppercase block mb-1">
                      Full Refund Window (Days)
                    </label>
                    <input
                      type="number"
                      value={currentData.cancellationWindowDays ?? 7}
                      onChange={(e) => updateField('cancellationWindowDays', Number(e.target.value))}
                      className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs font-bold text-teal-800 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-teal-700 uppercase block mb-1">
                      Refund Processing Timeline
                    </label>
                    <input
                      type="text"
                      value={currentData.refundProcessingDays || '5-7 business days'}
                      onChange={(e) => updateField('refundProcessingDays', e.target.value)}
                      className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs font-bold text-teal-800 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </>
              )}

              {selectedKey === 'policy_contact_us' && (
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Working Hours
                  </label>
                  <input
                    type="text"
                    value={currentData.workingHours || ''}
                    onChange={(e) => updateField('workingHours', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Sections Editor (Available for pages with sections) */}
          {selectedKey !== 'policy_contact_us' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-teal-600" /> Document Clauses & Sections ({Array.isArray(currentData.sections) ? currentData.sections.length : 0})
                </h4>
                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add Section
                </button>
              </div>

              {Array.isArray(currentData.sections) && currentData.sections.length > 0 ? (
                <div className="space-y-3">
                  {currentData.sections.map((section: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={section.heading || ''}
                          onChange={(e) => updateSection(idx, 'heading', e.target.value)}
                          placeholder="Section Heading"
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeSection(idx)}
                          title="Delete Section"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={section.body || ''}
                        onChange={(e) => updateSection(idx, 'body', e.target.value)}
                        placeholder="Detailed clause content..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 leading-relaxed focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No sections added yet. Click &ldquo;Add Section&rdquo; above to add structured legal clauses.
                </div>
              )}
            </div>
          )}

          {/* Bottom Save Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Changes immediately update live public compliance routes.
            </span>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save & Publish {currentMeta.label}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

