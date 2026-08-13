import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Review, Appointment, Patient, Therapist } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

// GET /api/reviews - Retrieve all reviews or filter by therapistId
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const therapistId = url.searchParams.get('therapistId');
    const filter: any = { isModerated: true }; // Only return moderated (approved) reviews by default

    if (therapistId) {
      filter.therapistId = therapistId;
    }

    const reviews = await Review.find(filter)
      .populate('patientId', 'name profilePhoto')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reviews - Submit review for completed appointment
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request, ['patient']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId, rating, comment } = await request.json();

    if (!appointmentId || !rating) {
      return NextResponse.json({ error: 'appointmentId and rating are required' }, { status: 400 });
    }

    // Verify appointment details
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Verify patient owns the appointment
    const patient = await Patient.findOne({ userId: user.userId });
    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized profile ownership mismatch' }, { status: 403 });
    }

    // Ensure appointment is completed
    if (appointment.status !== 'completed') {
      return NextResponse.json({ error: 'Reviews can only be submitted for completed appointments' }, { status: 400 });
    }

    if (!appointment.therapistId) {
      return NextResponse.json({ error: 'No therapist was assigned to this appointment' }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this appointment' }, { status: 400 });
    }

    // Create review
    const review = await Review.create({
      patientId: patient._id,
      therapistId: appointment.therapistId,
      serviceId: appointment.serviceId,
      appointmentId,
      rating,
      comment,
      isModerated: true, // auto approve for development ease
    });

    // Update Therapist ratings metrics
    const therapist = await Therapist.findById(appointment.therapistId);
    if (therapist) {
      const prevTotal = therapist.ratingAverage * therapist.ratingCount;
      therapist.ratingCount += 1;
      therapist.ratingAverage = parseFloat(((prevTotal + rating) / therapist.ratingCount).toFixed(2));
      await therapist.save();
    }

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
