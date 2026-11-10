import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { optimizeAndUploadToCloudinary } from './cloudinary';

/**
 * Optimizes an uploaded doctor/therapist image, resizes it with facial/top bias,
 * compresses and converts it to WebP format, and uploads directly to Cloudinary.
 * Also keeps local cached copy if writable.
 *
 * @param file The uploaded image File or Buffer from FormData
 * @param doctorName Name of the doctor to generate a clean, SEO-friendly filename
 * @returns Cloudinary HTTPS URL (or fallback relative public path)
 */
export async function processAndSaveDoctorImage(file: File | Buffer, doctorName: string): Promise<string> {
  if (!file) return '';

  const buffer = Buffer.isBuffer(file) ? file : Buffer.from(await (file as File).arrayBuffer());
  if (buffer.length === 0) return '';

  const cleanName = doctorName
    .toLowerCase()
    .replace(/^dr[\.\s_]*/i, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 30);

  const publicId = `dr_${cleanName || 'practitioner'}_${Date.now()}`;

  // 1. Primary: Upload to Cloudinary with WebP conversion and top/facial crop
  try {
    const cloudRes = await optimizeAndUploadToCloudinary(buffer, {
      folder: 'quickphysio24/doctors',
      publicId,
      maxWidth: 800,
      maxHeight: 800,
      quality: 82,
      fit: 'cover',
      position: 'top',
    });

    if (cloudRes?.url) {
      return cloudRes.url;
    }
  } catch (cloudErr) {
    console.warn('[Cloudinary Doctor Upload Warning - Falling back to local]:', cloudErr);
  }

  // 2. Fallback: Save to local public/doctors if running local environment
  try {
    const webpBuffer = await sharp(buffer)
      .resize({
        width: 800,
        height: 800,
        fit: 'cover',
        position: 'top',
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const filename = `${publicId}.webp`;
    const adminDocsDir = path.join(process.cwd(), 'public', 'doctors');
    await fs.mkdir(adminDocsDir, { recursive: true });
    await fs.writeFile(path.join(adminDocsDir, filename), webpBuffer);

    try {
      const backendDocsDir = path.resolve(process.cwd(), '..', 'backend-nextjs', 'public', 'doctors');
      await fs.mkdir(backendDocsDir, { recursive: true });
      await fs.writeFile(path.join(backendDocsDir, filename), webpBuffer);
    } catch (_) {}

    return `/doctors/${filename}`;
  } catch (err) {
    console.error('[Local Doctor Image Fallback Error]:', err);
    return '';
  }
}
