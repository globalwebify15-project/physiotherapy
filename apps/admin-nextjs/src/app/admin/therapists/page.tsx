import React from 'react';
import { connectDB, Therapist } from 'database';
import { revalidatePath } from 'next/cache';
import TherapistsDirectoryClient from '@/components/TherapistsDirectoryClient';
import { processAndSaveDoctorImage } from '@/utils/imageOptimizer';

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
  const imageFile = formData.get('profileImage') as File | null;
  
  let profilePhoto = '';
  if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === 'function') {
    try {
      const arrayBuf = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const optimizedWebpPath = await processAndSaveDoctorImage(buffer, name);
      if (optimizedWebpPath) {
        profilePhoto = optimizedWebpPath;
      }
    } catch (e) {
      console.error('[THERAPIST IMAGE UPLOAD ERROR]:', e);
    }
  }

  const specialization = specializationStr
    ? specializationStr.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
    : [];

  await connectDB();
  await Therapist.create({
    name,
    email,
    mobile,
    qualification,
    experience,
    specialization,
    profilePhoto: profilePhoto || undefined,
    isActive: true,
  });

  revalidatePath('/admin/therapists');
}

// Server Action to update a therapist
async function updateTherapistAction(formData: FormData) {
  'use server';
  const therapistId = formData.get('therapistId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const mobile = formData.get('mobile') as string;
  const qualification = formData.get('qualification') as string;
  const experience = parseInt(formData.get('experience') as string) || 0;
  const specializationStr = formData.get('specialization') as string;
  const startTime = (formData.get('startTime') as string) || '09:00';
  const endTime = (formData.get('endTime') as string) || '19:00';
  const imageFile = formData.get('profileImage') as File | null;

  if (!therapistId) return;

  const specialization = specializationStr
    ? specializationStr.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
    : [];

  const updateFields: any = {
    name,
    email,
    mobile,
    qualification,
    experience,
    specialization,
    workingHours: {
      start: startTime,
      end: endTime,
    },
  };

  if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === 'function') {
    try {
      const arrayBuf = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const optimizedWebpPath = await processAndSaveDoctorImage(buffer, name);
      if (optimizedWebpPath) {
        updateFields.profilePhoto = optimizedWebpPath;
      }
    } catch (e) {
      console.error('[THERAPIST IMAGE UPDATE ERROR]:', e);
    }
  }

  await connectDB();
  await Therapist.findByIdAndUpdate(therapistId, updateFields);

  revalidatePath('/admin/therapists');
}

// Server Action to delete a therapist (soft delete)
async function deleteTherapistAction(formData: FormData) {
  'use server';
  const therapistId = formData.get('therapistId') as string;
  if (!therapistId) return;

  await connectDB();
  await Therapist.findByIdAndUpdate(therapistId, { isActive: false });

  revalidatePath('/admin/therapists');
}

export default async function TherapistsPage() {
  await connectDB();

  const therapists = await Therapist.find({ isActive: true }).sort({ name: 1 }).lean();

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Therapists & Doctor Management</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Manage practitioner details, onboard staff, edit doctor schedules, and review specialties.
        </p>
      </div>

      {/* Full-width Interactive Directory with Search, Filters, CSV Export & Onboard Modal */}
      <TherapistsDirectoryClient
        therapists={JSON.parse(JSON.stringify(therapists))}
        onAdd={onboardTherapistAction}
        onUpdate={updateTherapistAction}
        onDelete={deleteTherapistAction}
      />
    </div>
  );
}
