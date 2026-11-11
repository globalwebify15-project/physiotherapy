import React from 'react';
import { connectDB, CMS } from 'database';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ShieldCheck,
  FileText,
  RotateCcw,
  PhoneCall,
  Info,
  Truck,
  AlertTriangle,
  UserX,
  Building2,
  MapPin,
  Mail,
  Clock,
  ChevronRight,
  CheckCircle2,
  HeartPulse
} from 'lucide-react';
import { PrintPageButton, DeleteAccountForm } from '@/components/ComplianceInteractiveActions';

export const revalidate = 60; // Revalidate every 60 seconds

const SLUG_TO_KEY_MAP: Record<string, string> = {
  'privacy': 'policy_privacy',
  'privacy-policy': 'policy_privacy',
  'terms': 'policy_terms',
  'terms-and-conditions': 'policy_terms',
  'refund-policy': 'policy_refund',
  'cancellation-refund-policy': 'policy_refund',
  'contact-us': 'policy_contact_us',
  'contact': 'policy_contact_us',
  'shipping-delivery-policy': 'policy_shipping_delivery',
  'fulfillment-policy': 'policy_shipping_delivery',
  'about-us': 'policy_about_us',
  'about': 'policy_about_us',
  'medical-disclaimer': 'policy_medical_disclaimer',
  'delete-account': 'policy_delete_account',
};

const COMPLIANCE_NAV = [
  { slug: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
  { slug: 'terms', label: 'Terms & Conditions', icon: FileText },
  { slug: 'refund-policy', label: 'Refund & Cancellation', icon: RotateCcw },
  { slug: 'contact-us', label: 'Contact Us', icon: PhoneCall },
  { slug: 'about-us', label: 'About Us', icon: Info },
  { slug: 'shipping-delivery-policy', label: 'Service Delivery', icon: Truck },
  { slug: 'medical-disclaimer', label: 'Medical Disclaimer', icon: AlertTriangle },
  { slug: 'delete-account', label: 'Delete Account', icon: UserX },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = SLUG_TO_KEY_MAP[slug.toLowerCase()];
  if (!key) return { title: 'Page Not Found - QuickPhysio24.com' };

  await connectDB();
  const cmsDoc: any = await CMS.findOne({ key }).lean();
  const title = cmsDoc?.content?.title || 'Policy & Legal Information';

  return {
    title: `${title} | QuickPhysio24.com - Synergy Global Hospital`,
    description: cmsDoc?.content?.summary || 'Official policies and compliance documentation for QuickPhysio24.com.',
  };
}

export default async function CompliancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const canonicalSlug = slug.toLowerCase();
  const key = SLUG_TO_KEY_MAP[canonicalSlug];

  if (!key) {
    notFound();
  }

  await connectDB();
  const cmsDoc: any = await CMS.findOne({ key }).lean();

  if (!cmsDoc || !cmsDoc.content) {
    notFound();
  }

  const data = cmsDoc.content;
  const isRefund = canonicalSlug === 'refund-policy' || canonicalSlug === 'cancellation-refund-policy';
  const isContact = canonicalSlug === 'contact-us' || canonicalSlug === 'contact';
  const isAbout = canonicalSlug === 'about-us' || canonicalSlug === 'about';
  const isDelete = canonicalSlug === 'delete-account';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Notification Bar */}
      <div className="bg-teal-900 text-teal-100 text-xs px-4 py-2 border-b border-teal-800/50">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">
              Official Healthcare Entity: <strong className="text-white">QuickPhysio24.com</strong> • Synergy Global Hospital, Ranchi
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-teal-200">
            <a href="tel:9110912544" className="hover:text-white transition-colors flex items-center gap-1">
              <PhoneCall size={12} /> Helpline: +91 91109 12544
            </a>
            <a href="mailto:contact@quickphysio24.com" className="hover:text-white transition-colors flex items-center gap-1">
              <Mail size={12} /> contact@quickphysio24.com
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">QuickPhysio<span className="text-teal-600">24</span></span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-sm bg-teal-50 text-teal-700 border border-teal-200/60">
                  Hospital Dept
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-none">Synergy Global Hospital, Ranchi</p>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/apk"
              className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-3.5 py-2 rounded-xl transition-all"
            >
              Download App
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              Admin Portal
            </Link>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 overflow-x-auto scrollbar-none border-t border-slate-100">
          <nav className="flex items-center gap-1 py-2 min-w-max">
            {COMPLIANCE_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = canonicalSlug === item.slug || (item.slug === 'privacy' && canonicalSlug === 'privacy-policy');
              return (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-teal-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Document Body (8 Cols on Desktop) */}
          <article className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xs">
            {/* Header Badge & Title */}
            <div className="border-b border-slate-100 pb-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-teal-50 text-teal-700 border border-teal-200">
                  <ShieldCheck size={14} />
                  {data.badge || 'Official Legal Document'}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Last Updated: <strong className="text-slate-700">{data.lastUpdated || 'November 2026'}</strong>
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3">
                {data.title}
              </h1>

              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {data.summary}
              </p>
            </div>

            {/* Special Highlight Banner for Refund Policy (7-Day Guarantee) */}
            {isRefund && (
              <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-teal-500/30">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-teal-900 text-base">
                      {data.cancellationWindowDays || 7}-Day Full Refund Policy Guaranteed
                    </h3>
                    <p className="text-xs text-teal-800/90 font-medium mt-1 leading-relaxed">
                      Advance bookings and treatment packages can be cancelled up to <strong>{data.cancellationWindowDays || 7} days</strong> before the scheduled appointment for a <strong>100% full refund</strong> with zero cancellation charges. Standard single appointments can be rescheduled or cancelled up to 2 hours prior to the slot.
                    </p>
                    <div className="mt-2.5 flex items-center gap-4 text-xs font-bold text-teal-900">
                      <span>✓ 100% Source Refund</span>
                      <span>✓ Direct to UPI / Card</span>
                      <span>✓ 5-7 Business Days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Us Interactive Details */}
            {isContact && (
              <div className="mb-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                      <Building2 size={16} /> Physical Hospital Clinic
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {data.clinicAddress || 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Landmark: Opposite RIMS Trauma Centre, Bariatu Road</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                      <Clock size={16} /> Consultation Hours
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {data.workingHours || 'Mon - Sat: 08:00 AM - 08:00 PM | Sun: 09:00 AM - 02:00 PM'}
                    </p>
                    <p className="text-[11px] text-teal-600 font-bold mt-1">Emergency Trauma: 24/7 at Hospital Emergency</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                      <PhoneCall size={16} /> Helpline Numbers
                    </div>
                    <div className="space-y-1 text-xs font-semibold text-slate-800">
                      <div>Official Desk: <a href="tel:9110912544" className="text-teal-700 font-bold hover:underline">+91 91109 12544</a></div>
                      <div>Dr. Rajnish Bariyar: <a href="tel:9110912544" className="text-teal-700 font-bold hover:underline">+91 91109 12544</a></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                      <Mail size={16} /> Official Email Support
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      <a href="mailto:contact@quickphysio24.com" className="text-teal-700 font-bold hover:underline">
                        contact@quickphysio24.com
                      </a>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Grievance & Queries: Responses within 24 business hours</p>
                  </div>
                </div>

                {/* Grievance Officer Card */}
                <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2">
                    <ShieldCheck size={16} className="text-amber-700" /> Statutory Grievance Redressal Officer
                  </h4>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    Under the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023, the designated Grievance Officer for <strong>QuickPhysio24.com</strong> is:
                  </p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold text-amber-900">
                    <div>Officer: <span className="text-amber-950">{data.grievanceOfficer || 'Dr. Rajnish Bariyar'}</span></div>
                    <div>Designation: <span className="text-amber-950">Head of Department</span></div>
                    <div>Email: <a href="mailto:contact@quickphysio24.com" className="underline text-amber-950">contact@quickphysio24.com</a></div>
                  </div>
                </div>
              </div>
            )}

            {/* About Us Clinic & Founders Showcase */}
            {isAbout && data.leadership && Array.isArray(data.leadership) && (
              <div className="mb-8 space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Clinical Leadership</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.leadership.map((leader: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <h4 className="font-extrabold text-slate-900 text-sm">{leader.name}</h4>
                      <p className="text-xs font-bold text-teal-700 mt-0.5">{leader.role}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{leader.qualification}</p>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{leader.bio}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Deletion Request Form */}
            {isDelete && <DeleteAccountForm />}

            {/* Standard Policy Sections List */}
            {data.sections && Array.isArray(data.sections) && (
              <div className="space-y-6">
                {data.sections.map((section: any, idx: number) => (
                  <section key={idx} className="scroll-mt-24">
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-4 rounded-full bg-teal-600 inline-block" />
                      {section.heading}
                    </h2>
                    <p className="text-xs md:text-sm text-slate-600 font-normal leading-relaxed pl-3.5 border-l border-slate-100">
                      {section.body}
                    </p>
                  </section>
                ))}
              </div>
            )}

            {/* Print & Official Seal Footer */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Legally Binding Digital Disclosure of QuickPhysio24.com</span>
              </div>
              <PrintPageButton />
            </div>
          </article>

          {/* Right Sidebar: Quick Details, Entity Verification, Links (4 Cols on Desktop) */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Business Entity Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="text-teal-600" size={18} />
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Registered Business Entity
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Legal / Business Name</span>
                  <p className="font-bold text-slate-900">{data.businessName || 'QuickPhysio24.com'}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Clinic Address</span>
                  <p className="font-medium text-slate-700 leading-snug">
                    {data.clinicAddress || 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009'}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Support Email</span>
                  <a href={`mailto:${data.supportEmail || 'contact@quickphysio24.com'}`} className="font-bold text-teal-700 hover:underline">
                    {data.supportEmail || 'contact@quickphysio24.com'}
                  </a>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Official Helpline</span>
                  <a href="tel:9110912544" className="font-bold text-teal-700 hover:underline">
                    {data.supportPhone || '+91 91109 12544'}
                  </a>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Grievance Officer</span>
                  <p className="font-bold text-slate-900">{data.grievanceOfficer || 'Dr. Rajnish Bariyar'}</p>
                </div>
              </div>
            </div>

            {/* Quick Policy Index Navigator */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">
                Compliance & Policy Index
              </h3>
              <ul className="space-y-1.5 text-xs font-semibold">
                {COMPLIANCE_NAV.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/${item.slug}`}
                      className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                        canonicalSlug === item.slug
                          ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <item.icon size={14} className={canonicalSlug === item.slug ? 'text-teal-700' : 'text-slate-400'} />
                        {item.label}
                      </span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment & Gateway Compliance Badge */}
            <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} className="text-teal-400" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider">Gateway Verified</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Transactions on QuickPhysio24.com are processed through encrypted, RBI-licensed payment aggregators (Razorpay). Verified with 256-bit SSL encryption.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-bold text-slate-700">© 2026 QuickPhysio24.com. All rights reserved.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Operating at Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
            <Link href="/privacy" className="hover:text-teal-700">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-teal-700">Terms of Service</Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-teal-700">Refund Policy</Link>
            <span>•</span>
            <Link href="/contact-us" className="hover:text-teal-700">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
