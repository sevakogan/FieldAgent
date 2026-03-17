"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { formatCurrency, JOB_STATUS_STYLES } from "@/lib/utils";
import { JOBS, CLIENTS } from "@/lib/mock-data";
import type { Job } from "@/types";

const JOB_ICONS = { done: "\u2705", active: "\u2699\uFE0F", upcoming: "\uD83D\uDCC5" } as const;
const JOB_BADGE = { done: "success", active: "warning", upcoming: "info" } as const;

interface NewJobForm {
  readonly clientId: string;
  readonly svc: string;
  readonly date: string;
  readonly time: string;
  readonly worker: string;
  readonly total: string;
  readonly notes: string;
}

const EMPTY_FORM: NewJobForm = {
  clientId: "",
  svc: "",
  date: "",
  time: "",
  worker: "",
  total: "",
  notes: "",
};

function formatTimeDisplay(time24: string): string {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<readonly Job[]>(JOBS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<NewJobForm>(EMPTY_FORM);

  const sorted = [...jobs].sort((a, b) => {
    const order = { active: 0, upcoming: 1, done: 2 };
    return order[a.st] - order[b.st];
  });

  const updateField = useCallback(
    <K extends keyof NewJobForm>(field: K, value: NewJobForm[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleOpen = useCallback(() => {
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.clientId || !form.svc || !form.date || !form.time) return;

    const client = CLIENTS.find((c) => c.id === parseInt(form.clientId, 10));
    if (!client) return;

    const newJob: Job = {
      id: Math.max(0, ...jobs.map((j) => j.id)) + 1,
      ini: client.ini,
      client: client.name,
      addr: "TBD",
      svc: form.svc,
      worker: form.worker || "You",
      time: formatTimeDisplay(form.time),
      st: "upcoming",
      total: parseInt(form.total, 10) || 0,
      photos: 0,
    };

    setJobs((prev) => [...prev, newJob]);
    setSheetOpen(false);
    setForm(EMPTY_FORM);
  }, [form, jobs]);

  return (
    <>
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <h2 className="font-extrabold text-base tracking-tight">All Jobs</h2>
        <button
          onClick={handleOpen}
          className="bg-brand-dark text-white border-none rounded-[10px] px-4 py-2 text-[13px] font-semibold cursor-pointer hover:opacity-85 transition-opacity inline-flex items-center gap-1.5"
        >
          + New Job
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {sorted.map((job) => {
          const status = JOB_STATUS_STYLES[job.st];
          return (
            <Card
              key={job.id}
              className="flex items-center gap-3.5 cursor-pointer hover:shadow-md transition-all"
              padding="sm"
            >
              <div className={`w-12 h-12 rounded-2xl ${status.icon} flex items-center justify-center text-xl shrink-0`}>
                {JOB_ICONS[job.st]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-sm">{job.client}</span>
                  <Badge variant={JOB_BADGE[job.st]}>{status.label}</Badge>
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {job.addr} - {job.svc} - {job.time} - {job.worker}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {job.photos > 0 && (
                  <span className="text-[11px] text-gray-400">{job.photos} photos</span>
                )}
                <span className="font-black text-xl tracking-tight">{formatCurrency(job.total)}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <BottomSheet open={sheetOpen} onClose={handleClose} title="New Job">
        <div className="flex flex-col gap-4">
          {/* Client selector */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500">Client</span>
            <select
              value={form.clientId}
              onChange={(e) => updateField("clientId", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="">Select a client...</option>
              {CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {/* Service type */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500">Service Type</span>
            <input
              type="text"
              value={form.svc}
              onChange={(e) => updateField("svc", e.target.value)}
              placeholder="e.g. Weekly Lawn Care"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </label>

          {/* Date & Time row */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500">Time</span>
              <input
                type="time"
                value={form.time}
                onChange={(e) => updateField("time", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </label>
          </div>

          {/* Worker & Price row */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500">Assign Worker</span>
              <input
                type="text"
                value={form.worker}
                onChange={(e) => updateField("worker", e.target.value)}
                placeholder="e.g. Jose M."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500">Price ($)</span>
              <input
                type="number"
                value={form.total}
                onChange={(e) => updateField("total", e.target.value)}
                placeholder="0"
                min="0"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </label>
          </div>

          {/* Notes */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Any special instructions..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
            />
          </label>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!form.clientId || !form.svc || !form.date || !form.time}
            className="w-full bg-brand-dark text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            Create Job
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
