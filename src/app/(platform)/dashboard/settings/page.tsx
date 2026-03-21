'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getCompany, updateCompany } from '@/lib/actions/company'
import type { Company } from '@/types/database'

export default function SettingsPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [taxRate, setTaxRate] = useState('')
  const [autoApproveTimeout, setAutoApproveTimeout] = useState('')
  const [cancellationPolicy, setCancellationPolicy] = useState('')
  const [jobBuffer, setJobBuffer] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getCompany()
    if (result.success && result.data) {
      const c = result.data
      setCompany(c)
      setName(c.name)
      setPhone(c.phone ?? '')
      setEmail(c.email ?? '')
      setBusinessType(c.business_type)
      setTaxRate(String(c.tax_rate))
      setAutoApproveTimeout(String(c.auto_approve_timeout_hours))
      setCancellationPolicy(String(c.cancellation_policy_hours))
      setJobBuffer(String(c.job_buffer_minutes))
    } else {
      setError(result.error ?? 'Failed to load company settings')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    const result = await updateCompany({
      name,
      phone: phone || null,
      email: email || null,
      business_type: businessType,
      tax_rate: parseFloat(taxRate) || 0,
      auto_approve_timeout_hours: parseInt(autoApproveTimeout) || 0,
      cancellation_policy_hours: parseInt(cancellationPolicy) || 0,
      job_buffer_minutes: parseInt(jobBuffer) || 0,
    })
    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error ?? 'Failed to save')
    }
    setSaving(false)
  }

  const settingsLinks = [
    { label: 'Billing', href: '/dashboard/settings/billing', description: 'Manage your subscription and billing' },
    { label: 'Stripe', href: '/dashboard/settings/stripe', description: 'Connect and configure Stripe payments' },
    { label: 'Automation', href: '/dashboard/settings/automation', description: 'Auto-assign, reviews, and scheduling' },
    { label: 'Notifications', href: '/dashboard/settings/notifications', description: 'Email, SMS, and push notification preferences' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Company Settings</h1>
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
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm">Settings saved successfully</div>
      )}

      {!loading && company && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
              <h2 className="font-semibold text-[#1C1C1E] mb-4">Company Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Company Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Business Type</label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
              <h2 className="font-semibold text-[#1C1C1E] mb-4">Operations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Auto-Approve Timeout (hours)</label>
                  <input
                    type="number"
                    value={autoApproveTimeout}
                    onChange={(e) => setAutoApproveTimeout(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Cancellation Policy (hours)</label>
                  <input
                    type="number"
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Job Buffer (minutes)</label>
                  <input
                    type="number"
                    value={jobBuffer}
                    onChange={(e) => setJobBuffer(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-[#1C1C1E] mb-2">More Settings</h2>
            {settingsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block bg-white rounded-2xl border border-[#E5E5EA] p-4 hover:bg-[#F2F2F7] transition-colors"
              >
                <p className="font-medium text-sm text-[#1C1C1E]">{link.label}</p>
                <p className="text-xs text-[#8E8E93] mt-0.5">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
