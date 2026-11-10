const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;

dotenv.config({ path: path.resolve(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'bc4kgc77',
  api_key: process.env.CLOUDINARY_API_KEY || '738945981836422',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'LetbHJxRMkkKMlLJXsMbucoJXjs',
  secure: true,
});

async function optimizeAndUpload(buffer, folder, publicId, options = {}) {
  const { maxWidth = 800, maxHeight = 800, fit = 'cover', position = 'top', quality = 82 } = options;

  const webpBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit,
      position: fit === 'cover' ? position : undefined,
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `quickphysio24/${folder}`,
        public_id: publicId,
        resource_type: 'image',
        format: 'webp',
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(webpBuffer);
  });
}

async function runMigration() {
  console.log('--- STARTING CLOUDINARY MIGRATION ---');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  // 1. Upload Local Doctor Images to Cloudinary
  const doctorImagesDir = path.resolve(__dirname, '../apps/admin-nextjs/public/doctors');
  const doctorFiles = [
    { file: 'dr_rajnish_bariyar.png', id: 'dr_rajnish_bariyar', name: 'Dr. Rajnish Bariyar' },
    { file: 'dr_priyanka_bariyar.png', id: 'dr_priyanka_bariyar', name: 'Dr. Priyanka Bariyar' },
    { file: 'doctors_together.png', id: 'doctors_together', name: 'Doctors Together Clinic' },
  ];

  const uploadedDoctors = {};

  for (const item of doctorFiles) {
    const filePath = path.join(doctorImagesDir, item.file);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      console.log(`Optimizing & uploading ${item.file} (${buffer.length} bytes)...`);
      const uploadRes = await optimizeAndUpload(buffer, 'doctors', item.id, {
        maxWidth: 800,
        maxHeight: 800,
        fit: 'cover',
        position: 'top',
      });
      console.log(`✓ Uploaded ${item.file} -> ${uploadRes.secure_url} (${uploadRes.bytes} bytes, format: ${uploadRes.format})`);
      uploadedDoctors[item.name] = uploadRes.secure_url;
      uploadedDoctors[item.id] = uploadRes.secure_url;
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  }

  // 2. Update Therapists in MongoDB with Cloudinary URLs
  console.log('\n--- UPDATING THERAPISTS IN MONGODB ---');
  const therapists = await mongoose.connection.db.collection('therapists').find({}).toArray();
  for (const t of therapists) {
    let cloudUrl = '';
    const nameLower = (t.name || '').toLowerCase();

    if (nameLower.includes('rajnish')) {
      cloudUrl = uploadedDoctors['Dr. Rajnish Bariyar'];
    } else if (nameLower.includes('priyanka')) {
      cloudUrl = uploadedDoctors['Dr. Priyanka Bariyar'];
    }

    if (cloudUrl) {
      await mongoose.connection.db.collection('therapists').updateOne(
        { _id: t._id },
        { $set: { profilePhoto: cloudUrl, updatedAt: new Date() } }
      );
      console.log(`✓ Updated Therapist "${t.name}" -> ${cloudUrl}`);
    } else if (t.profilePhoto && !t.profilePhoto.startsWith('https://res.cloudinary.com/')) {
      console.log(`  Therapist "${t.name}" already has photo: ${t.profilePhoto}`);
    }
  }

  // 3. Migrate Patient Base64 Photos in MongoDB to Cloudinary WebP
  console.log('\n--- CHECKING PATIENTS IN MONGODB ---');
  const patients = await mongoose.connection.db.collection('patients').find({}).toArray();
  let migratedPatients = 0;
  for (const p of patients) {
    if (p.profilePhoto && typeof p.profilePhoto === 'string' && p.profilePhoto.startsWith('data:image')) {
      console.log(`Migrating base64 photo for patient: ${p.name} (length: ${p.profilePhoto.length})...`);
      const base64Data = p.profilePhoto.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const cleanName = (p.name || 'patient').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const publicId = `patient_${cleanName}_${p._id}`;

      try {
        const uploadRes = await optimizeAndUpload(buffer, 'patients', publicId, {
          maxWidth: 600,
          maxHeight: 600,
          fit: 'cover',
          position: 'center',
          quality: 80,
        });

        await mongoose.connection.db.collection('patients').updateOne(
          { _id: p._id },
          { $set: { profilePhoto: uploadRes.secure_url, updatedAt: new Date() } }
        );
        console.log(`✓ Migrated Patient "${p.name}" -> ${uploadRes.secure_url} (${uploadRes.bytes} bytes)`);
        migratedPatients++;
      } catch (err) {
        console.error(`✗ Failed migrating photo for patient ${p.name}:`, err);
      }
    }
  }
  console.log(`✓ Total patients migrated: ${migratedPatients}`);

  // 4. Verify Final State
  console.log('\n--- VERIFICATION OF DATABASE STATE ---');
  const updatedTherapists = await mongoose.connection.db.collection('therapists').find({}).toArray();
  for (const t of updatedTherapists) {
    console.log(`Therapist: ${t.name} -> photo: ${t.profilePhoto}`);
  }

  const updatedPatients = await mongoose.connection.db.collection('patients').find({ profilePhoto: { $exists: true, $ne: '' } }).toArray();
  for (const p of updatedPatients) {
    console.log(`Patient: ${p.name} -> photo: ${p.profilePhoto}`);
  }

  await mongoose.disconnect();
  console.log('\n✓ MIGRATION COMPLETED SUCCESSFULLY');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

