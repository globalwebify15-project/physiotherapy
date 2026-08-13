import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Appointment, Therapist, Patient, User } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';
import { createNotification } from '@/utils/notifications';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/appointments/[id] - Retrieve single appointment details
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const appointment = await Appointment.findById(id)
      .populate('patientId')
      .populate('serviceId')
      .populate('therapistId')
      .populate('paymentId');

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    console.error('Error fetching appointment details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/appointments/[id] - Update status, reschedule, or assign therapist
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, therapistId, date, timeSlot, note } = body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Role enforcement
    if (user.role === 'patient') {
      // Patients can only reschedule or cancel their own appointments
      if (status && !['cancelled'].includes(status)) {
        return NextResponse.json({ error: 'Patients can only request cancellation' }, { status: 403 });
      }
      if (date || timeSlot) {
        // Rescheduling
        appointment.date = date || appointment.date;
        appointment.timeSlot = timeSlot || appointment.timeSlot;
        appointment.statusTimeline.push({
          status: appointment.status,
          note: note || 'Appointment rescheduled by patient.',
        });
      }
      if (status === 'cancelled') {
        appointment.status = 'cancelled';
        appointment.statusTimeline.push({
          status: 'cancelled',
          note: note || 'Cancelled by patient.',
        });
      }
    } else {
      // Admin/Staff changes
      if (status) {
        appointment.status = status;
        appointment.statusTimeline.push({
          status,
          note: note || `Status updated to ${status} by staff.`,
        });
      }

      if (therapistId) {
        // Validate therapist and check conflicts
        const therapist = await Therapist.findById(therapistId);
        if (!therapist || !therapist.isActive) {
          return NextResponse.json({ error: 'Therapist is inactive or not found' }, { status: 400 });
        }

        const conflict = await Appointment.findOne({
          _id: { $ne: id },
          therapistId,
          date: date || appointment.date,
          timeSlot: timeSlot || appointment.timeSlot,
          status: { $ne: 'cancelled' },
        });

        if (conflict) {
          return NextResponse.json({ error: 'Selected therapist is already booked for this slot' }, { status: 409 });
        }

        appointment.therapistId = therapistId;
        if (appointment.status === 'pending' || appointment.status === 'confirmed') {
          appointment.status = 'assigned';
        }
        appointment.statusTimeline.push({
          status: appointment.status,
          note: note || `Therapist ${therapist.name} assigned to the appointment.`,
        });
      }

      if (date || timeSlot) {
        appointment.date = date || appointment.date;
        appointment.timeSlot = timeSlot || appointment.timeSlot;
        appointment.statusTimeline.push({
          status: appointment.status,
          note: note || 'Rescheduled by staff.',
        });
      }
    }

    await appointment.save();

    // Dispatch Notifications on Admin/Staff updates
    if (user.role !== 'patient') {
      try {
        const patient = await Patient.findById(appointment.patientId);
        if (patient) {
          if (therapistId) {
            const therapist = await Therapist.findById(therapistId);
            if (therapist) {
              await createNotification(
                patient.userId,
                'Therapist Assigned',
                `Dr. ${therapist.name} has been assigned to your appointment on ${appointment.date}.`,
                'booking_alert',
                { appointmentId: appointment._id, therapistId: therapist._id }
              );
            }
          } else if (status) {
            const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
            await createNotification(
              patient.userId,
              `Appointment ${formattedStatus}`,
              `Your appointment status has been updated to "${status}".`,
              'booking_alert',
              { appointmentId: appointment._id }
            );
          }
        }
      } catch (notifErr) {
        console.error('Failed to dispatch status update notifications:', notifErr);
      }
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
