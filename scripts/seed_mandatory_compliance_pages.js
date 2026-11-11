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

const compliancePages = [
  {
    key: 'policy_privacy',
    content: {
      title: 'Privacy Policy',
      slug: 'privacy',
      lastUpdated: 'November 10, 2026',
      badge: 'Data Protection & HIPAA/DISHA Compliant',
      summary: 'QuickPhysio24.com is committed to protecting patient healthcare records, personal information, and appointment data with medical-grade encryption and strict confidentiality standards.',
      businessName: 'QuickPhysio24.com',
      clinicAddress: 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009',
      supportEmail: 'contact@quickphysio24.com',
      supportPhone: '+91 91109 12544',
      grievanceOfficer: 'Dr. Rajnish Bariyar',
      sections: [
        {
          heading: '1. Introduction & Overview',
          body: 'This Privacy Policy explains how QuickPhysio24.com ("we", "us", or "our"), operating out of the Physiotherapy Department at Synergy Global Hospital, Bariatu, Ranchi, collects, uses, stores, and protects personal and medical health information of patients using our mobile app, website, and clinical rehabilitation services.'
        },
        {
          heading: '2. Information We Collect',
          body: 'We collect: (a) Personal identity information including name, phone number, email address, date of birth, and gender; (b) Physical residential address and geolocation for home-visit physiotherapy services; (c) Clinical history including primary complaints, pain assessment scales, surgical history, and radiology reports; (d) Transaction and payment identifiers processed securely via RBI-licensed payment aggregators (Razorpay); and (e) Device and notification tokens (Firebase FCM) to deliver appointment reminders and prescription updates.'
        },
        {
          heading: '3. Clinical Data Confidentiality & Storage',
          body: 'All patient consultations, diagnostic notes, and rehabilitation progress reports are stored in encrypted databases. Access to patient records is strictly restricted to certified clinical physiotherapists and authorized healthcare personnel under professional confidentiality obligations.'
        },
        {
          heading: '4. Third-Party Service Providers',
          body: 'We do not sell, rent, or trade your personal health information. We only share necessary data with authorized service partners under strict non-disclosure agreements: (a) Razorpay for encrypted, PCI-DSS compliant online payment processing; (b) Firebase (Google) for secure authentication and push notifications; and (c) Cloudinary for encrypted medical document and photo storage.'
        },
        {
          heading: '5. Patient Rights & Data Erasure',
          body: 'Patients have the right to inspect their medical records, request corrections, or request complete account and data erasure in compliance with the Digital Personal Data Protection (DPDP) Act, 2023. Account deletion requests can be initiated within the mobile application settings or via our web portal at /delete-account.'
        },
        {
          heading: '6. Grievance Redressal & Contact Information',
          body: 'In accordance with Information Technology Act, 2000 and DPDP Act, the Grievance Officer for QuickPhysio24.com is Dr. Rajnish Bariyar. You can reach out directly via contact@quickphysio24.com or visit the Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009.'
        }
      ]
    }
  },
  {
    key: 'policy_terms',
    content: {
      title: 'Terms & Conditions',
      slug: 'terms',
      lastUpdated: 'November 10, 2026',
      badge: 'Official Terms of Clinical Service',
      summary: 'Please review these terms governing appointment bookings, home-visit clinical rehabilitation, clinic consultations, and platform usage with QuickPhysio24.com.',
      businessName: 'QuickPhysio24.com',
      clinicAddress: 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009',
      supportEmail: 'contact@quickphysio24.com',
      supportPhone: '+91 91109 12544',
      grievanceOfficer: 'Dr. Rajnish Bariyar',
      sections: [
        {
          heading: '1. Acceptance of Terms',
          body: 'By downloading, registering, or booking appointments via the QuickPhysio24.com mobile app or website, you agree to be bound by these Terms of Service, all applicable healthcare regulations, and clinical safety guidelines.'
        },
        {
          heading: '2. Professional Medical Services',
          body: 'All physiotherapy sessions, assessments, and treatment plans are executed by qualified, certified clinical physiotherapists. QuickPhysio24.com operates under the clinical guidance of Dr. Rajnish Bariyar and Dr. Priyanka Bariyar at Synergy Global Hospital, Ranchi.'
        },
        {
          heading: '3. Appointment Scheduling & Slot Allocation',
          body: 'Appointments are reserved on a confirmed basis upon successful online payment via Razorpay or selection of the verified "Pay at Clinic / Home" option. Patients are requested to arrive 10 minutes prior to clinic consultations or ensure availability at the designated residential address for home-visit appointments.'
        },
        {
          heading: '4. Patient Responsibility & Medical Disclosure',
          body: 'Patients must provide accurate clinical history, including cardiac conditions, fractures, recent surgeries, pregnancy, or implants, prior to receiving manual therapy, electrotherapy, or exercise rehabilitation.'
        },
        {
          heading: '5. Limitation of Liability',
          body: 'QuickPhysio24.com provides rehabilitation and clinical physiotherapy services. The platform is not intended for acute emergency trauma, stroke resuscitation, or critical intensive care. In medical emergencies, patients must immediately contact emergency hospital services.'
        },
        {
          heading: '6. Governing Law & Jurisdiction',
          body: 'These terms are governed by the laws of India. Any legal dispute or claim arising from these services shall be subject to the exclusive jurisdiction of the competent courts in Ranchi, Jharkhand.'
        }
      ]
    }
  },
  {
    key: 'policy_refund',
    content: {
      title: 'Cancellation & Refund Policy',
      slug: 'refund-policy',
      lastUpdated: 'November 10, 2026',
      badge: '7-Day Full Refund Guarantee',
      summary: 'Transparent, patient-first cancellation and refund rules for QuickPhysio24.com clinic consultations and home visits.',
      businessName: 'QuickPhysio24.com',
      clinicAddress: 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009',
      supportEmail: 'contact@quickphysio24.com',
      supportPhone: '+91 91109 12544',
      cancellationWindowDays: 7,
      refundProcessingDays: '5-7 business days',
      sections: [
        {
          heading: '1. Full Refund Cancellation Window (7 Days)',
          body: 'Patients can cancel their advance appointment bookings or package subscriptions up to 7 days before the scheduled consultation date to receive a 100% full refund with zero cancellation charges.'
        },
        {
          heading: '2. Standard & Same-Day Cancellations',
          body: 'For individual single-session bookings, appointments may be cancelled or rescheduled up to 2 hours prior to the scheduled slot without penalty. For home visits, therapist travel dispatch is finalized 1 hour beforehand. Cancellations initiated after therapist departure may incur a nominal transport charge of ₹150.'
        },
        {
          heading: '3. Refund Mode & Processing Timelines',
          body: 'All approved refunds are automatically initiated back to the original payment source (UPI, Credit/Debit Card, NetBanking) via Razorpay payment gateway within 24 hours of cancellation approval. The refunded amount will reflect in your bank account or card statement within 5 to 7 business days, depending on your issuing bank.'
        },
        {
          heading: '4. Rescheduling & Grace Period',
          body: 'If you need to change your appointment date or time, you can reschedule freely through the mobile app up to 2 hours before the session without any additional fees.'
        },
        {
          heading: '5. Doctor Unavailability or Emergency Rescheduling',
          body: 'In rare cases where a designated physiotherapist is unavailable due to medical emergencies or unforeseen clinical procedures, patients will be offered an immediate alternate senior specialist or a 100% unconditional instant refund.'
        },
        {
          heading: '6. How to Request a Refund',
          body: 'To cancel an appointment or check the status of your refund, tap "Cancel Appointment" in your Appointments screen on the mobile app, or contact our support desk at contact@quickphysio24.com or +91 91109 12544.'
        }
      ]
    }
  },
  {
    key: 'policy_contact_us',
    content: {
      title: 'Contact Us',
      slug: 'contact-us',
      lastUpdated: 'November 10, 2026',
      badge: 'Official Hospital & Clinic Support',
      summary: 'Reach out to the QuickPhysio24.com team for appointment assistance, clinic directions, home visit bookings, or clinical inquiries.',
      businessName: 'QuickPhysio24.com',
      clinicAddress: 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009',
      landmark: 'Opposite RIMS Trauma Centre, Bariatu Road',
      supportEmail: 'contact@quickphysio24.com',
      supportPhone: '+91 91109 12544',
      alternatePhone: '9110912544',
      drRajnishPhone: '+91 91109 12544',
      drPriyankaPhone: '+91 91109 12544',
      grievanceOfficer: 'Dr. Rajnish Bariyar',
      workingHours: 'Monday - Saturday: 08:00 AM - 08:00 PM | Sunday: 09:00 AM - 02:00 PM',
      emergencyNote: 'For critical trauma, please visit Synergy Global Hospital Emergency Wing directly.'
    }
  },
  {
    key: 'policy_shipping_delivery',
    content: {
      title: 'Service Delivery & Fulfillment Policy',
      slug: 'shipping-delivery-policy',
      lastUpdated: 'November 10, 2026',
      badge: 'Digital Booking & Home Visit Fulfillment',
      summary: 'Details regarding how clinical physiotherapy consultations and home healthcare services are delivered by QuickPhysio24.com.',
      businessName: 'QuickPhysio24.com',
      clinicAddress: 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009',
      supportEmail: 'contact@quickphysio24.com',
      supportPhone: '+91 91109 12544',
      sections: [
        {
          heading: '1. Nature of Services',
          body: 'QuickPhysio24.com provides professional healthcare and rehabilitation services. As our offerings are clinical consultations and physiotherapy procedures, physical postal shipment of goods is not applicable.'
        },
        {
          heading: '2. Instant Digital Booking Confirmation',
          body: 'Upon completing an online appointment reservation, the patient receives an instant digital booking confirmation via SMS, WhatsApp, and email with the appointment ID, assigned physiotherapist, consultation time, and clinic address / visit coordinates.'
        },
        {
          heading: '3. In-Clinic Consultation Delivery',
          body: 'For clinic appointments, patients check in at the Physiotherapy Department reception, Synergy Global Hospital, Bariatu, Ranchi. Consultations commence within 10-15 minutes of scheduled appointment time.'
        },
        {
          heading: '4. Certified Home Visit Delivery',
          body: 'For home healthcare bookings, our certified physiotherapist arrives at the registered residential address with portable rehabilitation equipment (TENS, ultrasound, mobility aids) during the reserved 1-hour time window.'
        },
        {
          heading: '5. Service Completion & Invoicing',
          body: 'Upon session completion, a clinical summary and digital payment invoice are recorded in the patient profile and delivered via email for insurance or medical tax exemption records.'
        }
      ]
    }
  },
  {
    key: 'policy_about_us',
    content: {
      title: 'About Us',
      slug: 'about-us',
      lastUpdated: 'November 10, 2026',
      badge: 'Excellence in Physical Rehabilitation',
      summary: 'QuickPhysio24.com is the specialized physical therapy and rehabilitation centre operating at Synergy Global Hospital, Bariatu, Ranchi.',
      businessName: 'QuickPhysio24.com',
      clinicAddress: 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009',
      supportEmail: 'contact@quickphysio24.com',
      supportPhone: '+91 91109 12544',
      leadership: [
        {
          name: 'Dr. Rajnish Bariyar',
          role: 'Founder & Head of Physiotherapy Department',
          qualification: 'BPT, MPT (Orthopaedics / Neurology)',
          bio: 'Over 15 years of clinical excellence in complex musculoskeletal rehabilitation, stroke recovery, and post-surgical mobility restoration.'
        },
        {
          name: 'Dr. Priyanka Bariyar',
          role: 'Senior Consultant Physiotherapist',
          qualification: 'BPT, MPT (Neuro-Rehab / Women Health)',
          bio: 'Specialist in spine care, antenatal/postnatal conditioning, sports injuries, and geriatric mobility programs.'
        }
      ],
      mission: 'To make compassionate, evidence-based physiotherapy universally accessible through state-of-the-art hospital infrastructure and doorstep home visits.'
    }
  },
  {
    key: 'policy_medical_disclaimer',
    content: {
      title: 'Medical Disclaimer',
      slug: 'medical-disclaimer',
      lastUpdated: 'November 10, 2026',
      badge: 'Health Advice & Emergency Warning',
      summary: 'Important clinical notice regarding exercise guidance, health information, and emergency medical treatment.',
      businessName: 'QuickPhysio24.com',
      clinicAddress: 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009',
      supportEmail: 'contact@quickphysio24.com',
      supportPhone: '+91 91109 12544',
      sections: [
        {
          heading: '1. Not an Emergency Medical Service',
          body: 'QuickPhysio24.com is designed for planned musculoskeletal rehabilitation, pain management, and physical therapy. The app and platform are NOT equipped for acute emergency care. If you experience chest pain, severe shortness of breath, acute stroke symptoms, or severe trauma, call 108 or go to the nearest emergency room immediately.'
        },
        {
          heading: '2. Professional Clinical Assessment Required',
          body: 'General rehabilitation exercises, infographics, and advice shown on the platform are for informational purposes only. Do not initiate strenuous exercises without prior clinical assessment and personalized instruction from a certified physiotherapist.'
        },
        {
          heading: '3. Individual Health Variability',
          body: 'Treatment outcomes vary according to patient age, underlying pathology, compliance with home exercise programs, and radiological findings. No guaranteed cure is stated or implied.'
        }
      ]
    }
  },
  {
    key: 'policy_delete_account',
    content: {
      title: 'Account & Data Deletion Request',
      slug: 'delete-account',
      lastUpdated: 'November 10, 2026',
      badge: 'Google Play & Apple Store Compliance',
      summary: 'Request permanent deletion of your QuickPhysio24.com account, personal details, and clinical appointment history.',
      businessName: 'QuickPhysio24.com',
      clinicAddress: 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009',
      supportEmail: 'contact@quickphysio24.com',
      supportPhone: '+91 91109 12544',
      sections: [
        {
          heading: '1. Data Deletion Commitment',
          body: 'In compliance with Google Play Developer Policy and Apple App Store Review Guideline 5.1.1(v), QuickPhysio24.com provides full autonomy for users to permanently erase their account and associated data.'
        },
        {
          heading: '2. What Data Is Deleted',
          body: 'Upon confirmation of your deletion request, we permanently remove: (a) Your profile name, mobile number, email, and authentication credentials; (b) Saved residential addresses; (c) Emergency contact info; and (d) Push notification device tokens.'
        },
        {
          heading: '3. Medical Record Retention Mandates',
          body: 'Under National Medical Commission (NMC) and Indian Clinical Establishments Act regulations, healthcare providers are legally mandated to preserve inpatient and outpatient clinical treatment records for a statutory period of 3 years. These records are decoupled from your active mobile profile and placed in cold, secure archival storage accessible only upon legal or judicial requisition.'
        },
        {
          heading: '4. How to Submit an Account Deletion Request',
          body: 'You may request account deletion directly from the mobile app (Settings > Account > Delete Account) or by emailing contact@quickphysio24.com with your registered phone number. Verification will be processed within 7 business days.'
        }
      ]
    }
  }
];

async function seedCompliancePages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    for (const page of compliancePages) {
      await CMS.findOneAndUpdate(
        { key: page.key },
        { content: page.content },
        { upsert: true, new: true }
      );
      console.log(`✓ Seeded compliance page CMS block: ${page.key} (/ ${page.content.slug})`);
    }

    // Also update existing contact_details key with the official clinic info
    await CMS.findOneAndUpdate(
      { key: 'contact_details' },
      {
        content: {
          phone: '+91 91109 12544',
          whatsapp: '+91 91109 12544',
          drRajnishPhone: '+91 91109 12544',
          drPriyankaPhone: '+91 91109 12544',
          email: 'contact@quickphysio24.com',
          address: 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009',
          website: 'https://quickphysio24.com',
          workingHours: 'Mon - Sat: 08:00 AM - 08:00 PM | Sun: 09:00 AM - 02:00 PM',
          grievanceOfficer: 'Dr. Rajnish Bariyar'
        }
      },
      { upsert: true }
    );
    console.log('✓ Updated contact_details with official clinic address and support contact.');

    // Also update legal_policies key for backward compatibility
    await CMS.findOneAndUpdate(
      { key: 'legal_policies' },
      {
        content: {
          cancellationPolicy: 'Appointments and packages can be cancelled up to 7 days before consultation for a 100% full refund. Standard cancellations can be done up to 2 hours prior to scheduled consultation with zero penalty.',
          termsOfService: 'Clinical physiotherapy consultations and home visits are provided by qualified physiotherapists at QuickPhysio24.com, operating at Synergy Global Hospital, Bariatu, Ranchi.',
          privacyPolicy: 'Patient health information, diagnostic notes, and contact phone numbers are encrypted with medical-grade security. Grievance Officer: Dr. Rajnish Bariyar (contact@quickphysio24.com).'
        }
      },
      { upsert: true }
    );
    console.log('✓ Updated legal_policies with 7-day refund guarantee.');

    console.log('\nAll 8 mandatory compliance pages successfully seeded in MongoDB!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedCompliancePages();

