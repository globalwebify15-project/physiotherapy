import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

/**
 * Optimizes an uploaded doctor/therapist image, resizes it with facial/top bias,
 * compresses and converts it to WebP format, and saves it into public/doctors.
 *
 * @param file The uploaded image File from FormData
 * @param doctorName Name of the doctor to generate a clean, SEO-friendly filename
 * @returns Relative public path (e.g. "/doctors/dr_rajesh_1740000000.webp")
 */
export async function processAndSaveDoctorImage(file: File, doctorName: string): Promise<string> {
  if (!file || file.size === 0) return '';

  const buffer = Buffer.from(await file.arrayBuffer());

  // Optimize and convert to WebP using sharp
  const webpBuffer = await sharp(buffer)
    .resize({
      width: 800,
      height: 800,
      fit: 'cover',
      position: 'top', // Focus on face/shoulders for medical professional headshots
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  const cleanName = doctorName
    .toLowerCase()
    .replace(/^dr[\.\s_]*/i, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 30);

  const filename = `dr_${cleanName || 'practitioner'}_${Date.now()}.webp`;

  // 1. Save to apps/admin-nextjs/public/doctors
  try {
    const adminDocsDir = path.join(process.cwd(), 'public', 'doctors');
    await fs.mkdir(adminDocsDir, { recursive: true });
    await fs.writeFile(path.join(adminDocsDir, filename), webpBuffer);
  } catch (err) {
    console.warn('Notice: Local public folder write restricted or serverless:', err);
  }

  // 2. Also sync to apps/backend-nextjs/public/doctors if running monorepo locally
  try {
    const backendDocsDir = path.resolve(process.cwd(), '..', 'backend-nextjs', 'public', 'doctors');
    await fs.mkdir(backendDocsDir, { recursive: true });
    await fs.writeFile(path.join(backendDocsDir, filename), webpBuffer);
  } catch (err) {
    // Non-fatal if separate deployment
  }

  return `/doctors/${filename}`;
}
