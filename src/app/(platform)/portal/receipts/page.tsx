'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getPortalReceipts } from '@/lib/actions/portal';
import type { PortalInvoiceRow } from '@/lib/actions/portal';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<PortalInvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortalReceipts().then(result => {
      setReceipts(result.success && result.data ? result.data : []);
      setLoading(false);
    });
  }, []);

  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDownloadReceipt = useCallback((receipt: PortalInvoiceRow) => {
    const lines = [
      'RECEIPT',
      '='.repeat(30),
      `Invoice: ${receipt.invoiceNumber}`,
      `Provider: ${receipt.companyName}`,
      `Amount: $${receipt.total.toFixed(2)}`,
      `Status: Paid`,
      `Date: ${new Date(receipt.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      '',
      'Thank you for your payment.',
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedId(receipt.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">Total Paid</p>
        <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
        <p className="text-xs text-gray-400">{receipts.length} payments</p>
      </div>

      <div className="space-y-3">
        {receipts.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-400">No receipts yet</p>
          </div>
        ) : (
          receipts.map((receipt) => (
            <div key={receipt.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{receipt.invoiceNumber}</h3>
                  <p className="text-sm text-gray-500">{receipt.companyName}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Paid {new Date(receipt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${receipt.total.toFixed(2)}</p>
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Paid</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/portal/invoices/${receipt.id}`}
                  className="rounded-xl bg-[#F2F2F7] px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
                >
                  View Invoice
                </Link>
                <button
                  onClick={() => handleDownloadReceipt(receipt)}
                  className="rounded-xl bg-[#F2F2F7] px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {copiedId === receipt.id ? 'Copied!' : 'Download Receipt'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
