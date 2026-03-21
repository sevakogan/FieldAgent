'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getCompany, updateCompany } from '@/lib/actions/company'
import type { AutoAssignRule } from '@/types/database'

const AUTO_ASSIGN_OPTIONS: { value: AutoAssignRule; label: string; description: string }[] = [
  { value: 'manual', label: 'Manual', description: 'Assign workers manually for each job' },
  { value: 'round_robin', label: 'Round Robin', description: 'Rotate assignments evenly across workers' },
  { value: 'nearest', label: 'Nearest', description: 'Assign the closest available worker' },
  { value: 'per_address', label: 'Per Address', description: 'Use the worker assigned to each address' },
]

export default function AutomationSettingsPage() {
  const [autoApproveTimeout, setAutoApproveTimeout] = useState('')
  const [autoAssignRule, setAutoAssignRule] = useState<AutoAssignRule>('manual')
  const [reviewAutoSendHours, setReviewAutoSendHours] = useState('')
  const [reviewSmartGate, setReviewSmartGate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getCompany()
    if (result.success && result.data) {
      const c = result.data
      setAutoApproveTimeout(String(c.auto_approve_timeout_hours))
      setAutoAssignRule(c.auto_assign_rule)
      setReviewAutoSendHours(String(c.review_auto_send_hours))
      setReviewSmartGate(c.review_smart_gate)
    } else {
      setError(result.error ?? 'Failed to load settings')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    const result = await updateCompany({
      auto_approve_timeout_hours: parseInt(autoApproveTimeout) || 0,
      auto_assign_rule: autoAssignRule,
      review_auto_send_hours: parseInt(reviewAutoSendHours) || 0,
      review_smart_gate: reviewSmartGate,
    })
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
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Automation</h1>
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
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm">Automation settings saved</div>
      )}

      {!loading && (
        <div className="max-w-2xl space-y-6">
          {/* Auto-assign */}
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Worker Auto-Assignment</h2>
            <div className="space-y-3">
              {AUTO_ASSIGN_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-colors ${
                    autoAssignRule === opt.value
                      ? 'border-[#007AFF] bg-[#007AFF]/5'
                      : 'border-[#E5E5EA] hover:bg-[#F2F2F7]'
                  }`}
                >
                  <input
                    type="radio"
                    name="auto_assign"
                    value={opt.value}
                    checked={autoAssignRule === opt.value}
                    onChange={() => setAutoAssignRule(opt.value)}
                    className="accent-[#007AFF]"
                  />
                  <div>
                    <p className="font-medium text-sm text-[#1C1C1E]">{opt.label}</p>
                    <p className="text-xs text-[#8E8E93]">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Job approval */}
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Job Auto-Approval</h2>
            <div>
              <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">
                Auto-approve timeout (hours)
              </label>
              <p className="text-xs text-[#8E8E93] mb-2">
                Jobs pending client review will auto-approve after this many hours. Set to 0 to disable.
              </p>
              <input
                type="number"
                value={autoApproveTimeout}
                onChange={(e) => setAutoApproveTimeout(e.target.value)}
                className="w-full md:w-48 px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              />
            </div>
          </div>

          {/* Review automation */}
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Review Automation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">
                  Auto-send review request (hours after job)
                </label>
                <input
                  type="number"
                  value={reviewAutoSendHours}
                  onChange={(e) => setReviewAutoSendHours(e.target.value)}
                  className="w-full md:w-48 px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                />
              </div>
              <label className="flex items-center gap-3 p-4 bg-[#F2F2F7] rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={reviewSmartGate}
                  onChange={(e) => setReviewSmartGate(e.target.checked)}
                  className="w-5 h-5 accent-[#007AFF] rounded"
                />
                <div>
                  <p className="font-medium text-sm text-[#1C1C1E]">Smart Review Gate</p>
                  <p className="text-xs text-[#8E8E93]">
                    Only publish reviews with 4+ stars automatically. Lower ratings go to your inbox first.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Automation Settings'}
          </button>
        </div>
      )}
    </div>
  )
}
