const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../apps/backend-nextjs/.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined.');
  process.exit(1);
}

const CMSSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const CMS = mongoose.models.CMS || mongoose.model('CMS', CMSSchema);

const defaultOnboardingConfig = {
  brandShortCode: 'QP',
  brandName: 'QuickPhysio24.com',
  ratingBadge: '4.9 (350+ Cases)',
  experienceBadge: '16+ Yrs Experience',
  clinicSubtitle: 'Synergy Global Hospital, Bariatu, Ranchi',
  promoPillText: 'Flat 25% OFF on 5-Session Rehab Packages',
  showPromoPill: true,
  headline: 'Expert Physiotherapy\n& Home Doctor Care',
  subtitle: 'Painless mobility, stroke paralysis recovery, and certified 24/7 caretakers at your doorstep in Ranchi.',
  doctorInitials: 'DR',
  doctorNames: 'Dr. Rajnish Bariyar & Dr. Priyanka Bariyar',
  doctorCredentials: 'BPT, MIAP, JSCPT • 16+ Years Clinical Excellence',
  primaryCtaText: 'Get Started / शुरू करें',
  secondaryCtaText: 'I already have an account',
  slides: [
    {
      iconKey: 'home_care',
      colorHex: '#0F766E',
      title: 'Doorstep Home Care in 60 Mins',
      desc: 'Senior licensed physiotherapists visit your residence across Ranchi with portable electrotherapy & recovery kits.',
    },
    {
      iconKey: 'clinic_rehab',
      colorHex: '#2563EB',
      title: 'In-Clinic Advanced Rehabilitation',
      desc: 'Modern spine decompression, chiropractic adjustments, Class-IV laser & neuro rehab at our Bariatu hospital center.',
    },
    {
      iconKey: 'caretaker',
      colorHex: '#D97706',
      title: '24/7 Caretakers & Nursing Support',
      desc: 'Compassionate, verified bedside assistance for elderly, bedridden, and post-surgery patients in 2, 12, or 24-hr shifts.',
    },
  ],
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    await CMS.findOneAndUpdate(
      { key: 'onboarding_config' },
      { content: defaultOnboardingConfig },
      { upsert: true, new: true }
    );

    console.log('✅ Successfully seeded onboarding_config into CMS collection!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed onboarding_config:', err);
    process.exit(1);
  }
}

seed();

