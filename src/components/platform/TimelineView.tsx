'use client'

import { useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// ── Types ────────────────────────────────────────────────────────────────

interface TimelineJob {
  id: string
  address_street: string
  address_city: string
  service_name: string
  worker_name: string | null
  status: string
  scheduled_date: string
  scheduled_time: string | null
  price: number
}

interface TimelineViewProps {
  days: Date[]
  jobs: TimelineJob[]
  onJobClick: (jobId: string) => void
}

// ── Constants ────────────────────────────────────────────────────────────

const PACIFIC_TZ = 'America/Los_Angeles'
const HOUR_HEIGHT = 60
const START_HOUR = 6
const END_HOUR = 20
const TOTAL_HOURS = END_HOUR - START_HOUR
const DEFAULT_DURATION_HOURS = 1

const TIMELINE_CARD_BG: Record<string, string> = {
  scheduled: 'bg-[#007AFF]/8',
  driving: 'bg-[#5AC8FA]/10',
  arrived: 'bg-[#FF9F0A]/10',
  in_progress: 'bg-[#FFD60A]/12',
  pending_review: 'bg-[#AF52DE]/8',
  completed: 'bg-[#34C759]/8',
  charged: 'bg-[#34C759]/8',
  cancelled: 'bg-[#8E8E93]/8',
  requested: 'bg-[#8E8E93]/8',
  approved: 'bg-[#5AC8FA]/8',
  revision_needed: 'bg-[#FF3B30]/8',
}

const TIMELINE_CARD_BORDER: Record<string, string> = {
  scheduled: 'border-l-[#007AFF]',
  driving: 'border-l-[#5AC8FA]',
  arrived: 'border-l-[#FF9F0A]',
  in_progress: 'border-l-[#FFD60A]',
  pending_review: 'border-l-[#AF52DE]',
  completed: 'border-l-[#34C759]',
  charged: 'border-l-[#34C759]',
  cancelled: 'border-l-[#8E8E93]',
  requested: 'border-l-[#8E8E93]',
  approved: 'border-l-[#5AC8FA]',
  revision_needed: 'border-l-[#FF3B30]',
}

const WORKER_COLORS = [
  'bg-[#34C759]',
  'bg-[#007AFF]',
  'bg-[#AF52DE]',
  'bg-[#FF9F0A]',
  'bg-[#FF3B30]',
  'bg-[#5AC8FA]',
]

// ── Helpers ──────────────────────────────────────────────────────────────

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isTodayCheck(date: Date): boolean {
  const now = new Date()
  const pacificStr = now.toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ })
  return formatDateKey(date) === pacificStr
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: PACIFIC_TZ })
}

function formatDayNumber(date: Date): number {
  return date.getDate()
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${mStr} ${ampm}`
}

function getEndTime(startTime: string): string {
  const [hStr, mStr] = startTime.split(':')
  const h = parseInt(hStr, 10) + DEFAULT_DURATION_HOURS
  return `${String(h).padStart(2, '0')}:${mStr}`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getWorkerColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return WORKER_COLORS[Math.abs(hash) % WORKER_COLORS.length]
}

function getPacificNowHours(): number {
  const now = new Date()
  const pacificStr = now.toLocaleTimeString('en-US', {
    timeZone: PACIFIC_TZ,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  })
  const [h, m] = pacificStr.split(':').map(Number)
  return h + m / 60
}

function getPacificTodayKey(): string {
  const now = new Date()
  return now.toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ })
}

// ── Positioned Job Card ──────────────────────────────────────────────────

function TimelineCard({
  job,
  topPx,
  heightPx,
  onClick,
}: {
  job: TimelineJob
  topPx: number
  heightPx: number
  onClick: () => void
}) {
  const bg = TIMELINE_CARD_BG[job.status] ?? 'bg-[#F2F2F7]'
  const border = TIMELINE_CARD_BORDER[job.status] ?? 'border-l-[#8E8E93]'
  const timeRange = job.scheduled_time
    ? `${formatTime12h(job.scheduled_time)} - ${formatTime12h(getEndTime(job.scheduled_time))}`
    : 'No time set'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`absolute left-1 right-1 rounded-xl p-1.5 cursor-pointer border-l-2 ${bg} ${border}
        hover:shadow-md hover:scale-[1.02] transition-all z-10 overflow-hidden`}
      style={{ top: `${topPx}px`, height: `${Math.max(heightPx, 28)}px` }}
      onClick={onClick}
    >
      <p className="text-[10px] font-semibold text-[#1C1C1E] truncate leading-tight">
        {job.service_name}
      </p>
      <p className="text-[9px] text-[#8E8E93] truncate leading-tight">
        {timeRange}
      </p>
      {heightPx >= 44 && job.worker_name && (
        <div className="flex items-center gap-1 mt-0.5">
          <div
            className={`w-4 h-4 rounded-full ${getWorkerColor(job.worker_name)} text-white text-[7px] font-bold flex items-center justify-center shrink-0`}
          >
            {getInitials(job.worker_name)}
          </div>
          <span className="text-[8px] text-[#8E8E93] truncate">
            {job.worker_name}
          </span>
        </div>
      )}
      {heightPx >= 56 && (
        <p className="text-[8px] text-[#636366] truncate mt-0.5">
          {job.address_street}
        </p>
      )}
    </motion.div>
  )
}

// ── Current Time Indicator ───────────────────────────────────────────────

function CurrentTimeIndicator({ columnIndex }: { columnIndex: number }) {
  const nowHours = getPacificNowHours()
  if (nowHours < START_HOUR || nowHours > END_HOUR) return null
  const topPx = (nowHours - START_HOUR) * HOUR_HEIGHT
  // The indicator spans across the "today" column only
  // columnIndex is 0-based among the 7 day columns
  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
      style={{ top: `${topPx}px` }}
    >
      <div className="w-2 h-2 rounded-full bg-[#FF3B30] -ml-1 shrink-0" />
      <div className="flex-1 h-[2px] bg-[#FF3B30]" />
    </div>
  )
}

// ── Main Timeline View ───────────────────────────────────────────────────

export function TimelineView({ days, jobs, onJobClick }: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayKey = getPacificTodayKey()

  // Group jobs by date key, only for the 7 visible days
  const dayKeys = useMemo(() => days.map(formatDateKey), [days])
  const jobsByDay = useMemo(() => {
    const map = new Map<string, TimelineJob[]>()
    for (const key of dayKeys) {
      map.set(key, [])
    }
    for (const job of jobs) {
      const existing = map.get(job.scheduled_date)
      if (existing) {
        map.set(job.scheduled_date, [...existing, job])
      }
    }
    return map
  }, [jobs, dayKeys])

  // Scroll to current time on mount
  useEffect(() => {
    if (!scrollRef.current) return
    const nowHours = getPacificNowHours()
    const scrollTarget = Math.max(0, (nowHours - START_HOUR - 1) * HOUR_HEIGHT)
    scrollRef.current.scrollTop = scrollTarget
  }, [])

  const hours = useMemo(
    () => Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i),
    []
  )

  const todayColIndex = dayKeys.indexOf(todayKey)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Sticky header row with day names */}
      <div className="flex border-b border-[#E5E5EA]">
        {/* Time gutter header */}
        <div className="w-16 shrink-0 border-r border-[#E5E5EA] bg-white/60 backdrop-blur-sm" />
        {/* Day column headers */}
        <div className="flex-1 grid grid-cols-7">
          {days.map((day, i) => {
            const key = dayKeys[i]
            const today = key === todayKey
            return (
              <div
                key={key}
                className={`flex flex-col items-center py-2.5 border-r border-[#E5E5EA] last:border-r-0
                  ${today ? 'bg-[#007AFF]/5' : 'bg-white/60 backdrop-blur-sm'}`}
              >
                <span className={`text-[10px] font-semibold uppercase ${today ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`}>
                  {formatDayLabel(day)}
                </span>
                <span
                  className={`text-lg font-bold leading-tight mt-0.5
                    ${today
                      ? 'w-8 h-8 rounded-full bg-[#007AFF] text-white flex items-center justify-center'
                      : 'text-[#1C1C1E]'
                    }`}
                >
                  {formatDayNumber(day)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Scrollable grid body */}
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 340px)' }}
      >
        <div className="flex" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
          {/* Time gutter */}
          <div className="w-16 shrink-0 border-r border-[#E5E5EA] relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full pr-2 text-right"
                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
              >
                <span className="text-[10px] font-medium text-[#8E8E93] -translate-y-1/2 inline-block">
                  {formatHourLabel(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex-1 grid grid-cols-7 relative">
            {days.map((day, colIdx) => {
              const key = dayKeys[colIdx]
              const today = key === todayKey
              const dayJobs = jobsByDay.get(key) ?? []

              return (
                <div
                  key={key}
                  className={`relative border-r border-[#E5E5EA] last:border-r-0 ${today ? 'bg-[#007AFF]/[0.03]' : ''}`}
                >
                  {/* Hour grid lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 border-t border-[#F2F2F7]"
                      style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
                    />
                  ))}

                  {/* Half-hour grid lines (dashed) */}
                  {hours.map((hour) => (
                    <div
                      key={`${hour}-half`}
                      className="absolute left-0 right-0 border-t border-dashed border-[#F2F2F7]/60"
                      style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
                    />
                  ))}

                  {/* Current time indicator */}
                  {today && todayColIndex >= 0 && <CurrentTimeIndicator columnIndex={colIdx} />}

                  {/* Job cards */}
                  {dayJobs.map((job) => {
                    const { topPx, heightPx } = getJobPosition(job)
                    return (
                      <TimelineCard
                        key={job.id}
                        job={job}
                        topPx={topPx}
                        heightPx={heightPx}
                        onClick={() => onJobClick(job.id)}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Position calculator ──────────────────────────────────────────────────

function getJobPosition(job: TimelineJob): { topPx: number; heightPx: number } {
  if (!job.scheduled_time) {
    // No time set - place at 6 AM
    return { topPx: 2, heightPx: HOUR_HEIGHT - 4 }
  }

  const [hStr, mStr] = job.scheduled_time.split(':')
  const hour = parseInt(hStr, 10)
  const minute = parseInt(mStr, 10)
  const fractionalHour = hour + minute / 60

  // Clamp within visible range
  const clampedStart = Math.max(fractionalHour, START_HOUR)
  const topPx = (clampedStart - START_HOUR) * HOUR_HEIGHT + 1
  const heightPx = DEFAULT_DURATION_HOURS * HOUR_HEIGHT - 2

  return { topPx, heightPx }
}
