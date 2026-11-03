'use client';

import React, { useState, useMemo } from 'react';
import DirectoryToolbar from './DirectoryToolbar';
import { exportToCsv } from '@/utils/exportCsv';
import { useToast } from './ToastProvider';
import { 
  Star, 
  MessageSquare, 
  CheckCircle, 
  EyeOff, 
  User, 
  Calendar,
  Sparkles
} from 'lucide-react';

interface ReviewsDirectoryClientProps {
  reviews: any[];
  toggleReviewModeration: (formData: FormData) => Promise<void>;
}

export default function ReviewsDirectoryClient({
  reviews,
  toggleReviewModeration,
}: ReviewsDirectoryClientProps) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [view, setView] = useState<'table' | 'cards'>('table');

  const statusOptions = [
    { label: 'Published / Approved', value: 'published' },
    { label: 'Under Review', value: 'pending' },
  ];

  const ratingOptions = [
    { label: '5 Stars Only', value: '5' },
    { label: '4 Stars & Above', value: '4plus' },
    { label: '3 Stars & Below', value: '3less' },
  ];

  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // Status filter
      if (statusFilter === 'published' && !rev.isModerated) return false;
      if (statusFilter === 'pending' && rev.isModerated) return false;

      // Rating filter
      const rating = Number(rev.rating) || 5;
      if (ratingFilter === '5' && rating !== 5) return false;
      if (ratingFilter === '4plus' && rating < 4) return false;
      if (ratingFilter === '3less' && rating > 3) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const pName = (rev.patientId?.name || '').toLowerCase();
        const tName = (rev.therapistId?.name || '').toLowerCase();
        const sTitle = (rev.serviceId?.title || '').toLowerCase();
        const comment = (rev.comment || '').toLowerCase();

        if (
          !pName.includes(q) &&
          !tName.includes(q) &&
          !sTitle.includes(q) &&
          !comment.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, search, statusFilter, ratingFilter]);

  const handleToggleModeration = async (formData: FormData, willBePublished: boolean) => {
    try {
      await toggleReviewModeration(formData);
      toast.success(
        willBePublished ? 'Review Published' : 'Review Hidden',
        willBePublished
          ? 'Patient testimonial is now visible publicly.'
          : 'Testimonial has been unpublished from public clinic views.'
      );
    } catch (err: any) {
      toast.error('Action Failed', err?.message || 'Could not update review status.');
    }
  };

  const handleExport = () => {
    const exportRows = filteredReviews.map((r) => ({
      'Patient Name': r.patientId?.name || 'Verified Patient',
      'Rating': `${r.rating || 5} Stars`,
      'Feedback': r.comment || 'N/A',
      'Therapist': r.therapistId?.name || 'QuickPhysio24 Specialist',
      'Service': r.serviceId?.title || 'General Consultation',
      'Submitted Date': new Date(r.createdAt).toISOString().slice(0, 10),
      'Moderation Status': r.isModerated ? 'Published' : 'Under Review',
    }));

    exportToCsv(exportRows, `reviews_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Export Complete', `Exported ${exportRows.length} patient reviews.`);
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter, Export & View Toggle Toolbar */}
      <DirectoryToolbar
        label="Reviews & Feedback"
        totalCount={reviews.length}
        filteredCount={filteredReviews.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search feedback by patient, therapist, service, comments..."
        filterOptions={statusOptions}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterLabel="Status"
        secondaryFilterOptions={ratingOptions}
        secondaryFilterValue={ratingFilter}
        onSecondaryFilterChange={setRatingFilter}
        secondaryFilterLabel="Rating"
        onExport={handleExport}
        showViewToggle={true}
        view={view}
        onViewChange={setView}
      />

      {/* Directory Content */}
      {view === 'table' ? (
        filteredReviews.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
            <MessageSquare className="mx-auto text-slate-300 w-12 h-12 mb-4" />
            <h3 className="font-bold text-slate-800 text-lg">No reviews found matching criteria</h3>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4 max-w-sm">Feedback Comment</th>
                    <th className="py-3.5 px-4">Therapist & Service</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredReviews.map((rev: any) => {
                    const patientName = rev.patientId?.name || 'Verified Patient';
                    const therapistName = rev.therapistId?.name || 'QuickPhysio24 Specialist';
                    const serviceTitle = rev.serviceId?.title || 'Physiotherapy Consultation';

                    return (
                      <tr key={rev._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <User size={13} className="text-teal-600" />
                            <span>{patientName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-slate-700 ml-1">{rev.rating}.0</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="italic text-slate-700 max-w-sm line-clamp-2" title={rev.comment}>
                            &ldquo;{rev.comment || 'Great treatment session, felt significant pain relief.'}&rdquo;
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{therapistName}</div>
                          <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            {serviceTitle}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            rev.isModerated 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {rev.isModerated ? 'Published' : 'Under Review'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <form
                            action={async (fd) => {
                              await handleToggleModeration(fd, !rev.isModerated);
                            }}
                            className="inline-block"
                          >
                            <input type="hidden" name="reviewId" value={rev._id.toString()} />
                            <input type="hidden" name="currentStatus" value={rev.isModerated ? 'true' : 'false'} />
                            {rev.isModerated ? (
                              <button 
                                type="submit" 
                                title="Hide from public"
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <EyeOff size={11} />
                                Unpublish
                              </button>
                            ) : (
                              <button 
                                type="submit" 
                                title="Publish review"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                              >
                                <CheckCircle size={11} />
                                Publish
                              </button>
                            )}
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Cards View */
        filteredReviews.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
            <MessageSquare className="mx-auto text-slate-300 w-12 h-12 mb-4" />
            <h3 className="font-bold text-slate-800 text-lg">No reviews found matching criteria</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReviews.map((rev: any) => {
              const patientName = rev.patientId?.name || 'Verified Patient';
              const therapistName = rev.therapistId?.name || 'QuickPhysio24 Specialist';
              const serviceTitle = rev.serviceId?.title || 'Physiotherapy Consultation';

              return (
                <div 
                  key={rev._id}
                  className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Row: User & Rating */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-xs border border-teal-100 shrink-0">
                          {patientName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-tight">{patientName}</h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-lg text-amber-700 text-xs font-bold">
                        <Star size={12} fill="currentColor" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    {/* Feedback content */}
                    <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 text-xs text-slate-700 italic">
                      &ldquo;{rev.comment || 'The therapist was attentive, knowledgeable, and helped reduce pain significantly.'}&rdquo;
                    </div>

                    {/* Meta tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">Therapist: <strong className="text-slate-700">{therapistName}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span className="text-teal-700 font-semibold bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md text-[10px]">
                        {serviceTitle}
                      </span>
                    </div>
                  </div>

                  {/* Moderation Controls Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      rev.isModerated 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {rev.isModerated ? 'Published' : 'Under Review'}
                    </span>

                    <form
                      action={async (fd) => {
                        await handleToggleModeration(fd, !rev.isModerated);
                      }}
                    >
                      <input type="hidden" name="reviewId" value={rev._id.toString()} />
                      <input type="hidden" name="currentStatus" value={rev.isModerated ? 'true' : 'false'} />
                      {rev.isModerated ? (
                        <button 
                          type="submit" 
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <EyeOff size={13} />
                          Unpublish
                        </button>
                      ) : (
                        <button 
                          type="submit" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <CheckCircle size={13} />
                          Approve & Publish
                        </button>
                      )}
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
