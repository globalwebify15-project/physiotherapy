import React from 'react';
import { connectDB, CMS } from 'database';
import { revalidatePath } from 'next/cache';
import { 
  Settings, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Save, 
  Info, 
  Plus, 
  FileText,
  MessageCircle,
  UserCheck,
  Image as ImageIcon,
  ShieldAlert,
  Award,
  Sparkles,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export const revalidate = 0; // Dynamic fetch

// Server Action: Update Contact Details
async function updateContactAction(formData: FormData) {
  'use server';
  const phone = formData.get('phone') as string;
  const whatsapp = formData.get('whatsapp') as string;
  const drRajnishPhone = formData.get('drRajnishPhone') as string;
  const drPriyankaPhone = formData.get('drPriyankaPhone') as string;
  const email = formData.get('email') as string;
  const address = formData.get('address') as string;
  const website = formData.get('website') as string;
  const workingHours = formData.get('workingHours') as string;

  await connectDB();
  await CMS.findOneAndUpdate(
    { key: 'contact_details' },
    { 
      content: { 
        phone, 
        whatsapp, 
        drRajnishPhone, 
        drPriyankaPhone, 
        email, 
        address, 
        website, 
        workingHours 
      } 
    },
    { upsert: true }
  );

  revalidatePath('/admin/cms');
}

// Server Action: Update About Clinic & Founder Information
async function updateAboutClinicAction(formData: FormData) {
  'use server';
  const clinicHeadline = formData.get('clinicHeadline') as string;
  const clinicBio = formData.get('clinicBio') as string;
  const yearsExperience = formData.get('yearsExperience') as string;
  const patientsTreated = formData.get('patientsTreated') as string;
  const accreditations = formData.get('accreditations') as string;
  const missionStatement = formData.get('missionStatement') as string;

  await connectDB();
  await CMS.findOneAndUpdate(
    { key: 'about_clinic' },
    { 
      content: { 
        clinicHeadline, 
        clinicBio, 
        yearsExperience, 
        patientsTreated, 
        accreditations, 
        missionStatement 
      } 
    },
    { upsert: true }
  );

  revalidatePath('/admin/cms');
}

// Server Action: Add Promotional Banner
async function addBannerAction(formData: FormData) {
  'use server';
  const title = formData.get('title') as string;
  const subtitle = formData.get('subtitle') as string;
  const badge = formData.get('badge') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const ctaText = formData.get('ctaText') as string;
  const targetRoute = (formData.get('targetRoute') as string) || '/all_services';
  const theme = (formData.get('theme') as string) || 'teal';
  const rawChips = (formData.get('chips') as string) || '';
  const chips = rawChips.split(',').map(s => s.trim()).filter(Boolean);

  if (!title || !imageUrl) return;

  await connectDB();
  const bannerBlock = await CMS.findOne({ key: 'homepage_banners' });
  const newBanner = {
    id: `banner_${Date.now()}`,
    numberTag: `${(bannerBlock?.content?.length || 0) + 1}.`,
    badge: badge || 'Special Offer',
    title,
    subtitle: subtitle || '',
    imageUrl,
    ctaText: ctaText || 'Explore Now →',
    targetRoute,
    theme,
    chips: chips.length > 0 ? chips : ['Expert Care', 'Certified Physio'],
    isActive: true,
  };

  if (bannerBlock) {
    if (!Array.isArray(bannerBlock.content)) bannerBlock.content = [];
    bannerBlock.content.push(newBanner);
    bannerBlock.markModified('content');
    await bannerBlock.save();
  } else {
    await CMS.create({
      key: 'homepage_banners',
      content: [newBanner],
    });
  }

  revalidatePath('/admin/cms');
}

// Server Action: Reset / Seed Core Default 5 Banners
async function resetDefaultBannersAction() {
  'use server';
  await connectDB();
  const defaultBanners = [
    {
      id: 'banner_1_pain_relief',
      numberTag: '1.',
      badge: 'Back & Joint Relief',
      title: 'Say Goodbye to Pain',
      subtitle: "Back, neck, knee or shoulder — we've got you covered.",
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Learn More →',
      targetRoute: '/all_services',
      theme: 'amber',
      gradientColors: ['#FFFDF5', '#FEF3C7', '#FDE68A'],
      borderColor: '#FCD34D',
      ctaColor: '#0F766E',
      chips: ['Back Pain', 'Neck Pain', 'Joint Pain'],
      isActive: true
    },
    {
      id: 'banner_2_recover_faster',
      numberTag: '2.',
      badge: 'Rehab & Sports',
      title: 'Recover Faster',
      subtitle: 'Post-surgery rehab & sports physiotherapy.',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Get Started →',
      targetRoute: '/booking',
      theme: 'sky',
      gradientColors: ['#F0F9FF', '#E0F2FE', '#BAE6FD'],
      borderColor: '#38BDF8',
      ctaColor: '#0284C7',
      chips: ['Rehab', 'Sports Injury', 'Performance'],
      isActive: true
    },
    {
      id: 'banner_3_better_mobility',
      numberTag: '3.',
      badge: 'Flexibility & Balance',
      title: 'Better Mobility Better Life',
      subtitle: 'Improve flexibility, strength and balance.',
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Start Your Journey →',
      targetRoute: '/all_services',
      theme: 'purple',
      gradientColors: ['#FAF5FF', '#F3E8FF', '#E9D5FF'],
      borderColor: '#C084FC',
      ctaColor: '#6B21A8',
      chips: ['Flexibility', 'Balance', 'Wellness'],
      isActive: true
    },
    {
      id: 'banner_4_healthier_you',
      numberTag: '4.',
      badge: 'Full Body Care',
      title: 'Your Journey to a Healthier You',
      subtitle: 'Professional care for a stronger, healthier you.',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Start Today →',
      targetRoute: '/service_providers',
      theme: 'orange',
      gradientColors: ['#FFF7ED', '#FFEDD5', '#FED7AA'],
      borderColor: '#FB923C',
      ctaColor: '#0F766E',
      chips: ['Active Life', 'Better Posture', 'Happier You'],
      isActive: true
    },
    {
      id: 'banner_5_doctor_showcase',
      numberTag: '5.',
      badge: 'Founder & Chief Specialists',
      title: 'Advanced Neuro & Spine Rehabilitation',
      subtitle: 'Personalized treatment protocols by Dr. Rajnish Bariyar & Dr. Priyanka Bariyar',
      imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Book Clinic / Home Visit →',
      targetRoute: '/booking',
      theme: 'teal',
      gradientColors: ['#F0FDFA', '#CCFBF1', '#99F6E4'],
      borderColor: '#2DD4BF',
      ctaColor: '#0F766E',
      chips: ['Stroke Rehab', 'Paralysis Care', 'Home Visit'],
      isActive: true
    }
  ];

  await CMS.findOneAndUpdate(
    { key: 'homepage_banners' },
    { content: defaultBanners },
    { upsert: true }
  );

  revalidatePath('/admin/cms');
}

// Server Action: Delete Banner
async function deleteBannerAction(formData: FormData) {
  'use server';
  const bannerId = formData.get('bannerId') as string;
  if (!bannerId) return;

  await connectDB();
  const bannerBlock = await CMS.findOne({ key: 'homepage_banners' });
  if (bannerBlock && Array.isArray(bannerBlock.content)) {
    bannerBlock.content = bannerBlock.content.filter((b: any) => b.id !== bannerId);
    bannerBlock.markModified('content');
    await bannerBlock.save();
  }

  revalidatePath('/admin/cms');
}

// Server Action: Update Legal Policies & Terms
async function updatePoliciesAction(formData: FormData) {
  'use server';
  const cancellationPolicy = formData.get('cancellationPolicy') as string;
  const termsOfService = formData.get('termsOfService') as string;
  const privacyPolicy = formData.get('privacyPolicy') as string;

  await connectDB();
  await CMS.findOneAndUpdate(
    { key: 'legal_policies' },
    { 
      content: { 
        cancellationPolicy, 
        termsOfService, 
        privacyPolicy 
      } 
    },
    { upsert: true }
  );

  revalidatePath('/admin/cms');
}

// Server Action: Add FAQ
async function addFaqAction(formData: FormData) {
  'use server';
  const question = formData.get('question') as string;
  const answer = formData.get('answer') as string;

  if (!question || !answer) return;

  await connectDB();
  const faqBlock = await CMS.findOne({ key: 'faqs' });
  
  if (faqBlock) {
    if (!Array.isArray(faqBlock.content)) faqBlock.content = [];
    faqBlock.content.push({ question, answer });
    faqBlock.markModified('content');
    await faqBlock.save();
  } else {
    await CMS.create({
      key: 'faqs',
      content: [{ question, answer }]
    });
  }

  revalidatePath('/admin/cms');
}

export default async function CMSPage() {
  await connectDB();

  // 1. Load Contact Details
  const contactCMS = await CMS.findOne({ key: 'contact_details' });
  const contacts = contactCMS?.content || {
    phone: '+91 91109 12544',
    whatsapp: '+91 96932 33447',
    drRajnishPhone: '+91 91109 12544',
    drPriyankaPhone: '+91 96932 33447',
    email: 'contact@drbariyarphysio.com',
    address: 'Near, Ashok Nagar Rd No 1, opposite Overhead Water Tank, Ashok Nagar, Ranchi, Jharkhand 834002',
    website: 'https://drbariyarphysio.com',
    workingHours: '9:00 AM – 7:00 PM (Monday – Sunday)'
  };

  // 2. Load Homepage Banners
  const bannerCMS = await CMS.findOne({ key: 'homepage_banners' });
  const banners = Array.isArray(bannerCMS?.content) ? bannerCMS.content : [
    {
      id: 'banner_def_1',
      title: 'Advanced Neuro & Spine Rehabilitation',
      subtitle: 'Personalized treatment protocols by Dr. Rajnish Bariyar & Dr. Priyanka Bariyar',
      badge: 'Certified Experts',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Book Clinic / Home Visit',
      isActive: true,
    }
  ];

  // 3. Load About Clinic Story
  const aboutCMS = await CMS.findOne({ key: 'about_clinic' });
  const about = aboutCMS?.content || {
    clinicHeadline: "Dr. Bariyar's Physiotherapy & Rehabilitation Center",
    clinicBio: "Leading physiotherapy & neuro-rehabilitation clinic in Ranchi, Jharkhand specializing in Stroke paralysis, Cervical & Lumbar Spondylosis, Joint replacements, Pediatric CP rehabilitation, and Sports Injury recovery.",
    yearsExperience: '16+ Years',
    patientsTreated: '15,000+',
    accreditations: 'MIAP Certified, JSCPT Registered, Government Recognized Center',
    missionStatement: 'Delivering compassionate, evidence-based physiotherapy to restore painless mobility and independent living for every patient.'
  };

  // 4. Load Policies & Legal Terms
  const policyCMS = await CMS.findOne({ key: 'legal_policies' });
  const policies = policyCMS?.content || {
    cancellationPolicy: "Appointments may be rescheduled or cancelled up to 2 hours prior to the scheduled consultation time. For home visits, travel dispatch is finalized 1 hour beforehand.",
    termsOfService: "Physiotherapy consultations and treatment sessions are conducted by licensed clinical practitioners. Patients are requested to present previous medical investigations and imaging reports.",
    privacyPolicy: "Patient medical history, diagnostic notes, and contact phone numbers are securely encrypted. We never share patient health information with unauthorized third parties."
  };

  // 5. Load FAQs
  const faqCMS = await CMS.findOne({ key: 'faqs' });
  const faqs = Array.isArray(faqCMS?.content) ? faqCMS.content : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="text-teal-600" size={26} />
          Content Management System (CMS)
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Control homepage banners, about clinic story, contact lines, FAQs, and legal policies across mobile & web.
        </p>
      </div>

      {/* Row 1: Contact Settings & Homepage Banners */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Contact & Support Channels */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="text-teal-600 w-5 h-5" />
            <h3 className="font-extrabold text-slate-800 text-base">Calling & WhatsApp Support Channels</h3>
          </div>

          <form action={updateContactAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Helpline Phone Number
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-3.5 text-teal-600" />
                  <input 
                    type="text" 
                    name="phone" 
                    defaultValue={contacts.phone} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  WhatsApp Support Number
                </label>
                <div className="relative">
                  <MessageCircle size={15} className="absolute left-3.5 top-3.5 text-emerald-600" />
                  <input 
                    type="text" 
                    name="whatsapp" 
                    defaultValue={contacts.whatsapp} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Dr. Rajnish Direct Calling Line
                </label>
                <div className="relative">
                  <UserCheck size={15} className="absolute left-3.5 top-3.5 text-teal-600" />
                  <input 
                    type="text" 
                    name="drRajnishPhone" 
                    defaultValue={contacts.drRajnishPhone} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Dr. Priyanka Direct Calling Line
                </label>
                <div className="relative">
                  <UserCheck size={15} className="absolute left-3.5 top-3.5 text-teal-700" />
                  <input 
                    type="text" 
                    name="drPriyankaPhone" 
                    defaultValue={contacts.drPriyankaPhone} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Clinic Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input 
                    type="email" 
                    name="email" 
                    defaultValue={contacts.email} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Website URL</label>
                <div className="relative">
                  <Globe size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    name="website" 
                    defaultValue={contacts.website} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Working Hours</label>
              <input 
                type="text" 
                name="workingHours" 
                defaultValue={contacts.workingHours} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Physical Address</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                <textarea 
                  name="address" 
                  defaultValue={contacts.address} 
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs ml-auto transition-colors shadow-xs"
            >
              <Save size={15} />
              Save Contact Settings
            </button>
          </form>
        </div>

        {/* Homepage Promotional Banners */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="text-teal-600 w-5 h-5" />
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Homepage Promotional Banners</h3>
                <p className="text-[11px] text-slate-500 font-medium">Controls live mobile app slider banners and campaigns</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <form action={resetDefaultBannersAction}>
                <button 
                  type="submit" 
                  title="Reset to 5 Core Default Banners"
                  className="text-[11px] font-bold text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 border border-slate-200 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1"
                >
                  <Sparkles size={13} className="text-amber-500" />
                  Restore 5 Core
                </button>
              </form>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-xl">
                {banners.length} Live Banners
              </span>
            </div>
          </div>

          {/* Add banner form */}
          <form action={addBannerAction} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Plus size={14} className="text-teal-600" /> Add New Promotional Banner
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input 
                type="text" 
                name="title" 
                required 
                placeholder="Banner Title (e.g. 20% Off Neuro Rehab)" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
              />
              <input 
                type="text" 
                name="badge" 
                placeholder="Tag / Badge (e.g. Limited Offer, Popular)" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
            <input 
              type="text" 
              name="subtitle" 
              placeholder="Subtitle description (e.g. Valid on all home consultations this week)" 
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input 
                type="url" 
                name="imageUrl" 
                required 
                placeholder="Image URL (https://...)" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 md:col-span-2"
              />
              <input 
                type="text" 
                name="ctaText" 
                placeholder="Button Label (e.g. Book Now →)" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Click Action / Target Route</label>
                <select 
                  name="targetRoute" 
                  defaultValue="/all_services"
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  <option value="/all_services">All Clinical Services (/all_services)</option>
                  <option value="/booking">Instant Booking Screen (/booking)</option>
                  <option value="/service_providers">Meet Doctors & Specialists (/service_providers)</option>
                  <option value="/offers">Offers & Packages (/offers)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Color Theme</label>
                <select 
                  name="theme" 
                  defaultValue="teal"
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  <option value="teal">Teal (Clinical & Chief Doctors)</option>
                  <option value="amber">Amber / Yellow (Pain Relief & Spine)</option>
                  <option value="sky">Sky Blue (Rehab & Sports)</option>
                  <option value="purple">Purple (Mobility & Balance)</option>
                  <option value="orange">Orange (Healthier You & Posture)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Feature Chips (comma separated)</label>
                <input 
                  type="text" 
                  name="chips" 
                  placeholder="e.g. Back Pain, Neck Pain, Sciatica" 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl ml-auto block transition-colors shadow-xs"
            >
              Add Banner to Mobile App
            </button>
          </form>

          {/* List of active banners */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {banners.map((b: any, idx: number) => (
              <div key={b.id || idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                    <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black text-slate-500">{b.numberTag || `${idx + 1}.`}</span>
                      <span className="text-xs font-bold text-slate-800 truncate">{b.title}</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded-md">
                        {b.badge || 'Banner'}
                      </span>
                      {b.theme && (
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.5 rounded-md uppercase">
                          {b.theme}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{b.subtitle}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Target: <strong className="text-slate-600">{b.targetRoute || '/all_services'}</strong></span>
                      <span>•</span>
                      <span>CTA: <strong className="text-teal-700">{b.ctaText || 'Learn More'}</strong></span>
                    </div>
                  </div>
                </div>
                <form action={deleteBannerAction}>
                  <input type="hidden" name="bannerId" value={b.id} />
                  <button type="submit" title="Delete Banner" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2: About Clinic Story & Legal Policies */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* About Clinic Management */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="text-teal-600 w-5 h-5" />
            <h3 className="font-extrabold text-slate-800 text-base">About Clinic & Doctor Profiles (CMS)</h3>
          </div>

          <form action={updateAboutClinicAction} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Clinic Headline</label>
              <input 
                type="text" 
                name="clinicHeadline" 
                defaultValue={about.clinicHeadline} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Overview & Founder Story</label>
              <textarea 
                name="clinicBio" 
                defaultValue={about.clinicBio} 
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Clinical Experience</label>
                <input 
                  type="text" 
                  name="yearsExperience" 
                  defaultValue={about.yearsExperience} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Treated Patients Metric</label>
                <input 
                  type="text" 
                  name="patientsTreated" 
                  defaultValue={about.patientsTreated} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Certifications & Accreditations</label>
              <input 
                type="text" 
                name="accreditations" 
                defaultValue={about.accreditations} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Mission Statement</label>
              <textarea 
                name="missionStatement" 
                defaultValue={about.missionStatement} 
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <button 
              type="submit" 
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs ml-auto transition-colors shadow-xs"
            >
              <Save size={15} />
              Save Clinic Profile
            </button>
          </form>
        </div>

        {/* Legal Policies, Terms & FAQs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="text-teal-600 w-5 h-5" />
            <h3 className="font-extrabold text-slate-800 text-base">Cancellation, Refund & Legal Terms</h3>
          </div>

          <form action={updatePoliciesAction} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Cancellation & Reschedule Policy
              </label>
              <textarea 
                name="cancellationPolicy" 
                defaultValue={policies.cancellationPolicy} 
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Terms of Clinical Service
              </label>
              <textarea 
                name="termsOfService" 
                defaultValue={policies.termsOfService} 
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Patient Data & Privacy Policy
              </label>
              <textarea 
                name="privacyPolicy" 
                defaultValue={policies.privacyPolicy} 
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <button 
              type="submit" 
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs ml-auto transition-colors shadow-xs"
            >
              <Save size={15} />
              Save Policies
            </button>
          </form>

          {/* FAQ section */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Info size={14} className="text-teal-600" /> Patient Questions & Answers ({faqs.length})
            </h4>

            <form action={addFaqAction} className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/50 space-y-2 mb-3">
              <input 
                type="text" 
                name="question" 
                required 
                placeholder="Question (e.g. What should I prepare for a home physiotherapy visit?)" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
              />
              <textarea 
                name="answer" 
                required 
                rows={2}
                placeholder="Answer details..." 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
              />
              <button 
                type="submit" 
                className="bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg ml-auto block transition-colors"
              >
                Add FAQ
              </button>
            </form>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {faqs.map((f: any, idx: number) => (
                <div key={idx} className="border-l-2 border-teal-500 pl-3 py-1 text-xs">
                  <span className="font-bold text-slate-800 block">{f.question}</span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">{f.answer}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
