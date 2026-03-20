"use client";

import { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CalendarView } from "@/components/jobs/calendar-view";
import { formatCurrency, JOB_STATUS_STYLES } from "@/lib/utils";
import { getServiceColor } from "@/lib/service-colors";
import { getAuthContext } from "@/lib/db/auth";
import { getJobs, createJob, updateJob } from "@/lib/db/jobs";
import { getClients } from "@/lib/db/clients";
import type { Job, Client, JobStatus } from "@/types";

const STATUS_DOT_COLORS: Record<JobStatus, string> = {
  done: "text-emerald-500",
  active: "text-yellow-500",
  upcoming: "text-blue-500",
};

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

function JobsPageContent() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") === "calendar" ? "calendar" : "list";

  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<NewJobForm>(EMPTY_FORM);

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const auth = await getAuthContext();
      if (!auth) { setError("Not authenticated"); setLoading(false); return; }
      setCompanyId(auth.companyId);
      const [jobsData, clientsData] = await Promise.all([
        getJobs(auth.companyId),
        getClients(auth.companyId),
      ]);
      setJobs(jobsData);
      setClients(clientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const sorted = useMemo(
    () =>
      [...jobs].sort((a, b) => {
        const order: Record<JobStatus, number> = { active: 0, upcoming: 1, done: 2 };
        return order[a.status] - order[b.status];
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
    setSheetOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.clientId || !form.svc || !form.date || !form.time || !companyId) return;
    setSaving(true);
    try {
      const newJob = await createJob(companyId, {
        client_id: form.clientId,
        service: form.svc,
        date: form.date,
        time: formatTimeDisplay(form.time),
        worker: form.worker || "You",
        total: parseInt(form.total, 10) || 0,
        notes: form.notes || undefined,
      });
      // Re-fetch to get joined client/property data
      const refreshed = await getJobs(companyId);
      setJobs(refreshed);
      setSheetOpen(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setSaving(false);
    }
  }, [form, companyId]);

  const handleJobStatusChange = useCallback(async (jobId: string, status: JobStatus) => {
    try {
      await updateJob(jobId, { status });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
    } catch (err) {
      console.error("Failed to update job status:", err);
    }
  }, []);

  const handleJobDateChange = useCallback(async (jobId: string, newDate: string) => {
    try {
      await updateJob(jobId, { date: newDate });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, date: newDate } : j)));
    } catch (err) {
      console.error("Failed to reschedule job:", err);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-full -m-5 md:-m-7 p-5 md:p-7 bg-[#f2f2f7] flex items-center justify-center">
        <div className="text-gray-400 text-[15px]">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full -m-5 md:-m-7 p-5 md:p-7 bg-[#f2f2f7]">
      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] mb-4">{error}</div>
      )}

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

        <div className="flex bg-gray-200/70 rounded-lg p-0.5 mt-4 w-fit">
          {(["list", "calendar"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-5 py-1.5 rounded-[7px] text-[13px] font-semibold transition-all capitalize ${
                viewMode === mode ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "calendar" ? (
        <CalendarView jobs={jobs} onJobDateChange={handleJobDateChange} />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          {sorted.length === 0 ? (
            <p className="text-gray-400 text-[15px] px-4 py-8 text-center">No jobs yet. Tap + New Job to get started.</p>
          ) : (
            sorted.map((job, index) => {
              const status = JOB_STATUS_STYLES[job.status];
              const serviceColorClass = getServiceColor(job.service);
              const clientName = job.clients?.name ?? "";

              return (
                <div
                  key={job.id}
                  className={`flex items-center gap-3 px-4 min-h-[56px] cursor-pointer hover:bg-gray-50 transition-colors ${
                    index < sorted.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${serviceColorClass}`} />

                  <div className="flex-1 min-w-0 py-2.5">
                    <span className="font-semibold text-[15px] text-gray-900 block leading-tight">{clientName}</span>
                    <span className="text-[13px] text-gray-500 block leading-tight mt-0.5 truncate">
                      {job.service} &middot; {job.time ?? ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-semibold text-[15px] text-gray-900 block leading-tight">
                        {formatCurrency(job.total)}
                      </span>
                      <span className={`text-[11px] font-medium block leading-tight mt-0.5 ${STATUS_DOT_COLORS[job.status]}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Quick status toggle */}
                    {job.status !== "done" && (
                      <button
                        onClick={() => handleJobStatusChange(job.id, job.status === "upcoming" ? "active" : "done")}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs transition-colors shrink-0"
                        title={job.status === "upcoming" ? "Mark Active" : "Mark Done"}
                      >
                        {job.status === "upcoming" ? "▶" : "✓"}
                      </button>
                    )}

                    <span className="text-gray-300 text-[18px] font-light ml-1">&rsaquo;</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* New Job Bottom Sheet */}
      <BottomSheet open={sheetOpen} onClose={handleClose} title="New Job">
        <div className="flex flex-col gap-5">
          {/* Client select */}
          <div className="bg-white rounded-2xl px-4 py-3">
            <span className="text-[13px] font-medium text-gray-500 block mb-1.5">Client</span>
            <select
              value={form.clientId}
              onChange={(e) => updateField("clientId", e.target.value)}
              className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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

          <button
            onClick={handleSubmit}
            disabled={!form.clientId || !form.svc || !form.date || !form.time || saving}
            className="w-full bg-brand-dark text-white rounded-2xl py-3.5 text-[17px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Creating..." : "Create Job"}
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
