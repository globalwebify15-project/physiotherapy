import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Review, Patient, Therapist } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/reviews/[id] - Retrieve single review details
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const { id } = await params;
    const review = await Review.findById(id)
      .populate('patientId', 'name profilePhoto')
      .populate('therapistId', 'name qualification')
      .populate('serviceId', 'title');

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/reviews/[id] - Edit existing review (by patient who submitted it)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { rating, comment } = await request.json();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Role check: Only the patient owner or admin can edit
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ userId: user.userId });
      if (!patient || review.patientId.toString() !== patient._id.toString()) {
        return NextResponse.json({ error: 'Forbidden: You can only edit your own reviews' }, { status: 403 });
      }
    }

    const oldRating = review.rating;
    if (rating !== undefined) {
      review.rating = Math.max(1, Math.min(5, Number(rating)));
    }
    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Recalculate therapist rating average if rating changed
    if (rating !== undefined && rating !== oldRating && review.therapistId) {
      const allTherapistReviews = await Review.find({
        therapistId: review.therapistId,
        isModerated: true,
      });
      if (allTherapistReviews.length > 0) {
        const sum = allTherapistReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
        const newAvg = parseFloat((sum / allTherapistReviews.length).toFixed(2));
        await Therapist.findByIdAndUpdate(review.therapistId, {
          ratingAverage: newAvg,
        });
      }
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/reviews/[id] - Delete review (by patient or admin)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Role check: Patient owner or admin/superadmin
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ userId: user.userId });
      if (!patient || review.patientId.toString() !== patient._id.toString()) {
        return NextResponse.json({ error: 'Forbidden: You can only delete your own reviews' }, { status: 403 });
      }
    }

    const therapistId = review.therapistId;
    await Review.findByIdAndDelete(id);

    // Recompute therapist ratings
    if (therapistId) {
      const remainingReviews = await Review.find({
        therapistId,
        isModerated: true,
      });
      const therapist = await Therapist.findById(therapistId);
      if (therapist) {
        if (remainingReviews.length > 0) {
          const sum = remainingReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
          therapist.ratingAverage = parseFloat((sum / remainingReviews.length).toFixed(2));
          therapist.ratingCount = remainingReviews.length;
        } else {
          therapist.ratingAverage = 5.0;
          therapist.ratingCount = 0;
        }
        await therapist.save();
      }
    }

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
