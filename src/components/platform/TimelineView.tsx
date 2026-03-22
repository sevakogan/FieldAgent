'use client'

import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface TimelineJob {
  id: string
  address_street: string
  address_city: string
  service_name: string
  worker_name: string | null
  client_name?: string | null
  status: string
  scheduled_date: string
  scheduled_time: string | null
  price: number
}

interface TimelineViewProps {
  days: Date[]
  jobs: TimelineJob[]
  onJobClick: (jobId: string) => void
  onJobMove?: (jobId: string, newDate: string) => void
}

const PACIFIC_TZ = 'America/Los_Angeles'
const HOUR_HEIGHT = 56 // compact
const START_HOUR = 7
const END_HOUR = 19 // 7 PM
const TOTAL_HOURS = END_HOUR - START_HOUR
const DEFAULT_DURATION = 1

const PALETTES = [
  { bg: 'rgba(0,122,255,0.12)', border: '#007AFF', text: '#0055B3', shadow: 'rgba(0,122,255,0.15)' },
  { bg: 'rgba(175,82,222,0.12)', border: '#AF52DE', text: '#8B44B8', shadow: 'rgba(175,82,222,0.15)' },
  { bg: 'rgba(255,159,10,0.14)', border: '#FF9F0A', text: '#CC7F08', shadow: 'rgba(255,159,10,0.15)' },
  { bg: 'rgba(52,199,89,0.12)', border: '#34C759', text: '#248A3D', shadow: 'rgba(52,199,89,0.15)' },
  { bg: 'rgba(255,45,85,0.12)', border: '#FF2D55', text: '#D62246', shadow: 'rgba(255,45,85,0.15)' },
  { bg: 'rgba(90,200,250,0.14)', border: '#5AC8FA', text: '#2E8EB8', shadow: 'rgba(90,200,250,0.15)' },
  { bg: 'rgba(255,214,10,0.16)', border: '#FFD60A', text: '#8B7500', shadow: 'rgba(255,214,10,0.15)' },
  { bg: 'rgba(88,86,214,0.12)', border: '#5856D6', text: '#4745AB', shadow: 'rgba(88,86,214,0.15)' },
]

const WORKER_COLORS = ['#34C759', '#007AFF', '#AF52DE', '#FF9F0A', '#FF3B30', '#5AC8FA']

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function getPalette(name: string) { return PALETTES[hash(name) % PALETTES.length] }
function getWorkerColor(name: string) { return WORKER_COLORS[hash(name) % WORKER_COLORS.length] }
function getInitials(name: string) { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }

function fmtDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtHour(h: number) {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function fmtTime(t: string | null) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = parseInt(h, 10)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

function fmtEndTime(t: string) {
  const [h, m] = t.split(':')
  return `${String(parseInt(h, 10) + DEFAULT_DURATION).padStart(2, '0')}:${m}`
}

function getNowHours() {
  const s = new Date().toLocaleTimeString('en-US', { timeZone: PACIFIC_TZ, hour12: false, hour: '2-digit', minute: '2-digit' })
  const [h, m] = s.split(':').map(Number)
  return h + m / 60
}

function getPos(job: TimelineJob) {
  if (!job.scheduled_time) return { top: 2, height: HOUR_HEIGHT - 4 }
  const [h, m] = job.scheduled_time.split(':').map(Number)
  const frac = Math.max(h + m / 60, START_HOUR)
  return { top: (frac - START_HOUR) * HOUR_HEIGHT + 2, height: DEFAULT_DURATION * HOUR_HEIGHT - 4 }
}

// ── Draggable Card ────────────────────────────────────────────────────
function Card({ job, topPx, heightPx, onClick, onDragToDayIndex, dayCount }: {
  job: TimelineJob
  topPx: number
  heightPx: number
  onClick: () => void
  onDragToDayIndex?: (dayIdx: number) => void
  dayCount: number
}) {
  const p = getPalette(job.service_name)
  const range = job.scheduled_time ? `${fmtTime(job.scheduled_time)} – ${fmtTime(fmtEndTime(job.scheduled_time))}` : ''
  const [dragging, setDragging] = useState(false)

  const handleDragEnd = useCallback((_: unknown, info: { point: { x: number } }) => {
    setDragging(false)
    if (!onDragToDayIndex) return

    // Find which column we dropped into
    const el = document.querySelector('[data-timeline-grid]')
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = info.point.x - rect.left
    const colWidth = rect.width / dayCount
    const dayIdx = Math.max(0, Math.min(dayCount - 1, Math.floor(relX / colWidth)))
    onDragToDayIndex(dayIdx)
  }, [onDragToDayIndex, dayCount])

  return (
    <motion.div
      drag={!!onDragToDayIndex}
      dragSnapToOrigin={!dragging}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: `0 12px 32px ${p.shadow}, 0 4px 12px rgba(0,0,0,0.08)` }}
      whileHover={{ y: -1, boxShadow: `0 6px 20px ${p.shadow}, 0 2px 8px rgba(0,0,0,0.06)` }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute left-1 right-1 rounded-2xl cursor-grab active:cursor-grabbing overflow-hidden border-l-[3px] z-10"
      style={{
        top: `${topPx}px`,
        height: `${Math.max(heightPx, 40)}px`,
        background: p.bg,
        borderLeftColor: p.border,
        boxShadow: `0 2px 8px ${p.shadow}, 0 1px 3px rgba(0,0,0,0.04)`,
      }}
      onClick={(e) => { if (!dragging) onClick(); e.stopPropagation() }}
    >
      <div className="p-1.5 h-full flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-bold truncate leading-tight" style={{ color: p.text }}>
            {job.service_name}
          </p>
          {range && <p className="text-[8px] text-[#8E8E93] leading-tight">{range}</p>}
        </div>
        {heightPx >= 44 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 min-w-0">
              {job.worker_name && (
                <div className="w-3.5 h-3.5 rounded-full text-white text-[6px] font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: getWorkerColor(job.worker_name) }}>
                  {getInitials(job.worker_name)}
                </div>
              )}
              <span className="text-[7px] text-[#636366] truncate">
                {job.client_name ?? job.address_street.split(',')[0]}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#1C1C1E]">${Number(job.price).toFixed(0)}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────
export function TimelineView({ days, jobs, onJobClick, onJobMove }: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ })

  const dayKeys = useMemo(() => days.map(fmtDateKey), [days])
  const jobsByDay = useMemo(() => {
    const map = new Map<string, TimelineJob[]>()
    for (const k of dayKeys) map.set(k, [])
    for (const j of jobs) {
      const arr = map.get(j.scheduled_date)
      if (arr) map.set(j.scheduled_date, [...arr, j])
    }
    return map
  }, [jobs, dayKeys])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = Math.max(0, (getNowHours() - START_HOUR - 1) * HOUR_HEIGHT)
  }, [])

  const hours = useMemo(() => Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i), [])

  const handleDrop = useCallback((jobId: string, dayIdx: number) => {
    if (!onJobMove) return
    const newDate = dayKeys[dayIdx]
    if (newDate) onJobMove(jobId, newDate)
  }, [onJobMove, dayKeys])

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.5)',
      }}>
      {/* Day headers */}
      <div className="flex border-b border-[#E5E5EA]/40">
        <div className="w-12 shrink-0" />
        <div className="flex-1 grid grid-cols-7">
          {days.map((day, i) => {
            const today = dayKeys[i] === todayKey
            return (
              <div key={dayKeys[i]} className={`flex flex-col items-center py-2.5 border-r border-[#E5E5EA]/20 last:border-r-0 ${today ? 'bg-[#007AFF]/[0.04]' : ''}`}>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${today ? 'text-[#007AFF]' : 'text-[#C7C7CC]'}`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short', timeZone: PACIFIC_TZ })}
                </span>
                <span className={`text-base font-bold mt-0.5 leading-none ${
                  today ? 'w-8 h-8 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-md shadow-[#007AFF]/25' : 'text-[#1C1C1E]'
                }`}>
                  {day.getDate()}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <div className="flex relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
          {/* Time gutter */}
          <div className="w-12 shrink-0 relative">
            {hours.map(h => (
              <div key={h} className="absolute w-full pr-1.5 text-right" style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT - 5}px` }}>
                <span className="text-[9px] font-medium text-[#C7C7CC]">{fmtHour(h)}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex-1 grid grid-cols-7" data-timeline-grid>
            {days.map((day, colIdx) => {
              const key = dayKeys[colIdx]
              const today = key === todayKey
              const dj = jobsByDay.get(key) ?? []

              return (
                <div key={key} className={`relative border-r border-[#E5E5EA]/15 last:border-r-0 ${today ? 'bg-[#007AFF]/[0.02]' : ''}`}>
                  {hours.map(h => (
                    <div key={h} className="absolute left-0 right-0 border-t border-[#E5E5EA]/25" style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT}px` }} />
                  ))}
                  {hours.map(h => (
                    <div key={`${h}h`} className="absolute left-0 right-0 border-t border-dotted border-[#E5E5EA]/10" style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }} />
                  ))}

                  {/* Now line */}
                  {today && (() => {
                    const now = getNowHours()
                    if (now < START_HOUR || now > END_HOUR) return null
                    const top = (now - START_HOUR) * HOUR_HEIGHT
                    return (
                      <div className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" style={{ top: `${top}px` }}>
                        <div className="w-2 h-2 rounded-full bg-[#FF3B30] -ml-0.5 shrink-0 shadow-sm shadow-[#FF3B30]/30" />
                        <div className="flex-1 h-[1.5px] bg-[#FF3B30]/80" />
                      </div>
                    )
                  })()}

                  {/* Cards */}
                  {dj.map(job => {
                    const { top, height } = getPos(job)
                    return (
                      <Card
                        key={job.id}
                        job={job}
                        topPx={top}
                        heightPx={height}
                        onClick={() => onJobClick(job.id)}
                        onDragToDayIndex={onJobMove ? (idx) => handleDrop(job.id, idx) : undefined}
                        dayCount={7}
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
