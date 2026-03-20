'use client';

import { useState } from 'react';
import Link from 'next/link';

const MOCK_QUOTES = [
  { id: 'q-1', service: 'Deep Clean', provider: 'SparkleClean Co.', amount: 285.00, date: '2026-03-18', expires: '2026-03-25', status: 'pending' as const, address: '742 Evergreen Terrace' },
  { id: 'q-2', service: 'Window Washing (12 windows)', provider: 'ClearView Pros', amount: 180.00, date: '2026-03-17', expires: '2026-03-24', status: 'pending' as const, address: '742 Evergreen Terrace' },
  { id: 'q-3', service: 'Carpet Cleaning', provider: 'FreshFloor Inc.', amount: 320.00, date: '2026-03-10', expires: '2026-03-17', status: 'accepted' as const, address: '123 Ocean Ave, Unit 4B' },
  { id: 'q-4', service: 'Move-Out Clean', provider: 'SparkleClean Co.', amount: 450.00, date: '2026-03-05', expires: '2026-03-12', status: 'declined' as const, address: '456 Palm Drive' },
  { id: 'q-5', service: 'Standard Clean', provider: 'SparkleClean Co.', amount: 150.00, date: '2026-02-28', expires: '2026-03-07', status: 'expired' as const, address: '742 Evergreen Terrace' },
];

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700',
  accepted: 'bg-green-50 text-green-700',
  declined: 'bg-red-50 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
} as const;

type QuoteStatus = keyof typeof STATUS_STYLES;
const FILTER_OPTIONS: Array<{ value: QuoteStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
];

export default function QuotesPage() {
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all');

  const filtered = filter === 'all' ? MOCK_QUOTES : MOCK_QUOTES.filter((q) => q.status === filter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>

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

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-400">No quotes found</p>
          </div>
        ) : (
          filtered.map((quote) => (
            <Link
              key={quote.id}
              href={`/portal/quotes/${quote.id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{quote.service}</h3>
                  <p className="text-sm text-gray-500">{quote.provider}</p>
                  <p className="text-xs text-gray-400">{quote.address}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Received {new Date(quote.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {quote.status === 'pending' && (
                      <> &middot; Expires {new Date(quote.expires).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${quote.amount.toFixed(2)}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[quote.status]}`}>
                    {quote.status}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
