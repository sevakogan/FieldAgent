'use client'

import { useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

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

const PACIFIC_TZ = 'America/Los_Angeles'
const HOUR_HEIGHT = 72
const START_HOUR = 5
const END_HOUR = 24
const TOTAL_HOURS = END_HOUR - START_HOUR
const DEFAULT_DURATION_HOURS = 1

// Pastel card colors — rotate by service name hash for variety (like the screenshot)
const CARD_PALETTES = [
  { bg: 'rgba(0, 122, 255, 0.08)', border: '#007AFF', text: '#0055B3' },    // blue
  { bg: 'rgba(175, 82, 222, 0.08)', border: '#AF52DE', text: '#8B44B8' },   // purple
  { bg: 'rgba(255, 159, 10, 0.10)', border: '#FF9F0A', text: '#CC7F08' },   // orange
  { bg: 'rgba(52, 199, 89, 0.08)', border: '#34C759', text: '#248A3D' },    // green
  { bg: 'rgba(255, 45, 85, 0.08)', border: '#FF2D55', text: '#D62246' },    // pink
  { bg: 'rgba(90, 200, 250, 0.10)', border: '#5AC8FA', text: '#2E8EB8' },   // cyan
  { bg: 'rgba(255, 214, 10, 0.12)', border: '#FFD60A', text: '#B8860B' },   // yellow
  { bg: 'rgba(88, 86, 214, 0.08)', border: '#5856D6', text: '#4745AB' },    // indigo
]

const WORKER_COLORS = ['#34C759', '#007AFF', '#AF52DE', '#FF9F0A', '#FF3B30', '#5AC8FA']

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function getCardPalette(serviceName: string) {
  return CARD_PALETTES[hashStr(serviceName) % CARD_PALETTES.length]
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isTodayCheck(date: Date): boolean {
  return formatDateKey(date) === new Date().toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ })
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: PACIFIC_TZ })
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
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${mStr} ${h >= 12 ? 'PM' : 'AM'}`
}

function getEndTime(startTime: string): string {
  const [hStr, mStr] = startTime.split(':')
  return `${String(parseInt(hStr, 10) + DEFAULT_DURATION_HOURS).padStart(2, '0')}:${mStr}`
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getWorkerColor(name: string): string {
  return WORKER_COLORS[hashStr(name) % WORKER_COLORS.length]
}

function getPacificNowHours(): number {
  const s = new Date().toLocaleTimeString('en-US', { timeZone: PACIFIC_TZ, hour12: false, hour: '2-digit', minute: '2-digit' })
  const [h, m] = s.split(':').map(Number)
  return h + m / 60
}

function getPacificTodayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ })
}

function getJobPosition(job: TimelineJob): { topPx: number; heightPx: number } {
  if (!job.scheduled_time) return { topPx: 2, heightPx: HOUR_HEIGHT - 4 }
  const [hStr, mStr] = job.scheduled_time.split(':')
  const fractional = parseInt(hStr, 10) + parseInt(mStr, 10) / 60
  const clamped = Math.max(fractional, START_HOUR)
  return { topPx: (clamped - START_HOUR) * HOUR_HEIGHT + 2, heightPx: DEFAULT_DURATION_HOURS * HOUR_HEIGHT - 4 }
}

// ── Job Card ──────────────────────────────────────────────────────────
function TimelineCard({ job, topPx, heightPx, onClick }: { job: TimelineJob; topPx: number; heightPx: number; onClick: () => void }) {
  const palette = getCardPalette(job.service_name)
  const timeRange = job.scheduled_time ? `${formatTime12h(job.scheduled_time)} – ${formatTime12h(getEndTime(job.scheduled_time))}` : 'No time'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="absolute left-1 right-1 rounded-2xl cursor-pointer hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all z-10 overflow-hidden border-l-[3px]"
      style={{
        top: `${topPx}px`,
        height: `${Math.max(heightPx, 36)}px`,
        background: palette.bg,
        borderLeftColor: palette.border,
      }}
      onClick={onClick}
    >
      <div className="p-2 h-full flex flex-col justify-between">
        <div>
          <p className="text-[11px] font-bold truncate leading-tight" style={{ color: palette.text }}>
            {job.service_name}
          </p>
          <p className="text-[9px] text-[#8E8E93] leading-tight mt-0.5">{timeRange}</p>
        </div>
        {heightPx >= 52 && (
          <div className="flex items-center justify-between mt-1">
            {job.worker_name ? (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full text-white text-[7px] font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: getWorkerColor(job.worker_name) }}>
                  {getInitials(job.worker_name)}
                </div>
                <span className="text-[8px] text-[#636366] truncate max-w-[60px]">{job.worker_name.split(' ')[0]}</span>
              </div>
            ) : <div />}
            <span className="text-[9px] font-semibold text-[#1C1C1E]">${Number(job.price).toFixed(0)}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Current Time Line ─────────────────────────────────────────────────
function CurrentTimeLine() {
  const nowHours = getPacificNowHours()
  if (nowHours < START_HOUR || nowHours > END_HOUR) return null
  const topPx = (nowHours - START_HOUR) * HOUR_HEIGHT
  return (
    <div className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" style={{ top: `${topPx}px` }}>
      <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] -ml-1 shrink-0 shadow-sm" />
      <div className="flex-1 h-[2px] bg-[#FF3B30] shadow-sm" />
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────
export function TimelineView({ days, jobs, onJobClick }: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayKey = getPacificTodayKey()

  const dayKeys = useMemo(() => days.map(formatDateKey), [days])
  const jobsByDay = useMemo(() => {
    const map = new Map<string, TimelineJob[]>()
    for (const key of dayKeys) map.set(key, [])
    for (const job of jobs) {
      const existing = map.get(job.scheduled_date)
      if (existing) map.set(job.scheduled_date, [...existing, job])
    }
    return map
  }, [jobs, dayKeys])

  useEffect(() => {
    if (!scrollRef.current) return
    const scrollTarget = Math.max(0, (getPacificNowHours() - START_HOUR - 1) * HOUR_HEIGHT)
    scrollRef.current.scrollTop = scrollTarget
  }, [])

  const hours = useMemo(() => Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i), [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Day headers */}
      <div className="flex border-b border-[#E5E5EA]/50">
        <div className="w-14 shrink-0" />
        <div className="flex-1 grid grid-cols-7">
          {days.map((day, i) => {
            const key = dayKeys[i]
            const today = key === todayKey
            return (
              <div key={key} className={`flex flex-col items-center py-3 border-r border-[#E5E5EA]/30 last:border-r-0 ${today ? 'bg-[#007AFF]/[0.04]' : ''}`}>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${today ? 'text-[#007AFF]' : 'text-[#AEAEB2]'}`}>
                  {formatDayLabel(day)}
                </span>
                <span className={`text-lg font-bold mt-0.5 leading-none ${
                  today ? 'w-9 h-9 rounded-full bg-[#007AFF] text-white flex items-center justify-center' : 'text-[#1C1C1E]'
                }`}>
                  {day.getDate()}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        <div className="flex relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
          {/* Time labels */}
          <div className="w-14 shrink-0 relative">
            {hours.map(hour => (
              <div key={hour} className="absolute w-full pr-2 text-right" style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT - 6}px` }}>
                <span className="text-[10px] font-medium text-[#AEAEB2]">{formatHourLabel(hour)}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex-1 grid grid-cols-7">
            {days.map((day, colIdx) => {
              const key = dayKeys[colIdx]
              const today = key === todayKey
              const dayJobs = jobsByDay.get(key) ?? []

              return (
                <div key={key} className={`relative border-r border-[#E5E5EA]/20 last:border-r-0 ${today ? 'bg-[#007AFF]/[0.02]' : ''}`}>
                  {/* Hour lines */}
                  {hours.map(hour => (
                    <div key={hour} className="absolute left-0 right-0 border-t border-[#E5E5EA]/30" style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }} />
                  ))}
                  {/* Half-hour lines */}
                  {hours.map(hour => (
                    <div key={`${hour}h`} className="absolute left-0 right-0 border-t border-dashed border-[#E5E5EA]/15" style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }} />
                  ))}

                  {/* Current time */}
                  {today && <CurrentTimeLine />}

                  {/* Job cards */}
                  {dayJobs.map(job => {
                    const { topPx, heightPx } = getJobPosition(job)
                    return <TimelineCard key={job.id} job={job} topPx={topPx} heightPx={heightPx} onClick={() => onJobClick(job.id)} />
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
