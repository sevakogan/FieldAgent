'use client'

import { useState, useEffect, useCallback } from 'react'
import { getReviews, respondToReview, type ReviewRow, type ReviewStats } from '@/lib/actions/reviews'

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'text-2xl' : 'text-sm'
  return (
    <span className={cls}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? 'text-[#FFD60A]' : 'text-[#E5E5EA]'}>&#9733;</span>
      ))}
    </span>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    average: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replySaving, setReplySaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getReviews()
    if (result.success && result.data) {
      setReviews(result.data.reviews)
      setStats(result.data.stats)
    } else {
      setError(result.error ?? 'Failed to load reviews')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleReply = async (reviewId: string) => {
    const text = replyText.trim()
    if (!text) return
    setReplySaving(true)
    const result = await respondToReview(reviewId, text)
    if (result.success) {
      setReplyingTo(null)
      setReplyText('')
      await fetchData()
    }
    setReplySaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Reviews</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="glass rounded-2xl p-3">
              <p className="text-xs text-[#8E8E93] uppercase font-medium mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#1C1C1E]">{stats.average.toFixed(1)}</span>
                <Stars rating={Math.round(stats.average)} size="lg" />
              </div>
            </div>
            <div className="glass rounded-2xl p-3">
              <p className="text-xs text-[#8E8E93] uppercase font-medium mb-1">Total Reviews</p>
              <span className="text-xl font-bold text-[#1C1C1E]">{stats.total}</span>
            </div>
            <div className="glass rounded-2xl p-3">
              <p className="text-xs text-[#8E8E93] uppercase font-medium mb-1">Rating Distribution</p>
              <div className="space-y-1 mt-1">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = stats.distribution[star] ?? 0
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-[#8E8E93]">{star}</span>
                      <div className="flex-1 h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FFD60A] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right text-[#8E8E93]">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">&#11088;</div>
              <h3 className="text-lg font-semibold text-[#1C1C1E] mb-1">No reviews yet</h3>
              <p className="text-sm text-[#8E8E93]">Client reviews will appear here after jobs are completed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="glass rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] font-semibold text-sm">
                        {review.client_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#1C1C1E]">{review.client_name}</p>
                        <Stars rating={review.rating} />
                      </div>
                    </div>
                    <span className="text-xs text-[#8E8E93]">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'America/Los_Angeles',
                      })}
                    </span>
                  </div>
                  {review.review && <p className="text-sm text-[#1C1C1E] mt-2">{review.review}</p>}
                  {review.response && (
                    <div className="mt-3 pl-4 border-l-2 border-[#007AFF]">
                      <p className="text-xs font-medium text-[#007AFF] mb-1">Your Response</p>
                      <p className="text-sm text-[#8E8E93]">{review.response}</p>
                    </div>
                  )}
                  {!review.response && replyingTo !== review.id && (
                    <button
                      onClick={() => { setReplyingTo(review.id); setReplyText('') }}
                      className="mt-3 text-sm text-[#007AFF] font-medium hover:text-[#0066DD] transition-colors"
                    >
                      Reply
                    </button>
                  )}
                  {replyingTo === review.id && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your response..."
                        rows={3}
                        className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReply(review.id)}
                          disabled={!replyText.trim() || replySaving}
                          className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
                        >
                          {replySaving ? 'Saving...' : 'Submit Response'}
                        </button>
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText('') }}
                          className="px-4 py-2 text-[#8E8E93] text-sm font-medium hover:text-[#1C1C1E] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
