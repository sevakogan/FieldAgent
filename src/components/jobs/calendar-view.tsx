"use client";

import { useState, useCallback, useMemo, useEffect, type DragEvent } from "react";
import { formatCurrency, JOB_STATUS_STYLES } from "@/lib/utils";
import { getServiceColor } from "@/lib/service-colors";
import type { Job } from "@/types";

// ── Constants ────────────────────────────────────────────────────

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const HOUR_LABELS = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM
const STATUS_ICONS: Record<Job["st"], string> = { done: "checkmark.circle.fill", active: "wrench.fill", upcoming: "calendar" };

// ── Helpers ──────────────────────────────────────────────────────

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekDays(anchorDate: Date): readonly Date[] {
  const sunday = new Date(anchorDate);
  sunday.setDate(sunday.getDate() - sunday.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function buildJobsByDate(jobs: readonly Job[]): ReadonlyMap<string, readonly Job[]> {
  const map = new Map<string, Job[]>();
  for (const job of jobs) {
    const existing = map.get(job.date) ?? [];
    map.set(job.date, [...existing, job]);
  }
  return map;
}

function parseTimeToMinutes(timeStr: string): number {
  // Handles "9:00 AM", "1:30 PM", etc.
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 480; // default 8 AM
  const [, hourStr, minStr, period] = match;
  let hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  if (period) {
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
  }
  return hour * 60 + min;
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function getServiceBorderColor(service: string): string {
  return getServiceColor(service).replace("bg-", "border-l-");
}

function getServiceBgColor(service: string): string {
  return getServiceColor(service).replace("bg-", "bg-").replace("-500", "-50");
}

function getServiceTextColor(service: string): string {
  return getServiceColor(service).replace("bg-", "text-");
}

// ── Types ────────────────────────────────────────────────────────

interface CalendarViewProps {
  readonly jobs: readonly Job[];
  readonly onJobDateChange: (jobId: number, newDate: string) => void;
}

// ── Component ────────────────────────────────────────────────────

export function CalendarView({ jobs, onJobDateChange }: CalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);

  const [weekAnchor, setWeekAnchor] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeMinutes);

  // Update current time indicator every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMinutes(getCurrentTimeMinutes());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const jobsByDate = useMemo(() => buildJobsByDate(jobs), [jobs]);
  const weekDays = useMemo(() => getWeekDays(weekAnchor), [weekAnchor]);

  const selectedDayJobs = useMemo(() => {
    const dayJobs = jobsByDate.get(selectedDate) ?? [];
    return [...dayJobs].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
  }, [jobsByDate, selectedDate]);

  // Week summary stats
  const weekStats = useMemo(() => {
    let count = 0;
    let revenue = 0;
    for (const day of weekDays) {
      const key = toDateKey(day);
      const dayJobs = jobsByDate.get(key) ?? [];
      count += dayJobs.length;
      for (const job of dayJobs) {
        revenue += job.total;
      }
    }
    return { count, revenue };
  }, [weekDays, jobsByDate]);

  // Month label from the selected week anchor
  const monthLabel = useMemo(() => {
    // Use the middle of the week (Wednesday) for the month label
    const mid = weekDays[3] ?? weekAnchor;
    return mid.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [weekDays, weekAnchor]);

  // ── Navigation ──────────────────────────────────────────────

  const navigateWeek = useCallback((delta: number) => {
    setWeekAnchor((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta * 7);
      return next;
    });
  }, []);

  const navigateMonth = useCallback((delta: number) => {
    setWeekAnchor((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setWeekAnchor(now);
    setSelectedDate(toDateKey(now));
  }, []);

  const handleDaySelect = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
  }, []);

  // ── Drag & Drop ─────────────────────────────────────────────

  const handleDragStart = useCallback((e: DragEvent, jobId: number) => {
    e.dataTransfer.setData("text/plain", String(jobId));
    e.dataTransfer.effectAllowed = "move";
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("opacity-40", "scale-95");
    }
  }, []);

  const handleDragEnd = useCallback((e: DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("opacity-40", "scale-95");
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

  // ── Render ──────────────────────────────────────────────────

  const selectedDateObj = useMemo(
    () => new Date(selectedDate + "T12:00:00"),
    [selectedDate],
  );

  const selectedDateLabel = useMemo(() => {
    if (selectedDate === todayKey) return "Today";
    return selectedDateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate, todayKey, selectedDateObj]);

  return (
    <div className="flex flex-col bg-gray-50/80 min-h-full">
      {/* ── Month/Year Header ─────────────────────────────────── */}
      <div className="bg-white/90 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-blue-500 active:bg-blue-50 transition-colors"
            aria-label="Previous month"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-[17px] font-semibold text-gray-900 tracking-tight">
            {monthLabel}
          </h1>
          <button
            onClick={() => navigateMonth(1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-blue-500 active:bg-blue-50 transition-colors"
            aria-label="Next month"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Week Strip ──────────────────────────────────────── */}
        <div className="relative px-2 pb-3">
          {/* Week navigation arrows */}
          <div className="flex items-center">
            <button
              onClick={() => navigateWeek(-1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 active:bg-gray-100 transition-colors shrink-0"
              aria-label="Previous week"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex-1 grid grid-cols-7 gap-0.5">
              {weekDays.map((day) => {
                const dateKey = toDateKey(day);
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDate;
                const hasJobs = (jobsByDate.get(dateKey) ?? []).length > 0;
                const isDragTarget = dateKey === dragOverDate;

                return (
                  <button
                    key={dateKey}
                    onClick={() => handleDaySelect(dateKey)}
                    onDragOver={(e) => handleDragOver(e, dateKey)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, dateKey)}
                    className={`flex flex-col items-center py-1.5 rounded-2xl transition-all duration-200 ${
                      isDragTarget
                        ? "bg-blue-100 ring-2 ring-blue-400 scale-105"
                        : isSelected && !isToday
                          ? "bg-gray-100"
                          : ""
                    }`}
                  >
                    <span
                      className={`text-[11px] font-medium mb-1 ${
                        isToday ? "text-blue-500" : "text-gray-400"
                      }`}
                    >
                      {WEEKDAY_LABELS[day.getDay()]}
                    </span>

                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-semibold transition-all duration-200 ${
                        isToday
                          ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
                          : isSelected
                            ? "bg-gray-200 text-gray-900"
                            : "text-gray-700"
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    {/* Job indicator dots */}
                    <div className="h-1.5 mt-1 flex items-center justify-center gap-0.5">
                      {hasJobs && (
                        <>
                          {(jobsByDate.get(dateKey) ?? []).slice(0, 3).map((job) => (
                            <div
                              key={job.id}
                              className={`w-1 h-1 rounded-full ${
                                isToday ? "bg-white/80" : getServiceColor(job.svc)
                              }`}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => navigateWeek(1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 active:bg-gray-100 transition-colors shrink-0"
              aria-label="Next week"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Filter Row ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3">
        <button
          onClick={goToToday}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
            selectedDate === todayKey
              ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
              : "bg-white text-blue-500 border border-blue-200 active:bg-blue-50"
          }`}
        >
          Today
        </button>
        <span className="text-[13px] text-gray-500">
          <span className="font-semibold text-gray-700">{weekStats.count} jobs</span>
          {" · "}
          <span className="text-gray-400">{formatCurrency(weekStats.revenue)}</span>
        </span>
      </div>

      {/* ── Day Label ─────────────────────────────────────────── */}
      <div className="px-5 pb-2">
        <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide">
          {selectedDateLabel}
        </h2>
      </div>

      {/* ── Day Schedule / Timeline ───────────────────────────── */}
      <div className="flex-1 px-4 pb-6">
        {selectedDayJobs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="relative">
            {/* Time slots background */}
            <div className="absolute inset-0 pointer-events-none">
              {HOUR_LABELS.map((hour) => {
                const topPercent = ((hour - 6) / 14) * 100;
                return (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-gray-100"
                    style={{ top: `${topPercent}%` }}
                  />
                );
              })}
            </div>

            {/* Current time indicator (only if today) */}
            {selectedDate === todayKey && currentMinutes >= 360 && currentMinutes <= 1200 && (
              <div
                className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                style={{ top: `${((currentMinutes / 60 - 6) / 14) * 100}%` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1 shadow-sm" />
                <div className="flex-1 h-[1.5px] bg-red-500" />
              </div>
            )}

            {/* Job cards (Apple-style grouped list) */}
            <div className="relative z-10 flex flex-col gap-2.5 py-1">
              {selectedDayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Job Card ─────────────────────────────────────────────────────

interface JobCardProps {
  readonly job: Job;
  readonly onDragStart: (e: DragEvent, jobId: number) => void;
  readonly onDragEnd: (e: DragEvent) => void;
}

function JobCard({ job, onDragStart, onDragEnd }: JobCardProps) {
  const status = JOB_STATUS_STYLES[job.st];
  const borderColor = getServiceBorderColor(job.svc);
  const bgColor = getServiceBgColor(job.svc);
  const textColor = getServiceTextColor(job.svc);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, job.id)}
      onDragEnd={onDragEnd}
      className={`group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-grab active:cursor-grabbing active:shadow-md active:scale-[0.98] transition-all duration-200 border-l-[3px] ${borderColor}`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Drag handle */}
        <div className="flex flex-col gap-[3px] opacity-0 group-hover:opacity-40 transition-opacity shrink-0">
          <div className="flex gap-[3px]">
            <div className="w-1 h-1 rounded-full bg-gray-400" />
            <div className="w-1 h-1 rounded-full bg-gray-400" />
          </div>
          <div className="flex gap-[3px]">
            <div className="w-1 h-1 rounded-full bg-gray-400" />
            <div className="w-1 h-1 rounded-full bg-gray-400" />
          </div>
          <div className="flex gap-[3px]">
            <div className="w-1 h-1 rounded-full bg-gray-400" />
            <div className="w-1 h-1 rounded-full bg-gray-400" />
          </div>
        </div>

        {/* Service icon circle */}
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
          <ServiceIcon service={job.svc} className={textColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-gray-900 truncate">
              {job.client}
            </span>
            <StatusPill status={job.st} label={status.label} />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[13px] text-gray-500 truncate">{job.svc}</span>
            <span className="text-gray-300">·</span>
            <span className="text-[13px] text-gray-400">{job.time}</span>
          </div>
          <div className="text-[11px] text-gray-300 mt-0.5 truncate">
            {job.worker}
          </div>
        </div>

        {/* Price */}
        <span className="text-[17px] font-semibold text-gray-900 tracking-tight shrink-0 tabular-nums">
          {formatCurrency(job.total)}
        </span>
      </div>
    </div>
  );
}

// ── Status Pill ──────────────────────────────────────────────────

const STATUS_PILL_STYLES: Record<Job["st"], string> = {
  done: "bg-emerald-50 text-emerald-600",
  active: "bg-amber-50 text-amber-600",
  upcoming: "bg-blue-50 text-blue-600",
};

function StatusPill({ status, label }: { readonly status: Job["st"]; readonly label: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shrink-0 ${STATUS_PILL_STYLES[status]}`}
    >
      {label}
    </span>
  );
}

// ── Service Icon ─────────────────────────────────────────────────

function ServiceIcon({ service, className }: { readonly service: string; readonly className: string }) {
  // Simple SVG icons by service type
  const iconPath = getIconPath(service);
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
      <path d={iconPath} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getIconPath(service: string): string {
  const lower = service.toLowerCase();
  if (lower.includes("lawn") || lower.includes("mow")) {
    // Grass/leaf icon
    return "M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zM8 14s1.5 2 4 2 4-2 4-2";
  }
  if (lower.includes("pool")) {
    // Water wave
    return "M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0";
  }
  if (lower.includes("pressure") || lower.includes("wash")) {
    // Spray/droplet
    return "M12 2v6m0 0l-3 3m3-3l3 3M5 12l-2 7h18l-2-7M7 19v3m10-3v3";
  }
  if (lower.includes("hedge") || lower.includes("trim")) {
    // Scissors
    return "M6 9a3 3 0 100-6 3 3 0 000 6zm12 0a3 3 0 100-6 3 3 0 000 6zM6 9l12 12M18 9L6 21";
  }
  if (lower.includes("leaf") || lower.includes("cleanup")) {
    // Leaf
    return "M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L12 14l-3-3c2-2 6-4 9-4 0 0 1-7-6-7";
  }
  // Default: wrench
  return "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z";
}

// ── Empty State ──────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gray-300">
          <path
            d="M8 2v4m8-4v4m-9 4h10M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-[15px] font-semibold text-gray-400">No jobs scheduled</p>
      <p className="text-[13px] text-gray-300 mt-1">Drag a job here to reschedule</p>
    </div>
  );
}
