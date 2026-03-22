'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getJobs, updateJobStatus, type JobRow } from '@/lib/actions/jobs'
import { StatusBadge } from '@/components/platform/Badge'
import { Button } from '@/components/platform/Button'
import { SegmentedControl } from '@/components/platform/SegmentedControl'
import { TimelineView } from '@/components/platform/TimelineView'

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

// ── Date Helpers (Pacific Time) ───────────────────────────────────────────

function getPacificToday(): Date {
  const now = new Date()
  const pacificStr = now.toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ })
  return new Date(pacificStr + 'T00:00:00')
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function get7DayRange(weekOffset: number): Date[] {
  const today = getPacificToday()
  const start = new Date(today)
  start.setDate(start.getDate() + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

function formatDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: PACIFIC_TZ })
}

function formatMonthAbbr(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', timeZone: PACIFIC_TZ })
}

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${mStr} ${ampm}`
}

function isToday(date: Date): boolean {
  return formatDateKey(date) === formatDateKey(getPacificToday())
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
  isStarting,
  onClick,
}: {
  job: JobRow
  onStart: (e: React.MouseEvent) => void
  isStarting: boolean
  onClick: () => void
}) {
  const [showCall, setShowCall] = useState(false)

  const dotColor = STATUS_DOT_COLORS[job.status] ?? 'bg-[#8E8E93]'
  const borderColor = STATUS_BORDER_COLORS[job.status] ?? 'border-l-[#8E8E93]'

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
            {job.address_street}{job.address_city ? `, ${job.address_city}` : ''}
          </p>
          <p className="text-xs text-[#8E8E93] truncate mt-0.5">
            {job.service_name}
            {job.worker_name ? ` · ${job.worker_name}` : ''}
            {job.client_name ? ` · ${job.client_name}` : ''}
          </p>
        </div>
      </div>

      {/* Row 2: Price + status + actions */}
      <div className="flex items-center justify-between mt-2 pl-[calc(4rem+0.625rem+0.5rem+0.5rem)]">
        <span className="text-sm font-semibold text-[#1C1C1E]">
          ${Number(job.price).toFixed(2)}
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge status={job.status} />
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowCall((prev) => !prev)
              }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all
                ${job.client_phone
                  ? 'text-[#007AFF] hover:bg-[#007AFF]/10 opacity-0 group-hover:opacity-100'
                  : 'text-[#C7C7CC] opacity-0 group-hover:opacity-60 cursor-default'
                }`}
              title={job.client_phone ? 'Contact client' : 'No phone on file'}
            >
              📞
            </button>
            <AnimatePresence>
              {showCall && (
                <CallDropdown
                  phone={job.client_phone}
                  onClose={() => setShowCall(false)}
                />
              )}
            </AnimatePresence>
          </div>
          {job.status === 'scheduled' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStart(e)
              }}
              disabled={isStarting}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#34C759] text-white hover:bg-[#2DB84E] active:bg-[#28A745] disabled:opacity-50 transition-all opacity-0 group-hover:opacity-100"
            >
              {isStarting ? '...' : '▶ Start'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── 7-Day Calendar Strip ──────────────────────────────────────────────────

function CalendarStrip({
  days,
  selectedDate,
  jobCountByDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}: {
  days: Date[]
  selectedDate: string | null
  jobCountByDate: Map<string, number>
  onSelectDate: (dateKey: string) => void
  onPrevWeek: () => void
  onNextWeek: () => void
}) {
  return (
    <div className="glass rounded-2xl p-3 mb-4">
      <div className="flex items-center gap-2">
        {/* Prev arrow */}
        <button
          onClick={onPrevWeek}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-[#1C1C1E] transition-colors shrink-0"
          aria-label="Previous week"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Day boxes */}
        <div className="flex-1 grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const key = formatDateKey(day)
            const today = isToday(day)
            const selected = selectedDate === key
            const count = jobCountByDate.get(key) ?? 0

            return (
              <button
                key={key}
                onClick={() => onSelectDate(key)}
                className={`
                  relative flex flex-col items-center py-2 px-1 rounded-xl transition-all text-center
                  ${selected
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : today
                      ? 'bg-[#007AFF]/10 text-[#007AFF]'
                      : 'text-[#3C3C43] hover:bg-[#F2F2F7]'
                  }
                `}
              >
                <span className={`text-[10px] font-medium uppercase ${selected ? 'text-white/80' : 'text-[#8E8E93]'}`}>
                  {formatDayName(day)}
                </span>
                <span className={`text-lg font-bold leading-tight ${selected ? 'text-white' : ''}`}>
                  {day.getDate()}
                </span>
                <span className={`text-[9px] font-medium ${selected ? 'text-white/70' : 'text-[#8E8E93]'}`}>
                  {formatMonthAbbr(day)}
                </span>
                {count > 0 && (
                  <span
                    className={`
                      absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold
                      flex items-center justify-center leading-none
                      ${selected ? 'bg-white text-[#007AFF]' : 'bg-[#007AFF] text-white'}
                    `}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Next arrow */}
        <button
          onClick={onNextWeek}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-[#1C1C1E] transition-colors shrink-0"
          aria-label="Next week"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')
  const dayRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const days = useMemo(() => get7DayRange(weekOffset), [weekOffset])

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getJobs({ status: filter })
    if (result.success && result.data) {
      setJobs(result.data)
    } else {
      setError(result.error ?? 'Failed to load jobs')
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Search + date filter
  const filtered = useMemo(() => {
    return jobs.filter((j) => {
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
      // Date filter: if a day is selected, only show that day
      if (selectedDate) {
        return j.scheduled_date === selectedDate
      }
      return true
    })
  }, [jobs, search, selectedDate])

  // Group jobs by date for card display
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, JobRow[]>()
    const sorted = [...filtered].sort((a, b) => {
      // Sort by date ascending, then by time ascending
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

  // Jobs for the timeline view: filtered by search + status but scoped to visible week
  const timelineJobs = useMemo(() => {
    const dayKeys = new Set(days.map(formatDateKey))
    return jobs.filter((j) => {
      if (!dayKeys.has(j.scheduled_date)) return false
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
      return true
    })
  }, [jobs, days, search])

  // Count jobs per date for badge dots on calendar
  const jobCountByDate = useMemo(() => {
    const counts = new Map<string, number>()
    for (const job of jobs) {
      // Apply status filter but not date/search filter for calendar badges
      counts.set(job.scheduled_date, (counts.get(job.scheduled_date) ?? 0) + 1)
    }
    return counts
  }, [jobs])

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

  function handleCardClick(jobId: string) {
    router.push(`/dashboard/jobs/${jobId}`)
  }

  function handleSelectDate(dateKey: string) {
    // Toggle: clicking the same day deselects
    setSelectedDate((prev) => (prev === dateKey ? null : dateKey))
  }

  function formatDayHeader(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00')
    const todayKey = formatDateKey(getPacificToday())
    const tomorrowDate = new Date(getPacificToday())
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    const tomorrowKey = formatDateKey(tomorrowDate)

    if (dateStr === todayKey) return 'Today'
    if (dateStr === tomorrowKey) return 'Tomorrow'

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      timeZone: PACIFIC_TZ,
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Jobs</h1>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <SegmentedControl
              segments={[
                { value: 'list', label: 'List' },
                { value: 'timeline', label: 'Timeline' },
              ]}
              value={viewMode}
              onChange={(v) => setViewMode(v as 'list' | 'timeline')}
            />
          </div>
          <Link href="/dashboard/jobs/new">
            <Button size="sm" icon={<span className="text-sm">+</span>}>
              New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* 7-Day Calendar Strip */}
      <CalendarStrip
        days={days}
        selectedDate={selectedDate}
        jobCountByDate={jobCountByDate}
        onSelectDate={handleSelectDate}
        onPrevWeek={() => setWeekOffset((o) => o - 1)}
        onNextWeek={() => setWeekOffset((o) => o + 1)}
      />

      {/* Filters + Search row */}
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

      {/* Timeline View (desktop only, hidden on mobile) */}
      {!loading && !error && jobs.length > 0 && viewMode === 'timeline' && (
        <div className="hidden md:block">
          <TimelineView
            days={days}
            jobs={timelineJobs}
            onJobClick={handleCardClick}
          />
        </div>
      )}

      {/* List View — always visible in list mode, mobile fallback in timeline mode */}
      {!loading && !error && jobs.length > 0 && (
        <div className={viewMode === 'timeline' ? 'md:hidden' : ''}>
          {/* No matches after filtering */}
          {filtered.length === 0 && (
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

          {/* Job cards grouped by day */}
          {filtered.length > 0 && (
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
                        isStarting={startingJobId === job.id}
                        onClick={() => handleCardClick(job.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
