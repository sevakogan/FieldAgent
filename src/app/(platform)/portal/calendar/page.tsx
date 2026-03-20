'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const MOCK_JOBS = [
  { id: 'job-1', service: 'Deep Clean', date: '2026-03-22', time: '9:00 AM', address: '742 Evergreen Terrace', color: '#AF52DE' },
  { id: 'job-2', service: 'Window Washing', date: '2026-03-25', time: '1:00 PM', address: '742 Evergreen Terrace', color: '#007AFF' },
  { id: 'job-3', service: 'Carpet Cleaning', date: '2026-03-28', time: '10:00 AM', address: '123 Ocean Ave, Unit 4B', color: '#34C759' },
  { id: 'job-4', service: 'Standard Clean', date: '2026-04-01', time: '9:00 AM', address: '742 Evergreen Terrace', color: '#AF52DE' },
  { id: 'job-5', service: 'Standard Clean', date: '2026-03-15', time: '9:00 AM', address: '742 Evergreen Terrace', color: '#AF52DE' },
  { id: 'job-6', service: 'Deep Clean', date: '2026-03-08', time: '10:00 AM', address: '123 Ocean Ave, Unit 4B', color: '#FF9500' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 20));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const jobsByDate = useMemo(() => {
    const map: Record<string, typeof MOCK_JOBS> = {};
    for (const job of MOCK_JOBS) {
      const key = job.date;
      if (!map[key]) map[key] = [];
      map[key] = [...map[key], job];
    }
    return map;
  }, []);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedJobs = selectedDate ? (jobsByDate[selectedDate] ?? []) : [];
  const todayStr = '2026-03-20';

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
      <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>

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
            <div key={d} className="text-center text-xs font-medium text-gray-400">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />;
            const hasJobs = !!jobsByDate[cell.dateStr];
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
                    {(jobsByDate[cell.dateStr] ?? []).slice(0, 3).map((j) => (
                      <div
                        key={j.id}
                        className="h-1 w-1 rounded-full"
                        style={{ backgroundColor: isSelected ? '#fff' : j.color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
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
                  <div className="h-10 w-1 rounded-full" style={{ backgroundColor: job.color }} />
                  <div>
                    <h4 className="font-semibold text-gray-900">{job.service}</h4>
                    <p className="text-sm text-gray-500">{job.time} &middot; {job.address}</p>
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
