const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../atlas-cred.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const CMSSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

const CMS = mongoose.models.CMS || mongoose.model('CMS', CMSSchema);

async function seedBanners() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const banners = [
    {
      id: 'banner_1_pain_relief',
      numberTag: '1.',
      badge: 'Back & Joint Relief',
      title: 'Say Goodbye to Pain',
      subtitle: "Back, neck, knee or shoulder — we've got you covered.",
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Learn More →',
      targetRoute: '/all_services',
      theme: 'amber',
      gradientColors: ['#FFFDF5', '#FEF3C7', '#FDE68A'],
      borderColor: '#FCD34D',
      ctaColor: '#0F766E',
      chips: ['Back Pain', 'Neck Pain', 'Joint Pain'],
      isActive: true
    },
    {
      id: 'banner_2_recover_faster',
      numberTag: '2.',
      badge: 'Rehab & Sports',
      title: 'Recover Faster',
      subtitle: 'Post-surgery rehab & sports physiotherapy.',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Get Started →',
      targetRoute: '/booking',
      theme: 'sky',
      gradientColors: ['#F0F9FF', '#E0F2FE', '#BAE6FD'],
      borderColor: '#38BDF8',
      ctaColor: '#0284C7',
      chips: ['Rehab', 'Sports Injury', 'Performance'],
      isActive: true
    },
    {
      id: 'banner_3_better_mobility',
      numberTag: '3.',
      badge: 'Flexibility & Balance',
      title: 'Better Mobility Better Life',
      subtitle: 'Improve flexibility, strength and balance.',
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Start Your Journey →',
      targetRoute: '/all_services',
      theme: 'purple',
      gradientColors: ['#FAF5FF', '#F3E8FF', '#E9D5FF'],
      borderColor: '#C084FC',
      ctaColor: '#6B21A8',
      chips: ['Flexibility', 'Balance', 'Wellness'],
      isActive: true
    },
    {
      id: 'banner_4_healthier_you',
      numberTag: '4.',
      badge: 'Full Body Care',
      title: 'Your Journey to a Healthier You',
      subtitle: 'Professional care for a stronger, healthier you.',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Start Today →',
      targetRoute: '/service_providers',
      theme: 'orange',
      gradientColors: ['#FFF7ED', '#FFEDD5', '#FED7AA'],
      borderColor: '#FB923C',
      ctaColor: '#0F766E',
      chips: ['Active Life', 'Better Posture', 'Happier You'],
      isActive: true
    },
    {
      id: 'banner_5_doctor_showcase',
      numberTag: '5.',
      badge: 'Founder & Chief Specialists',
      title: 'Advanced Neuro & Spine Rehabilitation',
      subtitle: 'Personalized treatment protocols by Dr. Rajnish Bariyar & Dr. Priyanka Bariyar',
      imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Book Clinic / Home Visit →',
      targetRoute: '/booking',
      theme: 'teal',
      gradientColors: ['#F0FDFA', '#CCFBF1', '#99F6E4'],
      borderColor: '#2DD4BF',
      ctaColor: '#0F766E',
      chips: ['Stroke Rehab', 'Paralysis Care', 'Home Visit'],
      isActive: true
    }
  ];

  await CMS.findOneAndUpdate(
    { key: 'homepage_banners' },
    { content: banners },
    { upsert: true, new: true }
  );
  console.log('Successfully seeded 5 rich banners into homepage_banners in MongoDB Atlas!');

  const faqs = [
    {
      question: 'What are the clinic timings and working hours?',
      hindi: 'क्लिनिक का समय क्या है?',
      answer: 'Our clinic is open daily from 9:00 AM to 7:00 PM (Clinic Hours: 9:00 AM – 7:00 PM). Both clinic consultations and home visits are available during these hours.'
    },
    {
      question: 'Who are the chief doctors and physiotherapists?',
      hindi: 'क्लिनिक के मुख्य डॉक्टर कौन हैं?',
      answer: 'Dr. Rajnish Bariyar (BPT, MIAP, JSCPT - Founder & Chief Physiotherapist, Joint Secretary IAP Jharkhand Branch) and Dr. Priyanka Bariyar (BPT, MIAP, JSCPT - Co-Founder & Director).'
    },
    {
      question: 'What specialized treatments are offered?',
      hindi: 'यहाँ कौन से विशेष उपचार उपलब्ध हैं?',
      answer: "We specialize in Stroke / Paralysis Rehab, Parkinson's & Alzheimer's, Facial / Bell's Palsy, Vestibular Dysfunction, Cervical & Lumbar Spondylosis, Knee OA, CP Child, Autism, Developmental Delay, Prenatal & Postnatal, Joint Replacement Rehab, and Sports Injury Management."
    },
    {
      question: 'How does Home Physiotherapy visit work?',
      hindi: 'घर पर फिजियोथेरेपी कैसे काम करती है?',
      answer: 'Our expert physiotherapist visits your home with clinical assessment and therapy equipment for paralysis, stroke, post-operative, and pediatric patients.'
    },
    {
      question: 'How can I book or reschedule an appointment?',
      hindi: 'अपॉइंटमेंट कैसे बुक या बदलें?',
      answer: 'You can book directly via the app booking screen by choosing your service, preferred doctor, and time slot, or call the clinic at +91 91109 12544 / +91 96932 33447.'
    }
  ];

  await CMS.findOneAndUpdate(
    { key: 'faqs' },
    { content: faqs },
    { upsert: true, new: true }
  );
  console.log('Successfully updated 5 bilingual clinical FAQs in MongoDB Atlas!');

  process.exit(0);
}

seedBanners().catch(err => {
  console.error('Error seeding banners:', err);
  process.exit(1);
});
