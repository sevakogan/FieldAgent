'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCalendarJobs } from '@/lib/actions/company'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#007AFF',
  in_progress: '#FFD60A',
  pending_review: '#AF52DE',
  completed: '#34C759',
  cancelled: '#FF6B6B',
  driving: '#5AC8FA',
  arrived: '#FF9F0A',
  charged: '#34C759',
  requested: '#8E8E93',
  approved: '#007AFF',
  revision_needed: '#FF9F0A',
}

type CalendarJob = {
  id: string
  service_name: string
  status: string
  scheduled_date: string
  scheduled_time: string | null
  address_street: string
  worker_name: string | null
}

export default function CalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [jobs, setJobs] = useState<CalendarJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getCalendarJobs(currentYear, currentMonth)
    if (result.success && result.data) {
      setJobs(result.data)
    } else {
      setError(result.error ?? 'Failed to load calendar')
    }
    setLoading(false)
  }, [currentYear, currentMonth])

  useEffect(() => { fetchData() }, [fetchData])

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  // Group jobs by day number
  const jobsByDay = new Map<number, CalendarJob[]>()
  for (const job of jobs) {
    const day = parseInt(job.scheduled_date.split('-')[2], 10)
    const existing = jobsByDay.get(day) ?? []
    existing.push(job)
    jobsByDay.set(day, existing)
  }

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDay(null)
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDay(null)
  }

  const selectedJobs = selectedDay ? (jobsByDay.get(selectedDay) ?? []) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 hover:bg-[#F2F2F7] rounded-lg text-[#8E8E93] transition-colors">
            &larr;
          </button>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">{monthName}</h1>
          <button onClick={nextMonth} className="p-2 hover:bg-[#F2F2F7] rounded-lg text-[#8E8E93] transition-colors">
            &rarr;
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#E5E5EA]">
          {DAYS.map((d) => (
            <div key={d} className="p-3 text-center text-xs font-medium text-[#8E8E93]">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {cells.map((day, i) => {
            const dayJobs = day ? (jobsByDay.get(day) ?? []) : []
            return (
              <div
                key={i}
                onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                className={`min-h-[100px] p-2 border-b border-r border-[#E5E5EA] ${
                  day && isToday(day) ? 'bg-[#007AFF]/5' : ''
                } ${day && selectedDay === day ? 'bg-[#007AFF]/10' : ''} ${
                  !day ? 'bg-[#F2F2F7]/50' : 'hover:bg-[#F2F2F7] cursor-pointer'
                }`}
              >
                {day && (
                  <>
                    <span
                      className={`text-sm ${
                        isToday(day)
                          ? 'bg-[#007AFF] text-white w-6 h-6 rounded-full flex items-center justify-center'
                          : 'text-[#1C1C1E]'
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayJobs.slice(0, 3).map((job) => {
                        const color = STATUS_COLORS[job.status] ?? '#8E8E93'
                        return (
                          <div
                            key={job.id}
                            className="text-xs px-1.5 py-0.5 rounded truncate"
                            style={{ backgroundColor: color + '20', color }}
                          >
                            {job.service_name}
                          </div>
                        )
                      })}
                      {dayJobs.length > 3 && (
                        <div className="text-xs text-[#8E8E93] pl-1">+{dayJobs.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="mt-4 bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="font-semibold text-[#1C1C1E] mb-3">
            {new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              timeZone: 'America/Los_Angeles',
            })}
          </h2>
          {selectedJobs.length === 0 ? (
            <p className="text-sm text-[#8E8E93]">No jobs scheduled for this day</p>
          ) : (
            <div className="space-y-2">
              {selectedJobs.map((job) => {
                const color = STATUS_COLORS[job.status] ?? '#8E8E93'
                return (
                  <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F2F2F7]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1C1E]">{job.service_name}</p>
                      <p className="text-xs text-[#8E8E93] truncate">
                        {job.address_street}
                        {job.scheduled_time && ` at ${job.scheduled_time}`}
                        {job.worker_name && ` - ${job.worker_name}`}
                      </p>
                    </div>
                    <span
                      className="px-2 py-0.5 text-xs font-medium rounded-full shrink-0"
                      style={{ backgroundColor: color + '20', color }}
                    >
                      {job.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
