'use client';

import Link from 'next/link';

const MOCK_RECEIPTS = [
  { id: 'rcpt-101', invoiceId: 'inv-101', service: 'Standard Clean', provider: 'SparkleClean Co.', amount: 150.00, paidDate: '2026-03-15', method: 'Visa •••• 4242', address: '742 Evergreen Terrace' },
  { id: 'rcpt-100', invoiceId: 'inv-100', service: 'Deep Clean', provider: 'SparkleClean Co.', amount: 285.00, paidDate: '2026-03-08', method: 'Visa •••• 4242', address: '123 Ocean Ave, Unit 4B' },
  { id: 'rcpt-098', invoiceId: 'inv-098', service: 'Carpet Cleaning', provider: 'FreshFloor Inc.', amount: 320.00, paidDate: '2026-02-20', method: 'Mastercard •••• 8888', address: '123 Ocean Ave, Unit 4B' },
  { id: 'rcpt-095', invoiceId: 'inv-095', service: 'Standard Clean', provider: 'SparkleClean Co.', amount: 150.00, paidDate: '2026-02-01', method: 'Visa •••• 4242', address: '742 Evergreen Terrace' },
  { id: 'rcpt-090', invoiceId: 'inv-090', service: 'Deep Clean', provider: 'SparkleClean Co.', amount: 285.00, paidDate: '2026-01-15', method: 'Visa •••• 4242', address: '742 Evergreen Terrace' },
];

export default function ReceiptsPage() {
  const totalSpent = MOCK_RECEIPTS.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">Total Spent (last 90 days)</p>
        <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
        <p className="text-xs text-gray-400">{MOCK_RECEIPTS.length} payments</p>
      </div>

      <div className="space-y-3">
        {MOCK_RECEIPTS.map((receipt) => (
          <div key={receipt.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{receipt.service}</h3>
                <p className="text-sm text-gray-500">{receipt.provider}</p>
                <p className="text-xs text-gray-400">{receipt.address}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Paid {new Date(receipt.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &middot; {receipt.method}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">${receipt.amount.toFixed(2)}</p>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Paid</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="rounded-xl bg-[#F2F2F7] px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200">
                Download PDF
              </button>
              <Link
                href={`/portal/invoices/${receipt.invoiceId}`}
                className="rounded-xl bg-[#F2F2F7] px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
              >
                View Invoice
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
