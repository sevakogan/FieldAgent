'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getPortalCalendarJobs } from '@/lib/actions/portal';
import type { CalendarJob } from '@/lib/actions/portal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#AF52DE',
  approved: '#007AFF',
  requested: '#FF9500',
  in_progress: '#34C759',
  completed: '#34C759',
  cancelled: '#8E8E93',
};

export default function CalendarPage() {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [jobs, setJobs] = useState<CalendarJob[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const loadJobs = useCallback(() => {
    setLoading(true);
    getPortalCalendarJobs(year, month + 1).then(result => {
      setJobs(result.success && result.data ? result.data : []);
      setLoading(false);
    });
  }, [year, month]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const jobsByDate = useMemo(() => {
    const map: Record<string, CalendarJob[]> = {};
    for (const job of jobs) {
      const key = job.scheduledDate;
      map[key] = [...(map[key] ?? []), job];
    }
    return map;
  }, [jobs]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedJobs = selectedDate ? (jobsByDate[selectedDate] ?? []) : [];
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; dateStr: string } | null> = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr });
    }
    return days;
  }, [year, month, daysInMonth, firstDay]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <Link
          href="/portal/request"
          className="flex items-center gap-1.5 rounded-xl bg-[#AF52DE] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#AF52DE]/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Request Service
        </Link>
      </div>

      {/* Month navigation */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-[#F2F2F7]">
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-[#F2F2F7]">
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} />;
              const dateJobs = jobsByDate[cell.dateStr] ?? [];
              const hasJobs = dateJobs.length > 0;
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDate;

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr === selectedDate ? null : cell.dateStr)}
                  className={`relative flex h-10 w-full flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                    isSelected
                      ? 'bg-[#AF52DE] text-white'
                      : isToday
                        ? 'bg-[#AF52DE]/10 font-semibold text-[#AF52DE]'
                        : 'text-gray-700 hover:bg-[#F2F2F7]'
                  }`}
                >
                  {cell.day}
                  {hasJobs && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {dateJobs.slice(0, 3).map((j) => (
                        <div
                          key={j.id}
                          className="h-1 w-1 rounded-full"
                          style={{ backgroundColor: isSelected ? '#fff' : (STATUS_COLORS[j.status] ?? '#AF52DE') }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected day jobs */}
      {selectedDate && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-500">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          {selectedJobs.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-gray-400">No jobs scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/portal/jobs/${job.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="h-10 w-1 rounded-full" style={{ backgroundColor: STATUS_COLORS[job.status] ?? '#AF52DE' }} />
                  <div>
                    <h4 className="font-semibold text-gray-900">{job.serviceName}</h4>
                    <p className="text-sm text-gray-500">
                      {job.scheduledTime ?? ''} {job.scheduledTime ? '\u00B7 ' : ''}{job.address}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
