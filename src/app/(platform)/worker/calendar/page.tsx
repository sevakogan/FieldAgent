'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'week' | 'month';

interface CalendarJob {
  readonly id: string;
  readonly time: string;
  readonly clientName: string;
  readonly service: string;
  readonly amount: number;
  readonly day: number;
}

const CURRENT_MONTH = 'March 2026';
const CURRENT_DAY = 20;

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const MOCK_JOBS: readonly CalendarJob[] = [
  { id: 'j-001', time: '8:00 AM', clientName: 'Sarah Mitchell', service: 'Deep Clean', amount: 185, day: 18 },
  { id: 'j-002', time: '11:30 AM', clientName: 'Marcus Chen', service: 'Standard Clean', amount: 120, day: 18 },
  { id: 'j-003', time: '9:00 AM', clientName: 'Emily Watson', service: 'Move-In Clean', amount: 220, day: 19 },
  { id: 'j-004', time: '8:00 AM', clientName: 'Sarah Mitchell', service: 'Deep Clean', amount: 185, day: 20 },
  { id: 'j-005', time: '11:30 AM', clientName: 'Marcus Chen', service: 'Standard Clean', amount: 120, day: 20 },
  { id: 'j-006', time: '2:00 PM', clientName: 'Linda Park', service: 'Office Clean', amount: 95, day: 20 },
  { id: 'j-007', time: '4:30 PM', clientName: 'James Rodriguez', service: 'Move-Out Clean', amount: 150, day: 20 },
  { id: 'j-008', time: '9:00 AM', clientName: 'Karen Liu', service: 'Deep Clean', amount: 200, day: 21 },
  { id: 'j-009', time: '1:00 PM', clientName: 'Tom Harris', service: 'Window Clean', amount: 80, day: 21 },
  { id: 'j-010', time: '10:00 AM', clientName: 'Angela Davis', service: 'Standard Clean', amount: 110, day: 22 },
  { id: 'j-011', time: '8:30 AM', clientName: 'Robert Kim', service: 'Deep Clean', amount: 195, day: 24 },
  { id: 'j-012', time: '11:00 AM', clientName: 'Diana Cruz', service: 'Office Clean', amount: 140, day: 24 },
  { id: 'j-013', time: '2:30 PM', clientName: 'Mike Johnson', service: 'Standard Clean', amount: 115, day: 25 },
  { id: 'j-014', time: '9:00 AM', clientName: 'Nancy White', service: 'Move-Out Clean', amount: 250, day: 26 },
] as const;

function getJobsForDay(day: number): readonly CalendarJob[] {
  return MOCK_JOBS.filter((j) => j.day === day);
}

function getWeekDays(): readonly number[] {
  const dayOfWeek = new Date(2026, 2, CURRENT_DAY).getDay();
  const startDay = CURRENT_DAY - dayOfWeek;
  return Array.from({ length: 7 }, (_, i) => startDay + i);
}

function getDaysInMonth(): readonly (number | null)[] {
  const firstDay = new Date(2026, 2, 1).getDay();
  const totalDays = 31;
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  return cells;
}

function DayCell({
  day,
  selected,
  onSelect,
  compact,
}: {
  readonly day: number | null;
  readonly selected: boolean;
  readonly onSelect: (d: number) => void;
  readonly compact: boolean;
}) {
  if (day === null) {
    return <div className={compact ? 'w-10 h-10' : 'aspect-square'} />;
  }

  const jobs = getJobsForDay(day);
  const isToday = day === CURRENT_DAY;

  return (
    <button
      onClick={() => onSelect(day)}
      className={`relative flex flex-col items-center justify-center rounded-xl transition-all ${
        compact ? 'w-10 h-10' : 'aspect-square'
      } ${
        selected
          ? 'bg-[#007AFF] text-white shadow-[0_2px_8px_rgba(0,122,255,0.3)]'
          : isToday
          ? 'bg-[#007AFF]/10 text-[#007AFF]'
          : 'text-gray-900 hover:bg-gray-100'
      }`}
    >
      <span className={`text-sm font-semibold ${compact ? '' : 'mb-0.5'}`}>
        {day}
      </span>
      {jobs.length > 0 && !compact && (
        <div className="flex gap-0.5">
          {jobs.slice(0, 3).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full ${
                selected ? 'bg-white/70' : 'bg-[#007AFF]'
              }`}
            />
          ))}
        </div>
      )}
      {jobs.length > 0 && compact && (
        <div
          className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
            selected ? 'bg-white/70' : 'bg-[#007AFF]'
          }`}
        />
      )}
    </button>
  );
}

export default function WorkerCalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDay, setSelectedDay] = useState(CURRENT_DAY);

  const weekDays = getWeekDays();
  const monthDays = getDaysInMonth();
  const selectedJobs = getJobsForDay(selectedDay);
  const dailyTotal = selectedJobs.reduce((sum, j) => sum + j.amount, 0);

  return (
    <div className="p-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{CURRENT_MONTH}</h1>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['week', 'month'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === mode ? 'text-white' : 'text-[#8E8E93]'
              }`}
            >
              {viewMode === mode && (
                <motion.div
                  layoutId="view-toggle"
                  className="absolute inset-0 bg-[#007AFF] rounded-lg"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 capitalize">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-5">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold text-[#8E8E93]">
              {d}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'week' ? (
            <motion.div
              key="week"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-7 gap-1"
            >
              {weekDays.map((day) => (
                <DayCell
                  key={day}
                  day={day > 0 && day <= 31 ? day : null}
                  selected={day === selectedDay}
                  onSelect={setSelectedDay}
                  compact
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="month"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-7 gap-1"
            >
              {monthDays.map((day, i) => (
                <DayCell
                  key={i}
                  day={day}
                  selected={day === selectedDay}
                  onSelect={setSelectedDay}
                  compact={false}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Day Jobs */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          March {selectedDay}
        </h2>
        <span className="text-sm font-semibold text-[#8E8E93]">
          {selectedJobs.length} jobs &middot; ${dailyTotal}
        </span>
      </div>

      <div className="space-y-2.5">
        {selectedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-[#8E8E93] text-sm">No jobs scheduled</p>
          </div>
        ) : (
          selectedJobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/worker/jobs/${job.id}`} className="block no-underline">
                <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 flex items-center justify-center text-xs font-bold text-[#007AFF]">
                      {job.time.split(' ')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {job.clientName}
                      </p>
                      <p className="text-xs text-[#8E8E93]">{job.service}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    ${job.amount}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
