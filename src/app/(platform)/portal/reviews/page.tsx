'use client';

import { useState, useEffect } from 'react';
import { getPortalReviews, submitPortalReview } from '@/lib/actions/portal';
import type { PortalReview, PortalPendingReview } from '@/lib/actions/portal';

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (n: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate?.(star)}
          disabled={!interactive}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <svg className={`h-6 w-6 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<PortalReview[]>([]);
  const [pending, setPending] = useState<PortalPendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReview, setActiveReview] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPortalReviews().then(result => {
      if (result.success && result.data) {
        setReviews(result.data.reviews);
        setPending(result.data.pending);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (jobId: string) => {
    if (rating === 0) return;
    setSubmitting(true);
    const result = await submitPortalReview({ jobId, rating, review: comment || undefined });
    if (result.success) {
      setPending(prev => prev.filter(p => p.jobId !== jobId));
      setActiveReview(null);
      setRating(0);
      setComment('');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>

      {/* Pending */}
      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Pending Reviews</h2>
          <div className="space-y-3">
            {pending.map((req) => (
              <div key={req.jobId} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{req.serviceName}</h3>
                    <p className="text-sm text-gray-500">{req.companyName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(req.scheduledDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &middot; {req.address}
                    </p>
                  </div>
                  {activeReview !== req.jobId && (
                    <button
                      onClick={() => { setActiveReview(req.jobId); setRating(0); setComment(''); }}
                      className="rounded-xl bg-[#AF52DE] px-4 py-2 text-sm font-medium text-white"
                    >
                      Review
                    </button>
                  )}
                </div>

                {activeReview === req.jobId && (
                  <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">Rating</p>
                      <StarRating rating={rating} onRate={setRating} interactive />
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-700">Comment</p>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        placeholder="How was the service?"
                        className="w-full resize-none rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveReview(null)}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmit(req.jobId)}
                        disabled={rating === 0 || submitting}
                        className="flex-1 rounded-xl bg-[#AF52DE] py-2.5 text-sm font-medium text-white disabled:opacity-40"
                      >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past reviews */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Your Reviews</h2>
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-gray-400">No reviews yet</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.serviceName}</h3>
                    <p className="text-sm text-gray-500">{review.companyName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                {review.review && <p className="mt-2 text-sm text-gray-600">{review.review}</p>}
                {review.response && (
                  <div className="mt-2 rounded-xl bg-[#F2F2F7] p-3">
                    <p className="text-xs font-medium text-gray-500">Provider Response</p>
                    <p className="text-sm text-gray-700">{review.response}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
