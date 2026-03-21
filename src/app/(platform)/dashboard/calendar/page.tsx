'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getCalendarJobs } from '@/lib/actions/company'
import { updateJob } from '@/lib/actions/jobs'

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

// Client colors — consistent per client name via hash
const CLIENT_COLORS = [
  '#007AFF', '#34C759', '#FF9F0A', '#AF52DE', '#FF5A5B',
  '#5AC8FA', '#30D158', '#FF6482', '#64D2FF', '#FFD60A',
  '#FF2D55', '#00C7BE', '#BF5AF2', '#FF6B6B', '#32ADE6',
]

// Service type border accents — different from client fills
const SERVICE_ACCENTS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF',
  '#5856D6', '#AF52DE', '#FF2D55', '#A2845E', '#00C7BE',
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function getClientColor(clientName: string | null): string {
  if (!clientName) return '#8E8E93'
  return CLIENT_COLORS[hashString(clientName) % CLIENT_COLORS.length]
}

function getServiceAccent(serviceName: string): string {
  return SERVICE_ACCENTS[hashString(serviceName) % SERVICE_ACCENTS.length]
}

function formatTime(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function CalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [jobs, setJobs] = useState<CalendarJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'schedule' | 'month'>('month')

  // Drag-and-drop state
  const [dragJobId, setDragJobId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [confirmMove, setConfirmMove] = useState<{
    job: CalendarJob
    fromDate: string
    toDate: string
  } | null>(null)
  const [moving, setMoving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getCalendarJobs(currentYear, currentMonth)
    if (result.success && result.data) {
      setJobs(result.data as CalendarJob[])
    } else {
      setError(result.error ?? 'Failed to load')
    }
    setLoading(false)
  }, [currentYear, currentMonth])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const workerNames = [...new Set(jobs.map(j => j.worker_name).filter(Boolean))] as string[]
  const clientNames = [...new Set(jobs.map(j => j.client_name).filter(Boolean))] as string[]
  const serviceNames = [...new Set(jobs.map(j => j.service_name))]

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(currentYear - 1); setCurrentMonth(11) }
    else setCurrentMonth(currentMonth - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(currentYear + 1); setCurrentMonth(0) }
    else setCurrentMonth(currentMonth + 1)
  }

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  const getDayStr = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // Month grid
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const monthCells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete weeks
  const remainder = monthCells.length % 7
  if (remainder > 0) {
    monthCells.push(...Array.from({ length: 7 - remainder }, () => null))
  }

  const jobsByDay = new Map<number, CalendarJob[]>()
  for (const job of jobs) {
    const day = parseInt(job.scheduled_date.split('-')[2], 10)
    jobsByDay.set(day, [...(jobsByDay.get(day) ?? []), job])
  }

  // Schedule view data
  const startDay = Math.max(1, today.getMonth() === currentMonth && today.getFullYear() === currentYear ? today.getDate() - 2 : 1)
  const visibleDays = Array.from(
    { length: Math.min(14, daysInMonth - startDay + 1) },
    (_, i) => startDay + i
  )
  const addressMap = new Map<string, CalendarJob[]>()
  for (const job of jobs) {
    const key = job.address_street || 'Unassigned'
    addressMap.set(key, [...(addressMap.get(key) ?? []), job])
  }
  const addresses = Array.from(addressMap.keys()).sort()

  // Hover tooltip state
  const [hoverJob, setHoverJob] = useState<{ job: CalendarJob; x: number; y: number } | null>(null)

  // Drag handlers
  function handleDragStart(jobId: string) {
    setDragJobId(jobId)
  }

  function handleDragOver(e: React.DragEvent, dayStr: string) {
    e.preventDefault()
    setDropTarget(dayStr)
  }

  function handleDragLeave() {
    setDropTarget(null)
  }

  function handleDrop(e: React.DragEvent, targetDay: number) {
    e.preventDefault()
    setDropTarget(null)

    if (!dragJobId) return
    const job = jobs.find(j => j.id === dragJobId)
    if (!job) return

    const toDateStr = getDayStr(targetDay)
    if (job.scheduled_date === toDateStr) {
      setDragJobId(null)
      return
    }

    setConfirmMove({ job, fromDate: job.scheduled_date, toDate: toDateStr })
    setDragJobId(null)
  }

  async function handleConfirmMove() {
    if (!confirmMove) return
    setMoving(true)

    const result = await updateJob(confirmMove.job.id, {
      scheduled_date: confirmMove.toDate,
    })

    if (result.success) {
      setToast(`Job moved to ${formatDate(confirmMove.toDate)}`)
      setConfirmMove(null)
      await fetchData()
    } else {
      setToast(result.error ?? 'Failed to move job')
    }
    setMoving(false)
  }

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-[#34C759] text-white text-sm font-semibold shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-white border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#007AFF] flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">
            {monthName} <span className="text-[#8E8E93] font-normal">{currentYear}</span>
          </h1>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-white border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#007AFF] flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#F2F2F7] rounded-xl p-0.5 flex border border-[#E5E5EA]">
            <button
              onClick={() => setView('schedule')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === 'schedule' ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === 'month' ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              Month
            </button>
          </div>
          <Link href="/dashboard/jobs/new" className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors">
            + New Job
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {/* Legend — Clients (fill) + Services (accent) */}
      {(clientNames.length > 0 || serviceNames.length > 0) && (
        <div className="flex items-center gap-6 mb-4 flex-wrap">
          {clientNames.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] text-[#8E8E93] font-semibold uppercase tracking-wider">Clients</span>
              {clientNames.map((name) => (
                <div key={name} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getClientColor(name) }} />
                  <span className="text-xs text-[#1C1C1E] font-medium">{name}</span>
                </div>
              ))}
            </div>
          )}
          {serviceNames.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] text-[#8E8E93] font-semibold uppercase tracking-wider">Services</span>
              {serviceNames.map((name) => (
                <div key={name} className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full" style={{ backgroundColor: getServiceAccent(name) }} />
                  <span className="text-xs text-[#1C1C1E]">{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'month' ? (
        /* ════ MONTH VIEW (FULL 4+ WEEKS, DRAG-AND-DROP) ══════════════ */
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#E5E5EA]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-3 text-center text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {monthCells.map((day, i) => {
              const dayJobs = day ? (jobsByDay.get(day) ?? []) : []
              const dayStr = day ? getDayStr(day) : ''
              const isDropHere = dropTarget === dayStr && dragJobId !== null

              return (
                <div
                  key={i}
                  onDragOver={day ? (e) => handleDragOver(e, dayStr) : undefined}
                  onDragLeave={day ? handleDragLeave : undefined}
                  onDrop={day ? (e) => handleDrop(e, day) : undefined}
                  className={`min-h-[120px] p-2 border-b border-r border-[#F2F2F7] transition-colors ${
                    !day ? 'bg-[#FAFAFA]' : ''
                  } ${day && isToday(day) ? 'bg-[#34C759]/5' : ''
                  } ${isDropHere ? 'bg-[#007AFF]/10 ring-2 ring-inset ring-[#007AFF]/40' : ''}`}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex items-center justify-center text-sm ${
                          isToday(day)
                            ? 'bg-[#34C759] text-white w-7 h-7 rounded-full font-bold'
                            : 'text-[#1C1C1E] font-medium'
                        }`}>
                          {day}
                        </span>
                        {dayJobs.length > 0 && (
                          <span className="text-[9px] text-[#8E8E93] font-medium">
                            {dayJobs.length} job{dayJobs.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayJobs.slice(0, 4).map((job) => {
                          const clientColor = getClientColor(job.client_name ?? null)
                          const serviceAccent = getServiceAccent(job.service_name)
                          return (
                            <div
                              key={job.id}
                              draggable
                              onDragStart={() => handleDragStart(job.id)}
                              onDragEnd={() => { setDragJobId(null); setDropTarget(null) }}
                              onMouseEnter={(e) => {
                                const rect = (e.target as HTMLElement).getBoundingClientRect()
                                setHoverJob({ job, x: rect.left + rect.width / 2, y: rect.top })
                              }}
                              onMouseLeave={() => setHoverJob(null)}
                              className="group cursor-grab active:cursor-grabbing"
                            >
                              <Link
                                href={`/dashboard/jobs/${job.id}`}
                                onClick={(e) => { if (dragJobId) e.preventDefault() }}
                                className="flex items-center gap-1 text-[10px] px-1.5 py-1 rounded-lg text-white font-medium truncate hover:brightness-110 transition-all shadow-sm border-l-[3px]"
                                style={{ backgroundColor: clientColor, borderLeftColor: serviceAccent }}
                              >
                                <span className="truncate">{job.service_name}</span>
                                {job.scheduled_time && (
                                  <span className="ml-auto opacity-75 text-[8px] shrink-0">{formatTime(job.scheduled_time)}</span>
                                )}
                              </Link>
                            </div>
                          )
                        })}
                        {dayJobs.length > 4 && (
                          <div className="text-[10px] text-[#8E8E93] pl-1 font-medium">+{dayJobs.length - 4} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ════ SCHEDULE VIEW ══════════════════════════════ */
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-[#8E8E93] text-sm">No jobs scheduled this month</p>
              <Link href="/dashboard/jobs/new" className="text-[#007AFF] text-sm mt-2 hover:underline">Schedule your first job</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#E5E5EA]">
                    <th className="sticky left-0 z-10 bg-white w-[200px] p-3 text-left border-r border-[#E5E5EA]">
                      <span className="text-[11px] text-[#8E8E93] font-semibold uppercase tracking-wider">Property</span>
                    </th>
                    {visibleDays.map((day) => (
                      <th key={day} className={`p-2 text-center min-w-[90px] border-r border-[#F2F2F7] ${isToday(day) ? 'bg-[#34C759]/5' : ''}`}>
                        <div className="text-[10px] text-[#8E8E93] uppercase font-medium">
                          {new Date(currentYear, currentMonth, day).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-sm font-bold mt-0.5 ${isToday(day) ? 'text-[#34C759]' : 'text-[#1C1C1E]'}`}>
                          {isToday(day) ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#34C759] text-white">{day}</span>
                          ) : day}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {addresses.map((address) => {
                    const addrJobs = addressMap.get(address) ?? []
                    return (
                      <tr key={address} className="border-b border-[#F2F2F7] hover:bg-[#FAFAFA] transition-colors">
                        <td className="sticky left-0 z-10 bg-white p-3 border-r border-[#E5E5EA]">
                          <div className="text-[13px] font-semibold text-[#1C1C1E] truncate max-w-[180px]">{address}</div>
                          <div className="text-[10px] text-[#8E8E93] mt-0.5">{addrJobs.length} job{addrJobs.length !== 1 ? 's' : ''}</div>
                        </td>
                        {visibleDays.map((day) => {
                          const dayStr = getDayStr(day)
                          const cellJobs = addrJobs.filter(j => j.scheduled_date === dayStr)
                          return (
                            <td key={day} className={`p-1 border-r border-[#F2F2F7] align-top ${isToday(day) ? 'bg-[#34C759]/3' : ''}`}>
                              <div className="space-y-1 min-h-[48px]">
                                {cellJobs.map((job) => {
                                  const clientColor = getClientColor(job.client_name ?? null)
                                  const serviceAccent = getServiceAccent(job.service_name)
                                  return (
                                    <Link
                                      key={job.id}
                                      href={`/dashboard/jobs/${job.id}`}
                                      draggable
                                      className="block rounded-lg px-2 py-1.5 text-white text-[11px] font-medium truncate hover:brightness-110 transition-all shadow-sm cursor-grab active:cursor-grabbing border-l-[3px]"
                                      style={{ backgroundColor: clientColor, borderLeftColor: serviceAccent }}
                                    >
                                      <div className="truncate">{job.service_name}</div>
                                      {job.price != null && (
                                        <div className="text-[10px] opacity-80 mt-0.5">${Number(job.price).toFixed(0)}</div>
                                      )}
                                    </Link>
                                  )
                                })}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══ Hover Tooltip — glass black, above card ══════════════════ */}
      <AnimatePresence>
        {hoverJob && !dragJobId && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: Math.min(Math.max(hoverJob.x - 120, 12), typeof window !== 'undefined' ? window.innerWidth - 260 : 800),
              top: hoverJob.y - 12,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="bg-black/85 backdrop-blur-xl text-white rounded-2xl px-4 py-3 shadow-2xl shadow-black/40 w-[240px] border border-white/10">
              <div className="text-[13px] font-bold mb-2">{hoverJob.job.service_name}</div>
              {hoverJob.job.client_name && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-white/40 w-12">Client</span>
                  <span className="text-[11px] text-white/90 font-medium">{hoverJob.job.client_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-white/40 w-12">Address</span>
                <span className="text-[11px] text-white/90">{hoverJob.job.address_street}</span>
              </div>
              {hoverJob.job.worker_name && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-white/40 w-12">Worker</span>
                  <span className="text-[11px] text-white/90">{hoverJob.job.worker_name}</span>
                </div>
              )}
              {hoverJob.job.scheduled_time && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-white/40 w-12">Time</span>
                  <span className="text-[11px] text-white/90 font-medium">{formatTime(hoverJob.job.scheduled_time)}</span>
                </div>
              )}
              {hoverJob.job.price != null && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40 w-12">Price</span>
                  <span className="text-[12px] font-bold text-[#34C759]">${Number(hoverJob.job.price).toFixed(2)}</span>
                </div>
              )}
              <div className="text-[9px] text-white/25 mt-2 pt-2 border-t border-white/8">
                Drag to reschedule · Click to open
              </div>
            </div>
            {/* Arrow pointing down */}
            <div className="flex justify-center -mt-[1px]">
              <div className="w-3 h-3 bg-black/85 backdrop-blur-xl rotate-45 border-r border-b border-white/10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Confirm Move Modal ══════════════════════════════ */}
      <AnimatePresence>
        {confirmMove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setConfirmMove(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1C1C1E]">Move Job?</h3>
              </div>

              <div className="bg-[#F2F2F7] rounded-xl p-4 mb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#8E8E93] w-14">Service</span>
                  <span className="text-sm font-medium text-[#1C1C1E]">{confirmMove.job.service_name}</span>
                </div>
                {confirmMove.job.client_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#8E8E93] w-14">Client</span>
                    <span className="text-sm text-[#1C1C1E]">{confirmMove.job.client_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#8E8E93] w-14">Address</span>
                  <span className="text-sm text-[#1C1C1E]">{confirmMove.job.address_street}</span>
                </div>
                {confirmMove.job.scheduled_time && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#8E8E93] w-14">Time</span>
                    <span className="text-sm text-[#1C1C1E]">{formatTime(confirmMove.job.scheduled_time)} (unchanged)</span>
                  </div>
                )}
                {confirmMove.job.price != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#8E8E93] w-14">Price</span>
                    <span className="text-sm text-[#1C1C1E]">${Number(confirmMove.job.price).toFixed(2)} (unchanged)</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="text-center">
                  <div className="text-[10px] text-[#8E8E93] uppercase font-semibold mb-1">From</div>
                  <div className="text-sm font-bold text-[#FF3B30]">{formatDate(confirmMove.fromDate)}</div>
                </div>
                <svg className="w-5 h-5 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="text-center">
                  <div className="text-[10px] text-[#34C759] uppercase font-semibold mb-1">To</div>
                  <div className="text-sm font-bold text-[#34C759]">{formatDate(confirmMove.toDate)}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmMove}
                  disabled={moving}
                  className="flex-1 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
                >
                  {moving ? 'Moving...' : 'Yes, Move Job'}
                </button>
                <button
                  onClick={() => setConfirmMove(null)}
                  disabled={moving}
                  className="flex-1 py-2.5 bg-[#F2F2F7] text-[#1C1C1E] rounded-xl text-sm font-medium hover:bg-[#E5E5EA] transition-colors disabled:opacity-50"
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
