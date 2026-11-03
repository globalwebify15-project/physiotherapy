import React from 'react';
import { connectDB, Service } from 'database';
import { revalidatePath } from 'next/cache';
import ServicesDirectoryClient from '@/components/ServicesDirectoryClient';

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

// Server Action to delete a service (soft-delete)
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
    <div className="space-y-6 animate-fade-in w-full">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Physiotherapy Services Management</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Add, edit, configure, and manage clinical treatments, session durations, and consultation rates.
        </p>
      </div>

      {/* Full-width Interactive Directory with Search, Filters, CSV Export & Add Modal */}
      <ServicesDirectoryClient
        services={JSON.parse(JSON.stringify(services))}
        onAdd={createServiceAction}
        onUpdate={updateServiceAction}
        onDelete={deleteServiceAction}
      />
    </div>
  );
}
