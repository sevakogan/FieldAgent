'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPortalQuote, acceptPortalQuote, declinePortalQuote } from '@/lib/actions/portal';
import type { PortalQuoteDetail } from '@/lib/actions/portal';

export default function QuoteDetailPage() {
  const params = useParams();
  const quoteId = params.id as string;
  const [quote, setQuote] = useState<PortalQuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<'accepted' | 'declined' | null>(null);

  useEffect(() => {
    getPortalQuote(quoteId).then(result => {
      if (result.success && result.data) {
        setQuote(result.data);
      } else {
        setError(result.error ?? 'Quote not found');
      }
      setLoading(false);
    });
  }, [quoteId]);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" /></div>;
  }

  if (error || !quote) {
    return (
      <div className="space-y-4">
        <Link href="/portal/quotes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm"><p className="text-sm text-gray-500">{error ?? 'Quote not found'}</p></div>
      </div>
    );
  }

  const currentStatus = decision ?? quote.status;

  const handleAccept = async () => {
    setDecision('accepted');
    await acceptPortalQuote(quoteId);
  };

  const handleDecline = async () => {
    setDecision('declined');
    await declinePortalQuote(quoteId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/quotes" className="rounded-lg p-2 hover:bg-white">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{quote.title ?? 'Quote'}</h1>
          <p className="text-sm text-gray-500">{quote.serviceName ?? quote.companyName}</p>
        </div>
      </div>

      {/* Provider info */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AF52DE]/10 text-sm font-bold text-[#AF52DE]">
            {quote.companyName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{quote.companyName}</p>
            {quote.addressDisplay && <p className="text-sm text-gray-500">{quote.addressDisplay}</p>}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Quote Details</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Received</dt>
            <dd className="text-gray-900">{new Date(quote.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</dd>
          </div>
          {quote.validUntil && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Expires</dt>
              <dd className="text-gray-900">{new Date(quote.validUntil).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Line items */}
      {quote.lineItems.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Line Items</h2>
          <ul className="space-y-2">
            {quote.lineItems.map((item, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.description} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                <span className="font-medium text-gray-900">${(item.quantity * item.unit_price).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">${quote.subtotal.toFixed(2)}</span>
            </div>
            {quote.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">${quote.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-lg text-[#AF52DE]">${quote.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {quote.description && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-900">Notes</h2>
          <p className="text-sm text-gray-600">{quote.description}</p>
        </div>
      )}

      {/* Actions */}
      {currentStatus === 'sent' && (
        <div className="flex gap-3">
          <button onClick={handleAccept} className="flex-1 rounded-2xl bg-[#AF52DE] py-3.5 font-semibold text-white shadow-sm transition-opacity hover:opacity-90">
            Accept Quote
          </button>
          <button onClick={handleDecline} className="flex-1 rounded-2xl border border-red-200 bg-white py-3.5 font-semibold text-red-600 shadow-sm hover:bg-red-50">
            Decline
          </button>
        </div>
      )}

      {(currentStatus === 'accepted' || currentStatus === 'declined') && (
        <div className={`rounded-2xl p-4 text-center shadow-sm ${currentStatus === 'accepted' ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-semibold ${currentStatus === 'accepted' ? 'text-green-700' : 'text-red-700'}`}>
            {currentStatus === 'accepted' ? 'Quote accepted! The provider will confirm scheduling.' : 'Quote declined.'}
          </p>
        </div>
      )}
    </div>
  );
}
