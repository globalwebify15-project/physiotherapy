import React from 'react';
import { connectDB, Service } from 'database';
import { revalidatePath } from 'next/cache';
import { 
  Activity, 
  Plus, 
  Clock, 
  MapPin, 
  Building, 
  Coins 
} from 'lucide-react';

export const revalidate = 0; // Dynamic fetch

// Server Action to add a new service
async function createServiceAction(formData: FormData) {
  'use server';
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const duration = parseInt(formData.get('duration') as string) || 45;
  const pricingClinic = parseFloat(formData.get('pricingClinic') as string) || 0;
  const pricingHome = parseFloat(formData.get('pricingHome') as string) || 0;
  const homeVisitAvailable = formData.get('homeVisitAvailable') === 'on';
  const clinicVisitAvailable = formData.get('clinicVisitAvailable') === 'on';

  await connectDB();
  await Service.create({
    title,
    description,
    category,
    duration,
    pricingClinic,
    pricingHome,
    homeVisitAvailable,
    clinicVisitAvailable,
    isActive: true,
  });

  revalidatePath('/admin/services');
}

export default async function ServicesPage() {
  await connectDB();

  const services = await Service.find({ isActive: true }).sort({ title: 1 });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Physiotherapy Services</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Add, configure, and review clinical treatments and home consultation rates.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Create Service Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm self-start">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Add Service</h3>
          </div>

          <form action={createServiceAction} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Service Title</label>
              <input 
                type="text" 
                name="title" 
                required 
                placeholder="Post-Pregnancy Core Rehab" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</label>
              <textarea 
                name="description" 
                required 
                rows={3}
                placeholder="Brief summary describing the treatment purpose..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                <input 
                  type="text" 
                  name="category" 
                  required 
                  placeholder="Rehabilitation" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Duration (Min)</label>
                <input 
                  type="number" 
                  name="duration" 
                  required 
                  min="5"
                  placeholder="60" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Clinic Price (₹)</label>
                <input 
                  type="number" 
                  name="pricingClinic" 
                  required 
                  placeholder="800" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Home Price (₹)</label>
                <input 
                  type="number" 
                  name="pricingHome" 
                  required 
                  placeholder="1200" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Service Offerings</label>
              
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  name="clinicVisitAvailable" 
                  id="clinicCheck" 
                  defaultChecked
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="clinicCheck" className="text-sm font-medium text-slate-600 cursor-pointer">
                  Clinic Consultation Available
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  name="homeVisitAvailable" 
                  id="homeCheck" 
                  defaultChecked
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="homeCheck" className="text-sm font-medium text-slate-600 cursor-pointer">
                  Home Visit Available
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-indigo-100"
            >
              Add Service Catalog
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Services Grid */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.length === 0 ? (
            <div className="col-span-2 bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
              <Activity className="mx-auto text-slate-300 w-12 h-12 mb-4" />
              <h3 className="font-bold text-slate-800 text-lg">No active services</h3>
              <p className="text-slate-400 text-sm mt-1">Configure treatments using the left panel.</p>
            </div>
          ) : (
            services.map((service: any) => (
              <div 
                key={service._id} 
                className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/35 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {service.category}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                      <Clock size={12} />
                      {service.duration} mins
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base leading-snug">{service.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 font-medium">{service.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Building size={14} className={service.clinicVisitAvailable ? 'text-indigo-600' : 'text-slate-300'} />
                      <span>Clinic: {service.clinicVisitAvailable ? `₹${service.pricingClinic}` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className={service.homeVisitAvailable ? 'text-emerald-600' : 'text-slate-300'} />
                      <span>Home: {service.homeVisitAvailable ? `₹${service.pricingHome}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
