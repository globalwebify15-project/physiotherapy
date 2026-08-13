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
  FileText 
} from 'lucide-react';

export const revalidate = 0; // Dynamic fetch

// Server Action to update contact details CMS block
async function updateContactAction(formData: FormData) {
  'use server';
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const address = formData.get('address') as string;
  const website = formData.get('website') as string;
  const workingHours = formData.get('workingHours') as string;

  await connectDB();
  await CMS.findOneAndUpdate(
    { key: 'contact_details' },
    { 
      content: { phone, email, address, website, workingHours } 
    },
    { upsert: true }
  );

  revalidatePath('/admin/cms');
}

// Server Action to add an FAQ
async function addFaqAction(formData: FormData) {
  'use server';
  const question = formData.get('question') as string;
  const answer = formData.get('answer') as string;

  await connectDB();
  const faqBlock = await CMS.findOne({ key: 'faqs' });
  
  if (faqBlock) {
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

  // Load Contact Details
  const contactCMS = await CMS.findOne({ key: 'contact_details' });
  const contacts = contactCMS?.content || {
    phone: '',
    email: '',
    address: '',
    website: '',
    workingHours: ''
  };

  // Load FAQs
  const faqCMS = await CMS.findOne({ key: 'faqs' });
  const faqs = faqCMS?.content || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Content Management (CMS)</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Customize website details, clinic location data, contact coordinates, and patient FAQs.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Left Column: Contact details configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="text-indigo-600 w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-lg">Clinic Profile Info</h3>
          </div>

          <form action={updateContactAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    name="phone" 
                    defaultValue={contacts.phone} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Clinic Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input 
                    type="email" 
                    name="email" 
                    defaultValue={contacts.email} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Website URL</label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  name="website" 
                  defaultValue={contacts.website} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Working Hours Summary</label>
              <input 
                type="text" 
                name="workingHours" 
                defaultValue={contacts.workingHours} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Physical Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <textarea 
                  name="address" 
                  defaultValue={contacts.address} 
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 text-sm ml-auto transition-colors"
            >
              <Save size={16} />
              Save Clinic Profile
            </button>
          </form>
        </div>

        {/* Right Column: FAQ list & onboarding form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info className="text-indigo-600 w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-lg">Patient FAQ Listings</h3>
          </div>

          {/* Add FAQ form */}
          <form action={addFaqAction} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/40 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Plus size={14} /> Add New Question
            </h4>
            <input 
              type="text" 
              name="question" 
              required 
              placeholder="e.g. Can I cancel within 2 hours?" 
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
            />
            <textarea 
              name="answer" 
              required 
              rows={2}
              placeholder="e.g. Yes, cancellations made up to 2 hours before are fully refunded." 
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg ml-auto block transition-colors"
            >
              Add FAQ
            </button>
          </form>

          {/* List of current FAQs */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {faqs.length === 0 ? (
              <p className="text-slate-400 text-xs italic text-center py-4">No FAQs defined.</p>
            ) : (
              faqs.map((faq: any, idx: number) => (
                <div key={idx} className="border-l-2 border-indigo-500 pl-3.5 py-1">
                  <h4 className="text-sm font-bold text-slate-800">{faq.question}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{faq.answer}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
