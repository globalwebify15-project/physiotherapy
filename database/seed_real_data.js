const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../atlas-cred.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment.');
  process.exit(1);
}

// Schemas
const UserSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  email: { type: String },
  role: { type: String, default: 'patient' },
  passwordHash: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const PatientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  profilePhoto: { type: String },
  medicalHistory: [{ type: String }],
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String, required: true },
  },
  savedAddresses: [{ type: String }],
}, { timestamps: true });

const TherapistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: Number, required: true },
  specialization: [{ type: String }],
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '19:00' },
  },
  workingDays: [{ type: Number, default: [0, 1, 2, 3, 4, 5, 6] }],
  ratingAverage: { type: Number, default: 5.0 },
  ratingCount: { type: Number, default: 28 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ServiceSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: Number, default: 45 },
  pricingClinic: { type: Number, required: true },
  pricingHome: { type: Number, required: true },
  homeVisitAvailable: { type: Boolean, default: true },
  clinicVisitAvailable: { type: Boolean, default: true },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const CMSSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist' },
  visitType: { type: String, enum: ['clinic', 'home'], required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, default: 'confirmed' },
  address: { type: String },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  statusTimeline: [{ status: String, timestamp: { type: Date, default: Date.now }, note: String }],
}, { timestamps: true });

const PaymentSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, default: 'paid' },
  history: [{ status: String, timestamp: { type: Date, default: Date.now }, note: String }],
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  isModerated: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
const Therapist = mongoose.models.Therapist || mongoose.model('Therapist', TherapistSchema);
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
const CMS = mongoose.models.CMS || mongoose.model('CMS', CMSSchema);
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

async function seedRealClinicData() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // 1. Super Admin Account
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await User.findOneAndUpdate(
    { email: 'admin@globalwebify.com' },
    {
      mobile: '+919110912544',
      email: 'admin@globalwebify.com',
      role: 'superadmin',
      passwordHash: adminPasswordHash,
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log('Super Admin account synchronized.');

  // 2. Real Doctors / Therapists
  const doctors = [
    {
      name: 'Dr. Rajnish Bariyar',
      email: 'rajnish@drbariyarphysio.com',
      mobile: '+919110912544',
      qualification: 'BPT, MIAP, JSCPT • Founder & Senior Neuro/Spine Physio',
      experience: 12,
      specialization: [
        'Stroke / Paralysis Rehabilitation',
        'Cervical & Lumbar Spondylosis',
        'Knee & Hip Joint Replacement Rehab',
        'Sports Injury Management',
        'Bell\'s Palsy & Facial Therapy',
        'Posture Correction'
      ],
      workingHours: { start: '09:00', end: '19:00' },
      workingDays: [0, 1, 2, 3, 4, 5, 6],
      ratingAverage: 5.0,
      ratingCount: 42,
      isActive: true,
    },
    {
      name: 'Dr. Priyanka Bariyar',
      email: 'priyanka@drbariyarphysio.com',
      mobile: '+919693233447',
      qualification: 'BPT, MIAP, JSCPT • Co-Founder & Pediatric/Women\'s Health Specialist',
      experience: 10,
      specialization: [
        'CP Child (Cerebral Palsy)',
        'Developmental Delay Support',
        'Autism Sensory & Motor Therapy',
        'Prenatal & Postnatal Physiotherapy',
        'Women\'s Pelvic Floor & Core Rehab',
        'Pediatric Neurodevelopmental Therapy'
      ],
      workingHours: { start: '09:00', end: '19:00' },
      workingDays: [0, 1, 2, 3, 4, 5, 6],
      ratingAverage: 4.9,
      ratingCount: 36,
      isActive: true,
    }
  ];

  const savedDoctors = [];
  for (const doc of doctors) {
    const d = await Therapist.findOneAndUpdate(
      { email: doc.email },
      doc,
      { upsert: true, new: true }
    );
    savedDoctors.push(d);
  }
  console.log('Doctors & Specialist Profiles synchronized.');

  // 3. 15 Real Clinical Services
  const clinicalServices = [
    {
      title: 'Stroke / Paralysis Rehabilitation',
      category: 'Neurological Care',
      duration: 60,
      pricingClinic: 800,
      pricingHome: 1200,
      description: 'Comprehensive neuro-rehab protocols, muscle re-education, balance restoration, and mobility training for post-stroke recovery.',
    },
    {
      title: 'Parkinson\'s & Alzheimer\'s Care',
      category: 'Neurological Care',
      duration: 45,
      pricingClinic: 700,
      pricingHome: 1100,
      description: 'Gait training, tremor management, cognitive-motor coordination drills, and fall prevention therapies.',
    },
    {
      title: 'Facial / Bell\'s Palsy Therapy',
      category: 'Neurological Care',
      duration: 45,
      pricingClinic: 600,
      pricingHome: 1000,
      description: 'Facial neuromuscular stimulation, mirror therapy, and gentle trigger point stimulation for facial nerve revival.',
    },
    {
      title: 'Vestibular Dysfunction & Vertigo',
      category: 'Neurological Care',
      duration: 45,
      pricingClinic: 700,
      pricingHome: 1100,
      description: 'Epley maneuvers, canalith repositioning, and vestibular rehabilitation therapy for vertigo and dizziness relief.',
    },
    {
      title: 'Cervical Spondylosis & Neck Pain',
      category: 'Orthopedic & Spine',
      duration: 45,
      pricingClinic: 600,
      pricingHome: 1000,
      description: 'Manual cervical traction, postural correction, deep tissue release, and ergonomic strengthening for neck and radiating arm pain.',
    },
    {
      title: 'Lumbar Spondylosis & Sciatica',
      category: 'Orthopedic & Spine',
      duration: 45,
      pricingClinic: 600,
      pricingHome: 1000,
      description: 'Spine decompression, core stabilization, sciatic nerve glides, and lumbar mobility exercises.',
    },
    {
      title: 'OA (Knee Osteoarthritis) Relief',
      category: 'Orthopedic & Joint',
      duration: 45,
      pricingClinic: 600,
      pricingHome: 1000,
      description: 'Quadriceps strengthening, joint lubrication mobilization, ultrasound therapy, and pain-free walking rehab.',
    },
    {
      title: 'Tennis & Golfer\'s Elbow Therapy',
      category: 'Sports & Joint',
      duration: 40,
      pricingClinic: 500,
      pricingHome: 900,
      description: 'Eccentric tendon loading, dry needling, cross-friction massage, and forearm muscle conditioning.',
    },
    {
      title: 'Frozen Shoulder / Capsulitis Care',
      category: 'Orthopedic & Joint',
      duration: 45,
      pricingClinic: 600,
      pricingHome: 1000,
      description: 'Scapulohumeral rhythm restoration, capsular stretching, hydrotherapy guidance, and range-of-motion drills.',
    },
    {
      title: 'CP Child (Cerebral Palsy) Therapy',
      category: 'Pediatric Care',
      duration: 60,
      pricingClinic: 800,
      pricingHome: 1200,
      description: 'Neurodevelopmental therapy (NDT), muscle tone modulation, sensory integration, and posture support for children.',
    },
    {
      title: 'Developmental Delay Support',
      category: 'Pediatric Care',
      duration: 45,
      pricingClinic: 700,
      pricingHome: 1100,
      description: 'Milestone achievement coaching, crawling and sitting facilitation, and motor coordination activities.',
    },
    {
      title: 'Autism Sensory & Motor Therapy',
      category: 'Pediatric Care',
      duration: 60,
      pricingClinic: 800,
      pricingHome: 1200,
      description: 'Sensory diet implementation, vestibular and proprioceptive stimulation, balance and fine-motor games.',
    },
    {
      title: 'Prenatal & Postnatal Physiotherapy',
      category: 'Women\'s Health',
      duration: 45,
      pricingClinic: 700,
      pricingHome: 1100,
      description: 'Pelvic floor strengthening, diastasis recti repair, back pain relief, and safe prenatal conditioning.',
    },
    {
      title: 'Joint Replacement Rehab (Knee & Hip)',
      category: 'Post-Surgical Rehab',
      duration: 60,
      pricingClinic: 800,
      pricingHome: 1200,
      description: 'Post-operative mobilization, gait training with walker/cane, swelling control, and functional independence training.',
    },
    {
      title: 'Sports Injury & Ligament Rehab',
      category: 'Sports & Joint',
      duration: 50,
      pricingClinic: 700,
      pricingHome: 1100,
      description: 'ACL/meniscus rehabilitation, ankle sprain recovery, proprioceptive agility drills, and return-to-sport testing.',
    }
  ];

  const savedServices = [];
  for (const s of clinicalServices) {
    const created = await Service.findOneAndUpdate(
      { title: s.title },
      { ...s, homeVisitAvailable: true, clinicVisitAvailable: true, isActive: true },
      { upsert: true, new: true }
    );
    savedServices.push(created);
  }
  console.log(`15 Clinical Services synchronized (${savedServices.length} total).`);

  // 4. Real CMS Settings
  await CMS.findOneAndUpdate(
    { key: 'contact_details' },
    {
      content: {
        phone: '+91 91109 12544',
        whatsapp: '+91 96932 33447',
        drRajnishPhone: '+91 91109 12544',
        drPriyankaPhone: '+91 96932 33447',
        email: 'contact@drbariyarphysio.com',
        address: 'Near, Ashok Nagar Rd No 1, opposite Overhead Water Tank, Ashok Nagar, Ranchi, Jharkhand 834002',
        website: 'https://drbariyarphysio.com',
        workingHours: '9:00 AM – 7:00 PM (Monday – Sunday)',
      }
    },
    { upsert: true }
  );

  await CMS.findOneAndUpdate(
    { key: 'faqs' },
    {
      content: [
        {
          question: 'How do I book a home visit physiotherapy consultation?',
          answer: 'Select any service on the mobile app or web portal, choose "Home Visit", pick your preferred date and time slot, enter your home address, and complete payment. Our specialist will visit your location.'
        },
        {
          question: 'What are the clinic working hours in Ranchi?',
          answer: 'The clinic is open 7 days a week from 9:00 AM to 7:00 PM (Monday through Sunday) at Ashok Nagar Rd No 1, Ranchi.'
        },
        {
          question: 'Can I call Dr. Rajnish Bariyar or Dr. Priyanka Bariyar directly?',
          answer: 'Yes! Tap on "Call Doctor" or "Helpline" in the app or website to connect directly with Dr. Rajnish Bariyar (+91 91109 12544) or Dr. Priyanka Bariyar (+91 96932 33447).'
        },
        {
          question: 'Do you treat post-stroke and paralysis patients at home?',
          answer: 'Yes, our neuro-physiotherapy specialists bring portable modalities and conduct specialized bedside rehabilitation exercises at your home.'
        }
      ]
    },
    { upsert: true }
  );
  console.log('CMS Contact Information and FAQs synchronized.');

  // 5. Sample Patients & Appointment Records (if none exist)
  const existingPatientsCount = await Patient.countDocuments();
  if (existingPatientsCount === 0) {
    console.log('Creating initial realistic patient records...');
    const patientUser1 = await User.create({
      mobile: '+919876543219',
      role: 'patient',
      isActive: true,
    });

    const patient1 = await Patient.create({
      userId: patientUser1._id,
      name: 'Amit Sharma',
      gender: 'male',
      dob: new Date('1988-05-14'),
      medicalHistory: ['Lumbar Disc Bulge L4-L5', 'Sciatica', 'Post-Work Stiffness'],
      emergencyContact: {
        name: 'Sunita Sharma',
        phone: '+919876543218',
        relation: 'Spouse',
      },
      savedAddresses: ['Flat 402, Green Valley Apartments, Morabadi, Ranchi, Jharkhand 834008'],
    });

    const patientUser2 = await User.create({
      mobile: '+919823145670',
      role: 'patient',
      isActive: true,
    });

    const patient2 = await Patient.create({
      userId: patientUser2._id,
      name: 'Pooja Verma',
      gender: 'female',
      dob: new Date('1994-11-20'),
      medicalHistory: ['Postnatal Core Weakness', 'Cervical Posture Strain'],
      emergencyContact: {
        name: 'Rohan Verma',
        phone: '+919823145671',
        relation: 'Husband',
      },
      savedAddresses: ['B-12, Harmu Housing Colony, Ranchi, Jharkhand 834002'],
    });

    // Create Initial Appointments
    const appt1 = await Appointment.create({
      patientId: patient1._id,
      serviceId: savedServices[5]._id, // Lumbar Spondylosis
      therapistId: savedDoctors[0]._id, // Dr. Rajnish
      visitType: 'clinic',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '10:00 AM - 10:45 AM',
      status: 'confirmed',
      statusTimeline: [{ status: 'confirmed', note: 'Appointment booked & confirmed.' }],
    });

    const payment1 = await Payment.create({
      appointmentId: appt1._id,
      razorpayOrderId: 'order_live_98124',
      razorpayPaymentId: 'pay_live_9812401',
      amount: 600,
      currency: 'INR',
      status: 'paid',
      history: [{ status: 'paid', note: 'Captured successfully.' }],
    });
    appt1.paymentId = payment1._id;
    await appt1.save();

    const appt2 = await Appointment.create({
      patientId: patient2._id,
      serviceId: savedServices[12]._id, // Prenatal & Postnatal
      therapistId: savedDoctors[1]._id, // Dr. Priyanka
      visitType: 'home',
      address: 'B-12, Harmu Housing Colony, Ranchi, Jharkhand 834002',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '04:00 PM - 04:45 PM',
      status: 'confirmed',
      statusTimeline: [{ status: 'confirmed', note: 'Home visit scheduled.' }],
    });

    const payment2 = await Payment.create({
      appointmentId: appt2._id,
      razorpayOrderId: 'order_live_98125',
      razorpayPaymentId: 'pay_live_9812502',
      amount: 1100,
      currency: 'INR',
      status: 'paid',
      history: [{ status: 'paid', note: 'Captured successfully.' }],
    });
    appt2.paymentId = payment2._id;
    await appt2.save();

    // Create Reviews
    await Review.create({
      patientId: patient1._id,
      therapistId: savedDoctors[0]._id,
      serviceId: savedServices[5]._id,
      appointmentId: appt1._id,
      rating: 5,
      comment: 'Excellent diagnosis by Dr. Rajnish. My back pain has significantly reduced after only 3 sessions.',
      isModerated: true,
    });

    console.log('Sample dynamic appointments and reviews created.');
  }

  console.log('\n=== REAL CLINIC DATA SEEDING COMPLETE ===');
  await mongoose.disconnect();
}

seedRealClinicData().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
