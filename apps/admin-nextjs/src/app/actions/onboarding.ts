'use server';

import { connectDB, CMS } from 'database';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/utils/auth';

export async function saveOnboardingConfigAction(content: any) {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }

    await connectDB();

    await CMS.findOneAndUpdate(
      { key: 'onboarding_config' },
      {
        content,
        updatedBy: session.userId,
      },
      { upsert: true, new: true }
    );

    revalidatePath('/admin/cms');

    return { success: true };
  } catch (err: any) {
    console.error('Error saving onboarding config:', err);
    return { success: false, error: err?.message || 'Failed to save onboarding configuration.' };
  }
}

