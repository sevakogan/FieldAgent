'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getJob, updateJobStatus, updateJob, deleteJob, getTeamMembers, type JobDetail, type TeamMember } from '@/lib/actions/jobs'
import { getServices, type ServiceRow } from '@/lib/actions/services'
import type { JobStatus } from '@/types/database'
import { StatusBadge } from '@/components/platform/Badge'
import { Button } from '@/components/platform/Button'

const STATUS_LABELS: Record<string, string> = {
  requested: 'Requested',
  approved: 'Approved',
  scheduled: 'Scheduled',
  driving: 'Driving',
  arrived: 'Arrived',
  in_progress: 'In Progress',
  pending_review: 'Pending Review',
  revision_needed: 'Revision Needed',
  completed: 'Completed',
  charged: 'Charged',
  cancelled: 'Cancelled',
}

const STATUS_FLOW: Record<string, string[]> = {
  requested: ['approved', 'cancelled'],
  approved: ['scheduled', 'cancelled'],
  scheduled: ['driving', 'in_progress', 'cancelled'],
  driving: ['arrived', 'cancelled'],
  arrived: ['in_progress', 'cancelled'],
  in_progress: ['pending_review', 'completed', 'cancelled'],
  pending_review: ['completed', 'revision_needed'],
  revision_needed: ['in_progress', 'cancelled'],
  completed: ['charged'],
  charged: [],
  cancelled: [],
}

/** Maps each status to a primary workflow action with label and color */
const WORKFLOW_ACTIONS: Record<string, { label: string; targetStatus: string; variant: 'primary' | 'success' | 'warning' | 'purple' | 'danger' }> = {
  scheduled: { label: '▶ Start Job', targetStatus: 'in_progress', variant: 'success' },
  approved: { label: '▶ Start Job', targetStatus: 'in_progress', variant: 'success' },
  driving: { label: '✓ Complete Job', targetStatus: 'completed', variant: 'success' },
  arrived: { label: '✓ Complete Job', targetStatus: 'completed', variant: 'success' },
  in_progress: { label: '✓ Complete Job', targetStatus: 'completed', variant: 'success' },
  pending_review: { label: '✓ Approve', targetStatus: 'completed', variant: 'success' },
  revision_needed: { label: '▶ Restart', targetStatus: 'in_progress', variant: 'primary' },
}

const WORKFLOW_SECONDARY: Record<string, { label: string; targetStatus: string; variant: 'primary' | 'success' | 'warning' | 'purple' | 'danger' }> = {
  pending_review: { label: 'Request Revision', targetStatus: 'revision_needed', variant: 'warning' },
}

const STATUS_PILL_COLORS: Record<string, { active: string; inactive: string }> = {
  scheduled: { active: 'bg-[#007AFF] text-white', inactive: 'bg-[#007AFF]/10 text-[#007AFF]' },
  driving: { active: 'bg-[#5AC8FA] text-white', inactive: 'bg-[#5AC8FA]/10 text-[#2E8EB8]' },
  arrived: { active: 'bg-[#FF9F0A] text-white', inactive: 'bg-[#FF9F0A]/12 text-[#CC7F08]' },
  in_progress: { active: 'bg-[#007AFF] text-white', inactive: 'bg-[#007AFF]/10 text-[#007AFF]' },
  pending_review: { active: 'bg-[#AF52DE] text-white', inactive: 'bg-[#AF52DE]/10 text-[#AF52DE]' },
  revision_needed: { active: 'bg-[#FF3B30] text-white', inactive: 'bg-[#FF3B30]/10 text-[#FF3B30]' },
  completed: { active: 'bg-[#34C759] text-white', inactive: 'bg-[#34C759]/10 text-[#248A3D]' },
  charged: { active: 'bg-[#34C759] text-white', inactive: 'bg-[#34C759]/10 text-[#248A3D]' },
  cancelled: { active: 'bg-[#8E8E93] text-white', inactive: 'bg-[#8E8E93]/10 text-[#636366]' },
  requested: { active: 'bg-[#8E8E93] text-white', inactive: 'bg-[#8E8E93]/10 text-[#636366]' },
  approved: { active: 'bg-[#5AC8FA] text-white', inactive: 'bg-[#5AC8FA]/10 text-[#2E8EB8]' },
}

// ── Collapsible Card ────────────────────────────────────────────────────
function CollapsibleCard({ title, icon, children, defaultOpen = true, delay = 0, externalOpen }: {
  title: string; icon?: string; children: React.ReactNode; defaultOpen?: boolean; delay?: number; externalOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  // Allow parent to collapse
  useEffect(() => {
    if (externalOpen !== undefined) setOpen(externalOpen)
  }, [externalOpen])
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#F2F2F7]/50 transition-colors"
      >
        <h2 className="text-sm font-bold text-[#1C1C1E] flex items-center gap-1.5">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        <motion.svg
          className="w-4 h-4 text-[#C7C7CC]"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Tasks List (clickable to complete) ───────────────────────────────────
function TasksList({ job, onUpdate }: { job: JobDetail; onUpdate: () => void }) {
  const [completing, setCompleting] = useState<string | null>(null)

  const checklistItems: [string, boolean][] = job.checklist_results
    ? Object.entries(job.checklist_results).map(([k, v]) => [k, Boolean(v)])
    : ((job.service_checklist_items as string[]) ?? []).map((item) => [item, false])

  if (checklistItems.length === 0) {
    return <p className="text-sm text-[#8E8E93] italic">No tasks defined. Add checklist items in Services.</p>
  }

  async function toggleTask(taskName: string, currentDone: boolean) {
    setCompleting(taskName)
    const current = (job.checklist_results ?? {}) as Record<string, boolean>
    const updated = { ...current, [taskName]: !currentDone }
    await updateJob(job.id, { checklist_results: updated } as Parameters<typeof updateJob>[1])
    onUpdate()
    setCompleting(null)
  }

  return (
    <div className="space-y-1">
      {checklistItems.map(([name, done]) => (
        <button
          key={name}
          onClick={() => toggleTask(name, done)}
          disabled={completing === name}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
            done ? 'bg-[#34C759]/8' : 'hover:bg-[#F2F2F7] active:bg-[#E5E5EA]'
          } ${completing === name ? 'opacity-50' : ''}`}
        >
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
            done ? 'bg-[#34C759] border-[#34C759]' : 'border-[#D1D1D6]'
          }`}>
            {done && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <span className={`text-sm font-medium ${done ? 'text-[#8E8E93] line-through' : 'text-[#1C1C1E]'}`}>
            {name}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Water Chemistry Form (pool services) ────────────────────────────────
const POOL_FIELDS = [
  { key: 'ph', label: 'pH Level', placeholder: '7.2-7.8', unit: '' },
  { key: 'chlorine_free', label: 'Free Chlorine', placeholder: '1-3', unit: 'ppm' },
  { key: 'chlorine_total', label: 'Total Chlorine', placeholder: '1-5', unit: 'ppm' },
  { key: 'alkalinity', label: 'Alkalinity', placeholder: '80-120', unit: 'ppm' },
  { key: 'calcium', label: 'Calcium Hardness', placeholder: '200-400', unit: 'ppm' },
  { key: 'cya', label: 'CYA (Stabilizer)', placeholder: '30-50', unit: 'ppm' },
  { key: 'water_temp', label: 'Water Temp', placeholder: '78', unit: '°F' },
]

function WaterChemistryForm({ jobId, existingData, allCustomFields, onCollapse }: { jobId: string; existingData: Record<string, string> | null; allCustomFields?: Record<string, unknown>; onSave: () => void; onCollapse?: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(existingData ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    // Merge with existing custom_field_values to preserve _expenses
    const merged = { ...(allCustomFields ?? {}), ...values }
    await updateJob(jobId, { custom_field_values: merged } as Parameters<typeof updateJob>[1])
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); onCollapse?.() }, 800)
  }

  return (
    <div>
      <div className="space-y-1.5">
        {POOL_FIELDS.map(f => (
          <div key={f.key} className="flex items-center gap-2">
            <span className="text-[10px] text-[#8E8E93] w-20 shrink-0 text-right">{f.label}</span>
            <input
              type="text"
              value={values[f.key] ?? ''}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="flex-1 px-2 py-1 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#5AC8FA]/40 max-w-[100px]"
            />
            {f.unit && <span className="text-[9px] text-[#C7C7CC] w-6">{f.unit}</span>}
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-2 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#5AC8FA] text-white hover:bg-[#4AB8EA] transition-colors disabled:opacity-50"
      >
        {saving ? '...' : saved ? '✓' : 'Save'}
      </button>
    </div>
  )
}

// ── Expense Section ─────────────────────────────────────────────────────
function ExpenseSection({ jobId, existingTotal, existingExpenses, allCustomFields }: { jobId: string; existingTotal: number; existingExpenses?: Array<{ description: string; amount: number }>; allCustomFields?: Record<string, unknown>; onUpdate: () => void }) {
  const [showAdd, setShowAdd] = useState(false)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [adding, setAdding] = useState(false)
  const [expenses, setExpenses] = useState<Array<{ description: string; amount: number }>>(existingExpenses ?? [])
  const [runningTotal, setRunningTotal] = useState(existingTotal)

  async function handleAdd() {
    const amt = parseFloat(amount)
    if (!desc.trim() || isNaN(amt) || amt <= 0) return
    setAdding(true)

    const autoApproved = amt < 30
    const newExpenses = [...expenses, { description: desc, amount: amt }]
    setExpenses(newExpenses)

    const newTotal = runningTotal + amt
    setRunningTotal(newTotal)

    // Merge expenses into existing custom_field_values — no page refresh
    const merged = { ...(allCustomFields ?? {}), _expenses: newExpenses }
    await updateJob(jobId, {
      expenses_total: newTotal,
      custom_field_values: merged,
    } as Parameters<typeof updateJob>[1])

    setDesc('')
    setAmount('')
    setShowAdd(false)
    setAdding(false)

    if (!autoApproved) {
      alert(`Expense of $${amt.toFixed(2)} requires owner approval (over $30).`)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF9F0A]/15 text-[#CC7F08] hover:bg-[#FF9F0A]/25 transition-all"
        >
          + Add Expense
        </button>
      </div>

      {expenses.length > 0 && (
        <div className="space-y-1 mb-2">
          {expenses.map((exp, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-[#1C1C1E]">{exp.description} — <span className="font-bold">${exp.amount.toFixed(2)}</span></span>
              {exp.amount < 30 && <span className="text-[8px] text-[#34C759] font-bold">AUTO ✓</span>}
            </div>
          ))}
          <div className="border-t border-[#E5E5EA] pt-1 mt-1 flex justify-between text-xs">
            <span className="text-[#8E8E93]">Total</span>
            <span className="font-bold text-[#1C1C1E]">${runningTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      {runningTotal > 0 && expenses.length === 0 && (
        <p className="text-xs text-[#8E8E93]">Total: ${runningTotal.toFixed(2)}</p>
      )}

      {showAdd && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
          <div className="border border-[#E5E5EA] rounded-xl p-3 space-y-2">
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What was it? (e.g. Chlorine)"
              className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9F0A]/30"
            />
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8E8E93]">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-6 pr-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9F0A]/30"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={adding || !desc.trim() || !amount}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#FF9F0A] text-white hover:bg-[#E68F09] disabled:opacity-50 transition-colors"
              >
                {adding ? '...' : 'Add'}
              </button>
              <button
                onClick={() => { setShowAdd(false); setDesc(''); setAmount('') }}
                className="px-3 py-2 rounded-lg text-xs text-[#8E8E93] hover:bg-[#F2F2F7]"
              >
                Cancel
              </button>
            </div>
            <p className="text-[10px] text-[#8E8E93]">Under $30 = auto-approved. Over $30 requires owner approval.</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showCancelPopup, setShowCancelPopup] = useState(false)
  const [cancelNote, setCancelNote] = useState('')
  const [cancelRescheduleDate, setCancelRescheduleDate] = useState('')
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [waterChemOpen, setWaterChemOpen] = useState(true)

  // Edit state
  const [editPrice, setEditPrice] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editServiceTypeId, setEditServiceTypeId] = useState('')
  const [editWorkerId, setEditWorkerId] = useState('')
  const [editStatus, setEditStatus] = useState('')

  // Dropdown data for edit mode
  const [services, setServices] = useState<ServiceRow[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)

  const fetchJob = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getJob(jobId)
    if (result.success && result.data) {
      setJob(result.data)
      setEditPrice(String(result.data.price))
      setEditDate(result.data.scheduled_date)
      setEditTime(result.data.scheduled_time ?? '')
      setEditServiceTypeId(result.data.service_type_id)
      setEditWorkerId(result.data.assigned_worker_id ?? '')
      setEditStatus(result.data.status)
    } else {
      setError(result.error ?? 'Failed to load job')
    }
    setLoading(false)
  }, [jobId])

  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  async function loadDropdowns() {
    setLoadingDropdowns(true)
    const [svcResult, memberResult] = await Promise.all([
      getServices(),
      getTeamMembers(),
    ])
    if (svcResult.success && svcResult.data) setServices(svcResult.data)
    if (memberResult.success && memberResult.data) setMembers(memberResult.data)
    setLoadingDropdowns(false)
  }

  function handleStartEditing() {
    setEditing(true)
    if (services.length === 0) {
      loadDropdowns()
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!job) return
    setUpdating(true)
    const result = await updateJobStatus(jobId, newStatus)
    if (result.success) {
      setJob({ ...job, status: newStatus as JobStatus })
      setEditStatus(newStatus)
    } else {
      setError(result.error ?? 'Failed to update status')
    }
    setUpdating(false)
  }

  async function handleSaveEdit() {
    if (!job) return
    setUpdating(true)
    const price = parseFloat(editPrice)
    if (isNaN(price) || price < 0) {
      setError('Invalid price')
      setUpdating(false)
      return
    }

    const result = await updateJob(jobId, {
      price,
      scheduled_date: editDate,
      scheduled_time: editTime || null,
      service_type_id: editServiceTypeId,
      assigned_worker_id: editWorkerId || null,
      status: editStatus,
    })

    if (result.success) {
      // Re-fetch to get updated relations (service name, worker name, etc.)
      await fetchJob()
      setEditing(false)
    } else {
      setError(result.error ?? 'Failed to update job')
    }
    setUpdating(false)
  }

  // Delete removed from Beta V1 — only cancel with reschedule

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !job) {
    return (
      <div>
        <Link href="/dashboard/jobs" className="text-[#007AFF] text-sm mb-4 inline-block">&larr; Back to Jobs</Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      </div>
    )
  }

  if (!job) return null

  const nextStatuses = STATUS_FLOW[job.status] ?? []
  const fullAddress = [job.address_street, job.address_unit, job.address_city, job.address_state, job.address_zip]
    .filter(Boolean)
    .join(', ')

  const primaryAction = WORKFLOW_ACTIONS[job.status]
  const secondaryAction = WORKFLOW_SECONDARY[job.status]
  const isTerminal = job.status === 'completed' || job.status === 'charged' || job.status === 'cancelled'

  return (
    <div>
      <Link href="/dashboard/jobs" className="text-[#007AFF] text-sm mb-2 inline-block">&larr; Jobs</Link>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Job Details</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {primaryAction && !isTerminal && (
            <Button
              variant={primaryAction.variant}
              onClick={() => {
                if (primaryAction.targetStatus === 'completed') {
                  setShowCompleteConfirm(true)
                } else {
                  handleStatusChange(primaryAction.targetStatus)
                }
              }}
              disabled={updating}
              loading={updating}
            >
              {primaryAction.label}
            </Button>
          )}
          {!isTerminal && nextStatuses.includes('cancelled') && (
            <Button variant="danger" size="sm" onClick={() => setShowCancelPopup(true)} disabled={updating}>
              Cancel
            </Button>
          )}
          <StatusBadge status={job.status} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Details card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1C1C1E]">Details</h2>
              {!editing && !isTerminal && (
                <button
                  onClick={handleStartEditing}
                  className="text-[#007AFF] text-sm font-medium hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-5">
                {loadingDropdowns ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Service Type — pill buttons */}
                    <div>
                      <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Service Type</label>
                      {services.length === 0 ? (
                        <p className="text-xs text-[#8E8E93]">No services available</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {services.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setEditServiceTypeId(s.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                                editServiceTypeId === s.id
                                  ? 'bg-[#007AFF]/10 text-[#007AFF] font-semibold ring-1 ring-[#007AFF]/20'
                                  : 'bg-[#F2F2F7]/60 text-[#3C3C43] hover:bg-[#E5E5EA]/60'
                              }`}
                            >
                              {s.name}
                              <span className="text-[10px] opacity-60">${Number(s.default_price).toFixed(0)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Worker — avatar pill buttons */}
                    <div>
                      <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
                        Assign Worker <span className="text-[#8E8E93] font-normal">(optional)</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditWorkerId('')}
                          className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                            editWorkerId === ''
                              ? 'bg-[#8E8E93]/15 text-[#1C1C1E] font-medium'
                              : 'bg-[#F2F2F7]/60 text-[#8E8E93] hover:bg-[#E5E5EA]/60'
                          }`}
                        >
                          Unassigned
                        </button>
                        {members.map((m) => (
                          <button
                            key={m.member_id}
                            type="button"
                            onClick={() => setEditWorkerId(m.member_id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                              editWorkerId === m.member_id
                                ? 'bg-[#007AFF]/10 text-[#007AFF] font-semibold ring-1 ring-[#007AFF]/20'
                                : 'bg-[#F2F2F7]/60 text-[#3C3C43] hover:bg-[#E5E5EA]/60'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-[#34C759] flex items-center justify-center text-white text-[8px] font-bold shrink-0">
                              {m.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                            </span>
                            {m.full_name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status — pill buttons with colors */}
                    <div>
                      <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Status</label>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(STATUS_LABELS).map(([key, label]) => {
                          const colors = STATUS_PILL_COLORS[key] ?? { active: 'bg-[#8E8E93] text-white', inactive: 'bg-[#8E8E93]/10 text-[#636366]' }
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setEditStatus(key)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                editStatus === key ? colors.active : colors.inactive + ' hover:opacity-80'
                              }`}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#8E8E93] mb-1">Scheduled Date</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#8E8E93] mb-1">Time</label>
                        <input
                          type="time"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs text-[#8E8E93] mb-1">Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                        />
                      </div>
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={updating}
                        loading={updating}
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditing(false)
                          setEditPrice(String(job.price))
                          setEditDate(job.scheduled_date)
                          setEditTime(job.scheduled_time ?? '')
                          setEditServiceTypeId(job.service_type_id)
                          setEditWorkerId(job.assigned_worker_id ?? '')
                          setEditStatus(job.status)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {/* Address — compact with maps link */}
                <div className="flex items-center justify-between">
                  <span className="text-[#8E8E93]">📍</span>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[#007AFF] font-medium hover:underline flex-1 ml-2 truncate">{fullAddress}</a>
                </div>
                {/* Service + Date/Time on one row */}
                <div className="flex items-center gap-3">
                  <span className="text-[#1C1C1E] font-semibold">{job.service_name}</span>
                  <span className="text-[#8E8E93]">·</span>
                  <span className="text-[#636366]">{new Date(job.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  {job.scheduled_time && <span className="text-[#636366]">{job.scheduled_time}</span>}
                </div>
                {/* Client + phone */}
                {(job.client_name || job.client_phone) && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#1C1C1E] font-medium">{job.client_name ?? 'Client'}</span>
                    {job.client_phone && (
                      <a href={`tel:${job.client_phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#34C759]/10 text-[#34C759] font-bold text-xs hover:bg-[#34C759]/20 transition-all">
                        📞 {job.client_phone}
                      </a>
                    )}
                  </div>
                )}
                {/* Worker */}
                <div className="text-[#8E8E93]">Worker: <span className="text-[#1C1C1E] font-medium">{job.worker_name ?? 'You'}</span></div>
              </div>
            )}
          </motion.div>

          {/* Tasks — collapsible, clickable to complete */}
          <CollapsibleCard title="Tasks" icon="✅" delay={0.1}>
            <TasksList job={job} onUpdate={fetchJob} />
          </CollapsibleCard>

          {/* Water Chemistry — for pool services */}
          {job.service_name?.toLowerCase().includes('pool') && (
            <CollapsibleCard title="Water Chemistry" icon="💧" delay={0.15} externalOpen={waterChemOpen}>
              <WaterChemistryForm jobId={jobId} existingData={job.custom_field_values as Record<string, string> | null} allCustomFields={job.custom_field_values as Record<string, unknown> | undefined} onSave={fetchJob} onCollapse={() => setWaterChemOpen(false)} />
            </CollapsibleCard>
          )}

          {/* Photos */}
          <CollapsibleCard title="Photos" icon="📸" delay={0.2}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#8E8E93]">Date, time & GPS auto-captured</p>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#007AFF] text-white hover:bg-[#0066DD] transition-all">
                + Add Photo
              </button>
            </div>
          </CollapsibleCard>

          {/* Expenses */}
          <CollapsibleCard title="Expenses" icon="💰" delay={0.25}>
            <ExpenseSection jobId={jobId} existingTotal={Number(job.expenses_total)} existingExpenses={((job.custom_field_values as Record<string, unknown>)?._expenses as Array<{ description: string; amount: number }>) ?? []} allCustomFields={job.custom_field_values as Record<string, unknown> | undefined} onUpdate={fetchJob} />
          </CollapsibleCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing — default minimized */}
          <CollapsibleCard title="Pricing" icon="💲" defaultOpen={false} delay={0.1}>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Service</span>
                <span className="text-[#1C1C1E]">${Number(job.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Expenses</span>
                <span className="text-[#1C1C1E]">${Number(job.expenses_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Tax</span>
                <span className="text-[#1C1C1E]">${Number(job.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Tip</span>
                <span className="text-[#34C759]">${Number(job.tip_amount).toFixed(2)}</span>
              </div>
              {job.total_charged !== null && (
                <div className="border-t border-[#E5E5EA] pt-2 flex justify-between font-semibold">
                  <span className="text-[#1C1C1E]">Total Charged</span>
                  <span className="text-[#1C1C1E]">${Number(job.total_charged).toFixed(2)}</span>
                </div>
              )}
            </div>
          </CollapsibleCard>

          {/* Actions — primary + cancel with popup */}
          {!isTerminal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              {primaryAction && (
                <Button
                  variant={primaryAction.variant}
                  onClick={() => {
                    if (primaryAction.targetStatus === 'completed') {
                      setShowCompleteConfirm(true)
                    } else {
                      handleStatusChange(primaryAction.targetStatus)
                    }
                  }}
                  disabled={updating}
                  loading={updating}
                  className="w-full"
                >
                  {primaryAction.label}
                </Button>
              )}

              {secondaryAction && (
                <Button
                  variant={secondaryAction.variant}
                  onClick={() => handleStatusChange(secondaryAction.targetStatus)}
                  disabled={updating}
                  className="w-full"
                >
                  {secondaryAction.label}
                </Button>
              )}

              {nextStatuses.includes('cancelled') && (
                <Button
                  variant="danger"
                  onClick={() => setShowCancelPopup(true)}
                  disabled={updating}
                  className="w-full"
                >
                  Cancel Job
                </Button>
              )}
            </motion.div>
          )}

          {/* Cancel Popup */}
          <AnimatePresence>
            {showCancelPopup && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4"
                onClick={() => setShowCancelPopup(false)}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm rounded-3xl p-5"
                  style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(40px)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
                  <h3 className="text-base font-bold text-[#1C1C1E] mb-4">Cancel Job</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-[#1C1C1E] mb-1 block">Reason</label>
                      <textarea
                        value={cancelNote}
                        onChange={(e) => setCancelNote(e.target.value)}
                        placeholder="Why is this job being cancelled?"
                        rows={2}
                        className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/30 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#1C1C1E] mb-1 block">Reschedule to (optional)</label>
                      <input
                        type="date"
                        value={cancelRescheduleDate}
                        onChange={(e) => setCancelRescheduleDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/30"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={async () => {
                        setUpdating(true)
                        if (cancelRescheduleDate) {
                          await updateJob(jobId, { scheduled_date: cancelRescheduleDate, cancellation_reason: cancelNote || 'Rescheduled' })
                        } else {
                          await updateJobStatus(jobId, 'cancelled')
                          if (cancelNote) await updateJob(jobId, { cancellation_reason: cancelNote })
                        }
                        setShowCancelPopup(false)
                        setCancelNote('')
                        setCancelRescheduleDate('')
                        await fetchJob()
                        setUpdating(false)
                      }}
                      disabled={updating}
                      className="flex-1 py-2.5 bg-[#FF3B30] text-white rounded-xl text-xs font-bold hover:bg-[#E0352B] transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Saving...' : cancelRescheduleDate ? 'Reschedule' : 'Cancel Job'}
                    </button>
                    <button
                      onClick={() => { setShowCancelPopup(false); setCancelNote(''); setCancelRescheduleDate('') }}
                      className="flex-1 py-2.5 bg-[#F2F2F7] text-[#1C1C1E] rounded-xl text-xs font-semibold hover:bg-[#E5E5EA] transition-colors"
                    >
                      Keep Job
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Complete Job Confirmation */}
          <AnimatePresence>
            {showCompleteConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4"
                onClick={() => setShowCompleteConfirm(false)}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-xs rounded-3xl p-5 text-center"
                  style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(40px)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
                  <div className="w-12 h-12 rounded-full bg-[#34C759]/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✓</span>
                  </div>
                  <h3 className="text-base font-bold text-[#1C1C1E] mb-1">Complete this job?</h3>
                  <p className="text-xs text-[#8E8E93] mb-4">This will mark the job as completed and notify the client.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setShowCompleteConfirm(false)
                        await handleStatusChange('completed')
                      }}
                      disabled={updating}
                      className="flex-1 py-2.5 bg-[#34C759] text-white rounded-xl text-xs font-bold hover:bg-[#2DB84E] transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Completing...' : 'Complete'}
                    </button>
                    <button
                      onClick={() => setShowCompleteConfirm(false)}
                      className="flex-1 py-2.5 bg-[#F2F2F7] text-[#1C1C1E] rounded-xl text-xs font-semibold hover:bg-[#E5E5EA] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Sticky Bottom Action Bar (mobile) ── */}
      {!isTerminal && (
        <div className="fixed bottom-[84px] md:bottom-4 left-0 right-0 z-40 px-4 md:hidden">
          <div className="flex flex-col gap-2 p-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', boxShadow: '0 -4px 24px rgba(0,0,0,0.1)' }}>
            {primaryAction && (
              <button
                onClick={() => {
                  if (primaryAction.targetStatus === 'completed') setShowCompleteConfirm(true)
                  else handleStatusChange(primaryAction.targetStatus)
                }}
                disabled={updating}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-[#34C759] text-white hover:bg-[#2DB84E] disabled:opacity-50 transition-all"
              >
                {updating ? '...' : primaryAction.label}
              </button>
            )}
            {nextStatuses.includes('cancelled') && (
              <button
                onClick={() => setShowCancelPopup(true)}
                className="w-full py-3 rounded-xl text-sm font-bold bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20 transition-all"
              >
                Cancel Job
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
