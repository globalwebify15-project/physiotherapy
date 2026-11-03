import React from 'react';
import { connectDB, Service } from 'database';
import { revalidatePath } from 'next/cache';
import ViewSwitcher from '@/components/ViewSwitcher';
import { 
  Activity, 
  Plus, 
  Clock, 
  MapPin, 
  Building, 
  Coins 
} from 'lucide-react';
import EditServiceModal from '@/components/EditServiceModal';

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

// Server Action to update an existing service
async function updateServiceAction(formData: FormData) {
  'use server';
  const serviceId = formData.get('serviceId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const duration = parseInt(formData.get('duration') as string) || 45;
  const pricingClinic = parseFloat(formData.get('pricingClinic') as string) || 0;
  const pricingHome = parseFloat(formData.get('pricingHome') as string) || 0;
  const homeVisitAvailable = formData.get('homeVisitAvailable') === 'on';
  const clinicVisitAvailable = formData.get('clinicVisitAvailable') === 'on';

  if (!serviceId) return;

  await connectDB();
  await Service.findByIdAndUpdate(serviceId, {
    title,
    description,
    category,
    duration,
    pricingClinic,
    pricingHome,
    homeVisitAvailable,
    clinicVisitAvailable,
  });

  revalidatePath('/admin/services');
}

// Server Action to deactivate/delete a service
async function deleteServiceAction(formData: FormData) {
  'use server';
  const serviceId = formData.get('serviceId') as string;
  if (!serviceId) return;

  await connectDB();
  await Service.findByIdAndUpdate(serviceId, { isActive: false });

  revalidatePath('/admin/services');
}

export default async function ServicesPage() {
  await connectDB();

  const services = await Service.find({ isActive: true }).sort({ title: 1 }).lean();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Physiotherapy Services Management</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Add, edit, configure, and manage clinical treatments, session durations, and consultation rates.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Create Service Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm self-start">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</label>
              <textarea 
                name="description" 
                required 
                rows={3}
                placeholder="Brief summary describing the treatment purpose..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Home Price (₹)</label>
                <input 
                  type="number" 
                  name="pricingHome" 
                  required 
                  placeholder="1200" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500"
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
                  className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
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
                  className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="homeCheck" className="text-sm font-medium text-slate-600 cursor-pointer">
                  Home Visit Available
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-teal-100"
            >
              Add Service Catalog
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Services View Switcher (Table default / Cards toggle) */}
        <div className="xl:col-span-2 space-y-4">
          <ViewSwitcher
            label="Services Catalog"
            totalCount={services.length}
            defaultView="table"
            tableView={
              services.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
                  <Activity className="mx-auto text-slate-300 w-12 h-12 mb-4" />
                  <h3 className="font-bold text-slate-800 text-lg">No active services</h3>
                  <p className="text-slate-400 text-sm mt-1">Configure treatments using the left panel.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3.5 px-4">Service & Category</th>
                          <th className="py-3.5 px-4">Duration</th>
                          <th className="py-3.5 px-4">Clinic Rate</th>
                          <th className="py-3.5 px-4">Home Rate</th>
                          <th className="py-3.5 px-4">Offerings</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {services.map((service: any) => (
                          <tr key={service._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 text-sm">{service.title}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                                  {service.category}
                                </span>
                                <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]" title={service.description}>
                                  {service.description}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-[11px]">
                                <Clock size={11} className="text-slate-400" />
                                {service.duration} mins
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900">
                                {service.clinicVisitAvailable ? `₹${service.pricingClinic}` : <span className="text-slate-300">N/A</span>}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900">
                                {service.homeVisitAvailable ? `₹${service.pricingHome}` : <span className="text-slate-300">N/A</span>}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {service.clinicVisitAvailable && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded">
                                    <Building size={10} /> Clinic
                                  </span>
                                )}
                                {service.homeVisitAvailable && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                    <MapPin size={10} /> Home
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <EditServiceModal
                                service={{
                                  _id: service._id.toString(),
                                  title: String(service.title),
                                  description: String(service.description),
                                  category: String(service.category),
                                  duration: Number(service.duration),
                                  pricingClinic: Number(service.pricingClinic),
                                  pricingHome: Number(service.pricingHome),
                                  homeVisitAvailable: Boolean(service.homeVisitAvailable),
                                  clinicVisitAvailable: Boolean(service.clinicVisitAvailable),
                                }}
                                onUpdate={updateServiceAction}
                                onDelete={deleteServiceAction}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            }
            cardView={
              services.length === 0 ? (
                <div className="col-span-2 bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
                  <Activity className="mx-auto text-slate-300 w-12 h-12 mb-4" />
                  <h3 className="font-bold text-slate-800 text-lg">No active services</h3>
                  <p className="text-slate-400 text-sm mt-1">Configure treatments using the left panel.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service: any) => (
                    <div 
                      key={service._id.toString()} 
                      className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100/60 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
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

                      <div>
                        <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Building size={14} className={service.clinicVisitAvailable ? 'text-teal-600' : 'text-slate-300'} />
                              <span>Clinic: {service.clinicVisitAvailable ? `₹${service.pricingClinic}` : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} className={service.homeVisitAvailable ? 'text-emerald-600' : 'text-slate-300'} />
                              <span>Home: {service.homeVisitAvailable ? `₹${service.pricingHome}` : 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <EditServiceModal
                          service={{
                            _id: service._id.toString(),
                            title: String(service.title),
                            description: String(service.description),
                            category: String(service.category),
                            duration: Number(service.duration),
                            pricingClinic: Number(service.pricingClinic),
                            pricingHome: Number(service.pricingHome),
                            homeVisitAvailable: Boolean(service.homeVisitAvailable),
                            clinicVisitAvailable: Boolean(service.clinicVisitAvailable),
                          }}
                          onUpdate={updateServiceAction}
                          onDelete={deleteServiceAction}
                        />
                      </div>

                    </div>
                  ))}
                </div>
              )
            }
          />
        </div>

      </div>
    </div>
  );
}
