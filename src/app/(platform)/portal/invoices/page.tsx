'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPortalInvoices, payAllOutstanding } from '@/lib/actions/portal';
import type { PortalInvoiceRow } from '@/lib/actions/portal';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-50 text-green-700',
  pending: 'bg-yellow-50 text-yellow-700',
  overdue: 'bg-red-50 text-red-700',
  failed: 'bg-red-50 text-red-700',
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Unpaid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
];

export default function InvoicesPage() {
  const [filter, setFilter] = useState('all');
  const [invoices, setInvoices] = useState<PortalInvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingAll, setPayingAll] = useState(false);
  const [payToast, setPayToast] = useState<string | null>(null);

  const loadInvoices = (f: string) => {
    setLoading(true);
    getPortalInvoices(f).then(result => {
      setInvoices(result.success && result.data ? result.data : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadInvoices(filter);
  }, [filter]);

  const handlePayAll = async () => {
    setPayingAll(true);
    const result = await payAllOutstanding();
    if (result.success && result.data) {
      setPayToast(`${result.data.count} invoice${result.data.count !== 1 ? 's' : ''} marked as paid`);
      loadInvoices(filter);
      setTimeout(() => setPayToast(null), 3000);
    }
    setPayingAll(false);
  };

  const totalUnpaid = invoices
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0);

  const pendingCount = invoices.filter(i => i.status !== 'paid').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>

      {/* Toast */}
      {payToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
          {payToast}
        </div>
      )}

      {/* Summary */}
      <div className="rounded-2xl bg-gradient-to-r from-[#AF52DE] to-[#AF52DE]/80 p-4 text-white shadow-sm">
        <p className="text-sm opacity-80">Outstanding Balance</p>
        <p className="text-3xl font-bold">${totalUnpaid.toFixed(2)}</p>
        <p className="mt-1 text-xs opacity-70">{pendingCount} invoices pending</p>
        {pendingCount > 0 && (
          <button
            onClick={handlePayAll}
            disabled={payingAll}
            className="mt-3 w-full rounded-xl bg-white/20 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            {payingAll ? 'Processing...' : `Pay All Outstanding ($${totalUnpaid.toFixed(2)})`}
          </button>
        )}
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

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-gray-400">No invoices found</p>
            </div>
          ) : (
            invoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/portal/invoices/${inv.id}`}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{inv.invoiceNumber}</h3>
                  <p className="text-sm text-gray-500">{inv.companyName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {inv.dueDate && <> &middot; Due {new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${inv.total.toFixed(2)}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {inv.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
