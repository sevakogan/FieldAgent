'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { inviteTeamMember } from '@/lib/actions/team'
import { Button } from '@/components/platform/Button'

export default function InviteTeamMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'lead' | 'worker'>('worker')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!fullName.trim()) { setError('Full name is required'); setLoading(false); return }
    if (!email.trim()) { setError('Email is required'); setLoading(false); return }

    const result = await inviteTeamMember({
      full_name: fullName,
      email,
      phone: phone || undefined,
      role,
    })

    if (result.success) {
      router.push('/dashboard/team')
    } else {
      setError(result.error ?? 'Failed to invite team member')
      setLoading(false)
    }
  }

  const INPUT = "w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-colors"

  return (
    <div className="max-w-lg">
      <Link href="/dashboard/team" className="text-[#007AFF] text-sm mb-4 inline-block hover:underline">
        &larr; Back to Team
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-[#1C1C1E] mb-6">Invite Team Member</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith" className={INPUT} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com" className={INPUT} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="(305) 555-0100" className={INPUT} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {(['worker', 'lead'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                      role === r
                        ? 'bg-[#007AFF] text-white shadow-sm'
                        : 'bg-[#F2F2F7] text-[#3C3C43] hover:bg-[#E5E5EA]'
                    }`}
                  >
                    {r === 'worker' ? '👷 Worker' : '🏷️ Lead'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hint about pay configuration */}
          <div className="flex items-start gap-3 px-4 py-3 bg-[#007AFF]/5 rounded-xl">
            <span className="text-sm mt-0.5">💡</span>
            <p className="text-xs text-[#3C3C43]">
              <strong>Pay rates are set per property.</strong> After inviting this team member, assign them to properties and configure their pay rate for each service type on the property detail page.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" loading={loading}>
              Invite Team Member
            </Button>
            <Link href="/dashboard/team"
              className="px-6 py-2.5 bg-[#F2F2F7] text-[#8E8E93] rounded-full text-sm font-medium hover:text-[#1C1C1E] transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
