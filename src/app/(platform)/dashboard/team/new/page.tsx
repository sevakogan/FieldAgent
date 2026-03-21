'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { inviteTeamMember } from '@/lib/actions/team'

const PAY_TYPE_OPTIONS = [
  { value: 'per_job', label: 'Per Job', icon: '🔧', desc: 'Flat rate per completed job', rateLabel: 'Amount per job', ratePlaceholder: '75.00' },
  { value: 'hourly', label: 'Hourly', icon: '⏱️', desc: 'Paid by hours worked', rateLabel: 'Hourly rate', ratePlaceholder: '25.00' },
  { value: 'percentage', label: '% of Job', icon: '📊', desc: 'Percentage of the job price', rateLabel: 'Percentage', ratePlaceholder: '50' },
  { value: 'manual', label: 'Manual', icon: '✏️', desc: 'You set pay each time', rateLabel: '', ratePlaceholder: '' },
]

export default function InviteTeamMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'lead' | 'worker'>('worker')
  const [payType, setPayType] = useState('')
  const [payRate, setPayRate] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await inviteTeamMember({
      full_name: fullName,
      email,
      phone: phone || undefined,
      role,
      pay_type: payType || undefined,
      pay_rate: payRate ? parseFloat(payRate) : undefined,
    })

    if (result.success) {
      router.push('/dashboard/team')
    } else {
      setError(result.error ?? 'Failed to invite team member')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/team" className="text-[#007AFF] text-sm mb-4 inline-block hover:underline">
        &larr; Back to Team
      </Link>

      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-6">Invite Team Member</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Smith"
            className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {(['worker', 'lead'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  role === r
                    ? 'bg-[#007AFF] text-white border-[#007AFF]'
                    : 'bg-white text-[#1C1C1E] border-[#E5E5EA] hover:border-[#007AFF]/50'
                }`}
              >
                {r === 'worker' ? 'Worker' : 'Lead'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
            How do they get paid?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PAY_TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPayType(opt.value)}
                className={`p-3 rounded-xl text-left transition-all border ${
                  payType === opt.value
                    ? 'bg-[#34C759]/8 border-[#34C759] ring-1 ring-[#34C759]/30'
                    : 'bg-white border-[#E5E5EA] hover:bg-[#F2F2F7]'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-base">{opt.icon}</span>
                  <span className={`text-sm font-semibold ${payType === opt.value ? 'text-[#1C1C1E]' : 'text-[#3C3C43]'}`}>
                    {opt.label}
                  </span>
                </div>
                <p className="text-[10px] text-[#8E8E93] ml-6">{opt.desc}</p>
              </button>
            ))}
          </div>

          {/* Dynamic pay rate input based on selection */}
          {payType && payType !== 'manual' && (() => {
            const selected = PAY_TYPE_OPTIONS.find(o => o.value === payType)
            return (
              <div className="mt-3">
                <label className="block text-xs font-medium text-[#8E8E93] mb-1">
                  {selected?.rateLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">
                    {payType === 'percentage' ? '%' : '$'}
                  </span>
                  <input
                    type="number"
                    step={payType === 'percentage' ? '1' : '0.01'}
                    min="0"
                    max={payType === 'percentage' ? '100' : undefined}
                    value={payRate}
                    onChange={(e) => setPayRate(e.target.value)}
                    placeholder={selected?.ratePlaceholder}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#34C759]/30 focus:bg-white transition-colors"
                  />
                </div>
                {payType === 'per_job' && payRate && (
                  <p className="text-[10px] text-[#8E8E93] mt-1">Worker earns ${payRate} for each completed job</p>
                )}
                {payType === 'hourly' && payRate && (
                  <p className="text-[10px] text-[#8E8E93] mt-1">Worker earns ${payRate}/hr tracked on each job</p>
                )}
                {payType === 'percentage' && payRate && (
                  <p className="text-[10px] text-[#8E8E93] mt-1">Worker earns {payRate}% of each job&apos;s price</p>
                )}
              </div>
            )
          })()}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
          >
            {loading ? 'Inviting...' : 'Invite Team Member'}
          </button>
          <Link
            href="/dashboard/team"
            className="px-6 py-2.5 bg-white text-[#8E8E93] border border-[#E5E5EA] rounded-xl text-sm font-medium hover:text-[#1C1C1E] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  )
}
