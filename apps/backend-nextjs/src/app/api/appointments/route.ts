import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB, Appointment, Patient, Therapist, Service, User } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';
import { createNotification } from '@/utils/notifications';

// GET /api/appointments - Retrieve appointments list
// For patients: returns their own bookings.
// For staff/admin: returns all with optional filters: ?status=pending&date=2026-08-08&therapistId=XYZ
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    const url = new URL(request.url);
    const filter: any = {};

    const queryMobile = url.searchParams.get('mobile');
    const status = url.searchParams.get('status');
    const date = url.searchParams.get('date');
    const therapistId = url.searchParams.get('therapistId');
    const patientId = url.searchParams.get('patientId');

    if (user && user.role === 'patient') {
      const patient = await Patient.findOne({ userId: user.userId });
      if (patient) {
        filter.patientId = patient._id;
      } else {
        return NextResponse.json({ success: true, appointments: [] });
      }
    } else if (queryMobile) {
      // Support query by mobile number
      const cleanMobile = queryMobile.replace(/^\+91/, '').trim();
      const dbUser = await User.findOne({
        $or: [{ mobile: cleanMobile }, { mobile: `+91${cleanMobile}` }, { mobile: queryMobile }]
      });
      if (dbUser) {
        const patient = await Patient.findOne({ userId: dbUser._id });
        if (patient) filter.patientId = patient._id;
      }
    }

    if (status) filter.status = status;
    if (date) filter.date = date;
    if (therapistId && mongoose.Types.ObjectId.isValid(therapistId)) filter.therapistId = therapistId;
    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) filter.patientId = patientId;

    const appointments = await Appointment.find(filter)
      .populate('patientId')
      .populate('serviceId')
      .populate('therapistId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/appointments - Create/Book an appointment
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const {
      serviceId,
      therapistId,
      date,
      timeSlot,
      visitType,
      paymentMethod,
      address,
      notes,
      patientIdOverride,
      mobile: bodyMobile,
      patientName: bodyPatientName,
    } = body;

    if (!serviceId || !date || !timeSlot || !visitType) {
      return NextResponse.json(
        { error: 'Missing booking parameters (serviceId, date, timeSlot, visitType)' },
        { status: 400 }
      );
    }

    // Determine target patient
    let patientId: any;
    let notificationUserId: any = user?.userId;

    if (user && user.role === 'patient') {
      let patient = await Patient.findOne({ userId: user.userId });
      if (!patient) {
        patient = await Patient.create({
          userId: user.userId,
          name: `Patient (${user.mobile.slice(-4)})`,
          gender: 'other',
          dob: new Date('2000-01-01'),
          emergencyContact: { name: 'Self', phone: user.mobile, relation: 'Self' },
          savedAddresses: address ? [address] : [],
        });
      }
      patientId = patient._id;
    } else if (user && user.role !== 'patient' && patientIdOverride) {
      patientId = patientIdOverride;
    } else {
      // Mobile fallback if token expired or booking directly with mobile
      const rawMobile = bodyMobile || user?.mobile || '9334306358';
      const cleanMobile = rawMobile.replace(/^\+91/, '').trim();

      let dbUser = await User.findOne({
        $or: [{ mobile: cleanMobile }, { mobile: `+91${cleanMobile}` }, { mobile: rawMobile }]
      });

      if (!dbUser) {
        dbUser = await User.create({
          mobile: cleanMobile,
          role: 'patient',
          isActive: true,
        });
      }
      notificationUserId = dbUser._id;

      let patient = await Patient.findOne({ userId: dbUser._id });
      if (!patient) {
        patient = await Patient.create({
          userId: dbUser._id,
          name: bodyPatientName || `Patient (${cleanMobile.slice(-4)})`,
          gender: 'other',
          dob: new Date('2000-01-01'),
          emergencyContact: { name: 'Self', phone: cleanMobile, relation: 'Self' },
          savedAddresses: address ? [address] : [],
        });
      }
      patientId = patient._id;
    }

    // Resolve service safely (ObjectId or fallback search)
    let service = mongoose.Types.ObjectId.isValid(serviceId)
      ? await Service.findById(serviceId)
      : null;

    if (!service) {
      service = await Service.findOne({
        $or: [
          { title: new RegExp(serviceId, 'i') },
          { category: new RegExp(serviceId, 'i') }
        ]
      }) || await Service.findOne({ isActive: true });
    }

    if (!service) {
      return NextResponse.json({ error: 'Service not found or inactive' }, { status: 400 });
    }

    // Resolve therapist safely (ObjectId or slug/name search)
    let validTherapistId: any = undefined;
    if (therapistId) {
      let therapist = mongoose.Types.ObjectId.isValid(therapistId)
        ? await Therapist.findById(therapistId)
        : null;

      if (!therapist) {
        const cleanName = therapistId.toString().replace(/^dr_?/i, '');
        therapist = await Therapist.findOne({
          $or: [
            { name: new RegExp(cleanName, 'i') },
            { email: new RegExp(cleanName, 'i') }
          ]
        }) || await Therapist.findOne({ isActive: true });
      }

      if (therapist) {
        validTherapistId = therapist._id;
      }
    }

    // Default to chief therapist if not set
    if (!validTherapistId) {
      const defaultTherapist = await Therapist.findOne({ isActive: true });
      if (defaultTherapist) {
        validTherapistId = defaultTherapist._id;
      }
    }

    const initialStatus = 'confirmed';
    const noteText = paymentMethod === 'clinic'
      ? 'Booked with Pay at Clinic.'
      : 'Appointment booked successfully.';

    // Create appointment in MongoDB
    const appointment = await Appointment.create({
      patientId,
      serviceId: service._id,
      therapistId: validTherapistId,
      date,
      timeSlot,
      visitType,
      address,
      status: initialStatus,
      statusTimeline: [{ status: initialStatus, note: noteText }],
      notes
    });

    // Populate for response
    const populated = await Appointment.findById(appointment._id)
      .populate('patientId')
      .populate('serviceId')
      .populate('therapistId');

    // Dispatch Notifications
    try {
      if (notificationUserId) {
        await createNotification(
          notificationUserId,
          'Appointment Confirmed',
          `Your appointment for ${service.title} is confirmed for ${date} at ${timeSlot}.`,
          'booking_alert',
          { appointmentId: appointment._id }
        );
      }

      const adminUser = await User.findOne({ role: 'superadmin' });
      if (adminUser) {
        await createNotification(
          adminUser._id,
          'New Appointment Booked',
          `New appointment for ${service.title} on ${date} at ${timeSlot} (${paymentMethod === 'clinic' ? 'Pay at Clinic' : 'Online'}).`,
          'booking_alert',
          { appointmentId: appointment._id }
        );
      }
    } catch (notifErr) {
      console.warn('Notification dispatch failed (non-blocking):', notifErr);
    }

    return NextResponse.json({ success: true, appointment: populated }, { status: 201 });
  } catch (error: any) {
    console.error('Error booking appointment:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
