"use client";

import { use, useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { formatCurrency, JOB_STATUS_STYLES } from "@/lib/utils";
import { getClientById } from "@/lib/db/clients";
import { getPropertiesByClient, createProperty } from "@/lib/db/properties";
import { getJobsByClient, createJob } from "@/lib/db/jobs";
import { getInvoicesByClient, createInvoice, updateInvoiceStatus } from "@/lib/db/invoices";
import { getAuthContext } from "@/lib/db/auth";
import type { Client, Property, Invoice, Job, InvoiceStatus, JobStatus } from "@/types";

const JOB_BADGE: Record<JobStatus, "success" | "warning" | "info"> = {
  done: "success",
  active: "warning",
  upcoming: "info",
};

const INVOICE_STATUS_BADGE: Record<InvoiceStatus, "success" | "warning" | "danger" | "info"> = {
  paid: "success",
  unpaid: "warning",
  overdue: "danger",
  partial: "info",
};

const PAYMENT_METHODS = ["Zelle", "Cash", "Credit Card", "Check", "Venmo", "Other"] as const;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function buildReceiptHtml(invoice: Invoice, clientName: string): string {
  const itemRows = invoice.items
    .map((item) => `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${item.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.unit_price)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.total)}</td>
    </tr>`)
    .join("");

  const paidLine = invoice.paid_date
    ? `<div style="margin-top:16px;font-size:13px;color:#666">Paid on ${formatDate(invoice.paid_date)} via ${invoice.payment_method}</div>`
    : "";

  return `<!DOCTYPE html><html><head><title>Receipt #${invoice.id.slice(0, 8)}</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:40px auto;padding:20px;color:#1a1a1a}
h1{font-size:24px;margin-bottom:4px}.meta{color:#888;font-size:13px;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin:16px 0}
th{text-align:left;padding:8px 12px;border-bottom:2px solid #222;font-size:12px;text-transform:uppercase;color:#666}
.totals{text-align:right;margin-top:12px}.totals div{margin:4px 0;font-size:14px}
.totals .grand{font-size:20px;font-weight:800;margin-top:8px}
.status{display:inline-block;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:700}
.paid{background:#d1fae5;color:#065f46}.unpaid{background:#fef3c7;color:#92400e}
.overdue{background:#fee2e2;color:#b91c1c}.partial{background:#dbeafe;color:#1e40af}</style></head>
<body><h1>Receipt #${invoice.id.slice(0, 8).toUpperCase()}</h1>
<div class="meta"><div>Date: ${formatDate(invoice.date)}</div><div>Due: ${formatDate(invoice.due_date)}</div>
<div>Client: ${clientName}</div>
<div style="margin-top:8px"><span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span></div></div>
<table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
<tbody>${itemRows}</tbody></table>
<div class="totals"><div>Subtotal: ${formatCurrency(invoice.subtotal)}</div><div>Tax: ${formatCurrency(invoice.tax)}</div>
<div class="grand">Total: ${formatCurrency(invoice.total)}</div></div>${paidLine}</body></html>`;
}

export default function ClientDetailPage({ params }: { readonly params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});
  const [expandedReceipts, setExpandedReceipts] = useState<Record<string, boolean>>({});
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // New Job modal state
  const [newJobOpen, setNewJobOpen] = useState(false);
  const [newJobForm, setNewJobForm] = useState({ service: "", date: "", time: "", worker: "", total: "", propertyId: "" });
  const [savingJob, setSavingJob] = useState(false);

  // Mark Paid modal state
  const [payInvoiceId, setPayInvoiceId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Zelle");
  const [savingPay, setSavingPay] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const auth = await getAuthContext();
      if (!auth) { setError("Not authenticated"); setLoading(false); return; }
      setCompanyId(auth.companyId);
      const [clientData, propsData, jobsData, invoicesData] = await Promise.all([
        getClientById(id),
        getPropertiesByClient(id),
        getJobsByClient(id),
        getInvoicesByClient(id),
      ]);
      if (!clientData) { setError("Client not found"); setLoading(false); return; }
      setClient(clientData);
      setProperties(propsData);
      setJobs(jobsData);
      setInvoices(invoicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load client");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const mrr = useMemo(
    () => properties.filter((p) => p.is_active).reduce((sum, p) => sum + p.monthly_rate, 0),
    [properties],
  );

  const outstandingBalance = useMemo(
    () => invoices.filter((inv) => inv.status !== "paid").reduce((sum, inv) => sum + inv.total, 0),
    [invoices],
  );

  const getJobsForProperty = useCallback(
    (propertyId: string) => jobs.filter((j) => j.property_id === propertyId),
    [jobs],
  );

  const getInvoicesForProperty = useCallback(
    (propertyId: string) =>
      [...invoices.filter((inv) => inv.property_id === propertyId)].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [invoices],
  );

  const handleCreateJob = async () => {
    if (!newJobForm.service || !newJobForm.date || !companyId || !client) return;
    setSavingJob(true);
    try {
      const [hours, minutes] = newJobForm.time.split(":");
      const h = parseInt(hours ?? "9", 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      const timeDisplay = newJobForm.time ? `${h12}:${minutes} ${ampm}` : "";

      await createJob(companyId, {
        client_id: client.id,
        property_id: newJobForm.propertyId || undefined,
        service: newJobForm.service,
        worker: newJobForm.worker || "You",
        date: newJobForm.date,
        time: timeDisplay,
        total: parseInt(newJobForm.total, 10) || 0,
      });
      await loadData();
      setNewJobOpen(false);
      setNewJobForm({ service: "", date: "", time: "", worker: "", total: "", propertyId: "" });
    } catch (err) {
      console.error("Failed to create job:", err);
    } finally {
      setSavingJob(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!payInvoiceId) return;
    setSavingPay(true);
    try {
      await updateInvoiceStatus(payInvoiceId, "paid", paymentMethod);
      setInvoices((prev) => prev.map((inv) =>
        inv.id === payInvoiceId
          ? { ...inv, status: "paid" as InvoiceStatus, paid_date: new Date().toISOString().split("T")[0], payment_method: paymentMethod }
          : inv
      ));
      setPayInvoiceId(null);
    } catch (err) {
      console.error("Failed to mark paid:", err);
    } finally {
      setSavingPay(false);
    }
  };

  const handleDownloadReceipt = (invoice: Invoice) => {
    const html = buildReceiptHtml(invoice, client?.name ?? "Client");
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) { win.onload = () => { URL.revokeObjectURL(url); win.print(); }; }
  };

  const handleShareReceipt = async (invoice: Invoice) => {
    const text = `Receipt #${invoice.id.slice(0, 8).toUpperCase()} — ${formatCurrency(invoice.total)} — ${invoice.status}`;
    if (navigator.share) {
      await navigator.share({ title: `Receipt for ${client?.name ?? "Client"}`, text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopiedInvoiceId(invoice.id);
      setTimeout(() => setCopiedInvoiceId(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-[15px]">Loading...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-gray-400 text-[13px] mb-4">{error ?? "Client not found"}</div>
        <Link href="/contacts" className="text-brand-dark font-semibold text-[13px] no-underline hover:opacity-80">Back to Contacts</Link>
      </div>
    );
  }

  const ini = getInitials(client.name);

  return (
    <div className="pb-24">
      {/* Back */}
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-[13px] font-semibold no-underline mb-4 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Client Header */}
      <Card className="mb-4" padding="lg">
        <div className="flex items-start gap-4">
          <Avatar initials={ini} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-black text-xl tracking-tight m-0">{client.name}</h1>
              {client.tag && <Badge variant={client.tag === "VIP" ? "purple" : "info"}>{client.tag}</Badge>}
            </div>
            <div className="text-[13px] text-gray-400 mb-1">{client.phone ?? client.email ?? "—"}</div>
            <div className="text-[11px] text-gray-400">
              {properties.filter((p) => p.is_active).length} active {properties.filter((p) => p.is_active).length === 1 ? "property" : "properties"}
            </div>
          </div>
          {/* Desktop inline actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={() => setNewJobOpen(true)}
              className="bg-brand-dark text-white rounded-xl px-4 py-2 text-[13px] font-semibold hover:opacity-85 transition-opacity"
            >
              + New Job
            </button>
            {client.phone && (
              <a href={`tel:${client.phone}`} className="bg-green-50 text-green-700 rounded-xl px-4 py-2 text-[13px] font-semibold hover:opacity-85 transition-opacity no-underline">
                Call
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <StatCard label="Properties" value={String(properties.filter((p) => p.is_active).length)} bg="bg-gray-50" textColor="text-gray-900" />
        <StatCard label="MRR" value={formatCurrency(mrr)} bg="bg-green-50" textColor="text-green-700" />
        <StatCard label="Lifetime" value={formatCurrency(mrr * 12)} bg="bg-blue-50" textColor="text-blue-700" />
        <StatCard
          label="Outstanding"
          value={outstandingBalance > 0 ? formatCurrency(outstandingBalance) : "Paid"}
          bg={outstandingBalance > 0 ? "bg-red-50" : "bg-green-50"}
          textColor={outstandingBalance > 0 ? "text-red-600" : "text-green-700"}
        />
      </div>

      {/* Properties */}
      <h2 className="font-bold text-sm mb-3 text-gray-700">Properties</h2>

      {properties.length === 0 ? (
        <Card padding="md">
          <p className="text-gray-400 text-[14px] text-center py-2">No properties yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {properties.map((property) => {
            const propJobs = getJobsForProperty(property.id);
            const propInvoices = getInvoicesForProperty(property.id);
            const currentJob = propJobs.find((j) => j.status === "active");
            const nextJob = propJobs.find((j) => j.status === "upcoming");
            const pastJobs = propJobs.filter((j) => j.status === "done");
            const upcomingJobs = propJobs.filter((j) => j.status === "upcoming");
            const jobsExpanded = expandedJobs[property.id] ?? false;
            const receiptsExpanded = expandedReceipts[property.id] ?? false;

            return (
              <Card key={property.id} padding="md" className={!property.is_active ? "opacity-60" : ""}>
                {/* Property header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm">{property.nickname ?? property.address.split(",")[0]}</span>
                      {!property.is_active && <Badge variant="default">Inactive</Badge>}
                    </div>
                    <div className="text-[11px] text-gray-400">{property.address}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-base tracking-tight leading-none">
                      {formatCurrency(property.monthly_rate)}
                      <span className="text-[10px] text-gray-400 font-normal">/mo</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                {property.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {property.services.map((svc) => (
                      <span key={svc} className="bg-gray-100 text-gray-600 rounded-lg px-2 py-0.5 text-[10px] font-semibold">{svc}</span>
                    ))}
                  </div>
                )}

                {/* Current / Next job preview */}
                {(currentJob ?? nextJob) && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    {currentJob && <JobPreviewRow job={currentJob} label="Current" />}
                    {nextJob && <JobPreviewRow job={nextJob} label="Next" />}
                  </div>
                )}

                {/* Expandable section buttons */}
                <div className="flex gap-2">
                  <ExpandButton
                    expanded={jobsExpanded}
                    onClick={() => setExpandedJobs((prev) => ({ ...prev, [property.id]: !prev[property.id] }))}
                    count={propJobs.length}
                    label="Jobs"
                  />
                  <ExpandButton
                    expanded={receiptsExpanded}
                    onClick={() => setExpandedReceipts((prev) => ({ ...prev, [property.id]: !prev[property.id] }))}
                    count={propInvoices.length}
                    label="Receipts"
                  />
                </div>

                {/* Jobs expanded */}
                {jobsExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h4 className="font-bold text-[12px] text-gray-500 mb-2 tracking-wider uppercase">Jobs</h4>
                    {currentJob && (
                      <div className="mb-2">
                        <div className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Current</div>
                        <JobRow job={currentJob} highlight />
                      </div>
                    )}
                    {upcomingJobs.length > 0 && (
                      <div className="mb-2">
                        <div className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Upcoming</div>
                        {upcomingJobs.map((job) => <JobRow key={job.id} job={job} />)}
                      </div>
                    )}
                    {pastJobs.length > 0 && (
                      <div>
                        <div className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Past</div>
                        {pastJobs.map((job) => <JobRow key={job.id} job={job} />)}
                      </div>
                    )}
                    {propJobs.length === 0 && (
                      <div className="text-gray-400 text-[12px] py-2">No jobs for this property.</div>
                    )}
                  </div>
                )}

                {/* Receipts expanded */}
                {receiptsExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h4 className="font-bold text-[12px] text-gray-500 mb-2 tracking-wider uppercase">Receipts</h4>
                    {propInvoices.length === 0 ? (
                      <div className="text-gray-400 text-[12px] py-2">No invoices yet.</div>
                    ) : (
                      propInvoices.map((invoice) => (
                        <InvoiceRow
                          key={invoice.id}
                          invoice={invoice}
                          copiedId={copiedInvoiceId}
                          onDownload={handleDownloadReceipt}
                          onShare={handleShareReceipt}
                          onMarkPaid={() => { setPayInvoiceId(invoice.id); setPaymentMethod("Zelle"); }}
                        />
                      ))
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Mobile quick actions */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 py-3 flex gap-2 z-50 md:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <button
          onClick={() => setNewJobOpen(true)}
          className="bg-brand-dark text-white flex-1 flex items-center justify-center gap-1.5 border-none rounded-xl py-3 font-semibold text-[13px] cursor-pointer"
        >
          📅 New Job
        </button>
        {client.phone && (
          <a
            href={`tel:${client.phone}`}
            className="bg-green-50 text-green-700 flex-1 flex items-center justify-center gap-1.5 border-none rounded-xl py-3 font-semibold text-[13px] no-underline"
          >
            📞 Call
          </a>
        )}
      </div>

      {/* New Job Sheet */}
      <BottomSheet open={newJobOpen} onClose={() => setNewJobOpen(false)} title="New Job">
        <div className="flex flex-col gap-4 p-4 pt-0">
          <div>
            <label className="text-[12px] font-semibold text-gray-500 block mb-1.5">Property</label>
            <select
              value={newJobForm.propertyId}
              onChange={(e) => setNewJobForm((f) => ({ ...f, propertyId: e.target.value }))}
              className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none"
            >
              <option value="">Any property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.nickname ?? p.address.split(",")[0]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-gray-500 block mb-1.5">Service</label>
            <input
              type="text"
              value={newJobForm.service}
              onChange={(e) => setNewJobForm((f) => ({ ...f, service: e.target.value }))}
              placeholder="e.g. Lawn Mowing"
              className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-gray-500 block mb-1.5">Date</label>
              <input
                type="date"
                value={newJobForm.date}
                onChange={(e) => setNewJobForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-gray-500 block mb-1.5">Time</label>
              <input
                type="time"
                value={newJobForm.time}
                onChange={(e) => setNewJobForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-gray-500 block mb-1.5">Worker</label>
              <input
                type="text"
                value={newJobForm.worker}
                onChange={(e) => setNewJobForm((f) => ({ ...f, worker: e.target.value }))}
                placeholder="You"
                className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-gray-500 block mb-1.5">Price ($)</label>
              <input
                type="number"
                value={newJobForm.total}
                onChange={(e) => setNewJobForm((f) => ({ ...f, total: e.target.value }))}
                placeholder="0"
                className="w-full rounded-xl border-none bg-gray-50 px-3 py-2.5 text-[15px] outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleCreateJob}
            disabled={!newJobForm.service || !newJobForm.date || savingJob}
            className="w-full bg-brand-dark text-white rounded-xl py-3.5 font-semibold text-[15px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {savingJob ? "Creating..." : "Create Job"}
          </button>
        </div>
      </BottomSheet>

      {/* Mark Paid Sheet */}
      <BottomSheet open={!!payInvoiceId} onClose={() => setPayInvoiceId(null)} title="Mark as Paid">
        <div className="flex flex-col gap-4 p-4 pt-0">
          <p className="text-[14px] text-gray-500">Select payment method:</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-2.5 rounded-xl text-[13px] font-semibold border-none cursor-pointer transition-all ${
                  paymentMethod === method
                    ? "bg-brand-dark text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
          <button
            onClick={handleMarkPaid}
            disabled={savingPay}
            className="w-full bg-green-600 text-white rounded-xl py-3.5 font-semibold text-[15px] disabled:opacity-40"
          >
            {savingPay ? "Saving..." : `Mark Paid via ${paymentMethod}`}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function StatCard({ label, value, bg, textColor }: { readonly label: string; readonly value: string; readonly bg: string; readonly textColor: string }) {
  return (
    <div className={`${bg} rounded-xl p-3`}>
      <div className="text-[10px] font-semibold text-gray-400 tracking-wider mb-1 uppercase">{label}</div>
      <div className={`font-black text-lg ${textColor}`}>{value}</div>
    </div>
  );
}

function JobPreviewRow({ job, label }: { readonly job: Job; readonly label: string }) {
  const status = JOB_STATUS_STYLES[job.status];
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase w-12 shrink-0">{label}</span>
        <span className="text-[12px] font-semibold truncate">{job.service}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-gray-400">{formatDate(job.date)}</span>
        <Badge variant={JOB_BADGE[job.status]}>{status.label}</Badge>
      </div>
    </div>
  );
}

function ExpandButton({ expanded, onClick, count, label }: { readonly expanded: boolean; readonly onClick: () => void; readonly count: number; readonly label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold border-none cursor-pointer transition-all ${
        expanded ? "bg-brand-dark text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      <span>{label}</span>
      <span className="bg-white/20 rounded-full px-1.5 py-0 text-[10px]">{count}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

function JobRow({ job, highlight = false }: { readonly job: Job; readonly highlight?: boolean }) {
  const status = JOB_STATUS_STYLES[job.status];
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 ${highlight ? "bg-yellow-50/50 -mx-2 px-2 rounded-lg" : ""}`}>
      <div className="min-w-0">
        <div className="font-semibold text-[13px]">{job.service}</div>
        <div className="text-[11px] text-gray-400">
          {formatDate(job.date)} &middot; {job.time ?? ""} &middot; {job.worker ?? ""}
        </div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <Badge variant={JOB_BADGE[job.status]}>{status.label}</Badge>
        <span className="font-extrabold text-sm">{formatCurrency(job.total)}</span>
      </div>
    </div>
  );
}

function InvoiceRow({
  invoice,
  copiedId,
  onDownload,
  onShare,
  onMarkPaid,
}: {
  readonly invoice: Invoice;
  readonly copiedId: string | null;
  readonly onDownload: (invoice: Invoice) => void;
  readonly onShare: (invoice: Invoice) => Promise<void>;
  readonly onMarkPaid: () => void;
}) {
  const isCopied = copiedId === invoice.id;

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <div className="font-semibold text-[13px]">Receipt #{invoice.id.slice(0, 8).toUpperCase()}</div>
          <div className="text-[11px] text-gray-400">
            {formatDate(invoice.date)} &middot; Due {formatDate(invoice.due_date)}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={INVOICE_STATUS_BADGE[invoice.status]}>{invoice.status}</Badge>
          <span className="font-extrabold text-sm">{formatCurrency(invoice.total)}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-2 mb-2">
        {invoice.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-[11px] py-0.5">
            <span className="text-gray-600 truncate mr-2">{item.description} {item.quantity > 1 ? `x${item.quantity}` : ""}</span>
            <span className="font-semibold text-gray-700 shrink-0">{formatCurrency(item.total)}</span>
          </div>
        ))}
        {invoice.tax > 0 && (
          <div className="flex justify-between text-[11px] py-0.5 border-t border-gray-200 mt-1 pt-1">
            <span className="text-gray-400">Tax</span>
            <span className="font-semibold text-gray-500">{formatCurrency(invoice.tax)}</span>
          </div>
        )}
      </div>

      {invoice.paid_date && (
        <div className="text-[10px] text-gray-400 mb-2">
          Paid {formatDate(invoice.paid_date)} via {invoice.payment_method}
        </div>
      )}

      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => onDownload(invoice)}
          className="bg-gray-100 text-gray-600 border-none rounded-lg px-3 py-1.5 text-[11px] font-semibold cursor-pointer hover:bg-gray-200 transition-colors">
          ↓ Download
        </button>
        <button onClick={() => onShare(invoice)}
          className="bg-gray-100 text-gray-600 border-none rounded-lg px-3 py-1.5 text-[11px] font-semibold cursor-pointer hover:bg-gray-200 transition-colors">
          {isCopied ? "✓ Copied!" : "Share"}
        </button>
        {invoice.status !== "paid" && (
          <button onClick={onMarkPaid}
            className="bg-green-50 text-green-700 border-none rounded-lg px-3 py-1.5 text-[11px] font-semibold cursor-pointer hover:bg-green-100 transition-colors">
            ✓ Mark Paid
          </button>
        )}
      </div>
    </div>
  );
}
