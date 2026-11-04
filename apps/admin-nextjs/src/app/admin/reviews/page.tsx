import React from 'react';
import { connectDB, Review, Patient, Therapist, Service } from 'database';
import { revalidatePath } from 'next/cache';
import ReviewsDirectoryClient from '@/components/ReviewsDirectoryClient';
import { Star, MessageSquare, CheckCircle, ShieldAlert } from 'lucide-react';

export const revalidate = 0; // Dynamic fetch

// Server Action to toggle review moderation status
async function toggleReviewModeration(formData: FormData) {
  'use server';
  const reviewId = formData.get('reviewId') as string;
  const currentStatus = formData.get('currentStatus') === 'true';

  if (!reviewId) return;

  await connectDB();
  const review = await Review.findById(reviewId);
  if (review) {
    review.isModerated = !currentStatus;
    await review.save();
  }

  revalidatePath('/admin/reviews');
}

// Server Action to delete inappropriate review
async function deleteReviewAction(formData: FormData) {
  'use server';
  const reviewId = formData.get('reviewId') as string;
  if (!reviewId) return;

  await connectDB();
  await Review.findByIdAndDelete(reviewId);
  revalidatePath('/admin/reviews');
}

export default async function ReviewsPage() {
  await connectDB();

  // Fetch all patient reviews populated with Patient, Therapist, and Service
  const reviews = await Review.find()
    .populate({ path: 'patientId', model: Patient })
    .populate({ path: 'therapistId', model: Therapist })
    .populate({ path: 'serviceId', model: Service })
    .sort({ createdAt: -1 })
    .lean();

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';
  const approvedCount = reviews.filter(r => r.isModerated).length;
  const pendingCount = totalReviews - approvedCount;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Patient Reviews & Feedback Moderation</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Review patient feedback, rating submissions, and control clinic testimonials visibility.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reviews</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalReviews}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Average Rating</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-black text-amber-700">{avgRating}</span>
              <Star size={18} className="text-amber-500 fill-amber-500" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
            <Star size={20} fill="currentColor" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Published</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Under Review</p>
            <p className="text-2xl font-black text-slate-700 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      {/* Full-width Reviews Directory Client with Instant Search, Status & Rating Filter, and CSV Export */}
      <div className="w-full">
        <ReviewsDirectoryClient
          reviews={JSON.parse(JSON.stringify(reviews))}
          toggleReviewModeration={toggleReviewModeration}
          deleteReviewAction={deleteReviewAction}
        />
      </div>
    </div>
  );
}
