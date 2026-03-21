'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  getTeamMember,
  updateTeamMember,
  deleteTeamMember,
  type TeamMemberDetail,
} from '@/lib/actions/team'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  lead: 'Lead',
  worker: 'Worker',
}

const ROLE_COLORS: Record<string, string> = {
  owner: '#AF52DE',
  lead: '#007AFF',
  worker: '#34C759',
}

const STATUS_COLORS: Record<string, string> = {
  active: '#34C759',
  invited: '#FF9F0A',
  deactivated: '#8E8E93',
}

const PAY_LABELS: Record<string, string> = {
  per_job: 'Per Job',
  hourly: 'Hourly',
  percentage: 'Percentage',
  manual: 'Manual',
}

const PAY_TYPE_OPTIONS = [
  { value: 'per_job', label: 'Per Job' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'manual', label: 'Manual' },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function TeamMemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const memberId = params.id as string

  const [member, setMember] = useState<TeamMemberDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Edit form state
  const [editRole, setEditRole] = useState('')
  const [editPayType, setEditPayType] = useState('')
  const [editPayRate, setEditPayRate] = useState('')

  const fetchMember = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getTeamMember(memberId)
    if (result.success && result.data) {
      setMember(result.data)
      setEditRole(result.data.role)
      setEditPayType(result.data.pay_type ?? '')
      setEditPayRate(result.data.pay_rate?.toString() ?? '')
    } else {
      setError(result.error ?? 'Failed to load team member')
    }
    setLoading(false)
  }, [memberId])

  useEffect(() => {
    fetchMember()
  }, [fetchMember])

  async function handleSave() {
    if (!member) return
    setSaving(true)
    setActionError(null)

    const result = await updateTeamMember(memberId, {
      role: editRole !== member.role ? editRole : undefined,
      pay_type: editPayType !== (member.pay_type ?? '') ? editPayType || undefined : undefined,
      pay_rate: editPayRate !== (member.pay_rate?.toString() ?? '')
        ? (editPayRate ? parseFloat(editPayRate) : undefined)
        : undefined,
    })

    if (result.success) {
      setEditing(false)
      await fetchMember()
    } else {
      setActionError(result.error ?? 'Failed to update')
    }
    setSaving(false)
  }

  async function handleStatusToggle() {
    if (!member) return
    setSaving(true)
    setActionError(null)

    const newStatus = member.status === 'active' ? 'deactivated' : 'active'
    const result = await updateTeamMember(memberId, { status: newStatus })

    if (result.success) {
      await fetchMember()
    } else {
      setActionError(result.error ?? 'Failed to update status')
    }
    setSaving(false)
  }

  async function handleDelete() {
    setDeleting(true)
    setActionError(null)

    const result = await deleteTeamMember(memberId)
    if (result.success) {
      router.push('/dashboard/team')
    } else {
      setActionError(result.error ?? 'Failed to delete')
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !member) {
    return (
      <div>
        <Link href="/dashboard/team" className="text-[#007AFF] text-sm mb-4 inline-block hover:underline">
          &larr; Back to Team
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error ?? 'Team member not found'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link href="/dashboard/team" className="text-[#007AFF] text-sm mb-4 inline-block hover:underline">
        &larr; Back to Team
      </Link>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {actionError}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ backgroundColor: ROLE_COLORS[member.role] ?? '#8E8E93' }}
              >
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  getInitials(member.full_name)
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1C1C1E]">{member.full_name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: (ROLE_COLORS[member.role] ?? '#8E8E93') + '20',
                      color: ROLE_COLORS[member.role] ?? '#8E8E93',
                    }}
                  >
                    {ROLE_LABELS[member.role] ?? member.role}
                  </span>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium capitalize"
                    style={{
                      backgroundColor: (STATUS_COLORS[member.status] ?? '#8E8E93') + '20',
                      color: STATUS_COLORS[member.status] ?? '#8E8E93',
                    }}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
            </div>

            <h2 className="font-semibold text-[#1C1C1E] mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#8E8E93] mb-0.5">Email</p>
                <p className="text-[#1C1C1E] font-medium">{member.email}</p>
              </div>
              <div>
                <p className="text-[#8E8E93] mb-0.5">Phone</p>
                <p className="text-[#1C1C1E] font-medium">{member.phone ?? '-'}</p>
              </div>
              <div>
                <p className="text-[#8E8E93] mb-0.5">Joined</p>
                <p className="text-[#1C1C1E] font-medium">
                  {new Date(member.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-[#8E8E93] mb-0.5">Total Jobs</p>
                <p className="text-[#1C1C1E] font-medium">{member.recent_jobs_count}</p>
              </div>
            </div>
          </motion.div>

          {/* Pay Info / Edit */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1C1C1E]">Pay Configuration</h2>
              {!editing && member.role !== 'owner' && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-[#007AFF] font-medium hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Role</label>
                  <div className="flex gap-3">
                    {(['worker', 'lead'] as const).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setEditRole(r)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                          editRole === r
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
                      value={editPayType}
                      onChange={(e) => setEditPayType(e.target.value)}
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
                      value={editPayRate}
                      onChange={(e) => setEditPayRate(e.target.value)}
                      placeholder={editPayType === 'percentage' ? 'e.g. 50' : 'e.g. 25.00'}
                      className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditRole(member.role)
                      setEditPayType(member.pay_type ?? '')
                      setEditPayRate(member.pay_rate?.toString() ?? '')
                    }}
                    className="px-5 py-2 text-[#8E8E93] text-sm font-medium hover:text-[#1C1C1E] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#8E8E93] mb-0.5">Pay Type</p>
                  <p className="text-[#1C1C1E] font-medium">
                    {member.pay_type ? (PAY_LABELS[member.pay_type] ?? member.pay_type) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[#8E8E93] mb-0.5">Pay Rate</p>
                  <p className="text-[#1C1C1E] font-medium">
                    {member.pay_rate != null
                      ? member.pay_type === 'percentage'
                        ? `${member.pay_rate}%`
                        : `$${member.pay_rate}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[#8E8E93] mb-0.5">Stripe Payout</p>
                  <p className="text-[#1C1C1E] font-medium">
                    {member.stripe_payout_account_id ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {member.role !== 'owner' && (
                <button
                  onClick={handleStatusToggle}
                  disabled={saving}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50 ${
                    member.status === 'active'
                      ? 'bg-white text-[#FF9F0A] border-[#FF9F0A] hover:bg-[#FF9F0A]/5'
                      : 'bg-white text-[#34C759] border-[#34C759] hover:bg-[#34C759]/5'
                  }`}
                >
                  {saving
                    ? 'Updating...'
                    : member.status === 'active'
                      ? 'Deactivate'
                      : 'Activate'}
                </button>
              )}

              {member.role !== 'owner' && !showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 bg-white text-[#FF3B30] border border-[#FF3B30] rounded-xl text-sm font-medium hover:bg-[#FF3B30]/5 transition-colors"
                >
                  Remove from Team
                </button>
              )}

              {showDeleteConfirm && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700 mb-3">
                    Remove {member.full_name} from the team? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 py-2 bg-[#FF3B30] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {deleting ? 'Removing...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 bg-white text-[#8E8E93] border border-[#E5E5EA] rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
