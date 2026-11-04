import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Review, Appointment, Patient, Therapist } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

// GET /api/reviews - Retrieve reviews (public, by therapist, or current patient's own reviews)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const therapistId = url.searchParams.get('therapistId');
    const isMyParam = url.searchParams.get('my') === 'true';
    const isAllParam = url.searchParams.get('all') === 'true';

    let filter: any = { isModerated: true };

    if (isMyParam) {
      const user = await getAuthenticatedUser(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const patient = await Patient.findOne({ userId: user.userId });
      if (!patient) {
        return NextResponse.json({ success: true, reviews: [] });
      }
      filter = { patientId: patient._id };
    } else if (isAllParam) {
      const user = await getAuthenticatedUser(request, ['admin', 'superadmin', 'receptionist']);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      filter = {};
    } else if (therapistId) {
      filter.therapistId = therapistId;
    }

    const reviews = await Review.find(filter)
      .populate('patientId', 'name profilePhoto')
      .populate('therapistId', 'name qualification')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reviews - Submit review (direct or for completed appointment)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request, ['patient']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId, rating, comment, therapistId, serviceId } = await request.json();

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return NextResponse.json({ error: 'Valid rating (1 to 5) is required' }, { status: 400 });
    }

    // Locate or link patient
    let patient = await Patient.findOne({ userId: user.userId });
    if (!patient) {
      patient = await Patient.create({
        userId: user.userId,
        name: user.name || 'Patient',
        mobile: user.mobile || '9876543210',
      });
    }

    let finalTherapistId = therapistId;
    let finalServiceId = serviceId;

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (appointment) {
        finalTherapistId = finalTherapistId || appointment.therapistId;
        finalServiceId = finalServiceId || appointment.serviceId;
      }
    }

    if (!finalTherapistId) {
      const defaultTherapist = await Therapist.findOne({ isActive: true });
      if (defaultTherapist) finalTherapistId = defaultTherapist._id;
    }

    // Create review
    const review = await Review.create({
      patientId: patient._id,
      therapistId: finalTherapistId,
      serviceId: finalServiceId,
      appointmentId: appointmentId || undefined,
      rating: Number(rating),
      comment: comment || '',
      isModerated: true, // auto approve
    });

    // Update Therapist ratings metrics
    if (finalTherapistId) {
      const therapist = await Therapist.findById(finalTherapistId);
      if (therapist) {
        const prevTotal = (therapist.ratingAverage || 5) * (therapist.ratingCount || 10);
        therapist.ratingCount = (therapist.ratingCount || 10) + 1;
        therapist.ratingAverage = parseFloat(((prevTotal + Number(rating)) / therapist.ratingCount).toFixed(2));
        await therapist.save();
      }
    }

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
