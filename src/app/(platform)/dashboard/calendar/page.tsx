'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getCalendarJobs } from '@/lib/actions/company'
import { updateJob } from '@/lib/actions/jobs'
import { StatusBadge } from '@/components/platform/Badge'

const PACIFIC_TZ = 'America/Los_Angeles'

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

function hashStr(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }

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

export default function CalendarPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<CalendarJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dragJob, setDragJob] = useState<CalendarJob | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [confirmMove, setConfirmMove] = useState<{ job: CalendarJob; newDate: string } | null>(null)
  const [moving, setMoving] = useState(false)
  const [weekCount, setWeekCount] = useState(3) // 1, 2, 3, or 4 weeks

  const days = useMemo(() => {
    const today = new Date()
    const start = new Date(today)
    // Center today: go back enough weeks so today is in the middle
    const weeksBack = Math.floor(weekCount / 2)
    start.setDate(today.getDate() - today.getDay() - (weeksBack * 7))
    return Array.from({ length: weekCount * 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [weekCount])

  const todayKey = getTodayKey()
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: PACIFIC_TZ })
  const rangeLabel = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[days.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  const now = new Date()
  const fetchJobs = useCallback(async () => {
    setLoading(true)
    const result = await getCalendarJobs(now.getFullYear(), now.getMonth())
    if (result.success && result.data) setJobs(result.data as CalendarJob[])
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const jobsByDate = useMemo(() => {
    const map = new Map<string, CalendarJob[]>()
    for (const j of jobs) map.set(j.scheduled_date, [...(map.get(j.scheduled_date) ?? []), j])
    return map
  }, [jobs])

  const selectedJobs = useMemo(() => {
    if (!selectedDate) return []
    return (jobsByDate.get(selectedDate) ?? []).sort((a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''))
  }, [selectedDate, jobsByDate])

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
    await fetchJobs()
    setConfirmMove(null)
    setMoving(false)
  }

  // Build week groups dynamically
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">{currentMonth}</h1>
          <p className="text-xs text-[#8E8E93] mt-0.5">{rangeLabel}</p>
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
          <button onClick={() => setSelectedDate(todayKey)}
            className="px-3 py-1.5 bg-[#007AFF] text-white rounded-xl text-xs font-semibold hover:bg-[#0066DD] transition-colors">
            Today
          </button>
          <Link href="/dashboard/jobs/new"
            className="px-4 py-2 bg-[#1C1C1E] text-white rounded-2xl text-xs font-semibold hover:bg-[#3C3C43] transition-colors">
            + New Job
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 3-Week Grid */}
          {weeks.map((week, wi) => (
            <div key={wi}>
              <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-widest mb-2 px-1">{week.label}</p>
              <div className="grid grid-cols-7 gap-1.5">
                {wi === 0 && (
                  // Day headers only on first week
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
                      onClick={() => setSelectedDate(key)}
                      onDragOver={(e) => { e.preventDefault(); setDropTarget(key) }}
                      onDragLeave={() => setDropTarget(null)}
                      onDrop={() => handleDrop(key)}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className={`min-h-[80px] rounded-2xl flex flex-col items-center pt-2 pb-1.5 cursor-pointer transition-all relative ${
                        isToday ? 'ring-2 ring-[#007AFF] bg-white shadow-lg shadow-[#007AFF]/10'
                        : isDrop ? 'ring-2 ring-[#34C759] bg-[#34C759]/5'
                        : isSelected ? 'bg-[#007AFF]/6 ring-1 ring-[#007AFF]/20'
                        : count > 0 ? 'bg-white shadow-sm'
                        : isPast && isThisMonth ? 'bg-[#F2F2F7]/40'
                        : !isThisMonth ? 'bg-[#F9F9FB]/30'
                        : 'bg-white/30'
                      }`}
                      style={isToday ? { boxShadow: '0 4px 20px rgba(0,122,255,0.12)' } : undefined}
                    >
                      <span className={`text-sm font-semibold leading-none ${
                        isToday ? 'text-[#007AFF]'
                        : !isThisMonth ? 'text-[#D1D1D6]'
                        : isPast && count === 0 ? 'text-[#C7C7CC]'
                        : 'text-[#1C1C1E]'
                      }`}>{day.getDate()}</span>

                      {count > 0 && (
                        <>
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className={`text-xl font-bold mt-0.5 leading-none ${
                              count >= 6 ? 'text-[#FF3B30]' : count >= 3 ? 'text-[#FF9F0A]' : 'text-[#34C759]'
                            }`}>{count}</motion.span>
                          {/* Job mini-cards inside the cell */}
                          <div className="w-full px-1 mt-1 space-y-0.5">
                            {dayJobs.slice(0, 2).map(j => {
                              const c = getColor(j.service_name)
                              return (
                                <div key={j.id} className="flex items-center gap-1 rounded-lg px-1 py-0.5"
                                  style={{ backgroundColor: c.light }}>
                                  {j.worker_name ? (
                                    <span className="w-3 h-3 rounded-full text-white text-[6px] font-bold flex items-center justify-center shrink-0"
                                      style={{ backgroundColor: c.bg }}>
                                      {j.worker_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                    </span>
                                  ) : (
                                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.bg }} />
                                  )}
                                  <span className="text-[7px] font-semibold truncate" style={{ color: c.text }}>
                                    {j.client_name?.split(' ')[0] ?? j.service_name.split(' ')[0]}
                                  </span>
                                </div>
                              )
                            })}
                            {count > 2 && (
                              <p className="text-[7px] text-[#8E8E93] text-center font-medium">+{count - 2}</p>
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

          {/* Selected Day — Job Cards */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                }}
              >
                <div className="px-4 py-3 border-b border-[#E5E5EA]/20 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#1C1C1E]">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: PACIFIC_TZ })}
                    </h2>
                    <p className="text-[10px] text-[#8E8E93]">{selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={() => setSelectedDate(null)} className="w-7 h-7 rounded-full bg-[#F2F2F7] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-3">
                  {selectedJobs.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-[#8E8E93]">No jobs this day</p>
                      <Link href="/dashboard/jobs/new" className="text-xs text-[#007AFF] mt-2 inline-block hover:underline">+ Schedule a job</Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedJobs.map((job, i) => {
                        const color = getColor(job.service_name)
                        return (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            draggable
                            onDragStart={() => setDragJob(job)}
                            onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                            className="flex items-center gap-3 p-3 rounded-2xl cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-l-[3px]"
                            style={{ backgroundColor: color.light, borderLeftColor: color.bg }}
                          >
                            <span className="text-lg">{getServiceIcon(job.service_name)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#1C1C1E] truncate">{job.service_name}</span>
                                <StatusBadge status={job.status} />
                              </div>
                              <p className="text-[11px] text-[#636366] truncate mt-0.5">
                                {job.scheduled_time ? fmtTime(job.scheduled_time) + ' · ' : ''}
                                {job.address_street}
                                {job.client_name ? ` · ${job.client_name}` : ''}
                              </p>
                            </div>
                            {job.price != null && (
                              <span className="text-base font-bold text-[#1C1C1E] shrink-0">${Number(job.price).toFixed(0)}</span>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" /><span className="text-[10px] text-[#8E8E93] font-medium">1–2 jobs</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF9F0A]" /><span className="text-[10px] text-[#8E8E93] font-medium">3–5 jobs</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" /><span className="text-[10px] text-[#8E8E93] font-medium">6+ jobs</span></div>
          </div>
        </div>
      )}

      {/* Confirm Move Modal */}
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
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{getServiceIcon(confirmMove.job.service_name)}</span>
                <div>
                  <h3 className="text-sm font-bold text-[#1C1C1E]">Move Job?</h3>
                  <p className="text-xs text-[#8E8E93]">{confirmMove.job.service_name}</p>
                </div>
              </div>
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
    </div>
  )
}
