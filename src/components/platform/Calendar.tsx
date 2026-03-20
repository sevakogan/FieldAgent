'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

interface CalendarEvent {
  date: string; // YYYY-MM-DD
  color?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  className?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function Calendar({
  events = [],
  selectedDate,
  onSelectDate,
  className = '',
}: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const todayStr = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const eventMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const ev of events) {
      const existing = map.get(ev.date) ?? [];
      map.set(ev.date, [...existing, ev.color ?? '#007AFF']);
    }
    return map;
  }, [events]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', {
    month: 'long',
  });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const cells: (number | null)[] = [
    ...Array.from<null>({ length: firstDay }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className={`bg-white rounded-[16px] border border-[#E5E5EA] p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="h-[44px] w-[44px] flex items-center justify-center rounded-full hover:bg-[#F2F2F7] transition-colors"
        >
          <svg
            className="h-5 w-5 text-[#8E8E93]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-base font-semibold text-[#1C1C1E]">
          {monthName} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="h-[44px] w-[44px] flex items-center justify-center rounded-full hover:bg-[#F2F2F7] transition-colors"
        >
          <svg
            className="h-5 w-5 text-[#8E8E93]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-[#AEAEB2] py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }
          const dateStr = formatDate(viewYear, viewMonth, day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dots = eventMap.get(dateStr) ?? [];

          return (
            <motion.button
              key={dateStr}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectDate?.(dateStr)}
              className={`
                relative h-[40px] w-full rounded-[10px] text-sm font-medium
                flex flex-col items-center justify-center gap-0.5
                transition-colors
                ${isSelected ? 'bg-[#007AFF] text-white' : ''}
                ${isToday && !isSelected ? 'bg-[#007AFF]/10 text-[#007AFF]' : ''}
                ${!isSelected && !isToday ? 'text-[#1C1C1E] hover:bg-[#F2F2F7]' : ''}
              `}
            >
              {day}
              {dots.length > 0 && (
                <div className="flex gap-0.5">
                  {dots.slice(0, 3).map((c, i) => (
                    <span
                      key={i}
                      className="block h-1 w-1 rounded-full"
                      style={{
                        backgroundColor: isSelected ? '#ffffff' : c,
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
