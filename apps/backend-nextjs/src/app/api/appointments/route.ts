import { NextRequest, NextResponse } from 'next/server';
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const filter: any = {};

    if (user.role === 'patient') {
      // Find patient document first
      const patient = await Patient.findOne({ userId: user.userId });
      if (!patient) {
        return NextResponse.json({ success: true, appointments: [] });
      }
      filter.patientId = patient._id;
    } else {
      // Admin/Staff filters
      const status = url.searchParams.get('status');
      const date = url.searchParams.get('date');
      const therapistId = url.searchParams.get('therapistId');
      const patientId = url.searchParams.get('patientId');

      if (status) filter.status = status;
      if (date) filter.date = date;
      if (therapistId) filter.therapistId = therapistId;
      if (patientId) filter.patientId = patientId;
    }

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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, therapistId, date, timeSlot, visitType, address, notes, patientIdOverride } = body;

    if (!serviceId || !date || !timeSlot || !visitType) {
      return NextResponse.json({ error: 'Missing booking parameters (serviceId, date, timeSlot, visitType)' }, { status: 400 });
    }

    // Determine target patient
    let patientId;
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ userId: user.userId });
      if (!patient) {
        return NextResponse.json({ error: 'Patient profile not found. Please onboard first.' }, { status: 400 });
      }
      patientId = patient._id;
    } else {
      // Admin/Receptionist can book for any patient by supplying patientIdOverride
      if (!patientIdOverride) {
        return NextResponse.json({ error: 'patientIdOverride is required when booking as staff' }, { status: 400 });
      }
      patientId = patientIdOverride;
    }

    // Verify service exists and is active
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'Service not found or inactive' }, { status: 400 });
    }

    // Check visit type availability
    if (visitType === 'home' && !service.homeVisitAvailable) {
      return NextResponse.json({ error: 'Home visits are not available for this service' }, { status: 400 });
    }
    if (visitType === 'clinic' && !service.clinicVisitAvailable) {
      return NextResponse.json({ error: 'Clinic visits are not available for this service' }, { status: 400 });
    }
    if (visitType === 'home' && !address) {
      return NextResponse.json({ error: 'Address is required for home visits' }, { status: 400 });
    }

    // Check Therapist availability and working schedule if a therapist is specified
    if (therapistId) {
      const therapist = await Therapist.findById(therapistId);
      if (!therapist || !therapist.isActive) {
        return NextResponse.json({ error: 'Selected therapist is not active or does not exist' }, { status: 400 });
      }

      // 1. Check if date falls in working days
      const bookingDate = new Date(date);
      const dayOfWeek = bookingDate.getDay(); // 0 (Sun) - 6 (Sat)
      if (!therapist.workingDays.includes(dayOfWeek)) {
        return NextResponse.json({ error: 'Therapist does not work on this day of the week' }, { status: 400 });
      }

      // 2. Check conflict booking
      const conflict = await Appointment.findOne({
        therapistId,
        date,
        timeSlot,
        status: { $ne: 'cancelled' }
      });
      if (conflict) {
        return NextResponse.json({ error: 'Selected therapist is already booked for this time slot' }, { status: 409 });
      }
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      serviceId,
      therapistId: therapistId || undefined,
      date,
      timeSlot,
      visitType,
      address,
      status: 'pending',
      statusTimeline: [{ status: 'pending', note: 'Appointment booked by patient.' }],
      notes
    });

    // Dispatch Notifications
    try {
      // 1. Patient Notification
      await createNotification(
        user.userId,
        'Appointment Requested',
        `Your appointment request for ${service.title} has been submitted for ${date} at ${timeSlot}.`,
        'booking_alert',
        { appointmentId: appointment._id }
      );

      // 2. Admin Notification
      const adminUser = await User.findOne({ role: 'superadmin' });
      if (adminUser) {
        await createNotification(
          adminUser._id,
          'New Appointment Request',
          `A new appointment for ${service.title} has been requested by Patient on ${date} at ${timeSlot}.`,
          'booking_alert',
          { appointmentId: appointment._id }
        );
      }
    } catch (notifErr) {
      console.error('Failed to dispatch booking notifications:', notifErr);
    }

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error: any) {
    console.error('Error booking appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
