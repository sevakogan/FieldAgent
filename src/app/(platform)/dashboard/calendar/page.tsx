'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getCalendarJobs } from '@/lib/actions/company'
import { updateJob } from '@/lib/actions/jobs'
import { TimelineView } from '@/components/platform/TimelineView'
import { StatusBadge } from '@/components/platform/Badge'

type CalendarJob = {
  id: string
  service_name: string
  status: string
  scheduled_date: string
  scheduled_time: string | null
  address_street: string
  address_city?: string
  worker_name: string | null
  price: number | null
  client_name?: string
}

type ViewMode = 'month' | 'week' | 'day'

const PACIFIC_TZ = 'America/Los_Angeles'

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const SERVICE_COLORS = [
  { bg: '#007AFF', light: 'rgba(0,122,255,0.1)' },
  { bg: '#AF52DE', light: 'rgba(175,82,222,0.1)' },
  { bg: '#FF9F0A', light: 'rgba(255,159,10,0.12)' },
  { bg: '#34C759', light: 'rgba(52,199,89,0.1)' },
  { bg: '#FF2D55', light: 'rgba(255,45,85,0.1)' },
  { bg: '#5AC8FA', light: 'rgba(90,200,250,0.12)' },
  { bg: '#FFD60A', light: 'rgba(255,214,10,0.15)' },
  { bg: '#5856D6', light: 'rgba(88,86,214,0.1)' },
]

function getServiceColor(name: string) {
  return SERVICE_COLORS[hashStr(name) % SERVICE_COLORS.length]
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getTodayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ })
}

function formatTime12h(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = parseInt(h, 10)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

// ─── Service Icon ────────────────────────────────────────────────────
function getServiceIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('clean') || n.includes('turnover')) return '🧹'
  if (n.includes('pool')) return '🏊'
  if (n.includes('lawn') || n.includes('grass') || n.includes('mow')) return '🌿'
  if (n.includes('plumb')) return '🔧'
  if (n.includes('handyman') || n.includes('repair')) return '🛠️'
  if (n.includes('laundry') || n.includes('linen')) return '🧺'
  if (n.includes('inspect') || n.includes('damage')) return '🔍'
  if (n.includes('pressure') || n.includes('wash')) return '💧'
  if (n.includes('deep')) return '✨'
  return '⚙️'
}

// ─── Job Pill with Hover Tooltip ─────────────────────────────────────
function JobPill({ job, onDragStart }: { job: CalendarJob; onDragStart: (job: CalendarJob) => void }) {
  const [hovered, setHovered] = useState(false)
  const color = getServiceColor(job.service_name)
  const pillRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative" ref={pillRef}>
      <motion.div
        draggable
        onDragStart={() => onDragStart(job)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.03, y: -1 }}
        className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 cursor-grab active:cursor-grabbing border-l-[3px]"
        style={{
          backgroundColor: color.light,
          borderLeftColor: color.bg,
          boxShadow: `0 2px 8px ${color.light}, 0 1px 3px rgba(0,0,0,0.04)`,
        }}
      >
        <span className="text-xs">{getServiceIcon(job.service_name)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold truncate" style={{ color: color.bg }}>{job.service_name}</p>
          <p className="text-[8px] text-[#8E8E93] truncate">
            {job.scheduled_time ? formatTime12h(job.scheduled_time) : ''}
            {job.client_name ? ` · ${job.client_name}` : ''}
          </p>
        </div>
        {job.price != null && (
          <span className="text-[11px] font-bold text-[#1C1C1E] shrink-0">${Number(job.price).toFixed(0)}</span>
        )}
      </motion.div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute z-50 bottom-full left-0 mb-2 w-56 rounded-2xl p-3 pointer-events-none"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getServiceIcon(job.service_name)}</span>
              <div>
                <p className="text-xs font-bold text-[#1C1C1E]">{job.service_name}</p>
                <p className="text-[10px] text-[#8E8E93]">{job.scheduled_time ? formatTime12h(job.scheduled_time) : 'No time set'}</p>
              </div>
            </div>
            {job.client_name && (
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3 h-3 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[10px] text-[#1C1C1E] font-medium">{job.client_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 mb-1">
              <svg className="w-3 h-3 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[10px] text-[#636366]">{job.address_street}</span>
            </div>
            {job.price != null && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E5E5EA]/30">
                <StatusBadge status={job.status} />
                <span className="text-sm font-bold text-[#1C1C1E]">${Number(job.price).toFixed(2)}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Month View ──────────────────────────────────────────────────────
function MonthView({ jobs, month, year, onDayClick, selectedDate, onJobMove }: {
  jobs: CalendarJob[]
  month: number
  year: number
  onDayClick: (date: string) => void
  selectedDate: string | null
  onJobMove?: (jobId: string, newDate: string) => void
}) {
  const todayKey = getTodayKey()
  const firstDay = new Date(year, month, 1)
  const startPad = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const [dragJob, setDragJob] = useState<CalendarJob | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [confirmMove, setConfirmMove] = useState<{ job: CalendarJob; newDate: string } | null>(null)

  const jobsByDate = useMemo(() => {
    const map = new Map<string, CalendarJob[]>()
    for (const j of jobs) map.set(j.scheduled_date, [...(map.get(j.scheduled_date) ?? []), j])
    return map
  }, [jobs])

  const cells = useMemo(() => {
    const arr: (number | null)[] = []
    for (let i = 0; i < startPad; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [startPad, daysInMonth])

  const handleDrop = (dateKey: string) => {
    if (!dragJob || dragJob.scheduled_date === dateKey) { setDragJob(null); setDropTarget(null); return }
    setConfirmMove({ job: dragJob, newDate: dateKey })
    setDragJob(null)
    setDropTarget(null)
  }

  const confirmMoveAction = async () => {
    if (!confirmMove || !onJobMove) return
    await onJobMove(confirmMove.job.id, confirmMove.newDate)
    setConfirmMove(null)
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden" style={{
        background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
      }}>
        <div className="grid grid-cols-7 border-b border-[#E5E5EA]/30">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2.5 text-center text-[10px] font-bold text-[#AEAEB2] uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="min-h-[100px] border-r border-b border-[#E5E5EA]/15 bg-[#F9F9FB]/30" />
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateKey === todayKey
            const isSelected = dateKey === selectedDate
            const isDrop = dropTarget === dateKey
            const dayJobs = jobsByDate.get(dateKey) ?? []

            return (
              <div
                key={i}
                onClick={() => onDayClick(dateKey)}
                onDragOver={(e) => { e.preventDefault(); setDropTarget(dateKey) }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={() => handleDrop(dateKey)}
                className={`min-h-[100px] p-1.5 border-r border-b border-[#E5E5EA]/15 text-left transition-all cursor-pointer hover:bg-[#007AFF]/[0.02] ${
                  isSelected ? 'bg-[#007AFF]/[0.04]' : ''
                } ${isDrop ? 'bg-[#007AFF]/[0.08] ring-2 ring-[#007AFF]/20 ring-inset' : ''}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-semibold inline-flex items-center justify-center ${
                    isToday ? 'w-7 h-7 rounded-full bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25' : 'text-[#1C1C1E]'
                  }`}>{day}</span>
                  {dayJobs.length > 0 && (
                    <span className="text-[8px] text-[#AEAEB2] font-medium">{dayJobs.length} job{dayJobs.length > 1 ? 's' : ''}</span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayJobs.slice(0, 3).map(j => (
                    <JobPill key={j.id} job={j} onDragStart={setDragJob} />
                  ))}
                  {dayJobs.length > 3 && (
                    <p className="text-[8px] text-[#8E8E93] pl-1 font-medium">+{dayJobs.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirm move modal */}
      <AnimatePresence>
        {confirmMove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
              }}
            >
              <h3 className="text-sm font-bold text-[#1C1C1E] mb-2">Move Job?</h3>
              <p className="text-xs text-[#8E8E93] mb-4">
                Move <strong>{confirmMove.job.service_name}</strong> to{' '}
                <strong>{new Date(confirmMove.newDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</strong>?
              </p>
              <div className="flex gap-2">
                <button onClick={confirmMoveAction}
                  className="flex-1 py-2.5 bg-[#007AFF] text-white rounded-xl text-xs font-semibold hover:bg-[#0066DD] transition-colors">
                  Move Job
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
    </>
  )
}

// ─── Day View ────────────────────────────────────────────────────────
function DayView({ jobs, date, onJobClick }: {
  jobs: CalendarJob[]
  date: string
  onJobClick: (id: string) => void
}) {
  const dayJobs = useMemo(() =>
    jobs.filter(j => j.scheduled_date === date)
      .sort((a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? '')),
    [jobs, date]
  )

  const dateObj = new Date(date + 'T12:00:00')
  const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: PACIFIC_TZ })

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-[#1C1C1E] mb-3">{dayLabel}</h3>
      {dayJobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-[#8E8E93]">No jobs scheduled</p>
          <Link href="/dashboard/jobs/new" className="text-xs text-[#007AFF] mt-2 inline-block hover:underline">+ Schedule a job</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {dayJobs.map(j => {
            const color = getServiceColor(j.service_name)
            return (
              <motion.button
                key={j.id}
                onClick={() => onJobClick(j.id)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:shadow-md transition-all border-l-[3px]"
                style={{ backgroundColor: color.light, borderLeftColor: color.bg }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1C1C1E]">{j.service_name}</span>
                    <StatusBadge status={j.status} />
                  </div>
                  <p className="text-xs text-[#8E8E93] mt-0.5">
                    {j.scheduled_time ? formatTime12h(j.scheduled_time) + ' · ' : ''}{j.address_street}
                    {j.worker_name ? ` · ${j.worker_name}` : ''}
                  </p>
                </div>
                {j.price != null && (
                  <span className="text-sm font-bold text-[#1C1C1E]">${Number(j.price).toFixed(0)}</span>
                )}
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Calendar Page ──────────────────────────────────────────────
export default function CalendarPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<CalendarJob[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Current month/year for month view
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())

  // Week offset for week view
  const [weekOffset, setWeekOffset] = useState(0)

  const weekDays = useMemo(() => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay() + weekOffset * 7) // Start from Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [weekOffset])

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    const result = await getCalendarJobs(year, month)
    if (result.success && result.data) {
      setJobs(result.data as CalendarJob[])
    }
    setLoading(false)
  }, [year, month])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const weekLabel = `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  const handlePrev = () => {
    if (viewMode === 'month') {
      if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1)
    } else {
      setWeekOffset(weekOffset - 1)
    }
  }

  const handleNext = () => {
    if (viewMode === 'month') {
      if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1)
    } else {
      setWeekOffset(weekOffset + 1)
    }
  }

  const handleToday = () => {
    const t = new Date()
    setMonth(t.getMonth())
    setYear(t.getFullYear())
    setWeekOffset(0)
    setSelectedDate(getTodayKey())
  }

  const handleDayClick = (dateKey: string) => {
    setSelectedDate(dateKey)
    if (viewMode === 'month') setViewMode('day')
  }

  // Timeline jobs mapped for TimelineView component
  const timelineJobs = useMemo(() => {
    const dayKeys = new Set(weekDays.map(formatDateKey))
    return jobs
      .filter(j => dayKeys.has(j.scheduled_date))
      .map(j => ({
        id: j.id,
        address_street: j.address_street,
        address_city: j.address_city ?? '',
        service_name: j.service_name,
        worker_name: j.worker_name,
        status: j.status,
        scheduled_date: j.scheduled_date,
        scheduled_time: j.scheduled_time,
        price: j.price ?? 0,
      }))
  }, [jobs, weekDays])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">
          {viewMode === 'month' ? monthLabel : viewMode === 'week' ? weekLabel : 'Calendar'}
        </h1>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-[#F2F2F7] rounded-xl p-0.5">
            {(['month', 'week', 'day'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  viewMode === mode ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93] hover:text-[#3C3C43]'
                }`}>
                {mode}
              </button>
            ))}
          </div>

          {/* Nav arrows + Today */}
          <div className="flex items-center gap-1">
            <button onClick={handlePrev} className="w-8 h-8 rounded-lg hover:bg-[#F2F2F7] flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={handleNext} className="w-8 h-8 rounded-lg hover:bg-[#F2F2F7] flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#007AFF] hover:bg-[#007AFF]/8 transition-colors">
              Today
            </button>
          </div>

          <Link href="/dashboard/jobs/new"
            className="px-4 py-2 bg-[#007AFF] text-white rounded-2xl text-xs font-semibold hover:bg-[#0066DD] transition-colors">
            + New Job
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'month' && (
            <motion.div key="month" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MonthView jobs={jobs} month={month} year={year} onDayClick={handleDayClick} selectedDate={selectedDate}
                onJobMove={async (jobId, newDate) => { await updateJob(jobId, { scheduled_date: newDate }); fetchJobs() }} />
            </motion.div>
          )}
          {viewMode === 'week' && (
            <motion.div key="week" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TimelineView
                days={weekDays}
                jobs={timelineJobs}
                onJobClick={(id) => router.push(`/dashboard/jobs/${id}`)}
                onJobMove={async (jobId, newDate) => {
                  await updateJob(jobId, { scheduled_date: newDate })
                  fetchJobs()
                }}
              />
            </motion.div>
          )}
          {viewMode === 'day' && (
            <motion.div key="day" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DayView jobs={jobs} date={selectedDate ?? getTodayKey()} onJobClick={(id) => router.push(`/dashboard/jobs/${id}`)} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
