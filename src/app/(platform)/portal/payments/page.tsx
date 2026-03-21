'use client';

import { useState, useEffect } from 'react';
import { getPortalPaymentInfo, togglePortalAutoPay } from '@/lib/actions/portal';
import type { PortalPaymentInfo } from '@/lib/actions/portal';

export default function PaymentsPage() {
  const [paymentInfo, setPaymentInfo] = useState<PortalPaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    getPortalPaymentInfo().then(result => {
      if (result.success && result.data) {
        setPaymentInfo(result.data);
      }
      setLoading(false);
    });
  }, []);

  const handleToggleAutoPay = async () => {
    if (!paymentInfo) return;
    setToggling(true);
    const newValue = !paymentInfo.autoPay;
    await togglePortalAutoPay(paymentInfo.clientCompanyId, newValue);
    setPaymentInfo({ ...paymentInfo, autoPay: newValue });
    setToggling(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>

      {/* Auto-pay toggle */}
      {paymentInfo && (
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <h3 className="font-semibold text-gray-900">Auto-Pay</h3>
            <p className="text-sm text-gray-500">Automatically pay invoices when due</p>
          </div>
          <button
            onClick={handleToggleAutoPay}
            disabled={toggling}
            className={`relative h-7 w-12 rounded-full transition-colors ${paymentInfo.autoPay ? 'bg-[#AF52DE]' : 'bg-gray-300'}`}
          >
            <div
              className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform"
              style={{ transform: paymentInfo.autoPay ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </button>
        </div>
      )}

      {/* Payment schedule info */}
      {paymentInfo && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-semibold text-gray-900">Payment Schedule</h3>
          <p className="text-sm text-gray-600 capitalize">{paymentInfo.paymentSchedule.replace('_', ' ')}</p>
        </div>
      )}

      {/* Stripe placeholder */}
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
        <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">Payment methods managed via Stripe</p>
        <p className="mt-1 text-xs text-gray-400">Contact your provider to update payment methods</p>
      </div>

      {!paymentInfo && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-400">No payment information found</p>
        </div>
      )}
    </div>
  );
}
