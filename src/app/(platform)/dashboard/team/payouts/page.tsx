'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getTeamPayouts, getTeamMembers, createPayout, type PayoutRow, type PayoutSummary, type TeamMemberRow } from '@/lib/actions/team'

const STATUS_COLORS: Record<string, string> = {
  pending: '#FF9F0A',
  processing: '#007AFF',
  paid: '#34C759',
  failed: '#FF3B30',
}

const PAY_TYPE_LABELS: Record<string, string> = {
  per_job: 'Per Job',
  hourly: 'Hourly',
  percentage: 'Percentage',
  manual: 'Manual',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const EMPTY_PAYOUT = { worker_id: '', amount: '', pay_type: 'manual' }

export default function TeamPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRow[]>([])
  const [summary, setSummary] = useState<PayoutSummary>({
    total_paid: 0,
    total_pending: 0,
    workers_count: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [payoutForm, setPayoutForm] = useState(EMPTY_PAYOUT)
  const [creating, setCreating] = useState(false)
  const [members, setMembers] = useState<TeamMemberRow[]>([])

  const fetchPayouts = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [payoutsResult, membersResult] = await Promise.all([
      getTeamPayouts(),
      getTeamMembers(),
    ])
    if (payoutsResult.success && payoutsResult.data) {
      setPayouts(payoutsResult.data.payouts)
      setSummary(payoutsResult.data.summary)
    } else {
      setError(payoutsResult.error ?? 'Failed to load payouts')
    }
    if (membersResult.success && membersResult.data) {
      setMembers(membersResult.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPayouts()
  }, [fetchPayouts])

  const handleCreatePayout = async () => {
    if (!payoutForm.worker_id || !payoutForm.amount) return
    setCreating(true)
    const result = await createPayout({
      worker_id: payoutForm.worker_id,
      amount: parseFloat(payoutForm.amount),
      pay_type: payoutForm.pay_type,
    })
    if (result.success) {
      setPayoutForm(EMPTY_PAYOUT)
      setShowForm(false)
      fetchPayouts()
    } else {
      setError(result.error ?? 'Failed to create payout')
    }
    setCreating(false)
  }

  const updatePayoutForm = (field: string, value: string) => {
    setPayoutForm((prev) => ({ ...prev, [field]: value }))
  }

  const filtered = payouts.filter(p => {
    const q = search.toLowerCase()
    return (
      p.worker_name.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q) ||
      p.pay_type.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <Link href="/dashboard/team" className="text-[#007AFF] text-sm mb-4 inline-block hover:underline">
        &larr; Back to Team
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Team Payouts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Payout'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-6">
          <h2 className="font-semibold text-[#1C1C1E] mb-3">New Payout</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-[#8E8E93] uppercase mb-1 block">Worker</label>
              <select
                value={payoutForm.worker_id}
                onChange={(e) => updatePayoutForm('worker_id', e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              >
                <option value="">Select worker...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#8E8E93] uppercase mb-1 block">Amount</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={payoutForm.amount}
                onChange={(e) => updatePayoutForm('amount', e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-sm text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#8E8E93] uppercase mb-1 block">Pay Type</label>
              <select
                value={payoutForm.pay_type}
                onChange={(e) => updatePayoutForm('pay_type', e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              >
                <option value="manual">Manual</option>
                <option value="per_job">Per Job</option>
                <option value="hourly">Hourly</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCreatePayout}
            disabled={creating || !payoutForm.worker_id || !payoutForm.amount}
            className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Payout'}
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
        >
          <p className="text-xs text-[#8E8E93] uppercase font-medium mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-[#34C759]">{formatCurrency(summary.total_paid)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
        >
          <p className="text-xs text-[#8E8E93] uppercase font-medium mb-1">Pending</p>
          <p className="text-2xl font-bold text-[#FF9F0A]">{formatCurrency(summary.total_pending)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
        >
          <p className="text-xs text-[#8E8E93] uppercase font-medium mb-1">Workers</p>
          <p className="text-2xl font-bold text-[#1C1C1E]">{summary.workers_count}</p>
        </motion.div>
      </div>

      <input
        type="text"
        placeholder="Search by worker name, status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-96 px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
      />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && payouts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center"
        >
          <div className="w-16 h-16 bg-[#F2F2F7] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">No payouts yet</h2>
          <p className="text-sm text-[#8E8E93]">
            Payouts will appear here once jobs are completed and workers are paid.
          </p>
        </motion.div>
      )}

      {!loading && !error && payouts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5EA]">
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Worker</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden md:table-cell">Job</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden md:table-cell">Pay Type</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Status</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase hidden lg:table-cell">Date</th>
                <th className="text-right p-4 text-xs font-medium text-[#8E8E93] uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {filtered.map((payout, i) => (
                <motion.tr
                  key={payout.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-[#F2F2F7] transition-colors"
                >
                  <td className="p-4 text-sm font-medium text-[#1C1C1E]">{payout.worker_name}</td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden md:table-cell">
                    {payout.job_id ? payout.job_id.slice(0, 8) + '...' : '-'}
                  </td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden md:table-cell">
                    {PAY_TYPE_LABELS[payout.pay_type] ?? payout.pay_type}
                  </td>
                  <td className="p-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                      style={{
                        backgroundColor: (STATUS_COLORS[payout.status] ?? '#8E8E93') + '20',
                        color: STATUS_COLORS[payout.status] ?? '#8E8E93',
                      }}
                    >
                      {payout.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#8E8E93] hidden lg:table-cell">
                    {new Date(payout.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm text-right font-medium text-[#1C1C1E]">
                    {formatCurrency(payout.amount)}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-[#8E8E93]">
                    No payouts match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
