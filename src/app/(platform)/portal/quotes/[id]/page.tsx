'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const MOCK_QUOTES: Record<string, {
  id: string;
  service: string;
  provider: string;
  amount: number;
  date: string;
  expires: string;
  status: 'pending' | 'accepted' | 'declined';
  address: string;
  lineItems: Array<{ label: string; amount: number }>;
  notes: string;
  estimatedDuration: string;
}> = {
  'q-1': {
    id: 'q-1',
    service: 'Deep Clean',
    provider: 'SparkleClean Co.',
    amount: 285.00,
    date: '2026-03-18',
    expires: '2026-03-25',
    status: 'pending',
    address: '742 Evergreen Terrace',
    lineItems: [
      { label: 'Deep Clean — 3 bed, 2 bath', amount: 250.00 },
      { label: 'Eco-friendly products upgrade', amount: 15.00 },
      { label: 'Inside oven cleaning', amount: 20.00 },
    ],
    notes: 'Includes all rooms, kitchen appliances interior, and baseboards. Eco products upon request.',
    estimatedDuration: '3–4 hours',
  },
  'q-2': {
    id: 'q-2',
    service: 'Window Washing',
    provider: 'ClearView Pros',
    amount: 180.00,
    date: '2026-03-17',
    expires: '2026-03-24',
    status: 'pending',
    address: '742 Evergreen Terrace',
    lineItems: [
      { label: 'Exterior windows (12)', amount: 120.00 },
      { label: 'Interior windows (12)', amount: 48.00 },
      { label: 'Screen cleaning', amount: 12.00 },
    ],
    notes: 'Weather permitting for exterior. Rain reschedule at no charge.',
    estimatedDuration: '2–3 hours',
  },
};

export default function QuoteDetailPage() {
  const params = useParams();
  const quoteId = params.id as string;
  const quote = MOCK_QUOTES[quoteId] ?? MOCK_QUOTES['q-1'];

  const [decision, setDecision] = useState<'accepted' | 'declined' | null>(null);
  const currentStatus = decision ?? quote.status;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/quotes" className="rounded-lg p-2 hover:bg-white">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Quote #{quote.id.split('-')[1]}</h1>
          <p className="text-sm text-gray-500">{quote.service}</p>
        </div>
      </div>

      {/* Provider info */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AF52DE]/10 text-sm font-bold text-[#AF52DE]">
            {quote.provider.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{quote.provider}</p>
            <p className="text-sm text-gray-500">{quote.address}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Quote Details</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Received</dt>
            <dd className="text-gray-900">{new Date(quote.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Expires</dt>
            <dd className="text-gray-900">{new Date(quote.expires).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Est. Duration</dt>
            <dd className="text-gray-900">{quote.estimatedDuration}</dd>
          </div>
        </dl>
      </div>

      {/* Line items */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Line Items</h2>
        <ul className="space-y-2">
          {quote.lineItems.map((item, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium text-gray-900">${item.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-lg text-[#AF52DE]">${quote.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-900">Provider Notes</h2>
          <p className="text-sm text-gray-600">{quote.notes}</p>
        </div>
      )}

      {/* Actions */}
      {currentStatus === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => setDecision('accepted')}
            className="flex-1 rounded-2xl bg-[#AF52DE] py-3.5 font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Accept Quote
          </button>
          <button
            onClick={() => setDecision('declined')}
            className="flex-1 rounded-2xl border border-red-200 bg-white py-3.5 font-semibold text-red-600 shadow-sm hover:bg-red-50"
          >
            Decline
          </button>
        </div>
      )}

      {currentStatus !== 'pending' && (
        <div className={`rounded-2xl p-4 text-center shadow-sm ${currentStatus === 'accepted' ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-semibold ${currentStatus === 'accepted' ? 'text-green-700' : 'text-red-700'}`}>
            {currentStatus === 'accepted' ? 'Quote accepted! The provider will confirm scheduling.' : 'Quote declined.'}
          </p>
        </div>
      )}
    </div>
  );
}
