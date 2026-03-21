'use client'

import Link from 'next/link'

export default function BillingSettingsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/settings" className="text-[#007AFF] hover:text-[#0066DD] text-sm font-medium">
          &larr; Settings
        </Link>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Billing</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
          <h2 className="font-semibold text-[#1C1C1E] mb-4">Current Plan</h2>
          <div className="flex items-center justify-between p-4 bg-[#F2F2F7] rounded-xl mb-4">
            <div>
              <p className="font-semibold text-[#1C1C1E]">Professional</p>
              <p className="text-sm text-[#8E8E93]">Per-address pricing</p>
            </div>
            <span className="px-3 py-1 bg-[#34C759]/10 text-[#34C759] text-xs font-medium rounded-full">Active</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#8E8E93]">Billing Cycle</p>
              <p className="font-medium text-[#1C1C1E]">Monthly</p>
            </div>
            <div>
              <p className="text-[#8E8E93]">Next Billing Date</p>
              <p className="font-medium text-[#1C1C1E]">April 1, 2026</p>
            </div>
            <div>
              <p className="text-[#8E8E93]">Price Per Address</p>
              <p className="font-medium text-[#1C1C1E]">$2.99/mo</p>
            </div>
            <div>
              <p className="text-[#8E8E93]">Active Addresses</p>
              <p className="font-medium text-[#1C1C1E]">--</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
          <h2 className="font-semibold text-[#1C1C1E] mb-4">Payment Method</h2>
          <p className="text-sm text-[#8E8E93] mb-4">No payment method on file</p>
          <div className="flex gap-3">
            <button
              disabled
              className="px-5 py-2.5 bg-[#F2F2F7] text-[#8E8E93] rounded-xl text-sm font-medium cursor-not-allowed"
            >
              Manage Subscription (Coming Soon)
            </button>
            <a
              href="mailto:support@kleanhq.com?subject=Billing%20Inquiry"
              className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors inline-block"
            >
              Contact Sales
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
          <h2 className="font-semibold text-[#1C1C1E] mb-4">Billing History</h2>
          <p className="text-sm text-[#8E8E93]">No billing history yet</p>
        </div>
      </div>
    </div>
  )
}
