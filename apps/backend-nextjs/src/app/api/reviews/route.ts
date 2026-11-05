import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Review, Appointment, Patient, Therapist, Service, User } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

// GET /api/reviews - Retrieve reviews (public, by therapist, or current patient's own reviews)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const therapistId = url.searchParams.get('therapistId');
    const isMyParam = url.searchParams.get('my') === 'true';
    const isAllParam = url.searchParams.get('all') === 'true';
    const patientMobile = url.searchParams.get('mobile');

    let filter: any = {};
    if (!isAllParam) {
      filter.isModerated = true; // default to published reviews for public views
    }

    if (patientMobile) {
      const cleanMobile = patientMobile.replace(/^\+91|\D/g, '').trim();
      const dbUser = await User.findOne({
        $or: [
          { mobile: cleanMobile },
          { mobile: `+91${cleanMobile}` },
          { mobile: patientMobile },
          { mobile: { $regex: cleanMobile } },
        ],
      });
      let patient = dbUser ? await Patient.findOne({ userId: dbUser._id }) : null;
      if (!patient && cleanMobile) {
        patient = await Patient.findOne({
          $or: [
            { 'emergencyContact.phone': cleanMobile },
            { 'emergencyContact.phone': `+91${cleanMobile}` },
          ],
        });
      }

      if (isMyParam && patient) {
        filter = { patientId: patient._id };
      } else if (!isAllParam && patient) {
        filter = {
          $or: [
            { isModerated: true },
            { patientId: patient._id },
          ],
        };
      }
    } else if (therapistId) {
      filter.therapistId = therapistId;
    }

    const reviews = await Review.find(filter)
      .populate('patientId', 'name profilePhoto emergencyContact')
      .populate('therapistId', 'name qualification')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reviews - Submit review (supports mobile patient sessions, direct review, and guest)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { appointmentId, rating, comment, therapistId, serviceId, treatment, patientName, patientMobile } = body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return NextResponse.json({ error: 'Valid rating (1 to 5) is required' }, { status: 400 });
    }

    // 1. Authenticate user if token exists, or fallback gracefully to patient details
    const user = await getAuthenticatedUser(request);
    let targetUserId = user?.userId;
    let patient = null;

    if (targetUserId) {
      patient = await Patient.findOne({ userId: targetUserId });
    }

    // Lookup user by mobile if targetUserId is missing or no patient
    const rawMobile = (patientMobile || user?.mobile || '').toString();
    const cleanMobile = rawMobile.replace(/^\+91|\D/g, '').trim();

    if (!patient && cleanMobile.length > 0) {
      let dbUser = await User.findOne({
        $or: [
          { mobile: cleanMobile },
          { mobile: `+91${cleanMobile}` },
          { mobile: rawMobile },
          { mobile: { $regex: cleanMobile } },
        ],
      });

      if (!dbUser && cleanMobile.length >= 10) {
        dbUser = await User.create({
          mobile: `+91${cleanMobile}`,
          name: (patientName || 'Verified Patient').toString().trim(),
          role: 'patient',
          isActive: true,
        });
      }

      if (dbUser) {
        targetUserId = dbUser._id;
        patient = await Patient.findOne({ userId: dbUser._id });
      }
    }

    // Fallback: match patient by emergency contact phone
    if (!patient && cleanMobile.length > 0) {
      patient = await Patient.findOne({
        $or: [
          { 'emergencyContact.phone': cleanMobile },
          { 'emergencyContact.phone': `+91${cleanMobile}` },
          { 'emergencyContact.phone': { $regex: cleanMobile } },
        ],
      });
    }

    // If still no patient found, ensure a User exists and create a valid Patient (userId is strictly required by schema)
    if (!patient) {
      const displayName = (patientName || 'Verified Patient').toString().trim();
      const phoneToUse = cleanMobile.length >= 10 ? cleanMobile : '9110912544';

      let fallbackUser = targetUserId ? await User.findById(targetUserId) : null;
      if (!fallbackUser) {
        fallbackUser = await User.create({
          mobile: `+91${phoneToUse}`,
          name: displayName,
          role: 'patient',
          isActive: true,
        });
      }

      patient = await Patient.create({
        userId: fallbackUser._id,
        name: displayName,
        gender: 'other',
        dob: new Date('2000-01-01'),
        emergencyContact: {
          name: displayName,
          phone: `+91${phoneToUse}`,
          relation: 'Self',
        },
        savedAddresses: [],
        medicalHistory: [treatment || 'Physiotherapy Consultation'],
      });
    } else if (patientName && (!patient.name || patient.name === 'Patient' || patient.name.startsWith('Patient ('))) {
      patient.name = patientName.toString().trim();
      await patient.save();
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

    // Match service by treatment text if provided
    if (!finalServiceId && treatment) {
      const matchedService = await Service.findOne({
        title: { $regex: new RegExp(treatment.split(' ')[0], 'i') },
      });
      if (matchedService) finalServiceId = matchedService._id;
    }

    // Default therapist (QuickPhysio24 active specialist)
    if (!finalTherapistId) {
      const defaultTherapist = await Therapist.findOne({ isActive: true });
      if (defaultTherapist) finalTherapistId = defaultTherapist._id;
    }

    // Create review
    const review = await Review.create({
      patientId: patient._id,
      therapistId: finalTherapistId || undefined,
      serviceId: finalServiceId || undefined,
      appointmentId: appointmentId || undefined,
      rating: Number(rating),
      comment: comment || '',
      isModerated: true, // auto-published by default, manageable in admin
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

    const populatedReview = await Review.findById(review._id)
      .populate('patientId', 'name profilePhoto emergencyContact')
      .populate('therapistId', 'name qualification')
      .populate('serviceId', 'title')
      .lean();

    return NextResponse.json({ success: true, review: populatedReview || review }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/reviews - Toggle review moderation status
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const { reviewId, isModerated } = await request.json();
    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isModerated: Boolean(isModerated) },
      { new: true }
    );

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/reviews - Remove inappropriate review
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const reviewId = url.searchParams.get('id');
    if (!reviewId) {
      return NextResponse.json({ error: 'Review id parameter is required' }, { status: 400 });
    }

    await Review.findByIdAndDelete(reviewId);
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
