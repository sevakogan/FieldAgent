'use client';

import { useState } from 'react';

const MOCK_REVIEW_REQUESTS = [
  { id: 'rev-1', jobId: 'job-5', service: 'Standard Clean', provider: 'SparkleClean Co.', date: '2026-03-15', address: '742 Evergreen Terrace' },
  { id: 'rev-2', jobId: 'job-6', service: 'Deep Clean', provider: 'SparkleClean Co.', date: '2026-03-08', address: '123 Ocean Ave, Unit 4B' },
];

const PAST_REVIEWS = [
  { id: 'prev-1', service: 'Carpet Cleaning', provider: 'FreshFloor Inc.', date: '2026-02-20', rating: 5, comment: 'Excellent work! Carpets look brand new.' },
  { id: 'prev-2', service: 'Standard Clean', provider: 'SparkleClean Co.', date: '2026-02-01', rating: 4, comment: 'Good job overall, missed a spot under the couch.' },
];

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (n: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate?.(star)}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <svg
            className={`h-6 w-6 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [pendingReviews, setPendingReviews] = useState(MOCK_REVIEW_REQUESTS);
  const [activeReview, setActiveReview] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (reviewId: string) => {
    setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
    setActiveReview(null);
    setRating(0);
    setComment('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>

      {/* Pending */}
      {pendingReviews.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending Reviews</h2>
          <div className="space-y-3">
            {pendingReviews.map((req) => (
              <div key={req.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{req.service}</h3>
                    <p className="text-sm text-gray-500">{req.provider}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &middot; {req.address}
                    </p>
                  </div>
                  {activeReview !== req.id && (
                    <button
                      onClick={() => { setActiveReview(req.id); setRating(0); setComment(''); }}
                      className="rounded-xl bg-[#AF52DE] px-4 py-2 text-sm font-medium text-white"
                    >
                      Review
                    </button>
                  )}
                </div>

                {activeReview === req.id && (
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
                        onClick={() => handleSubmit(req.id)}
                        disabled={rating === 0}
                        className="flex-1 rounded-xl bg-[#AF52DE] py-2.5 text-sm font-medium text-white disabled:opacity-40"
                      >
                        Submit Review
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
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Your Reviews</h2>
        <div className="space-y-3">
          {PAST_REVIEWS.map((review) => (
            <div key={review.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{review.service}</h3>
                  <p className="text-sm text-gray-500">{review.provider}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
