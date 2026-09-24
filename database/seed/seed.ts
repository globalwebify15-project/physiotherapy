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
    title: 'Stroke / Paralysis',
    description: 'Comprehensive neuro-rehabilitation to restore motor function, rebuild muscle strength, gait re-training, and promote neuroplasticity for stroke and paralysis recovery.',
    category: 'Neurological Rehabilitation',
    duration: 60,
    pricingClinic: 800,
    pricingHome: 1200,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_rajnish_bariyar.png'],
    isActive: true
  },
  {
    title: "Parkinson's / Alzheimer's",
    description: 'Specialized neuro-physiotherapy focusing on posture, balance restoration, tremor management, cognitive-motor coordination, and functional mobility retention.',
    category: 'Neurological Rehabilitation',
    duration: 60,
    pricingClinic: 800,
    pricingHome: 1200,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_rajnish_bariyar.png'],
    isActive: true
  },
  {
    title: "Facial / Bell's Palsy",
    description: 'Targeted neuromuscular facial stimulation, myofascial trigger point release, and facial symmetry exercises for rapid nerve recovery and motor control.',
    category: 'Neuro-Muscular Therapy',
    duration: 45,
    pricingClinic: 700,
    pricingHome: 1000,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_priyanka_bariyar.png'],
    isActive: true
  },
  {
    title: 'Vestibular Dysfunction',
    description: 'Vestibular rehabilitation therapy (VRT), canalith repositioning maneuvers, vertigo management, and gaze stabilization exercises.',
    category: 'Balance & Vestibular Care',
    duration: 45,
    pricingClinic: 750,
    pricingHome: 1100,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_rajnish_bariyar.png'],
    isActive: true
  },
  {
    title: 'Cervical Spondylosis',
    description: 'Advanced neck pain management, cervical decompression, manual cervical traction, posture correction, and scapular-cervical strengthening.',
    category: 'Spine & Orthopedic Care',
    duration: 45,
    pricingClinic: 650,
    pricingHome: 950,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_rajnish_bariyar.png'],
    isActive: true
  },
  {
    title: 'Lumbar Spondylosis',
    description: 'Lumbar spine decompression, core stabilization, sciatica relief, disk rehabilitation, and ergonomic training for chronic lower back pain.',
    category: 'Spine & Orthopedic Care',
    duration: 45,
    pricingClinic: 650,
    pricingHome: 950,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_rajnish_bariyar.png'],
    isActive: true
  },
  {
    title: 'OA (Knee Pain)',
    description: 'Osteoarthritis knee pain protocol with joint mobilization, quadriceps/hamstring strengthening, biomechanical alignment, and knee unloading therapies.',
    category: 'Joint & Arthritis Care',
    duration: 45,
    pricingClinic: 650,
    pricingHome: 950,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_rajnish_bariyar.png'],
    isActive: true
  },
  {
    title: "Tennis / Golfer's Elbow",
    description: 'Epicondylitis treatment with deep friction massage, ultrasound therapy, eccentric forearm loading, and tendon healing protocols.',
    category: 'Sports & Musculoskeletal',
    duration: 40,
    pricingClinic: 600,
    pricingHome: 900,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_rajnish_bariyar.png'],
    isActive: true
  },
  {
    title: 'Frozen Shoulder',
    description: 'Adhesive capsulitis multi-stage therapy including glenohumeral joint mobilization, capsular stretch, pain relief, and full range-of-motion recovery.',
    category: 'Joint & Mobility Care',
    duration: 45,
    pricingClinic: 650,
    pricingHome: 950,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_rajnish_bariyar.png'],
    isActive: true
  },
  {
    title: 'CP Child',
    description: 'Pediatric cerebral palsy physiotherapy using NDT (Neuro-Developmental Treatment), muscle tone regulation, postural control, and milestone stimulation.',
    category: 'Pediatric Rehabilitation',
    duration: 60,
    pricingClinic: 850,
    pricingHome: 1300,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_priyanka_bariyar.png'],
    isActive: true
  },
  {
    title: 'Developmental Delay',
    description: 'Early intervention pediatric physiotherapy to assist infants and children in achieving physical and motor developmental milestones on time.',
    category: 'Pediatric Rehabilitation',
    duration: 60,
    pricingClinic: 800,
    pricingHome: 1200,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_priyanka_bariyar.png'],
    isActive: true
  },
  {
    title: 'Autism',
    description: 'Sensory integration therapy, motor planning exercises, coordination games, and neuromuscular regulation for children with Autism Spectrum Disorder.',
    category: 'Pediatric Rehabilitation',
    duration: 60,
    pricingClinic: 850,
    pricingHome: 1300,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_priyanka_bariyar.png'],
    isActive: true
  },
  {
    title: 'Prenatal & Postnatal Physiotherapy',
    description: 'Pelvic floor strengthening, prenatal spine & pelvic girdle pain relief, safe labor conditioning, and postnatal core / diastasis recti recovery.',
    category: "Women's Health",
    duration: 50,
    pricingClinic: 750,
    pricingHome: 1100,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_priyanka_bariyar.png'],
    isActive: true
  },
  {
    title: 'Knee / Hip Replacement Rehab',
    description: 'Structured post-arthroplasty rehabilitation protocol: swelling control, joint mobility, quadriceps activation, weight-bearing training, and gait correction.',
    category: 'Post-Surgical Rehabilitation',
    duration: 60,
    pricingClinic: 900,
    pricingHome: 1350,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_rajnish_bariyar.png'],
    isActive: true
  },
  {
    title: 'Sports Injury Management',
    description: 'Advanced assessment and rehabilitation of ligament sprains, muscle strains, ACL/meniscus tears, return-to-sport testing, and biomechanical conditioning.',
    category: 'Sports Physiotherapy',
    duration: 60,
    pricingClinic: 850,
    pricingHome: 1250,
    homeVisitAvailable: true,
    clinicVisitAvailable: true,
    images: ['/doctors/dr_rajnish_bariyar.png'],
    isActive: true
  }
];

const THERAPISTS = [
  {
    name: 'Dr. Rajnish Bariyar',
    email: 'dr.rajnish@bariyarphysio.com',
    mobile: '9876543210',
    profilePhoto: '/doctors/dr_rajnish_bariyar.png',
    qualification: 'BPT, MIAP, JSCPT',
    designation: "Founder & Chief Physiotherapist of Dr. Bariyar's Physiotherapy & Rehabilitation | Joint Secretary, IAP (Jharkhand Branch)",
    experience: 16,
    specialization: [
      'Stroke / Paralysis',
      "Parkinson's / Alzheimer's",
      'Cervical & Lumbar Spondylosis',
      'OA (Knee Pain)',
      'Frozen Shoulder',
      'Knee / Hip Replacement Rehab',
      'Sports Injury Management'
    ],
    workingHours: { start: '09:00', end: '19:00' },
    workingDays: [1, 2, 3, 4, 5, 6, 7], // Daily
    ratingAverage: 5.0,
    ratingCount: 148,
    isActive: true
  },
  {
    name: 'Dr. Priyanka Bariyar',
    email: 'dr.priyanka@bariyarphysio.com',
    mobile: '9876543211',
    profilePhoto: '/doctors/dr_priyanka_bariyar.png',
    qualification: 'BPT, MIAP, JSCPT',
    designation: "Co-Founder & Director of Dr. Bariyar's Physiotherapy & Neuro Rehabilitation",
    experience: 14,
    specialization: [
      'CP Child',
      'Developmental Delay',
      'Autism',
      "Facial / Bell's Palsy",
      'Prenatal & Postnatal Physiotherapy',
      'Neuro Rehabilitation'
    ],
    workingHours: { start: '09:00', end: '19:00' },
    workingDays: [1, 2, 3, 4, 5, 6, 7], // Daily
    ratingAverage: 4.9,
    ratingCount: 124,
    isActive: true
  }
];

const CMS_BLOCKS = [
  {
    key: 'homepage_banners',
    content: [
      {
        title: "Dr. Bariyar's Physiotherapy & Rehabilitation",
        subtitle: 'Specialized Neuro, Orthopedic & Pediatric Physiotherapy. Clinic & Home Visits Available.',
        imageUrl: '/doctors/dr_rajnish_bariyar.png',
        ctaText: 'Book Appointment',
        targetRoute: '/booking'
      },
      {
        title: 'Clinic Hours: 9:00 AM – 7:00 PM',
        subtitle: 'Consult Dr. Rajnish Bariyar & Dr. Priyanka Bariyar. Daily Open 9:00 AM to 7:00 PM.',
        imageUrl: '/doctors/dr_priyanka_bariyar.png',
        ctaText: 'View Schedule',
        targetRoute: '/booking'
      }
    ]
  },
  {
    key: 'testimonials',
    content: [
      {
        name: 'Sunil Verma',
        rating: 5,
        feedback: "Dr. Rajnish Bariyar's treatment for my stroke paralysis rehabilitation showed tremendous improvement within weeks. Highly recommended!",
        designation: 'Patient'
      },
      {
        name: 'Sunita Devi',
        rating: 5,
        feedback: "Dr. Priyanka Bariyar is exceptionally kind and effective with pediatric physiotherapy. Our child with developmental delay has made amazing milestones.",
        designation: 'Parent'
      }
    ]
  },
  {
    key: 'faqs',
    content: [
      {
        question: 'What are the clinic timings?',
        answer: 'Our clinic is open from 9:00 AM to 7:00 PM (Clinic Hours: 9:00 AM – 7:00 PM).'
      },
      {
        question: 'Who are the doctors available at the clinic?',
        answer: "Dr. Rajnish Bariyar (BPT, MIAP, JSCPT - Founder & Chief Physiotherapist, Joint Secretary IAP Jharkhand Branch) and Dr. Priyanka Bariyar (BPT, MIAP, JSCPT - Co-Founder & Director)."
      },
      {
        question: 'Are home visit physiotherapy sessions available?',
        answer: 'Yes, we provide specialized home visit physiotherapy for paralysis, stroke, post-operative, and elderly patients across the city.'
      },
      {
        question: 'What conditions do you treat?',
        answer: 'We treat Stroke/Paralysis, Parkinson\'s, Facial Palsy, Cervical & Lumbar Spondylosis, OA Knee Pain, Frozen Shoulder, CP Child, Developmental Delay, Autism, Prenatal & Postnatal, Joint Replacement Rehab, and Sports Injuries.'
      }
    ]
  },
  {
    key: 'contact_details',
    content: {
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'contact@bariyarphysio.com',
      website: 'www.bariyarphysio.com',
      clinicName: "Dr. Bariyar's Physiotherapy & Rehabilitation",
      workingHours: '9:00 AM – 7:00 PM (Daily)',
      openTime: '9:00 AM',
      closeTime: '7:00 PM'
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
