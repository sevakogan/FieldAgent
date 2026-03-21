'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getWorkerMonthJobs } from '@/lib/actions/worker';
import type { WorkerJobRow } from '@/lib/actions/worker';

type ViewMode = 'week' | 'month';

function DayOffModal({
  onClose,
  onSubmit,
}: {
  readonly onClose: () => void;
  readonly onSubmit: (date: string, note: string) => void;
}) {
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Request Day Off</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#007AFF] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for day off..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:border-[#007AFF] focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (date) onSubmit(date, note);
            }}
            disabled={!date}
            className="flex-1 py-2.5 rounded-xl bg-[#007AFF] text-white text-sm font-semibold disabled:opacity-50"
          >
            Submit Request
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function formatTime(time: string | null): string {
  if (!time) return 'TBD';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

function DayCell({
  day,
  selected,
  isToday,
  jobCount,
  onSelect,
  compact,
}: {
  readonly day: number | null;
  readonly selected: boolean;
  readonly isToday: boolean;
  readonly jobCount: number;
  readonly onSelect: (d: number) => void;
  readonly compact: boolean;
}) {
  if (day === null) {
    return <div className={compact ? 'w-10 h-10' : 'aspect-square'} />;
  }

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
      {jobCount > 0 && !compact && (
        <div className="flex gap-0.5">
          {Array.from({ length: Math.min(jobCount, 3) }, (_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full ${
                selected ? 'bg-white/70' : 'bg-[#007AFF]'
              }`}
            />
          ))}
        </div>
      )}
      {jobCount > 0 && compact && (
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
  const now = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [jobs, setJobs] = useState<WorkerJobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDayOffModal, setShowDayOffModal] = useState(false);
  const [dayOffToast, setDayOffToast] = useState(false);

  const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;
  const todayDay = isCurrentMonth ? now.getDate() : -1;

  useEffect(() => {
    setLoading(true);
    getWorkerMonthJobs(currentYear, currentMonth).then((res) => {
      if (res.success && res.data) {
        setJobs(res.data);
      } else {
        setJobs([]);
      }
      setLoading(false);
    });
  }, [currentYear, currentMonth]);

  const jobsByDay = useMemo(() => {
    const map = new Map<number, WorkerJobRow[]>();
    for (const job of jobs) {
      const day = parseInt(job.scheduledDate.split('-')[2], 10);
      const existing = map.get(day) ?? [];
      map.set(day, [...existing, job]);
    }
    return map;
  }, [jobs]);

  const selectedJobs = jobsByDay.get(selectedDay) ?? [];
  const dailyTotal = selectedJobs.reduce((sum, j) => sum + j.price, 0);

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  const monthDays: (number | null)[] = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  const weekDays: number[] = useMemo(() => {
    const dayOfWeek = new Date(currentYear, currentMonth - 1, selectedDay).getDay();
    const startDay = selectedDay - dayOfWeek;
    return Array.from({ length: 7 }, (_, i) => startDay + i);
  }, [currentYear, currentMonth, selectedDay]);

  const handleDayOffSubmit = useCallback((_date: string, _note: string) => {
    setShowDayOffModal(false);
    setDayOffToast(true);
    setTimeout(() => setDayOffToast(false), 3000);
  }, []);

  return (
    <div className="p-5 max-w-lg mx-auto">
      {/* Day Off Modal */}
      {showDayOffModal && (
        <DayOffModal
          onClose={() => setShowDayOffModal(false)}
          onSubmit={handleDayOffSubmit}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {dayOffToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#34C759] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
          >
            Day off request submitted
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{monthName}</h1>
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
                  day={day > 0 && day <= daysInMonth ? day : null}
                  selected={day === selectedDay}
                  isToday={day === todayDay}
                  jobCount={(jobsByDay.get(day) ?? []).length}
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
                  isToday={day === todayDay}
                  jobCount={day ? (jobsByDay.get(day) ?? []).length : 0}
                  onSelect={setSelectedDay}
                  compact={false}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Request Day Off */}
      <button
        onClick={() => setShowDayOffModal(true)}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 text-sm font-semibold text-[#8E8E93] hover:border-[#007AFF] hover:text-[#007AFF] transition-colors flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="10" y1="15" x2="14" y2="15" />
        </svg>
        Request Day Off
      </button>

      {/* Selected Day Jobs */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {new Date(currentYear, currentMonth - 1, selectedDay).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </h2>
        <span className="text-sm font-semibold text-[#8E8E93]">
          {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} &middot; ${dailyTotal}
        </span>
      </div>

      <div className="space-y-2.5">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
          </div>
        ) : selectedJobs.length === 0 ? (
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
                      {formatTime(job.scheduledTime).split(' ')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {job.serviceName}
                      </p>
                      <p className="text-xs text-[#8E8E93]">{job.street}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    ${job.price}
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
