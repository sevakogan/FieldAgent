'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const MOCK_INVOICES: Record<string, {
  id: string;
  service: string;
  provider: string;
  amount: number;
  date: string;
  due: string;
  status: 'paid' | 'unpaid' | 'overdue';
  address: string;
  lineItems: Array<{ label: string; amount: number }>;
  tax: number;
  paidDate?: string;
}> = {
  'inv-103': {
    id: 'inv-103',
    service: 'Deep Clean',
    provider: 'SparkleClean Co.',
    amount: 285.00,
    date: '2026-03-22',
    due: '2026-04-05',
    status: 'unpaid',
    address: '742 Evergreen Terrace',
    lineItems: [
      { label: 'Deep Clean — 3 bed, 2 bath', amount: 250.00 },
      { label: 'Eco-friendly products', amount: 15.00 },
      { label: 'Inside oven cleaning', amount: 20.00 },
    ],
    tax: 22.78,
  },
  'inv-099': {
    id: 'inv-099',
    service: 'Move-Out Clean',
    provider: 'SparkleClean Co.',
    amount: 420.00,
    date: '2026-02-28',
    due: '2026-03-14',
    status: 'overdue',
    address: '456 Palm Drive',
    lineItems: [
      { label: 'Move-Out Clean — 4 bed, 3 bath', amount: 380.00 },
      { label: 'Garage sweep & mop', amount: 40.00 },
    ],
    tax: 33.60,
  },
};

const STATUS_STYLES = {
  paid: 'bg-green-50 text-green-700',
  unpaid: 'bg-yellow-50 text-yellow-700',
  overdue: 'bg-red-50 text-red-700',
} as const;

export default function InvoiceDetailPage() {
  const params = useParams();
  const invId = params.id as string;
  const invoice = MOCK_INVOICES[invId] ?? MOCK_INVOICES['inv-103'];

  const [paid, setPaid] = useState(false);
  const currentStatus = paid ? 'paid' : invoice.status;

  const subtotal = invoice.lineItems.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/invoices" className="rounded-lg p-2 hover:bg-white">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice.id.split('-')[1]}</h1>
          <p className="text-sm text-gray-500">{invoice.service}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[currentStatus]}`}>
          {currentStatus}
        </span>
      </div>

      {/* Info */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-400">Provider</dt>
            <dd className="font-medium text-gray-900">{invoice.provider}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Property</dt>
            <dd className="font-medium text-gray-900">{invoice.address}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Issued</dt>
            <dd className="font-medium text-gray-900">{new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Due</dt>
            <dd className={`font-medium ${currentStatus === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>
              {new Date(invoice.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </dd>
          </div>
        </dl>
      </div>

      {/* Line items */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Items</h2>
        <ul className="space-y-2">
          {invoice.lineItems.map((item, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium text-gray-900">${item.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tax</span>
            <span className="text-gray-900">${invoice.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-lg text-[#AF52DE]">${(subtotal + invoice.tax).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Pay button */}
      {currentStatus !== 'paid' ? (
        <button
          onClick={() => setPaid(true)}
          className="w-full rounded-2xl bg-[#AF52DE] py-3.5 font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Pay ${(subtotal + invoice.tax).toFixed(2)}
        </button>
      ) : (
        <div className="rounded-2xl bg-green-50 p-4 text-center shadow-sm">
          <p className="font-semibold text-green-700">Payment successful! A receipt has been emailed to you.</p>
        </div>
      )}
    </div>
  );
}
