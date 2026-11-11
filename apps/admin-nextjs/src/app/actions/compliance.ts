'use server';

import { connectDB, CMS } from 'database';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/utils/auth';

export async function saveCompliancePageAction(key: string, content: any) {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }

    await connectDB();

    await CMS.findOneAndUpdate(
      { key },
      {
        content,
        updatedBy: session.userId,
      },
      { upsert: true, new: true }
    );

    // Revalidate CMS admin page and the public compliance route
    revalidatePath('/admin/cms');
    if (content?.slug) {
      revalidatePath(`/${content.slug}`);
    }
    revalidatePath('/privacy');
    revalidatePath('/terms');
    revalidatePath('/refund-policy');
    revalidatePath('/contact-us');
    revalidatePath('/about-us');
    revalidatePath('/shipping-delivery-policy');
    revalidatePath('/medical-disclaimer');
    revalidatePath('/delete-account');

    return { success: true };
  } catch (err: any) {
    console.error('Error saving compliance page:', err);
    return { success: false, error: err?.message || 'Failed to save changes.' };
  }
}

