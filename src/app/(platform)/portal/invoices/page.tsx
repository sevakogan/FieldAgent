'use client';

import { useState } from 'react';
import Link from 'next/link';

const MOCK_INVOICES = [
  { id: 'inv-103', service: 'Deep Clean', provider: 'SparkleClean Co.', amount: 285.00, date: '2026-03-22', due: '2026-04-05', status: 'unpaid' as const, address: '742 Evergreen Terrace' },
  { id: 'inv-102', service: 'Window Washing', provider: 'ClearView Pros', amount: 180.00, date: '2026-03-20', due: '2026-04-03', status: 'unpaid' as const, address: '742 Evergreen Terrace' },
  { id: 'inv-101', service: 'Standard Clean', provider: 'SparkleClean Co.', amount: 150.00, date: '2026-03-15', due: '2026-03-29', status: 'paid' as const, address: '742 Evergreen Terrace' },
  { id: 'inv-100', service: 'Deep Clean', provider: 'SparkleClean Co.', amount: 285.00, date: '2026-03-08', due: '2026-03-22', status: 'paid' as const, address: '123 Ocean Ave, Unit 4B' },
  { id: 'inv-099', service: 'Move-Out Clean', provider: 'SparkleClean Co.', amount: 420.00, date: '2026-02-28', due: '2026-03-14', status: 'overdue' as const, address: '456 Palm Drive' },
  { id: 'inv-098', service: 'Carpet Cleaning', provider: 'FreshFloor Inc.', amount: 320.00, date: '2026-02-20', due: '2026-03-06', status: 'paid' as const, address: '123 Ocean Ave, Unit 4B' },
];

const STATUS_STYLES = {
  paid: 'bg-green-50 text-green-700',
  unpaid: 'bg-yellow-50 text-yellow-700',
  overdue: 'bg-red-50 text-red-700',
} as const;

type InvStatus = keyof typeof STATUS_STYLES;
const FILTERS: Array<{ value: InvStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
];

export default function InvoicesPage() {
  const [filter, setFilter] = useState<InvStatus | 'all'>('all');

  const filtered = filter === 'all' ? MOCK_INVOICES : MOCK_INVOICES.filter((inv) => inv.status === filter);

  const totalUnpaid = MOCK_INVOICES.filter((i) => i.status === 'unpaid' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>

      {/* Summary */}
      <div className="rounded-2xl bg-gradient-to-r from-[#AF52DE] to-[#AF52DE]/80 p-4 text-white shadow-sm">
        <p className="text-sm opacity-80">Outstanding Balance</p>
        <p className="text-3xl font-bold">${totalUnpaid.toFixed(2)}</p>
        <p className="mt-1 text-xs opacity-70">{MOCK_INVOICES.filter((i) => i.status !== 'paid').length} invoices pending</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-[#AF52DE] text-white' : 'bg-white text-gray-600 shadow-sm'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-400">No invoices found</p>
          </div>
        ) : (
          filtered.map((inv) => (
            <Link
              key={inv.id}
              href={`/portal/invoices/${inv.id}`}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{inv.service}</h3>
                <p className="text-sm text-gray-500">{inv.provider}</p>
                <p className="text-xs text-gray-400">
                  {new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &middot; {inv.address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">${inv.amount.toFixed(2)}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[inv.status]}`}>
                  {inv.status}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
