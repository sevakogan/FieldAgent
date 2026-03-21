'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getCalendarJobs } from '@/lib/actions/company'

type CalendarJob = {
  id: string
  service_name: string
  status: string
  scheduled_date: string
  scheduled_time: string | null
  address_street: string
  worker_name: string | null
  price?: number
}

const WORKER_COLORS = [
  '#69CA82', '#FF5A5B', '#5AC8FA', '#FFD60A', '#AF52DE',
  '#FF9F0A', '#30D158', '#FF6482', '#64D2FF', '#BDB76B',
]

function getWorkerColor(name: string | null, index: number): string {
  if (!name) return '#555'
  return WORKER_COLORS[index % WORKER_COLORS.length]
}

function formatTime(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

export default function CalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [jobs, setJobs] = useState<CalendarJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'schedule' | 'month'>('schedule')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getCalendarJobs(currentYear, currentMonth)
    if (result.success && result.data) {
      setJobs(result.data as CalendarJob[])
    } else {
      setError(result.error ?? 'Failed to load calendar')
    }
    setLoading(false)
  }, [currentYear, currentMonth])

  useEffect(() => { fetchData() }, [fetchData])

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Generate visible days (2-week window centered on today or start of month)
  const startDay = Math.max(1, today.getMonth() === currentMonth ? today.getDate() - 3 : 1)
  const visibleDays = Array.from({ length: Math.min(14, daysInMonth - startDay + 1) }, (_, i) => startDay + i)

  // Group jobs by address
  const addressMap = new Map<string, CalendarJob[]>()
  for (const job of jobs) {
    const key = job.address_street || 'Unassigned'
    const existing = addressMap.get(key) ?? []
    addressMap.set(key, [...existing, job])
  }
  const addresses = Array.from(addressMap.keys()).sort()

  // Build unique worker list for color assignment
  const workerNames = [...new Set(jobs.map(j => j.worker_name).filter(Boolean))] as string[]

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

  const getDayName = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  // Month grid data
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const monthCells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) monthCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) monthCells.push(d)

  const jobsByDay = new Map<number, CalendarJob[]>()
  for (const job of jobs) {
    const day = parseInt(job.scheduled_date.split('-')[2], 10)
    jobsByDay.set(day, [...(jobsByDay.get(day) ?? []), job])
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-[#1C1C1E] text-white/60 hover:text-white flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">
            {monthName} <span className="text-[#8E8E93] font-normal">{currentYear}</span>
          </h1>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-[#1C1C1E] text-white/60 hover:text-white flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#1C1C1E] rounded-xl p-0.5 flex">
            <button
              onClick={() => setView('schedule')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === 'schedule' ? 'bg-[#2C2C2E] text-white' : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === 'month' ? 'bg-[#2C2C2E] text-white' : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Month
            </button>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
          >
            + New Job
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {/* Worker Legend */}
      {workerNames.length > 0 && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {workerNames.map((name, i) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getWorkerColor(name, i) }} />
              <span className="text-xs text-[#8E8E93]">{name}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'schedule' ? (
        /* ════ SCHEDULE VIEW (Dark Grid) ══════════════════════════════ */
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden border border-[#2C2C2E]">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 border-3 border-[#69CA82] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && addresses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-2xl bg-[#2C2C2E] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[#8E8E93] text-sm">No jobs scheduled this month</p>
              <Link href="/dashboard/jobs/new" className="text-[#69CA82] text-sm mt-2 hover:underline">
                Schedule your first job
              </Link>
            </div>
          )}

          {!loading && addresses.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                {/* Day headers */}
                <thead>
                  <tr className="border-b border-[#2C2C2E]">
                    <th className="sticky left-0 z-10 bg-[#1C1C1E] w-[180px] p-3 text-left">
                      <span className="text-xs text-[#8E8E93] font-medium">Property</span>
                    </th>
                    {visibleDays.map((day) => (
                      <th
                        key={day}
                        className={`p-2 text-center min-w-[80px] ${
                          isToday(day) ? 'bg-[#69CA82]/10' : ''
                        }`}
                      >
                        <div className="text-[10px] text-[#8E8E93] uppercase">{getDayName(day)}</div>
                        <div className={`text-sm font-bold mt-0.5 ${
                          isToday(day) ? 'text-[#69CA82]' : 'text-white/80'
                        }`}>
                          {day}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Property rows */}
                <tbody>
                  {addresses.map((address) => {
                    const addressJobs = addressMap.get(address) ?? []
                    return (
                      <tr key={address} className="border-b border-[#2C2C2E]/50 hover:bg-[#2C2C2E]/30 transition-colors">
                        {/* Property name */}
                        <td className="sticky left-0 z-10 bg-[#1C1C1E] p-3 border-r border-[#2C2C2E]">
                          <div className="text-sm font-medium text-white truncate max-w-[160px]">{address}</div>
                        </td>

                        {/* Day cells */}
                        {visibleDays.map((day) => {
                          const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                          const cellJobs = addressJobs.filter(j => j.scheduled_date === dayStr)

                          return (
                            <td
                              key={day}
                              className={`p-1 border-r border-[#2C2C2E]/30 ${
                                isToday(day) ? 'bg-[#69CA82]/5' : ''
                              }`}
                            >
                              <div className="space-y-1">
                                {cellJobs.map((job) => {
                                  const workerIdx = workerNames.indexOf(job.worker_name ?? '')
                                  const color = getWorkerColor(job.worker_name, workerIdx)
                                  return (
                                    <Link
                                      key={job.id}
                                      href={`/dashboard/jobs/${job.id}`}
                                      className="block rounded-lg px-2 py-1.5 text-white text-[11px] font-medium truncate hover:brightness-110 transition-all"
                                      style={{ backgroundColor: color }}
                                    >
                                      <div className="flex items-center gap-1">
                                        {job.worker_name && (
                                          <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px] shrink-0">
                                            {job.worker_name.charAt(0)}
                                          </span>
                                        )}
                                        <span className="truncate">{job.worker_name ?? job.service_name}</span>
                                      </div>
                                      {job.price != null && (
                                        <div className="text-[10px] opacity-80 mt-0.5">
                                          ${Number(job.price).toFixed(0)}
                                        </div>
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
      ) : (
        /* ════ MONTH VIEW (Traditional Grid) ═══════════════════════════ */
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden border border-[#2C2C2E]">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#2C2C2E]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-3 text-center text-xs font-medium text-[#8E8E93]">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 relative">
            {loading && (
              <div className="absolute inset-0 bg-[#1C1C1E]/80 flex items-center justify-center z-10">
                <div className="h-8 w-8 border-3 border-[#69CA82] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {monthCells.map((day, i) => {
              const dayJobs = day ? (jobsByDay.get(day) ?? []) : []
              return (
                <div
                  key={i}
                  className={`min-h-[100px] p-2 border-b border-r border-[#2C2C2E]/50 ${
                    day && isToday(day) ? 'bg-[#69CA82]/10' : ''
                  } ${!day ? 'bg-[#1A1A1A]' : 'hover:bg-[#2C2C2E]/30 cursor-pointer'}`}
                >
                  {day && (
                    <>
                      <span className={`text-sm ${
                        isToday(day)
                          ? 'bg-[#69CA82] text-white w-6 h-6 rounded-full flex items-center justify-center font-bold'
                          : 'text-white/60'
                      }`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayJobs.slice(0, 3).map((job) => {
                          const workerIdx = workerNames.indexOf(job.worker_name ?? '')
                          const color = getWorkerColor(job.worker_name, workerIdx)
                          return (
                            <Link
                              key={job.id}
                              href={`/dashboard/jobs/${job.id}`}
                              className="block text-[10px] px-1.5 py-0.5 rounded truncate text-white font-medium"
                              style={{ backgroundColor: color }}
                            >
                              {job.service_name}
                            </Link>
                          )
                        })}
                        {dayJobs.length > 3 && (
                          <div className="text-[10px] text-[#8E8E93] pl-1">+{dayJobs.length - 3}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
