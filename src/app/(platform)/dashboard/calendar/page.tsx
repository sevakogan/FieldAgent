'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getCalendarJobs } from '@/lib/actions/company'
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

// ─── Month View ──────────────────────────────────────────────────────
function MonthView({ jobs, month, year, onDayClick, selectedDate }: {
  jobs: CalendarJob[]
  month: number
  year: number
  onDayClick: (date: string) => void
  selectedDate: string | null
}) {
  const todayKey = getTodayKey()
  const firstDay = new Date(year, month, 1)
  const startPad = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

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

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[#E5E5EA]/30">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold text-[#AEAEB2] uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="min-h-[90px] border-r border-b border-[#E5E5EA]/20 bg-[#F9F9FB]/50" />
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDate
          const dayJobs = jobsByDate.get(dateKey) ?? []

          return (
            <button
              key={i}
              onClick={() => onDayClick(dateKey)}
              className={`min-h-[90px] p-1.5 border-r border-b border-[#E5E5EA]/20 text-left transition-colors hover:bg-[#007AFF]/[0.03] ${
                isSelected ? 'bg-[#007AFF]/[0.05]' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium inline-flex items-center justify-center ${
                  isToday ? 'w-6 h-6 rounded-full bg-[#007AFF] text-white' : 'text-[#1C1C1E]'
                }`}>{day}</span>
                {dayJobs.length > 0 && (
                  <span className="text-[9px] text-[#8E8E93]">{dayJobs.length} job{dayJobs.length > 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="space-y-0.5">
                {dayJobs.slice(0, 3).map(j => {
                  const color = getServiceColor(j.service_name)
                  return (
                    <div key={j.id} className="flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[9px] font-medium truncate"
                      style={{ backgroundColor: color.light, color: color.bg }}>
                      {j.scheduled_time && <span className="opacity-70">{formatTime12h(j.scheduled_time)}</span>}
                      <span className="truncate">{j.service_name}</span>
                    </div>
                  )
                })}
                {dayJobs.length > 3 && (
                  <p className="text-[8px] text-[#8E8E93] pl-1">+{dayJobs.length - 3} more</p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
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
              <MonthView jobs={jobs} month={month} year={year} onDayClick={handleDayClick} selectedDate={selectedDate} />
            </motion.div>
          )}
          {viewMode === 'week' && (
            <motion.div key="week" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TimelineView days={weekDays} jobs={timelineJobs} onJobClick={(id) => router.push(`/dashboard/jobs/${id}`)} />
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
