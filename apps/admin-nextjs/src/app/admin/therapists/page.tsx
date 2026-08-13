import React from 'react';
import { connectDB, Therapist } from 'database';
import { revalidatePath } from 'next/cache';
import { 
  UserRound, 
  Mail, 
  Phone, 
  GraduationCap, 
  Sliders, 
  Plus, 
  CalendarDays, 
  Star 
} from 'lucide-react';

export const revalidate = 0; // Dynamic fetch

// Server Action to onboard a therapist
async function onboardTherapistAction(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const mobile = formData.get('mobile') as string;
  const qualification = formData.get('qualification') as string;
  const experience = parseInt(formData.get('experience') as string) || 0;
  const specializationStr = formData.get('specialization') as string;
  
  const specialization = specializationStr
    ? specializationStr.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  await connectDB();
  await Therapist.create({
    name,
    email,
    mobile,
    qualification,
    experience,
    specialization,
    workingHours: { start: '09:00', end: '18:00' },
    workingDays: [1, 2, 3, 4, 5], // Monday-Friday
    isActive: true,
  });

  revalidatePath('/admin/therapists');
}

export default async function TherapistsPage() {
  await connectDB();

  const therapists = await Therapist.find({ isActive: true }).sort({ name: 1 });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Block */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Therapist Management</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Manage practitioner details, onboard staff, and review schedule availability settings.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Onboard Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm self-start">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Onboard Therapist</h3>
          </div>

          <form action={onboardTherapistAction} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Dr. Rajesh Kumar" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="rajesh@clinic.com" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Mobile</label>
                <input 
                  type="text" 
                  name="mobile" 
                  required 
                  placeholder="9876543210" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Qualification</label>
              <input 
                type="text" 
                name="qualification" 
                required 
                placeholder="MPT (Sports Medicine), BPT" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Experience (Years)</label>
                <input 
                  type="number" 
                  name="experience" 
                  required 
                  min="0"
                  placeholder="5" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Working Days</label>
                <div className="text-xs font-bold text-slate-500 bg-slate-100/50 p-2.5 rounded-xl border border-slate-200/40 mt-1 select-none">
                  Mon - Fri (Default)
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Specializations (Comma separated)</label>
              <input 
                type="text" 
                name="specialization" 
                placeholder="Dry Needling, Joint Mobilization, Posture Correction" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-indigo-100"
            >
              Add Therapist
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Therapists List */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {therapists.length === 0 ? (
            <div className="col-span-2 bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
              <UserRound className="mx-auto text-slate-300 w-12 h-12 mb-4" />
              <h3 className="font-bold text-slate-800 text-lg">No active practitioners</h3>
              <p className="text-slate-400 text-sm mt-1">Add details on the left form to onboard new therapists.</p>
            </div>
          ) : (
            therapists.map((therapist: any) => (
              <div 
                key={therapist._id} 
                className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Avatar and rating header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-extrabold text-base border border-indigo-100">
                        {therapist.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base leading-snug">{therapist.name}</h4>
                        <span className="text-xs font-semibold text-slate-400">Experience: {therapist.experience} years</span>
                      </div>
                    </div>
                    <div className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-200/30 flex items-center gap-1 text-xs font-bold shrink-0">
                      <Star size={12} fill="currentColor" />
                      {therapist.ratingAverage}
                    </div>
                  </div>

                  {/* Body stats lists */}
                  <div className="space-y-2.5 text-sm font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} className="text-slate-400" />
                      <span className="text-xs text-slate-600 truncate block">{therapist.qualification}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-slate-400" />
                      <span className="text-xs">{therapist.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-slate-400" />
                      <span className="text-xs">{therapist.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-slate-400" />
                      <span className="text-xs">
                        Hrs: {therapist.workingHours.start} - {therapist.workingHours.end}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specialties footer labels */}
                {therapist.specialization && therapist.specialization.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {therapist.specialization.map((spec: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/35 px-2 py-0.5 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
