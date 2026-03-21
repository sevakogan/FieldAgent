'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPortalQuotes } from '@/lib/actions/portal';
import type { PortalQuoteRow } from '@/lib/actions/portal';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-yellow-50 text-yellow-700',
  accepted: 'bg-green-50 text-green-700',
  declined: 'bg-red-50 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'sent', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
];

export default function QuotesPage() {
  const [filter, setFilter] = useState('all');
  const [quotes, setQuotes] = useState<PortalQuoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPortalQuotes(filter).then(result => {
      setQuotes(result.success && result.data ? result.data : []);
      setLoading(false);
    });
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
        <Link
          href="/portal/request"
          className="flex items-center gap-1.5 rounded-xl bg-[#AF52DE] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#AF52DE]/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Request New Quote
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === opt.value ? 'bg-[#AF52DE] text-white' : 'bg-white text-gray-600 shadow-sm'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-gray-400">No quotes found</p>
            </div>
          ) : (
            quotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/portal/quotes/${quote.id}`}
                className="block rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{quote.title ?? 'Quote'}</h3>
                    <p className="text-sm text-gray-500">{quote.companyName}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Received {new Date(quote.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {quote.status === 'sent' && quote.validUntil && (
                        <> &middot; Expires {new Date(quote.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${quote.total.toFixed(2)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[quote.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {quote.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
