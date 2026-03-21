'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getCompany, updateCompany } from '@/lib/actions/company'
import type { FeeSetting } from '@/types/database'

const FEE_OPTIONS: { value: FeeSetting; label: string; description: string }[] = [
  { value: 'company_pays', label: 'Company Pays', description: 'You absorb the processing fees' },
  { value: 'client_pays', label: 'Client Pays', description: 'Processing fees added to client invoice' },
  { value: 'split_50_50', label: 'Split 50/50', description: 'Fees split equally between you and the client' },
]

export default function StripeSettingsPage() {
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)
  const [feeSetting, setFeeSetting] = useState<FeeSetting>('company_pays')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getCompany()
    if (result.success && result.data) {
      setStripeAccountId(result.data.stripe_account_id)
      setFeeSetting(result.data.stripe_fee_setting)
    } else {
      setError(result.error ?? 'Failed to load settings')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSaveFees = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    const result = await updateCompany({ stripe_fee_setting: feeSetting })
    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error ?? 'Failed to save')
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/settings" className="text-[#007AFF] hover:text-[#0066DD] text-sm font-medium">
          &larr; Settings
        </Link>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Stripe Connect</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm">Fee settings saved</div>
      )}

      {!loading && (
        <div className="max-w-2xl space-y-6">
          {/* Connection status */}
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Connection Status</h2>
            {stripeAccountId ? (
              <div className="flex items-center justify-between p-4 bg-[#34C759]/5 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
                    <span className="font-medium text-[#1C1C1E]">Connected</span>
                  </div>
                  <p className="text-sm text-[#8E8E93] mt-1">Account: {stripeAccountId}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-[#8E8E93] mb-4">
                  Connect your Stripe account to accept payments from clients.
                </p>
                <a
                  href="/api/payments/connect"
                  className="inline-block px-5 py-2.5 bg-[#635BFF] text-white rounded-xl text-sm font-medium hover:bg-[#5851DB] transition-colors"
                >
                  Connect Stripe
                </a>
              </div>
            )}
          </div>

          {/* Fee settings */}
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Processing Fee Settings</h2>
            <div className="space-y-3">
              {FEE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-colors ${
                    feeSetting === opt.value
                      ? 'border-[#007AFF] bg-[#007AFF]/5'
                      : 'border-[#E5E5EA] hover:bg-[#F2F2F7]'
                  }`}
                >
                  <input
                    type="radio"
                    name="fee_setting"
                    value={opt.value}
                    checked={feeSetting === opt.value}
                    onChange={() => setFeeSetting(opt.value)}
                    className="accent-[#007AFF]"
                  />
                  <div>
                    <p className="font-medium text-sm text-[#1C1C1E]">{opt.label}</p>
                    <p className="text-xs text-[#8E8E93]">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <button
              onClick={handleSaveFees}
              disabled={saving}
              className="mt-4 px-6 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Fee Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
