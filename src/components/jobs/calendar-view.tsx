"use client";

import { useState, useCallback, useMemo, type DragEvent } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, JOB_STATUS_STYLES } from "@/lib/utils";
import { getServiceColor } from "@/lib/service-colors";
import type { Job } from "@/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const JOB_ICONS = { done: "\u2705", active: "\u2699\uFE0F", upcoming: "\uD83D\uDCC5" } as const;
const JOB_BADGE = { done: "success", active: "warning", upcoming: "info" } as const;

type QuickFilter = "month" | "week" | "today";

interface CalendarViewProps {
  readonly jobs: readonly Job[];
  readonly onJobDateChange: (jobId: number, newDate: string) => void;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthDays(year: number, month: number): readonly Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();

  const days: Date[] = [];

  // Pad with previous month days
  for (let i = startPad - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Pad to fill last week
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
  }

  return days;
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

function isInWeek(dateKey: string, today: Date): boolean {
  const { start, end } = getWeekRange(today);
  return dateKey >= toDateKey(start) && dateKey <= toDateKey(end);
}

function buildJobsByDate(jobs: readonly Job[]): ReadonlyMap<string, readonly Job[]> {
  const map = new Map<string, Job[]>();
  for (const job of jobs) {
    const existing = map.get(job.date) ?? [];
    map.set(job.date, [...existing, job]);
  }
  return map;
}

export function CalendarView({ jobs, onJobDateChange }: CalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("month");
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const jobsByDate = useMemo(() => buildJobsByDate(jobs), [jobs]);

  const monthDays = useMemo(
    () => getMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const selectedJobs = useMemo(() => {
    if (quickFilter === "today") {
      return jobsByDate.get(todayKey) ?? [];
    }
    if (quickFilter === "week") {
      const { start, end } = getWeekRange(today);
      const startKey = toDateKey(start);
      const endKey = toDateKey(end);
      const weekJobs: Job[] = [];
      for (const [dateKey, dateJobs] of jobsByDate) {
        if (dateKey >= startKey && dateKey <= endKey) {
          weekJobs.push(...dateJobs);
        }
      }
      return weekJobs.sort((a, b) => a.date.localeCompare(b.date));
    }
    return jobsByDate.get(selectedDate) ?? [];
  }, [quickFilter, selectedDate, jobsByDate, todayKey, today]);

  const navigateMonth = useCallback((delta: number) => {
    setViewMonth((prev) => {
      const newMonth = prev + delta;
      if (newMonth < 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      if (newMonth > 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return newMonth;
    });
  }, []);

  const handleDayClick = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
    setQuickFilter("month");
  }, []);

  const handleDragStart = useCallback((e: DragEvent, jobId: number) => {
    e.dataTransfer.setData("text/plain", String(jobId));
    e.dataTransfer.effectAllowed = "move";
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.4";
    }
  }, []);

  const handleDragEnd = useCallback((e: DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDragOverDate(null);
  }, []);

  const handleDragOver = useCallback((e: DragEvent, dateKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(dateKey);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent, dateKey: string) => {
      e.preventDefault();
      setDragOverDate(null);
      const jobId = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (!isNaN(jobId)) {
        onJobDateChange(jobId, dateKey);
        setSelectedDate(dateKey);
      }
    },
    [onJobDateChange],
  );

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Quick filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["today", "week", "month"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setQuickFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              quickFilter === f
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f === "month" ? "This Month" : f === "week" ? "This Week" : "Today"}
          </button>
        ))}
      </div>

      {/* Calendar grid */}
      <Card padding="md" className="overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            &#8249;
          </button>
          <span className="font-bold text-sm text-gray-800">{monthLabel}</span>
          <button
            onClick={() => navigateMonth(1)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            &#8250;
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-semibold text-gray-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {monthDays.map((date) => {
            const dateKey = toDateKey(date);
            const isCurrentMonth = date.getMonth() === viewMonth;
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDate && quickFilter === "month";
            const isDragTarget = dateKey === dragOverDate;
            const dayJobs = jobsByDate.get(dateKey) ?? [];
            const inWeekRange = quickFilter === "week" && isInWeek(dateKey, today);

            return (
              <button
                key={dateKey}
                onClick={() => handleDayClick(dateKey)}
                onDragOver={(e) => handleDragOver(e, dateKey)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateKey)}
                className={`relative flex flex-col items-center py-2 min-h-[48px] rounded-lg transition-all ${
                  !isCurrentMonth ? "text-gray-300" : "text-gray-700"
                } ${isToday ? "font-bold" : ""} ${
                  isSelected ? "bg-indigo-50 ring-1 ring-indigo-300" : ""
                } ${inWeekRange ? "bg-blue-50/50" : ""} ${
                  isDragTarget
                    ? "bg-indigo-100 ring-2 ring-indigo-400 scale-105"
                    : "hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-xs leading-none ${
                    isToday
                      ? "bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                      : ""
                  }`}
                >
                  {date.getDate()}
                </span>

                {/* Job dots */}
                {dayJobs.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-[32px]">
                    {dayJobs.slice(0, 4).map((job) => (
                      <div
                        key={job.id}
                        className={`w-1.5 h-1.5 rounded-full ${getServiceColor(job.svc)}`}
                      />
                    ))}
                    {dayJobs.length > 4 && (
                      <span className="text-[8px] text-gray-400 leading-none">
                        +{dayJobs.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected day jobs */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-gray-500 px-1">
          {quickFilter === "today"
            ? "Today's Jobs"
            : quickFilter === "week"
              ? "This Week's Jobs"
              : selectedDate === todayKey
                ? "Today's Jobs"
                : new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
          {selectedJobs.length > 0 && (
            <span className="text-gray-400 ml-1">({selectedJobs.length})</span>
          )}
        </h3>

        {selectedJobs.length === 0 ? (
          <Card padding="md" className="text-center">
            <p className="text-sm text-gray-400 py-4">No jobs scheduled</p>
          </Card>
        ) : (
          selectedJobs.map((job) => {
            const status = JOB_STATUS_STYLES[job.st];
            const borderColor = getServiceColor(job.svc).replace("bg-", "border-l-");

            return (
              <Card
                key={job.id}
                className={`flex items-center gap-3.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-l-4 ${borderColor}`}
                padding="sm"
              >
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, job.id)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-3.5 flex-1 min-w-0"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${status.icon} flex items-center justify-center text-lg shrink-0`}
                  >
                    {JOB_ICONS[job.st]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm">{job.client}</span>
                      <Badge variant={JOB_BADGE[job.st]}>{status.label}</Badge>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {job.svc} - {job.time} - {job.worker}
                    </div>
                    {quickFilter !== "month" && (
                      <div className="text-[10px] text-gray-300 mt-0.5">
                        {new Date(job.date + "T12:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <span className="font-black text-lg tracking-tight shrink-0">
                  {formatCurrency(job.total)}
                </span>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
