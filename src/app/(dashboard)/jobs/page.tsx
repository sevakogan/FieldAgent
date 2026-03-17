"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CalendarView } from "@/components/jobs/calendar-view";
import { formatCurrency, JOB_STATUS_STYLES } from "@/lib/utils";
import { getServiceColor } from "@/lib/service-colors";
import { JOBS, CLIENTS } from "@/lib/mock-data";
import type { Job } from "@/types";

const STATUS_DOT_COLORS = {
  done: "text-emerald-500",
  active: "text-yellow-500",
  upcoming: "text-blue-500",
} as const;

type ViewMode = "list" | "calendar";

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

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface InlineClient {
  readonly name: string;
  readonly phone: string;
}

const EMPTY_INLINE_CLIENT: InlineClient = { name: "", phone: "" };

function JobsPageContent() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") === "calendar" ? "calendar" : "list";

  const [jobs, setJobs] = useState<readonly Job[]>(JOBS);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<NewJobForm>(EMPTY_FORM);
  const [localClients, setLocalClients] = useState(CLIENTS);
  const [showAddClient, setShowAddClient] = useState(false);
  const [inlineClient, setInlineClient] = useState<InlineClient>(EMPTY_INLINE_CLIENT);

  const sorted = useMemo(
    () =>
      [...jobs].sort((a, b) => {
        const order = { active: 0, upcoming: 1, done: 2 };
        return order[a.st] - order[b.st];
      }),
    [jobs],
  );

  const updateField = useCallback(
    <K extends keyof NewJobForm>(field: K, value: NewJobForm[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleOpen = useCallback(() => {
    setForm(EMPTY_FORM);
    setShowAddClient(false);
    setInlineClient(EMPTY_INLINE_CLIENT);
    setSheetOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.clientId || !form.svc || !form.date || !form.time) return;

    const client = localClients.find((c) => c.id === parseInt(form.clientId, 10));
    if (!client) return;

    const newJob: Job = {
      id: Math.max(0, ...jobs.map((j) => j.id)) + 1,
      ini: client.ini,
      client: client.name,
      addr: "TBD",
      svc: form.svc,
      worker: form.worker || "You",
      date: form.date,
      time: formatTimeDisplay(form.time),
      st: "upcoming",
      total: parseInt(form.total, 10) || 0,
      photos: 0,
    };

    setJobs((prev) => [...prev, newJob]);
    setSheetOpen(false);
    setForm(EMPTY_FORM);
  }, [form, jobs, localClients]);

  const handleSaveInlineClient = useCallback(() => {
    if (!inlineClient.name.trim()) return;

    const initials = inlineClient.name
      .trim()
      .split(" ")
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");

    const newId = Math.max(0, ...localClients.map((c) => c.id)) + 1;

    const newClient: (typeof CLIENTS)[number] = {
      id: newId,
      ini: initials || "??",
      name: inlineClient.name.trim(),
      phone: inlineClient.phone.trim(),
      props: 1,
      mrr: 0,
      bal: 0,
      tag: null,
      last: "Today",
    };

    setLocalClients((prev) => [...prev, newClient]);
    updateField("clientId", String(newId));
    setInlineClient(EMPTY_INLINE_CLIENT);
    setShowAddClient(false);
  }, [inlineClient, localClients, updateField]);

  const handleJobDateChange = useCallback((jobId: number, newDate: string) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, date: newDate } : job)),
    );
  }, []);

  return (
    <div className="min-h-full -m-5 md:-m-7 p-5 md:p-7 bg-[#f2f2f7]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[34px] font-bold tracking-tight leading-tight">Jobs</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">{formatTodayDate()}</p>
          </div>
          <button
            onClick={handleOpen}
            className="bg-brand-dark text-white border-none rounded-full px-4 py-2 text-[13px] font-semibold cursor-pointer hover:opacity-85 transition-opacity inline-flex items-center gap-1 mt-2"
          >
            + New Job
          </button>
        </div>

        {/* Segmented control */}
        <div className="flex bg-gray-200/70 rounded-lg p-0.5 mt-4 w-fit">
          <button
            onClick={() => setViewMode("list")}
            className={`px-5 py-1.5 rounded-[7px] text-[13px] font-semibold transition-all ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-5 py-1.5 rounded-[7px] text-[13px] font-semibold transition-all ${
              viewMode === "calendar"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <CalendarView jobs={jobs} onJobDateChange={handleJobDateChange} />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          {sorted.map((job, index) => {
            const status = JOB_STATUS_STYLES[job.st];
            const serviceColorClass = getServiceColor(job.svc);
            const dotColor = serviceColorClass
              .replace("bg-", "text-")
              .replace("-500", "-500");

            return (
              <div
                key={job.id}
                className={`flex items-center gap-3 px-4 min-h-[56px] cursor-pointer hover:bg-gray-50 transition-colors ${
                  index < sorted.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* Colored dot */}
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${serviceColorClass}`} />

                {/* Center content */}
                <div className="flex-1 min-w-0 py-2.5">
                  <span className="font-semibold text-[15px] text-gray-900 block leading-tight">
                    {job.client}
                  </span>
                  <span className="text-[13px] text-gray-500 block leading-tight mt-0.5 truncate">
                    {job.svc} &middot; {job.time}
                  </span>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="font-semibold text-[15px] text-gray-900 block leading-tight">
                      {formatCurrency(job.total)}
                    </span>
                    <span className={`text-[11px] font-medium block leading-tight mt-0.5 ${STATUS_DOT_COLORS[job.st]}`}>
                      {status.label}
                    </span>
                  </div>
                  <span className="text-gray-300 text-[18px] font-light ml-1">&rsaquo;</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BottomSheet open={sheetOpen} onClose={handleClose} title="New Job">
        <div className="flex flex-col gap-5">
          {/* Client section */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <label className="block px-4 py-3">
              <span className="text-[13px] font-medium text-gray-500 block mb-1.5">Client</span>
              <select
                value={form.clientId}
                onChange={(e) => updateField("clientId", e.target.value)}
                className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Select a client...</option>
                {localClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Inline add client */}
            {!showAddClient ? (
              <button
                type="button"
                onClick={() => setShowAddClient(true)}
                className="text-[13px] font-medium text-blue-500 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none px-4 pb-3 pt-0 text-left"
              >
                + Add new client
              </button>
            ) : (
              <div className="px-4 pb-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <input
                      type="text"
                      value={inlineClient.name}
                      onChange={(e) => setInlineClient((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Name"
                      className="w-full rounded-lg border-none bg-white px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    <input
                      type="tel"
                      value={inlineClient.phone}
                      onChange={(e) => setInlineClient((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone"
                      className="w-full rounded-lg border-none bg-white px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveInlineClient}
                      disabled={!inlineClient.name.trim()}
                      className="bg-brand-dark text-white rounded-lg px-3 py-1.5 text-[13px] font-semibold cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save Client
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddClient(false); setInlineClient(EMPTY_INLINE_CLIENT); }}
                      className="text-gray-500 hover:text-gray-700 bg-transparent border-none text-[13px] font-semibold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Service type */}
          <div className="bg-white rounded-2xl px-4 py-3">
            <span className="text-[13px] font-medium text-gray-500 block mb-1.5">Service Type</span>
            <input
              type="text"
              value={form.svc}
              onChange={(e) => updateField("svc", e.target.value)}
              placeholder="e.g. Lawn Mowing"
              className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-[15px] text-gray-900">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                className="border-none bg-transparent text-[15px] text-blue-500 outline-none text-right cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[15px] text-gray-900">Time</span>
              <input
                type="time"
                value={form.time}
                onChange={(e) => updateField("time", e.target.value)}
                className="border-none bg-transparent text-[15px] text-blue-500 outline-none text-right cursor-pointer"
              />
            </div>
          </div>

          {/* Worker & Price */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-[13px] font-medium text-gray-500 block mb-1.5">Assign Worker</span>
              <input
                type="text"
                value={form.worker}
                onChange={(e) => updateField("worker", e.target.value)}
                placeholder="e.g. Jose M."
                className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <div className="px-4 py-3">
              <span className="text-[13px] font-medium text-gray-500 block mb-1.5">Price ($)</span>
              <input
                type="number"
                value={form.total}
                onChange={(e) => updateField("total", e.target.value)}
                placeholder="0"
                min="0"
                className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl px-4 py-3">
            <span className="text-[13px] font-medium text-gray-500 block mb-1.5">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Any special instructions..."
              rows={3}
              className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!form.clientId || !form.svc || !form.date || !form.time}
            className="w-full bg-brand-dark text-white rounded-2xl py-3.5 text-[17px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Job
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-gray-400 text-sm p-4">Loading jobs...</div>}>
      <JobsPageContent />
    </Suspense>
  );
}
