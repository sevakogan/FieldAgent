'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { inviteTeamMember } from '@/lib/actions/team'

const PAY_TYPE_OPTIONS = [
  { value: 'per_job', label: 'Per Job' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'manual', label: 'Manual' },
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Pay Type</label>
            <select
              value={payType}
              onChange={(e) => setPayType(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-colors"
            >
              <option value="">Select...</option>
              {PAY_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Pay Rate</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={payRate}
              onChange={(e) => setPayRate(e.target.value)}
              placeholder={payType === 'percentage' ? 'e.g. 50' : 'e.g. 25.00'}
              className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-colors"
            />
          </div>
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
