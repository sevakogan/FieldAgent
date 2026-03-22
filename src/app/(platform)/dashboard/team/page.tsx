'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getTeamMembers, inviteTeamMember, type TeamMemberRow } from '@/lib/actions/team'
import { StatusBadge } from '@/components/platform/Badge'
import { Button } from '@/components/platform/Button'

const ROLE_LABELS: Record<string, string> = { owner: 'Owner', lead: 'Lead', worker: 'Worker' }
const ROLE_COLORS: Record<string, string> = { owner: '#AF52DE', lead: '#007AFF', worker: '#34C759' }

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

// ── Compact Invite Popup ─────────────────────────────────────────────
function InvitePopup({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'worker' | 'lead'>('worker')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { setError('Name and email required'); return }
    setSaving(true)
    setError('')
    const result = await inviteTeamMember({ full_name: name, email, phone: phone || undefined, role })
    if (result.success) {
      onInvited()
      onClose()
    } else {
      setError(result.error ?? 'Failed to invite')
      setSaving(false)
    }
  }

  const INPUT = "w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:bg-white"

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="w-[340px] rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.45)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      {/* Header with subtle gradient */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)' }}>
        <div>
          <h3 className="text-[15px] font-semibold text-[#1C1C1E] tracking-tight">Add Team Member</h3>
          <p className="text-[11px] text-[#8E8E93] mt-0.5">Invite a worker or lead</p>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-full bg-[#F2F2F7]/80 hover:bg-[#E5E5EA] flex items-center justify-center transition-colors">
          <svg className="w-3.5 h-3.5 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mx-5 mb-2 px-3 py-2 rounded-xl bg-[#FF3B30]/8 text-[#FF3B30] text-xs font-medium">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
        <div className="space-y-2">
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-2xl text-[14px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25 transition-shadow"
            style={{ background: 'rgba(142, 142, 147, 0.06)', border: '1px solid rgba(0,0,0,0.04)' }} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-2xl text-[14px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25 transition-shadow"
            style={{ background: 'rgba(142, 142, 147, 0.06)', border: '1px solid rgba(0,0,0,0.04)' }} />
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="w-full px-4 py-3 rounded-2xl text-[14px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25 transition-shadow"
            style={{ background: 'rgba(142, 142, 147, 0.06)', border: '1px solid rgba(0,0,0,0.04)' }} />
        </div>

        {/* Role selector */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: 'rgba(142, 142, 147, 0.06)' }}>
          {(['worker', 'lead'] as const).map(r => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                role === r
                  ? 'bg-white text-[#1C1C1E] shadow-sm'
                  : 'text-[#8E8E93] hover:text-[#3C3C43]'
              }`}
              style={role === r ? { boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)' } : undefined}>
              {r === 'worker' ? '👷 Worker' : '🏷️ Lead'}
            </button>
          ))}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={saving}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-2xl text-[15px] font-semibold text-white disabled:opacity-50 transition-all"
          style={{
            background: 'linear-gradient(135deg, #007AFF 0%, #0055D4 100%)',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Inviting...
            </span>
          ) : 'Send Invite'}
        </motion.button>
      </form>
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────
export default function TeamPage() {
  const [members, setMembers] = useState<TeamMemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'lead' | 'worker'>('all')
  const [showInvite, setShowInvite] = useState(false)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getTeamMembers()
    if (result.success && result.data) {
      setMembers(result.data)
    } else {
      setError(result.error ?? 'Failed to load team members')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    const matchesSearch =
      m.full_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone ?? '').toLowerCase().includes(q)
    const matchesRole = roleFilter === 'all' || m.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Team</h1>
        <div className="flex items-center gap-3 relative">
          <Link href="/dashboard/team/payouts"
            className="px-4 py-2 bg-white text-[#007AFF] border border-[#007AFF] rounded-full text-sm font-medium hover:bg-[#007AFF]/5 transition-colors">
            Payouts
          </Link>
          <Button variant="primary" size="sm" onClick={() => setShowInvite(!showInvite)}
            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}>
            Invite
          </Button>

          {/* Inline popup — positioned below the button */}
          <AnimatePresence>
            {showInvite && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <InvitePopup onClose={() => setShowInvite(false)} onInvited={fetchMembers} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <input type="text" placeholder="Search by name, email, or phone..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96 px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
        <div className="flex gap-1.5 bg-white border border-[#E5E5EA] rounded-2xl p-1">
          {(['all', 'lead', 'worker'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                roleFilter === r ? 'bg-[#007AFF] text-white' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}>
              {r === 'all' ? 'All' : ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {!loading && !error && members.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <div className="w-16 h-16 bg-[#F2F2F7] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">No team members yet</h2>
          <p className="text-sm text-[#8E8E93] mb-5">Invite your first worker to get started.</p>
          <Button variant="primary" onClick={() => setShowInvite(true)}>
            Invite Your First Worker
          </Button>
        </motion.div>
      )}

      {!loading && !error && members.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member, i) => (
            <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}>
              <Link href={`/dashboard/team/${member.id}`}
                className="block bg-white rounded-2xl border border-[#E5E5EA] p-5 hover:shadow-md hover:border-[#007AFF]/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                    style={{ backgroundColor: ROLE_COLORS[member.role] ?? '#8E8E93' }}>
                    {getInitials(member.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[#1C1C1E] truncate">{member.full_name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-xl font-medium shrink-0"
                        style={{ backgroundColor: (ROLE_COLORS[member.role] ?? '#8E8E93') + '20', color: ROLE_COLORS[member.role] ?? '#8E8E93' }}>
                        {ROLE_LABELS[member.role] ?? member.role}
                      </span>
                    </div>
                    <p className="text-xs text-[#8E8E93] truncate">{member.email}</p>
                    {member.phone && <p className="text-xs text-[#8E8E93] mt-0.5">{member.phone}</p>}
                  </div>
                  <StatusBadge status={member.status} />
                </div>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-[#8E8E93]">
              No team members match your search.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
