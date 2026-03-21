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
  price: number | null
}

const WORKER_COLORS = [
  '#34C759', '#FF5A5B', '#007AFF', '#FF9F0A', '#AF52DE',
  '#5AC8FA', '#30D158', '#FF6482', '#64D2FF', '#FFD60A',
]

function getWorkerColor(name: string | null, workerList: string[]): string {
  if (!name) return '#8E8E93'
  const idx = workerList.indexOf(name)
  return WORKER_COLORS[idx >= 0 ? idx % WORKER_COLORS.length : 0]
}

function formatTime(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
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
      setError(result.error ?? 'Failed to load')
    }
    setLoading(false)
  }, [currentYear, currentMonth])

  useEffect(() => { fetchData() }, [fetchData])

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // 14-day window for schedule view
  const startDay = Math.max(1, today.getMonth() === currentMonth && today.getFullYear() === currentYear ? today.getDate() - 2 : 1)
  const visibleDays = Array.from(
    { length: Math.min(14, daysInMonth - startDay + 1) },
    (_, i) => startDay + i
  )

  // Group jobs by address
  const addressMap = new Map<string, CalendarJob[]>()
  for (const job of jobs) {
    const key = job.address_street || 'Unassigned'
    addressMap.set(key, [...(addressMap.get(key) ?? []), job])
  }
  const addresses = Array.from(addressMap.keys()).sort()

  // Unique workers for color assignment
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

  const getDayName = (day: number) =>
    new Date(currentYear, currentMonth, day).toLocaleDateString('en-US', { weekday: 'short' })

  // Month grid
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const monthCells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
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
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <span className="text-xs text-[#8E8E93] font-medium">Workers:</span>
          {workerNames.map((name) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getWorkerColor(name, workerNames) }} />
              <span className="text-xs text-[#1C1C1E] font-medium">{name}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'schedule' ? (
        /* ════ SCHEDULE VIEW ══════════════════════════════ */
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[#8E8E93] text-sm">No jobs scheduled this month</p>
              <Link href="/dashboard/jobs/new" className="text-[#007AFF] text-sm mt-2 hover:underline">
                Schedule your first job
              </Link>
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
                      <th
                        key={day}
                        className={`p-2 text-center min-w-[90px] border-r border-[#F2F2F7] ${
                          isToday(day) ? 'bg-[#007AFF]/5' : ''
                        }`}
                      >
                        <div className="text-[10px] text-[#8E8E93] uppercase font-medium">{getDayName(day)}</div>
                        <div className={`text-sm font-bold mt-0.5 ${
                          isToday(day) ? 'text-[#007AFF]' : 'text-[#1C1C1E]'
                        }`}>
                          {isToday(day) ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#007AFF] text-white">{day}</span>
                          ) : (
                            day
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {addresses.map((address) => {
                    const addressJobs = addressMap.get(address) ?? []
                    return (
                      <tr key={address} className="border-b border-[#F2F2F7] hover:bg-[#FAFAFA] transition-colors">
                        <td className="sticky left-0 z-10 bg-white p-3 border-r border-[#E5E5EA]">
                          <div className="text-[13px] font-semibold text-[#1C1C1E] truncate max-w-[180px]">{address}</div>
                          <div className="text-[10px] text-[#8E8E93] mt-0.5">{addressJobs.length} job{addressJobs.length !== 1 ? 's' : ''}</div>
                        </td>
                        {visibleDays.map((day) => {
                          const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                          const cellJobs = addressJobs.filter(j => j.scheduled_date === dayStr)
                          return (
                            <td
                              key={day}
                              className={`p-1 border-r border-[#F2F2F7] align-top ${
                                isToday(day) ? 'bg-[#007AFF]/3' : ''
                              }`}
                            >
                              <div className="space-y-1 min-h-[48px]">
                                {cellJobs.map((job) => {
                                  const color = getWorkerColor(job.worker_name, workerNames)
                                  return (
                                    <Link
                                      key={job.id}
                                      href={`/dashboard/jobs/${job.id}`}
                                      className="block rounded-lg px-2 py-1.5 text-white text-[11px] font-medium truncate hover:brightness-110 transition-all shadow-sm"
                                      style={{ backgroundColor: color }}
                                    >
                                      <div className="flex items-center gap-1">
                                        {job.worker_name && (
                                          <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[8px] font-bold shrink-0">
                                            {job.worker_name.charAt(0)}
                                          </span>
                                        )}
                                        <span className="truncate">{job.worker_name ?? job.service_name}</span>
                                      </div>
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
      ) : (
        /* ════ MONTH VIEW ══════════════════════════════ */
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
              return (
                <div
                  key={i}
                  className={`min-h-[110px] p-2 border-b border-r border-[#F2F2F7] ${
                    day && isToday(day) ? 'bg-[#007AFF]/5' : ''
                  } ${!day ? 'bg-[#FAFAFA]' : 'hover:bg-[#F2F2F7]/50 cursor-pointer'}`}
                >
                  {day && (
                    <>
                      <span className={`inline-flex items-center justify-center text-sm ${
                        isToday(day)
                          ? 'bg-[#007AFF] text-white w-7 h-7 rounded-full font-bold'
                          : 'text-[#1C1C1E] font-medium'
                      }`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayJobs.slice(0, 4).map((job) => {
                          const color = getWorkerColor(job.worker_name, workerNames)
                          return (
                            <Link
                              key={job.id}
                              href={`/dashboard/jobs/${job.id}`}
                              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded text-white font-medium truncate hover:brightness-110 transition-all"
                              style={{ backgroundColor: color }}
                            >
                              {job.worker_name && (
                                <span className="w-3 h-3 rounded-full bg-white/25 flex items-center justify-center text-[7px] font-bold shrink-0">
                                  {job.worker_name.charAt(0)}
                                </span>
                              )}
                              <span className="truncate">{job.service_name}</span>
                              {job.price != null && (
                                <span className="ml-auto opacity-75">${Number(job.price).toFixed(0)}</span>
                              )}
                            </Link>
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
      )}
    </div>
  )
}
