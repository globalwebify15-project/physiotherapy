const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const therapists = await mongoose.connection.db.collection('therapists').find({}).toArray();
  console.log('--- Therapists count:', therapists.length);
  for (const t of therapists) {
    console.log(`  Therapist: ${t.name} -> photo: "${t.profilePhoto || ''}"`);
  }

  const patients = await mongoose.connection.db.collection('patients').find({}).toArray();
  console.log('--- Patients count:', patients.length);
  for (const p of patients) {
    if (p.profilePhoto) {
      console.log(`  Patient: ${p.name} -> photo length: ${p.profilePhoto.length}, prefix: ${p.profilePhoto.slice(0, 40)}`);
    }
  }

  const cmsDocs = await mongoose.connection.db.collection('cms').find({}).toArray();
  console.log('--- CMS count:', cmsDocs.length);
  for (const c of cmsDocs) {
    console.log(`  CMS Key: ${c.key}`);
    if (c.key === 'homepage_banners' && Array.isArray(c.content)) {
      console.log('  Banners imageUrls:');
      for (const b of c.content) {
        console.log(`    - ${b.id}: ${b.imageUrl}`);
      }
    }
  }

  const services = await mongoose.connection.db.collection('services').find({}).toArray();
  console.log('--- Services count:', services.length);
  const withImages = services.filter(s => Array.isArray(s.images) && s.images.length > 0);
  console.log('  Services with images:', withImages.length);

  await mongoose.disconnect();
}
check().catch(console.error);

