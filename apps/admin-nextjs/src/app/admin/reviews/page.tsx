import React from 'react';
import { connectDB, Review, Patient, Therapist, Service } from 'database';
import { revalidatePath } from 'next/cache';
import { 
  Star, 
  MessageSquare, 
  CheckCircle, 
  EyeOff, 
  User, 
  Calendar,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

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

export default async function ReviewsPage() {
  await connectDB();

  // Fetch all patient reviews populated with Patient, Therapist, and Service
  const reviews = await Review.find()
    .populate({ path: 'patientId', model: Patient })
    .populate({ path: 'therapistId', model: Therapist })
    .populate({ path: 'serviceId', model: Service })
    .sort({ createdAt: -1 });

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';
  const approvedCount = reviews.filter(r => r.isModerated).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Reviews & Feedback Moderation</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Review patient feedback, rating submissions, and control clinic testimonials visibility.
          </p>
        </div>

        {/* Aggregate Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200/60 px-3.5 py-2 rounded-xl flex items-center gap-2 text-amber-700 font-bold text-sm">
            <Star size={18} fill="currentColor" />
            <span>{avgRating} Avg Rating</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200/60 px-3.5 py-2 rounded-xl text-emerald-700 font-bold text-sm">
            {approvedCount} / {totalReviews} Published
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reviews.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
            <MessageSquare className="mx-auto text-slate-300 w-12 h-12 mb-4" />
            <h3 className="font-bold text-slate-800 text-lg">No reviews submitted yet</h3>
            <p className="text-slate-400 text-sm mt-1">
              Feedback submitted by patients after completing appointments will appear here.
            </p>
          </div>
        ) : (
          reviews.map((rev: any) => {
            const patientName = rev.patientId?.name || 'Verified Patient';
            const therapistName = rev.therapistId?.name || 'QuickPhysio24 Specialist';
            const serviceTitle = rev.serviceId?.title || 'Physiotherapy Consultation';

            return (
              <div 
                key={rev._id}
                className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Rating Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1.5">{rev.rating}.0</span>
                    </div>

                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                      rev.isModerated 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                        : 'bg-amber-50 text-amber-700 border-amber-200/60'
                    }`}>
                      {rev.isModerated ? 'Published' : 'Under Review'}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-slate-700 font-medium italic leading-relaxed">
                    &ldquo;{rev.comment || 'Great treatment session, felt significant pain relief.'}&rdquo;
                  </p>

                  {/* Meta details */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <User size={13} className="text-teal-600" />
                      <span>{patientName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Therapist: <strong className="text-slate-600">{therapistName}</strong></span>
                      <span>{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="text-[11px] text-teal-700 font-semibold bg-teal-50 border border-teal-100/60 px-2 py-0.5 rounded-md inline-block">
                      {serviceTitle}
                    </div>
                  </div>
                </div>

                {/* Moderation Action Button */}
                <form action={toggleReviewModeration} className="pt-3 border-t border-slate-100">
                  <input type="hidden" name="reviewId" value={rev._id.toString()} />
                  <input type="hidden" name="currentStatus" value={rev.isModerated ? 'true' : 'false'} />
                  
                  {rev.isModerated ? (
                    <button 
                      type="submit" 
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <EyeOff size={14} />
                      Unpublish / Hide Review
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-emerald-100"
                    >
                      <CheckCircle size={14} />
                      Approve & Publish Review
                    </button>
                  )}
                </form>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
