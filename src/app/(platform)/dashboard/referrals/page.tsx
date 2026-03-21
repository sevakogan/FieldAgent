'use client'

import { useState, useEffect, useCallback } from 'react'
import { getReferrals, createReferral, type ReferralRow } from '@/lib/actions/referrals'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FF9F0A20', text: '#FF9F0A' },
  signed_up: { bg: '#007AFF20', text: '#007AFF' },
  qualified: { bg: '#AF52DE20', text: '#AF52DE' },
  rewarded: { bg: '#34C75920', text: '#34C759' },
  expired: { bg: '#8E8E9320', text: '#8E8E93' },
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  signed_up: 'Signed Up',
  qualified: 'Qualified',
  rewarded: 'Rewarded',
  expired: 'Expired',
}

const REWARD_LABELS: Record<string, string> = {
  percentage_recurring: 'Recurring %',
  flat_one_time: 'Flat One-Time',
  credit: 'Credit',
  tier_badge: 'Badge',
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [referredEmail, setReferredEmail] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getReferrals()
    if (result.success && result.data) {
      setReferrals(result.data)
    } else {
      setError(result.error ?? 'Failed to load referrals')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreateReferral = async () => {
    if (!referredEmail.trim()) return
    setCreating(true)
    const result = await createReferral({ referred_email: referredEmail.trim() })
    if (result.success) {
      setReferredEmail('')
      setShowForm(false)
      fetchData()
    } else {
      setError(result.error ?? 'Failed to create referral')
    }
    setCreating(false)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const myCode = referrals.length > 0 ? referrals[0].referral_code : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Referrals</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Referral'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-6">
          <h2 className="font-semibold text-[#1C1C1E] mb-3">Create Referral</h2>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Referred email address"
              value={referredEmail}
              onChange={(e) => setReferredEmail(e.target.value)}
              className="flex-1 h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-sm text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
            <button
              onClick={handleCreateReferral}
              disabled={creating || !referredEmail.trim()}
              className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <>
          {myCode && (
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-6">
              <p className="text-xs text-[#8E8E93] uppercase font-medium mb-2">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <code className="bg-[#F2F2F7] px-4 py-2 rounded-xl text-lg font-mono font-bold text-[#1C1C1E] tracking-wider">
                  {myCode}
                </code>
                <button
                  onClick={() => copyCode(myCode)}
                  className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {referrals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
              <div className="text-4xl mb-3">&#128279;</div>
              <h3 className="text-lg font-semibold text-[#1C1C1E] mb-1">No referrals yet</h3>
              <p className="text-sm text-[#8E8E93]">Share your referral code to start earning rewards</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E5EA]">
                    <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Referred</th>
                    <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Reward</th>
                    <th className="text-right p-4 text-xs font-medium text-[#8E8E93] uppercase">Earned</th>
                    <th className="text-right p-4 text-xs font-medium text-[#8E8E93] uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => {
                    const statusStyle = STATUS_COLORS[r.status] ?? STATUS_COLORS.pending
                    return (
                      <tr key={r.id} className="border-b border-[#E5E5EA] last:border-0">
                        <td className="p-4 text-sm text-[#1C1C1E]">
                          {r.referred_user_email ?? <span className="text-[#8E8E93] italic">Pending signup</span>}
                        </td>
                        <td className="p-4">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                          >
                            {STATUS_LABELS[r.status] ?? r.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-[#8E8E93]">
                          {r.reward_type
                            ? `${REWARD_LABELS[r.reward_type] ?? r.reward_type}${r.reward_value ? ` (${r.reward_value})` : ''}`
                            : <span className="italic">N/A</span>
                          }
                        </td>
                        <td className="p-4 text-sm text-right font-medium text-[#34C759]">
                          {r.total_earned > 0 ? `$${r.total_earned.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-4 text-sm text-right text-[#8E8E93]">
                          {new Date(r.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            timeZone: 'America/Los_Angeles',
                          })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
