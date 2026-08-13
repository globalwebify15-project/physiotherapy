import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../db';
import { User } from '../models/User';
import { Therapist } from '../models/Therapist';
import { Service } from '../models/Service';
import { CMS } from '../models/CMS';
import { Appointment } from '../models/Appointment';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';
import { Patient } from '../models/Patient';

// Seed data definition
const SERVICES = [
  {
    title: 'Sports Injury Rehabilitation',
    description: 'Specialized therapy to recover from sports injuries, restore function, and improve athletic performance. Includes biomechanical assessment and targeted exercises.',
    category: 'Rehabilitation',
    duration: 60,
    pricingClinic: 800,
    pricingHome: 1200,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80'],
    isActive: true
  },
  {
    title: 'Manual Therapy & Chiropractic Care',
    description: 'Hands-on manipulation of muscles, joints, and spine to alleviate pain, reduce inflammation, and increase mobility.',
    category: 'Therapy',
    duration: 45,
    pricingClinic: 700,
    pricingHome: 1000,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['https://images.unsplash.com/photo-1597764690523-15bea4c581c9?auto=format&fit=crop&w=600&q=80'],
    isActive: true
  },
  {
    title: 'Geriatric Physiotherapy',
    description: 'Designed for older adults to combat age-related mobility issues, improve balance, manage arthritis pain, and maintain independence.',
    category: 'Geriatric',
    duration: 60,
    pricingClinic: 600,
    pricingHome: 900,
    homeVisitAvailable: true,
    clinicVisitAvailable: false,
    images: ['https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80'],
    isActive: true
  },
  {
    title: 'Post-Surgery Rehabilitation',
    description: 'Guided recovery program following orthopedic surgeries (like ACL reconstruction, knee replacement) to ensure correct joint healing and muscle strengthening.',
    category: 'Rehabilitation',
    duration: 60,
    pricingClinic: 900,
    pricingHome: 1400,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80'],
    isActive: true
  }
];

const THERAPISTS = [
  {
    name: 'Dr. Sarah Connor (PT)',
    email: 'sarah.pt@globalwebify.com',
    mobile: '9876543210',
    profilePhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    qualification: 'Master of Physiotherapy (MPT) - Sports & Musculoskeletal',
    experience: 8,
    specialization: ['Sports Rehabilitation', 'Dry Needling', 'Kinesio Taping'],
    workingHours: { start: '09:00', end: '17:00' },
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    ratingAverage: 4.9,
    ratingCount: 42,
    isActive: true
  },
  {
    name: 'Dr. John Miller (PT)',
    email: 'john.pt@globalwebify.com',
    mobile: '9876543211',
    profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    qualification: 'Bachelor of Physiotherapy (BPT), Diploma in Osteopathy',
    experience: 6,
    specialization: ['Manual Therapy', 'Geriatric Care', 'Spine Mobilization'],
    workingHours: { start: '10:00', end: '19:00' },
    workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    ratingAverage: 4.7,
    ratingCount: 28,
    isActive: true
  }
];

const CMS_BLOCKS = [
  {
    key: 'homepage_banners',
    content: [
      {
        title: 'Restore Your Movement & Pain-Free Life',
        subtitle: 'Expert physiotherapy care at your clinic or the comfort of your home.',
        imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1200&q=80',
        ctaText: 'Book Appointment',
        targetRoute: '/booking'
      },
      {
        title: 'Safe Home Visit Consultations',
        subtitle: 'No travel required. Get high-quality therapy directly at your doorstep.',
        imageUrl: 'https://images.unsplash.com/photo-1576765608866-5b5104814239?auto=format&fit=crop&w=1200&q=80',
        ctaText: 'Request Home Visit',
        targetRoute: '/booking?type=home'
      }
    ]
  },
  {
    key: 'testimonials',
    content: [
      {
        name: 'Amit Sharma',
        rating: 5,
        feedback: 'Dr. Sarah Connor helped me recover from an ACL tear in record time. Her approach to sports rehab is world-class.',
        designation: 'Professional Athlete'
      },
      {
        name: 'Ramesh Patel',
        rating: 5,
        feedback: 'The home visit physiotherapy for my father was a lifesaver. Dr. John is extremely patient and professional.',
        designation: 'Senior Citizen Caretaker'
      }
    ]
  },
  {
    key: 'faqs',
    content: [
      {
        question: 'What should I wear for my physiotherapy session?',
        answer: 'Wear loose-fitting, comfortable clothing like shorts, track pants, and t-shirts so the therapist can examine the joint or muscle area easily.'
      },
      {
        question: 'Do I need a doctor referral before booking?',
        answer: 'No, you do not need a referral. You can book directly with our physiotherapists. However, if you have a referral letter, please share it during your first appointment.'
      },
      {
        question: 'How long does a session last?',
        answer: 'A standard session lasts between 45 to 60 minutes, depending on the service selected and your specific treatment plan.'
      }
    ]
  },
  {
    key: 'contact_details',
    content: {
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'contact@globalwebify.com',
      website: 'www.globalwebify.com',
      address: 'Plot 15, Healthcare Hub, Sector 4, New Delhi, 110001',
      mapsUrl: 'https://maps.google.com/?q=28.6139,77.2090',
      workingHours: 'Monday - Saturday: 9:00 AM to 7:00 PM'
    }
  }
];

async function seed() {
  console.log('Starting database seeding...');
  await connectDB();

  try {
    // 1. Clean existing records
    console.log('Clearing collections...');
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Therapist.deleteMany({});
    await Service.deleteMany({});
    await CMS.deleteMany({});
    await Appointment.deleteMany({});
    await Payment.deleteMany({});
    await Review.deleteMany({});

    // 2. Seed Services
    console.log('Seeding services...');
    await Service.insertMany(SERVICES);

    // 3. Seed Therapists
    console.log('Seeding therapists...');
    await Therapist.insertMany(THERAPISTS);

    // 4. Seed CMS Content
    console.log('Seeding CMS content...');
    await CMS.insertMany(CMS_BLOCKS);

    // 5. Seed Super Admin User (Pass: admin123hashed - for now stored plain/mock hash, we can run bcrypt inside next-auth/jwt)
    console.log('Seeding admin user...');
    await User.create({
      mobile: '9999999999',
      email: 'admin@globalwebify.com',
      role: 'superadmin',
      passwordHash: '$2a$10$bGrsEbNe0ay7GxSMjxu0bulFYnMS41VyEbnC68Un4pvESmTSt6d42', // hashed bcrypt of "admin123"
      isActive: true
    });

    console.log('Database seeding successfully completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await disconnectDB();
  }
}

seed();
