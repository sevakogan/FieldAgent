'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPortalInvoice, payPortalInvoice } from '@/lib/actions/portal';
import type { PortalInvoiceDetail } from '@/lib/actions/portal';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-50 text-green-700',
  pending: 'bg-yellow-50 text-yellow-700',
  overdue: 'bg-red-50 text-red-700',
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const invId = params.id as string;
  const [invoice, setInvoice] = useState<PortalInvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    getPortalInvoice(invId).then(result => {
      if (result.success && result.data) {
        setInvoice(result.data);
        if (result.data.status === 'paid') setPaid(true);
      } else {
        setError(result.error ?? 'Invoice not found');
      }
      setLoading(false);
    });
  }, [invId]);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" /></div>;
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <Link href="/portal/invoices" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm"><p className="text-sm text-gray-500">{error ?? 'Invoice not found'}</p></div>
      </div>
    );
  }

  const currentStatus = paid ? 'paid' : invoice.status;

  const handlePay = async () => {
    setPaid(true);
    await payPortalInvoice(invId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/invoices" className="rounded-lg p-2 hover:bg-white">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <p className="text-sm text-gray-500">{invoice.companyName}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[currentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
          {currentStatus}
        </span>
      </div>

      {/* Info */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-400">Provider</dt>
            <dd className="font-medium text-gray-900">{invoice.companyName}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Issued</dt>
            <dd className="font-medium text-gray-900">{new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</dd>
          </div>
          {invoice.dueDate && (
            <div>
              <dt className="text-gray-400">Due</dt>
              <dd className={`font-medium ${currentStatus === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </dd>
            </div>
          )}
          {invoice.paidAt && (
            <div>
              <dt className="text-gray-400">Paid</dt>
              <dd className="font-medium text-green-600">{new Date(invoice.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Line items */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Items</h2>
        {invoice.items.length > 0 ? (
          <ul className="space-y-2">
            {invoice.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.description} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                <span className="font-medium text-gray-900">${(item.quantity * item.unit_price).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No line items</p>
        )}
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tax</span>
              <span className="text-gray-900">${invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-lg text-[#AF52DE]">${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Pay button */}
      {currentStatus !== 'paid' ? (
        <button
          onClick={handlePay}
          className="w-full rounded-2xl bg-[#AF52DE] py-3.5 font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Pay ${invoice.total.toFixed(2)}
        </button>
      ) : (
        <div className="rounded-2xl bg-green-50 p-4 text-center shadow-sm">
          <p className="font-semibold text-green-700">Payment successful!</p>
        </div>
      )}
    </div>
  );
}
