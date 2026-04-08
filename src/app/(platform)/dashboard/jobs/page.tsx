'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getJobs, updateJobStatus, updateJob, getTeamMembers, type JobRow, type TeamMember } from '@/lib/actions/jobs'
import { DatePicker } from '@/components/platform/DatePicker'
import { StatusBadge } from '@/components/platform/Badge'
import { Button } from '@/components/platform/Button'

// ── Constants ─────────────────────────────────────────────────────────────

const STATUSES = ['all', 'scheduled', 'in_progress', 'pending_review', 'completed', 'cancelled'] as const

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  pending_review: 'Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_DOT_COLORS: Record<string, string> = {
  scheduled: 'bg-[#007AFF]',
  driving: 'bg-[#5AC8FA]',
  arrived: 'bg-[#FF9F0A]',
  in_progress: 'bg-[#007AFF]',
  pending_review: 'bg-[#AF52DE]',
  completed: 'bg-[#34C759]',
  charged: 'bg-[#34C759]',
  cancelled: 'bg-[#8E8E93]',
  requested: 'bg-[#8E8E93]',
  approved: 'bg-[#5AC8FA]',
  revision_needed: 'bg-[#FF3B30]',
}

const STATUS_BORDER_COLORS: Record<string, string> = {
  scheduled: 'border-l-[#007AFF]',
  driving: 'border-l-[#5AC8FA]',
  arrived: 'border-l-[#FF9F0A]',
  in_progress: 'border-l-[#007AFF]',
  pending_review: 'border-l-[#AF52DE]',
  completed: 'border-l-[#34C759]',
  charged: 'border-l-[#34C759]',
  cancelled: 'border-l-[#8E8E93]',
  requested: 'border-l-[#8E8E93]',
  approved: 'border-l-[#5AC8FA]',
  revision_needed: 'border-l-[#FF3B30]',
}

const PACIFIC_TZ = 'America/Los_Angeles'

// ── Calendar helpers (identical to calendar page) ─────────────────────────

const COLORS = [
  { bg: '#007AFF', light: 'rgba(0,122,255,0.10)', text: '#0055B3' },
  { bg: '#AF52DE', light: 'rgba(175,82,222,0.10)', text: '#8B44B8' },
  { bg: '#FF9F0A', light: 'rgba(255,159,10,0.12)', text: '#CC7F08' },
  { bg: '#34C759', light: 'rgba(52,199,89,0.10)', text: '#248A3D' },
  { bg: '#FF2D55', light: 'rgba(255,45,85,0.10)', text: '#D62246' },
  { bg: '#5AC8FA', light: 'rgba(90,200,250,0.12)', text: '#2E8EB8' },
  { bg: '#FFD60A', light: 'rgba(255,214,10,0.14)', text: '#8B7500' },
  { bg: '#5856D6', light: 'rgba(88,86,214,0.10)', text: '#4745AB' },
]

function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function getColor(name: string) { return COLORS[hashStr(name) % COLORS.length] }
function fmtDateKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function getTodayKey() { return new Date().toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ }) }
function fmtTime(t: string | null) { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h, 10); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}` }

function getServiceIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('clean') || n.includes('turnover')) return '🧹'
  if (n.includes('pool')) return '🏊'
  if (n.includes('lawn') || n.includes('grass')) return '🌿'
  if (n.includes('plumb')) return '🔧'
  if (n.includes('handyman')) return '🛠️'
  if (n.includes('laundry') || n.includes('linen')) return '🧺'
  if (n.includes('inspect')) return '🔍'
  if (n.includes('deep')) return '✨'
  return '⚙️'
}

function getPacificToday(): Date {
  const now = new Date()
  const pacificStr = now.toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ })
  return new Date(pacificStr + 'T00:00:00')
}

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${mStr} ${ampm}`
}

// ── Call Dropdown Component ───────────────────────────────────────────────

function CallDropdown({
  phone,
  onClose,
}: {
  phone: string | null
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const disabled = !phone

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 bottom-full mb-1 z-50 w-52 glass-elevated rounded-xl shadow-lg border border-[#E5E5EA] overflow-hidden"
    >
      <button
        disabled
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#8E8E93] cursor-not-allowed"
      >
        <span className="text-base">📞</span>
        <span>Call via Dialer</span>
        <span className="ml-auto text-[10px] bg-[#F2F2F7] text-[#8E8E93] px-1.5 py-0.5 rounded-full">Soon</span>
      </button>
      <div className="border-t border-[#E5E5EA]" />
      {disabled ? (
        <button
          disabled
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#C7C7CC] cursor-not-allowed"
        >
          <span className="text-base opacity-40">📱</span>
          <span>No phone on file</span>
        </button>
      ) : (
        <a
          href={`tel:${phone}`}
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#1C1C1E] hover:bg-[#F2F2F7] transition-colors"
        >
          <span className="text-base">📱</span>
          <span>Call from Phone</span>
        </a>
      )}
      <div className="border-t border-[#E5E5EA]" />
      {disabled ? (
        <button
          disabled
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#C7C7CC] cursor-not-allowed"
        >
          <span className="text-base opacity-40">💬</span>
          <span>No phone on file</span>
        </button>
      ) : (
        <a
          href={`sms:${phone}`}
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#1C1C1E] hover:bg-[#F2F2F7] transition-colors"
        >
          <span className="text-base">💬</span>
          <span>Text</span>
        </a>
      )}
    </motion.div>
  )
}

// ── Job Card Component ────────────────────────────────────────────────────

function JobCard({
  job,
  onStart,
  onSkip,
  isStarting,
  onClick,
  members,
  onAssign,
}: {
  job: JobRow
  onStart: (e: React.MouseEvent) => void
  onSkip: (e: React.MouseEvent) => void
  isStarting: boolean
  onClick: () => void
  members: TeamMember[]
  onAssign: (jobId: string, memberId: string | null) => void
}) {
  const [showCall, setShowCall] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const assignRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showAssign) return
    function handleClickOutside(e: MouseEvent) {
      if (assignRef.current && !assignRef.current.contains(e.target as Node)) {
        setShowAssign(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAssign])

  const dotColor = STATUS_DOT_COLORS[job.status] ?? 'bg-[#8E8E93]'
  const borderColor = STATUS_BORDER_COLORS[job.status] ?? 'border-l-[#8E8E93]'

  const fullAddress = `${job.address_street}${job.address_city ? `, ${job.address_city}` : ''}`
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-3 hover:shadow-md transition-all group cursor-pointer border-l-3 ${borderColor}`}
      onClick={onClick}
    >
      {/* Row 1: Time + dot + address */}
      <div className="flex items-start gap-2.5">
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {job.scheduled_time && (
            <span className="text-xs font-medium text-[#636366] w-16 text-right tabular-nums">
              {formatTime12h(job.scheduled_time)}
            </span>
          )}
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1C1C1E] truncate group-hover:text-[#007AFF] transition-colors">
            {fullAddress}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <p className="text-xs text-[#8E8E93] truncate">
              {job.service_name}
              {job.client_name ? ` · ${job.client_name}` : ''}
            </p>
            {/* Assign worker button */}
            <div className="relative shrink-0" ref={assignRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowAssign(!showAssign) }}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                  job.worker_name
                    ? 'bg-[#34C759]/10 text-[#248A3D] hover:bg-[#34C759]/20'
                    : 'bg-[#FF9F0A]/10 text-[#CC7F08] hover:bg-[#FF9F0A]/20'
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {job.worker_name ?? 'Assign'}
              </button>
              <AnimatePresence>
                {showAssign && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-1 z-50 w-48 glass-elevated rounded-xl shadow-lg border border-[#E5E5EA] overflow-hidden"
                  >
                    <div className="px-3 py-2 text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider border-b border-[#E5E5EA]/40">
                      Assign Worker
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAssign(job.id, null); setShowAssign(false) }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[#F2F2F7] ${
                        !job.assigned_worker_id ? 'text-[#007AFF] font-medium' : 'text-[#8E8E93]'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[10px]">—</span>
                      Unassigned
                    </button>
                    {members.map((m) => (
                      <button
                        key={m.member_id}
                        onClick={(e) => { e.stopPropagation(); onAssign(job.id, m.member_id); setShowAssign(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[#F2F2F7] ${
                          job.assigned_worker_id === m.member_id ? 'text-[#007AFF] font-medium' : 'text-[#1C1C1E]'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          m.is_current_user ? 'bg-[#007AFF]/15 text-[#007AFF]' : 'bg-[#34C759]/15 text-[#248A3D]'
                        }`}>
                          {m.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                        {m.is_current_user ? `Yourself` : m.full_name}
                        {job.assigned_worker_id === m.member_id && (
                          <svg className="w-4 h-4 ml-auto text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Price + status */}
      <div className="flex items-center justify-between mt-2 pl-[calc(4rem+0.625rem+0.5rem+0.5rem)]">
        <span className="text-sm font-semibold text-[#1C1C1E]">
          ${Number(job.price).toFixed(2)}
        </span>
        <StatusBadge status={job.status} />
      </div>

      {/* Row 3: Action buttons — always visible for scheduled jobs */}
      {(job.status === 'scheduled' || job.status === 'approved') && (
        <div className="flex items-center gap-2 mt-2.5 pl-[calc(4rem+0.625rem+0.5rem+0.5rem)]">
          {/* Drive — opens Google Maps navigation */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#007AFF] text-white hover:bg-[#0066DD] active:scale-[0.97] transition-all shadow-sm min-w-[72px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Drive
          </a>

          {/* Start — changes status to in_progress */}
          <button
            onClick={(e) => { e.stopPropagation(); onStart(e) }}
            disabled={isStarting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#34C759] text-white hover:bg-[#2DB84E] active:scale-[0.97] disabled:opacity-50 transition-all shadow-sm min-w-[72px]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {isStarting ? '...' : 'Start'}
          </button>

          {/* Skip — opens skip modal */}
          <button
            onClick={(e) => { e.stopPropagation(); onSkip(e) }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF9F0A]/15 text-[#CC7F08] hover:bg-[#FF9F0A]/25 active:scale-[0.97] transition-all min-w-[64px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Skip
          </button>

          {/* Phone — contact client */}
          {job.client_phone && (
            <div className="relative ml-auto">
              <button
                onClick={(e) => { e.stopPropagation(); setShowCall(!showCall) }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm text-[#007AFF] hover:bg-[#007AFF]/10 transition-all"
              >
                📞
              </button>
              <AnimatePresence>
                {showCall && (
                  <CallDropdown phone={job.client_phone} onClose={() => setShowCall(false)} />
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* For in_progress jobs — show Complete button */}
      {job.status === 'in_progress' && (
        <div className="flex items-center gap-2 mt-2.5 pl-[calc(4rem+0.625rem+0.5rem+0.5rem)]">
          <button
            onClick={(e) => { e.stopPropagation(); onStart(e) }}
            disabled={isStarting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-[#34C759] text-white hover:bg-[#2DB84E] active:scale-95 disabled:opacity-50 transition-all shadow-sm"
          >
            ✓ Complete
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [startingJobId, setStartingJobId] = useState<string | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekCount, setWeekCount] = useState(3)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Drag-and-drop state (calendar grid)
  const [dragJob, setDragJob] = useState<JobRow | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [confirmMove, setConfirmMove] = useState<{ job: JobRow; newDate: string } | null>(null)
  const [skipJob, setSkipJob] = useState<JobRow | null>(null)
  const [skipReason, setSkipReason] = useState('')
  const [skipNewDate, setSkipNewDate] = useState('')
  const [skipping, setSkipping] = useState(false)
  const [moving, setMoving] = useState(false)
  const [members, setMembers] = useState<TeamMember[]>([])

  const dayRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const todayKey = getTodayKey()
  const now = new Date()

  // Build days array (identical to calendar page)
  const days = useMemo(() => {
    const today = new Date()
    const thisWeekSunday = new Date(today)
    thisWeekSunday.setDate(today.getDate() - today.getDay() + (weekOffset * 7))
    return Array.from({ length: weekCount * 7 }, (_, i) => {
      const d = new Date(thisWeekSunday)
      d.setDate(thisWeekSunday.getDate() + i)
      return d
    })
  }, [weekCount, weekOffset])

  // Visible range for header labels
  const visibleMonth = days.length > 7 ? days[7] : days[0]
  const currentMonth = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: PACIFIC_TZ })
  const rangeLabel = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[days.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  // Build week groups
  const weeks = useMemo(() => {
    const result: { label: string; days: Date[] }[] = []
    const todayWeekStart = new Date()
    todayWeekStart.setDate(todayWeekStart.getDate() - todayWeekStart.getDay())
    const todayWeekKey = fmtDateKey(todayWeekStart)

    for (let w = 0; w < weekCount; w++) {
      const weekDays = days.slice(w * 7, (w + 1) * 7)
      const weekStart = weekDays[0]
      const weekStartSunday = new Date(weekStart)
      weekStartSunday.setDate(weekStart.getDate() - weekStart.getDay())
      const key = fmtDateKey(weekStartSunday)

      let label: string
      if (key === todayWeekKey) label = 'This Week'
      else if (weekStart < todayWeekStart) {
        const diff = Math.round((todayWeekStart.getTime() - weekStart.getTime()) / (7 * 86400000))
        label = diff === 1 ? 'Last Week' : `${diff} Weeks Ago`
      } else {
        const diff = Math.round((weekStart.getTime() - todayWeekStart.getTime()) / (7 * 86400000))
        label = diff === 1 ? 'Next Week' : `In ${diff} Weeks`
      }
      result.push({ label, days: weekDays })
    }
    return result
  }, [days, weekCount])

  // Visible date keys for filtering job list
  const visibleDateKeys = useMemo(() => new Set(days.map(fmtDateKey)), [days])

  // ── Data Fetching ──────────────────────────────────────────────────────

  const fetchJobs = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true)
    setError(null)
    const result = await getJobs({ status: filter })
    if (result.success && result.data) {
      setJobs(result.data)
    } else {
      setError(result.error ?? 'Failed to load jobs')
    }
    if (showSpinner) setLoading(false)
  }, [filter])

  const initialLoadDone = useRef(false)
  useEffect(() => {
    fetchJobs(true).then(() => {
      if (!initialLoadDone.current) {
        initialLoadDone.current = true
        setLoading(false)
      }
    })
  }, [fetchJobs])

  // Fetch team members for assignment dropdown
  useEffect(() => {
    getTeamMembers().then((result) => {
      if (result.success && result.data) setMembers(result.data.members)
    })
  }, [])

  // ── Derived Data ───────────────────────────────────────────────────────

  // Jobs grouped by date for calendar cells
  const jobsByDate = useMemo(() => {
    const map = new Map<string, JobRow[]>()
    for (const j of jobs) {
      map.set(j.scheduled_date, [...(map.get(j.scheduled_date) ?? []), j])
    }
    return map
  }, [jobs])

  // Filtered jobs for the list below calendar
  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      // Status filter
      if (filter !== 'all' && j.status !== filter) return false
      // Text search
      if (search) {
        const q = search.toLowerCase()
        const matchesSearch =
          j.address_street.toLowerCase().includes(q) ||
          j.address_city.toLowerCase().includes(q) ||
          j.service_name.toLowerCase().includes(q) ||
          (j.worker_name ?? '').toLowerCase().includes(q) ||
          (j.client_name ?? '').toLowerCase().includes(q)
        if (!matchesSearch) return false
      }
      // Date filter: if a day is selected, only show that day; otherwise show today and forward
      if (selectedDate) {
        return j.scheduled_date === selectedDate
      }
      return j.scheduled_date >= todayKey
    })
  }, [jobs, search, selectedDate, filter, todayKey])

  // Group filtered jobs by date
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, JobRow[]>()
    const sorted = [...filtered].sort((a, b) => {
      const dateComp = a.scheduled_date.localeCompare(b.scheduled_date)
      if (dateComp !== 0) return dateComp
      if (a.scheduled_time && b.scheduled_time) return a.scheduled_time.localeCompare(b.scheduled_time)
      if (a.scheduled_time) return -1
      if (b.scheduled_time) return 1
      return 0
    })
    for (const job of sorted) {
      const existing = groups.get(job.scheduled_date)
      if (existing) {
        groups.set(job.scheduled_date, [...existing, job])
      } else {
        groups.set(job.scheduled_date, [job])
      }
    }
    return groups
  }, [filtered])

  // Count jobs per date for calendar badges
  const jobCountByDate = useMemo(() => {
    const counts = new Map<string, number>()
    for (const job of jobs) {
      counts.set(job.scheduled_date, (counts.get(job.scheduled_date) ?? 0) + 1)
    }
    return counts
  }, [jobs])

  // ── Actions ────────────────────────────────────────────────────────────

  async function handleStartJob(e: React.MouseEvent, jobId: string) {
    e.stopPropagation()
    setStartingJobId(jobId)
    const result = await updateJobStatus(jobId, 'driving')
    if (result.success) {
      await fetchJobs()
    } else {
      setError(result.error ?? 'Failed to start job')
    }
    setStartingJobId(null)
  }

  async function handleAssign(jobId: string, memberId: string | null) {
    const result = await updateJob(jobId, { assigned_worker_id: memberId })
    if (result.success) {
      // Optimistic update: find the member name
      const memberName = memberId ? members.find(m => m.member_id === memberId)?.full_name ?? null : null
      setJobs(prev => prev.map(j =>
        j.id === jobId ? { ...j, assigned_worker_id: memberId, worker_name: memberName } : j
      ))
    } else {
      setError(result.error ?? 'Failed to assign worker')
    }
  }

  function handleCardClick(jobId: string) {
    router.push(`/dashboard/jobs/${jobId}`)
  }

  function handleSelectDate(dateKey: string) {
    setSelectedDate((prev) => (prev === dateKey ? null : dateKey))
  }

  // Drag-and-drop handlers
  const handleDrop = (dateKey: string) => {
    if (!dragJob || dragJob.scheduled_date === dateKey) { setDragJob(null); setDropTarget(null); return }
    setConfirmMove({ job: dragJob, newDate: dateKey })
    setDragJob(null)
    setDropTarget(null)
  }

  const confirmMoveAction = async () => {
    if (!confirmMove) return
    setMoving(true)
    await updateJob(confirmMove.job.id, { scheduled_date: confirmMove.newDate })
    setJobs(prev => prev.map(j => j.id === confirmMove.job.id ? { ...j, scheduled_date: confirmMove.newDate } : j))
    fetchJobs()
    setConfirmMove(null)
    setMoving(false)
  }

  function formatDayHeader(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00')
    const tKey = getTodayKey()
    const tomorrowDate = new Date(getPacificToday())
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    const tomorrowKey = fmtDateKey(tomorrowDate)

    if (dateStr === tKey) return 'Today'
    if (dateStr === tomorrowKey) return 'Tomorrow'

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      timeZone: PACIFIC_TZ,
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Jobs</h1>
          <p className="text-xs text-[#8E8E93] mt-0.5">{currentMonth} · {rangeLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Week count toggle */}
          <div className="flex bg-[#F2F2F7] rounded-xl p-0.5">
            {[1, 2, 3, 4].map(w => (
              <button key={w} onClick={() => setWeekCount(w)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  weekCount === w ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93]'
                }`}>
                {w}W
              </button>
            ))}
          </div>
          {/* Navigation */}
          <button onClick={() => setWeekOffset(w => w - 1)}
            className="w-8 h-8 rounded-lg hover:bg-[#F2F2F7] flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={() => { setWeekOffset(0); setSelectedDate(todayKey) }}
            className="px-3 py-1.5 bg-[#007AFF] text-white rounded-xl text-xs font-semibold hover:bg-[#0066DD] transition-colors">
            Today
          </button>
          <button onClick={() => setWeekOffset(w => w + 1)}
            className="w-8 h-8 rounded-lg hover:bg-[#F2F2F7] flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <Link href="/dashboard/jobs/new">
            <Button size="sm" icon={<span className="text-sm">+</span>}>
              New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Status filter tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-white text-[#3C3C43] border border-[#E5E5EA] hover:bg-[#F2F2F7]'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s] ?? s}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-2 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 transition-shadow"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && jobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">No jobs yet</h2>
          <p className="text-sm text-[#8E8E93] mb-5">Schedule your first job to get started.</p>
          <Link href="/dashboard/jobs/new">
            <Button>Schedule Your First Job</Button>
          </Link>
        </motion.div>
      )}

      {/* Main Content: Calendar Grid + Job List */}
      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-5">
          {/* ── Calendar Grid (desktop only) ── */}
          <div className="hidden md:block rounded-3xl border border-[#E5E5EA]/40 p-3" style={{
            background: 'rgba(255,255,255,0.5)', boxShadow: '0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            {weeks.map((week, wi) => (
              <div key={wi}>
                <div className="grid grid-cols-7 gap-1.5">
                  {wi === 0 && (
                    <>
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                        <div key={d} className="text-center text-[9px] font-bold text-[#C7C7CC] tracking-widest mb-1">{d}</div>
                      ))}
                    </>
                  )}
                  {week.days.map(day => {
                    const key = fmtDateKey(day)
                    const isToday = key === todayKey
                    const isSelected = key === selectedDate
                    const isDrop = dropTarget === key
                    const dayJobs = jobsByDate.get(key) ?? []
                    const count = dayJobs.length
                    const isPast = key < todayKey
                    const isThisMonth = day.getMonth() === now.getMonth()

                    return (
                      <motion.div
                        key={key}
                        onClick={() => handleSelectDate(key)}
                        onDragOver={(e) => { e.preventDefault(); setDropTarget(key) }}
                        onDragLeave={() => setDropTarget(null)}
                        onDrop={() => handleDrop(key)}
                        whileHover={{ scale: 1.06, y: -4, rotateX: 3, rotateY: -2, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                        className={`min-h-[88px] rounded-2xl flex flex-col items-center pt-2.5 pb-2 cursor-pointer transition-all relative ${
                          isToday ? 'ring-2 ring-[#007AFF] bg-white'
                          : isDrop ? 'ring-2 ring-[#34C759] bg-[#34C759]/5'
                          : isSelected ? 'bg-white ring-1 ring-[#007AFF]/25'
                          : count > 0 ? 'bg-white'
                          : isPast && isThisMonth ? 'bg-[#F2F2F7]/30'
                          : !isThisMonth ? 'bg-[#F9F9FB]/20'
                          : 'bg-white/40'
                        }`}
                        style={{
                          boxShadow: isToday
                            ? '0 6px 24px rgba(0,122,255,0.15), 0 2px 8px rgba(0,0,0,0.04)'
                            : count > 0
                              ? '0 2px 12px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)'
                              : '0 1px 4px rgba(0,0,0,0.02)',
                        }}
                      >
                        <span className={`text-[13px] font-semibold leading-none ${
                          isToday ? 'text-[#007AFF]'
                          : !isThisMonth ? 'text-[#D1D1D6]'
                          : isPast && count === 0 ? 'text-[#C7C7CC]'
                          : 'text-[#1C1C1E]'
                        }`}>{day.getDate()}</span>

                        {count > 0 && (
                          <>
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className={`text-[20px] font-bold mt-0.5 leading-none ${
                                count >= 6 ? 'text-[#FF3B30]' : count >= 3 ? 'text-[#FF9F0A]' : 'text-[#34C759]'
                              }`}>{count}</motion.span>
                            {/* Service icons row with hover tooltips */}
                            <div className="flex items-center justify-center gap-1 mt-1.5 flex-wrap">
                              {dayJobs.slice(0, 4).map(j => {
                                const c = getColor(j.service_name)
                                return (
                                  <div key={j.id} className="group/icon relative">
                                    <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 transition-transform"
                                      style={{ backgroundColor: c.light }}>
                                      {getServiceIcon(j.service_name)}
                                    </div>
                                    {/* Hover tooltip */}
                                    <div className="absolute z-[60] bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-2xl p-2.5 pointer-events-none opacity-0 group-hover/icon:opacity-100 transition-all scale-95 group-hover/icon:scale-100"
                                      style={{ background: 'rgba(28,28,30,0.94)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-sm">{getServiceIcon(j.service_name)}</span>
                                        <span className="text-[11px] text-white font-bold">{j.service_name}</span>
                                      </div>
                                      <p className="text-[10px] text-white/80 flex items-center gap-1">
                                        <span className="text-white/50">👤</span> {j.client_name ?? 'Unknown'}
                                      </p>
                                      <p className="text-[10px] text-white/60 flex items-center gap-1">
                                        <span className="text-white/50">📍</span> {j.address_street}
                                      </p>
                                      <p className="text-[10px] text-white/60 flex items-center gap-1">
                                        <span className="text-white/50">🕐</span> {fmtTime(j.scheduled_time)}
                                      </p>
                                      {j.price != null && (
                                        <p className="text-[12px] text-[#34C759] font-bold mt-1">${Number(j.price).toFixed(0)}</p>
                                      )}
                                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45" style={{ background: 'rgba(28,28,30,0.94)' }} />
                                    </div>
                                  </div>
                                )
                              })}
                              {count > 4 && (
                                <span className="text-[8px] text-[#AEAEB2] font-bold">+{count - 4}</span>
                              )}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}

          {/* Selected day jobs — unfolds inside the calendar */}
          <AnimatePresence>
            {selectedDate && (() => {
              const dayJobs = (jobsByDate.get(selectedDate) ?? [])
                .filter(j => filter === 'all' || j.status === filter)
                .sort((a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''))
              return (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-[#E5E5EA]/20 mt-2 pt-3"
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-xs font-bold text-[#1C1C1E]">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      <span className="text-[#8E8E93] font-normal ml-2">{dayJobs.length} job{dayJobs.length !== 1 ? 's' : ''}</span>
                    </h3>
                    <button onClick={() => setSelectedDate(null)} className="w-6 h-6 rounded-full bg-[#F2F2F7] flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  {dayJobs.length === 0 ? (
                    <p className="text-xs text-[#8E8E93] text-center py-4">No jobs this day</p>
                  ) : (
                    <div className="space-y-1.5">
                      {dayJobs.map(job => {
                        const c = getColor(job.service_name)
                        return (
                          <motion.div key={job.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                            draggable onDragStart={() => setDragJob(job)}
                            onClick={() => handleCardClick(job.id)}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:shadow-md transition-all border-l-[3px]"
                            style={{ backgroundColor: c.light, borderLeftColor: c.bg }}>
                            <span className="text-base">{getServiceIcon(job.service_name)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#1C1C1E] truncate">{job.service_name}</span>
                                <StatusBadge status={job.status} />
                              </div>
                              <p className="text-[10px] text-[#636366] truncate">
                                {job.scheduled_time ? fmtTime(job.scheduled_time) + ' · ' : ''}{job.address_street}
                                {job.client_name ? ` · ${job.client_name}` : ''}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-[#1C1C1E] shrink-0">${Number(job.price).toFixed(0)}</span>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )
            })()}
          </AnimatePresence>

          </div>{/* close calendar grid container */}

          {/* Legend */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" /><span className="text-[10px] text-[#8E8E93] font-medium">1-2 jobs</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF9F0A]" /><span className="text-[10px] text-[#8E8E93] font-medium">3-5 jobs</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" /><span className="text-[10px] text-[#8E8E93] font-medium">6+ jobs</span></div>
          </div>

          {/* ── Job List Below Calendar ── */}

          {/* No matches after filtering — only when viewing all */}
          {filtered.length === 0 && !selectedDate && (
            <div className="glass rounded-2xl p-10 text-center">
              <p className="text-sm text-[#8E8E93]">No jobs match your filters.</p>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="mt-3 text-sm text-[#007AFF] font-medium hover:underline"
                >
                  Show all dates
                </button>
              )}
            </div>
          )}

          {/* Job cards grouped by day — only when no specific day selected */}
          {filtered.length > 0 && !selectedDate && (
            <div className="space-y-6">
              {[...groupedByDate.entries()].map(([dateStr, dayJobs]) => (
                <div
                  key={dateStr}
                  ref={(el) => {
                    if (el) dayRefs.current.set(dateStr, el)
                  }}
                >
                  {/* Day header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-sm font-bold text-[#1C1C1E]">
                      {formatDayHeader(dateStr)}
                    </h2>
                    <span className="text-xs text-[#8E8E93] font-medium">
                      {dayJobs.length} job{dayJobs.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex-1 h-px bg-[#E5E5EA]" />
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {dayJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onStart={(e) => handleStartJob(e, job.id)}
                        onSkip={(e) => { e.stopPropagation(); setSkipJob(job) }}
                        isStarting={startingJobId === job.id}
                        onClick={() => handleCardClick(job.id)}
                        members={members}
                        onAssign={handleAssign}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Confirm Move Modal (drag-and-drop) ── */}
      <AnimatePresence>
        {confirmMove && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl p-5"
              style={{
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
              }}>
              <h3 className="text-sm font-bold text-[#1C1C1E] mb-3">Move Job?</h3>
              {/* Job details */}
              <div className="rounded-2xl p-3 mb-3" style={{ backgroundColor: getColor(confirmMove.job.service_name).light, borderLeft: `3px solid ${getColor(confirmMove.job.service_name).bg}` }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{getServiceIcon(confirmMove.job.service_name)}</span>
                  <span className="text-sm font-bold text-[#1C1C1E]">{confirmMove.job.service_name}</span>
                </div>
                <p className="text-[11px] text-[#636366] flex items-center gap-1">👤 {confirmMove.job.client_name ?? 'Unknown'}</p>
                <p className="text-[11px] text-[#636366] flex items-center gap-1">📍 {confirmMove.job.address_street}</p>
                <p className="text-[11px] text-[#636366] flex items-center gap-1">🕐 {fmtTime(confirmMove.job.scheduled_time)}</p>
                {confirmMove.job.price != null && (
                  <p className="text-sm font-bold text-[#34C759] mt-1">${Number(confirmMove.job.price).toFixed(0)}</p>
                )}
              </div>
              {/* Date change arrow */}
              <div className="flex items-center gap-2 mb-4 text-xs text-[#636366]">
                <span className="px-2 py-1 bg-[#F2F2F7] rounded-lg font-medium">
                  {new Date(confirmMove.job.scheduled_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <svg className="w-4 h-4 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="px-2 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-lg font-bold">
                  {new Date(confirmMove.newDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={confirmMoveAction} disabled={moving}
                  className="flex-1 py-2.5 bg-[#007AFF] text-white rounded-xl text-xs font-semibold hover:bg-[#0066DD] transition-colors disabled:opacity-50">
                  {moving ? 'Moving...' : 'Confirm Move'}
                </button>
                <button onClick={() => setConfirmMove(null)}
                  className="flex-1 py-2.5 bg-[#F2F2F7] text-[#1C1C1E] rounded-xl text-xs font-semibold hover:bg-[#E5E5EA] transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Skip Job Modal ── */}
      <AnimatePresence>
        {skipJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4"
            onClick={() => { setSkipJob(null); setSkipReason(''); setSkipNewDate('') }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl p-5"
              style={{
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
              }}>
              <h3 className="text-base font-bold text-[#1C1C1E] mb-1">Skip Job</h3>
              <p className="text-xs text-[#8E8E93] mb-4">{skipJob.service_name} · {skipJob.address_street}</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#1C1C1E] mb-1">Reason (optional)</label>
                  <textarea
                    value={skipReason}
                    onChange={(e) => setSkipReason(e.target.value)}
                    placeholder="Why is this job being skipped?"
                    rows={2}
                    className="w-full px-3 py-2 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9F0A]/30 resize-none"
                  />
                </div>

                <DatePicker
                  label="Reschedule to (optional)"
                  value={skipNewDate}
                  onChange={(date) => setSkipNewDate(date)}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={async () => {
                    setSkipping(true)
                    if (skipNewDate) {
                      await updateJob(skipJob.id, {
                        scheduled_date: skipNewDate,
                        cancellation_reason: skipReason || 'Skipped',
                      })
                    } else {
                      await updateJobStatus(skipJob.id, 'cancelled')
                      if (skipReason) {
                        await updateJob(skipJob.id, { cancellation_reason: skipReason })
                      }
                    }
                    setSkipJob(null)
                    setSkipReason('')
                    setSkipNewDate('')
                    setSkipping(false)
                    fetchJobs()
                  }}
                  disabled={skipping}
                  className="flex-1 py-2.5 bg-[#FF9F0A] text-white rounded-xl text-xs font-bold hover:bg-[#E68F09] transition-colors disabled:opacity-50"
                >
                  {skipping ? 'Saving...' : skipNewDate ? 'Reschedule' : 'Skip Job'}
                </button>
                <button
                  onClick={() => { setSkipJob(null); setSkipReason(''); setSkipNewDate('') }}
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
  )
}
