"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, JOB_STATUS_STYLES, AVATAR_COLORS } from "@/lib/utils";
import { CLIENTS, JOBS, PROPERTIES, INVOICES } from "@/lib/mock-data";
import type { Client, Property, Invoice, Job } from "@/types";

const JOB_BADGE = { done: "success", active: "warning", upcoming: "info" } as const;

const INVOICE_STATUS_BADGE = {
  paid: "success",
  unpaid: "warning",
  overdue: "danger",
  partial: "info",
} as const;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildReceiptHtml(invoice: Invoice, clientName: string): string {
  const itemRows = invoice.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${item.description}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.unitPrice)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.total)}</td>
        </tr>`,
    )
    .join("");

  const paidLine = invoice.paidDate
    ? `<div style="margin-top:16px;font-size:13px;color:#666">Paid on ${formatDate(invoice.paidDate)} via ${invoice.paymentMethod}</div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <title>Receipt #${invoice.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; color: #1a1a1a; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .meta { color: #888; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #222; font-size: 12px; text-transform: uppercase; color: #666; }
    .totals { text-align: right; margin-top: 12px; }
    .totals div { margin: 4px 0; font-size: 14px; }
    .totals .grand { font-size: 20px; font-weight: 800; margin-top: 8px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; }
    .paid { background: #d1fae5; color: #065f46; }
    .unpaid { background: #fef3c7; color: #92400e; }
    .overdue { background: #fee2e2; color: #b91c1c; }
    .partial { background: #dbeafe; color: #1e40af; }
  </style>
</head>
<body>
  <h1>Receipt #${invoice.id}</h1>
  <div class="meta">
    <div>Date: ${formatDate(invoice.date)}</div>
    <div>Due: ${formatDate(invoice.dueDate)}</div>
    <div>Client: ${clientName}</div>
    <div style="margin-top:8px"><span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="totals">
    <div>Subtotal: ${formatCurrency(invoice.subtotal)}</div>
    <div>Tax: ${formatCurrency(invoice.tax)}</div>
    <div class="grand">Total: ${formatCurrency(invoice.total)}</div>
  </div>
  ${paidLine}
</body>
</html>`;
}

export default function ClientDetailPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const clientId = parseInt(id, 10);

  const client = CLIENTS.find((c) => c.id === clientId);

  const [expandedJobs, setExpandedJobs] = useState<Record<number, boolean>>({});
  const [expandedReceipts, setExpandedReceipts] = useState<Record<number, boolean>>({});
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<number | null>(null);

  const clientProperties = useMemo(
    () => PROPERTIES.filter((p) => p.clientId === clientId),
    [clientId],
  );

  const clientJobs = useMemo(
    () => JOBS.filter((j) => j.client === client?.name),
    [client?.name],
  );

  const clientInvoices = useMemo(
    () =>
      [...INVOICES.filter((inv) => inv.clientId === clientId)].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [clientId],
  );

  const lifetime = client ? client.mrr * 14 : 0;
  const outstandingBalance = clientInvoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const toggleJobs = (propertyId: number) => {
    setExpandedJobs((prev) => ({ ...prev, [propertyId]: !prev[propertyId] }));
  };

  const toggleReceipts = (propertyId: number) => {
    setExpandedReceipts((prev) => ({ ...prev, [propertyId]: !prev[propertyId] }));
  };

  const getJobsForProperty = (property: Property): readonly Job[] => {
    return clientJobs.filter((j) => j.propertyId === property.id);
  };

  const getInvoicesForProperty = (propertyId: number): readonly Invoice[] => {
    return clientInvoices.filter((inv) => inv.propertyId === propertyId);
  };

  const handleDownloadReceipt = (invoice: Invoice) => {
    const html = buildReceiptHtml(invoice, client?.name ?? "Unknown");
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const receiptWindow = window.open(url, "_blank");
    if (receiptWindow) {
      receiptWindow.onload = () => {
        URL.revokeObjectURL(url);
        receiptWindow.print();
      };
    }
  };

  const handleShareReceipt = async (invoice: Invoice, shareClient: Client) => {
    const text = `Receipt #${invoice.id} - ${formatCurrency(invoice.total)} - ${invoice.status}`;
    if (navigator.share) {
      await navigator.share({ title: `Receipt for ${shareClient.name}`, text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopiedInvoiceId(invoice.id);
      setTimeout(() => setCopiedInvoiceId(null), 2000);
    }
  };

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-gray-400 text-[13px] mb-4">Client not found</div>
        <Link
          href="/contacts"
          className="text-brand-dark font-semibold text-[13px] no-underline hover:opacity-80 transition-opacity"
        >
          Back to Contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Back button */}
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-[13px] font-semibold no-underline mb-4 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Client Header */}
      <Card className="mb-4" padding="lg">
        <div className="flex items-start gap-4">
          <Avatar initials={client.ini} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-black text-xl tracking-tight m-0">{client.name}</h1>
              {client.tag && (
                <Badge variant={client.tag === "VIP" ? "purple" : "info"}>
                  {client.tag}
                </Badge>
              )}
            </div>
            <div className="text-[13px] text-gray-400 mb-1">{client.phone}</div>
            <div className="text-[11px] text-gray-400">
              Active since {client.last} &middot; {client.props} {client.props === 1 ? "property" : "properties"}
            </div>
          </div>
          {/* Desktop inline actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button className="bg-brand-dark text-white rounded-xl px-4 py-2 text-[13px] font-semibold hover:opacity-85 transition-opacity">
              + New Job
            </button>
            <button className="bg-purple-50 text-purple-700 rounded-xl px-4 py-2 text-[13px] font-semibold hover:opacity-85 transition-opacity">
              Invoice
            </button>
            <a href={`tel:${client.phone}`} className="bg-green-50 text-green-700 rounded-xl px-4 py-2 text-[13px] font-semibold hover:opacity-85 transition-opacity no-underline">
              Call
            </a>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <StatCard
          label="Properties"
          value={String(clientProperties.filter((p) => p.isActive).length)}
          bg="bg-gray-50"
          textColor="text-gray-900"
        />
        <StatCard
          label="MRR"
          value={formatCurrency(client.mrr)}
          bg="bg-green-50"
          textColor="text-green-700"
        />
        <StatCard
          label="Lifetime"
          value={formatCurrency(lifetime)}
          bg="bg-blue-50"
          textColor="text-blue-700"
        />
        <StatCard
          label="Outstanding"
          value={outstandingBalance > 0 ? formatCurrency(outstandingBalance) : "Paid"}
          bg={outstandingBalance > 0 ? "bg-red-50" : "bg-green-50"}
          textColor={outstandingBalance > 0 ? "text-red-600" : "text-green-700"}
        />
      </div>

      {/* Properties Section */}
      <h2 className="font-bold text-sm mb-3 text-gray-700">Properties</h2>
      <div className="flex flex-col gap-3">
        {clientProperties.map((property) => {
          const propertyJobs = getJobsForProperty(property);
          const propertyInvoices = getInvoicesForProperty(property.id);
          const currentJob = propertyJobs.find((j) => j.st === "active");
          const nextJob = propertyJobs.find((j) => j.st === "upcoming");
          const pastJobs = propertyJobs.filter((j) => j.st === "done");
          const upcomingJobs = propertyJobs.filter((j) => j.st === "upcoming");
          const jobsExpanded = expandedJobs[property.id] ?? false;
          const receiptsExpanded = expandedReceipts[property.id] ?? false;

          return (
            <Card key={property.id} padding="md" className={!property.isActive ? "opacity-60" : ""}>
              {/* Property header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm">{property.nickname}</span>
                    {!property.isActive && <Badge variant="default">Inactive</Badge>}
                  </div>
                  <div className="text-[11px] text-gray-400">{property.address}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-base tracking-tight leading-none">
                    {formatCurrency(property.monthlyRate)}
                    <span className="text-[10px] text-gray-400 font-normal">/mo</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {property.services.map((svc) => (
                  <span
                    key={svc}
                    className="bg-gray-100 text-gray-600 rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                  >
                    {svc}
                  </span>
                ))}
              </div>

              {/* Current / Next job preview */}
              {(currentJob ?? nextJob) && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  {currentJob && (
                    <JobPreviewRow job={currentJob} label="Current" />
                  )}
                  {nextJob && (
                    <JobPreviewRow job={nextJob} label="Next" />
                  )}
                </div>
              )}

              {/* Expandable sections */}
              <div className="flex gap-2">
                <ExpandButton
                  expanded={jobsExpanded}
                  onClick={() => toggleJobs(property.id)}
                  count={propertyJobs.length}
                  label="Jobs"
                />
                <ExpandButton
                  expanded={receiptsExpanded}
                  onClick={() => toggleReceipts(property.id)}
                  count={propertyInvoices.length}
                  label="Receipts"
                />
              </div>

              {/* Jobs expanded */}
              {jobsExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h4 className="font-bold text-[12px] text-gray-500 mb-2 tracking-wider uppercase">
                    Jobs
                  </h4>

                  {currentJob && (
                    <div className="mb-2">
                      <div className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Current</div>
                      <JobRow job={currentJob} highlight />
                    </div>
                  )}

                  {upcomingJobs.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Upcoming</div>
                      {upcomingJobs.map((job) => (
                        <JobRow key={job.id} job={job} />
                      ))}
                    </div>
                  )}

                  {pastJobs.length > 0 && (
                    <div>
                      <div className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Past</div>
                      {pastJobs.map((job) => (
                        <JobRow key={job.id} job={job} />
                      ))}
                    </div>
                  )}

                  {propertyJobs.length === 0 && (
                    <div className="text-gray-400 text-[12px] py-2">No jobs for this property.</div>
                  )}
                </div>
              )}

              {/* Receipts expanded */}
              {receiptsExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h4 className="font-bold text-[12px] text-gray-500 mb-2 tracking-wider uppercase">
                    Receipts
                  </h4>

                  {propertyInvoices.length === 0 ? (
                    <div className="text-gray-400 text-[12px] py-2">No invoices yet.</div>
                  ) : (
                    propertyInvoices.map((invoice) => (
                      <InvoiceRow
                        key={invoice.id}
                        invoice={invoice}
                        client={client}
                        copiedId={copiedInvoiceId}
                        onDownload={handleDownloadReceipt}
                        onShare={handleShareReceipt}
                      />
                    ))
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Actions — mobile only */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 py-3 flex gap-2 z-50 md:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <QuickActionButton
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="12" y1="14" x2="12" y2="18" />
              <line x1="10" y1="16" x2="14" y2="16" />
            </svg>
          }
          label="New Job"
          bg="bg-brand-dark"
          fg="text-white"
        />
        <QuickActionButton
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          }
          label="Invoice"
          bg="bg-purple-50"
          fg="text-purple-700"
        />
        <QuickActionButton
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          }
          label="Call"
          bg="bg-green-50"
          fg="text-green-700"
          href={`tel:${client.phone}`}
        />
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  bg,
  textColor,
}: {
  readonly label: string;
  readonly value: string;
  readonly bg: string;
  readonly textColor: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-3`}>
      <div className="text-[10px] font-semibold text-gray-400 tracking-wider mb-1 uppercase">
        {label}
      </div>
      <div className={`font-black text-lg ${textColor}`}>{value}</div>
    </div>
  );
}

function JobPreviewRow({
  job,
  label,
}: {
  readonly job: Job;
  readonly label: string;
}) {
  const status = JOB_STATUS_STYLES[job.st];
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase w-12 shrink-0">
          {label}
        </span>
        <span className="text-[12px] font-semibold truncate">{job.svc}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-gray-400">{formatDate(job.date)}</span>
        <Badge variant={JOB_BADGE[job.st]}>{status.label}</Badge>
      </div>
    </div>
  );
}

function ExpandButton({
  expanded,
  onClick,
  count,
  label,
}: {
  readonly expanded: boolean;
  readonly onClick: () => void;
  readonly count: number;
  readonly label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold border-none cursor-pointer transition-all ${
        expanded
          ? "bg-brand-dark text-white"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      <span>{label}</span>
      <span className="bg-white/20 rounded-full px-1.5 py-0 text-[10px]">
        {count}
      </span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

function JobRow({
  job,
  highlight = false,
}: {
  readonly job: Job;
  readonly highlight?: boolean;
}) {
  const status = JOB_STATUS_STYLES[job.st];
  return (
    <div
      className={`flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 ${
        highlight ? "bg-yellow-50/50 -mx-2 px-2 rounded-lg" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="font-semibold text-[13px]">{job.svc}</div>
        <div className="text-[11px] text-gray-400">
          {formatDate(job.date)} &middot; {job.time} &middot; {job.worker}
        </div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <Badge variant={JOB_BADGE[job.st]}>{status.label}</Badge>
        <span className="font-extrabold text-sm">{formatCurrency(job.total)}</span>
      </div>
    </div>
  );
}

function InvoiceRow({
  invoice,
  client,
  copiedId,
  onDownload,
  onShare,
}: {
  readonly invoice: Invoice;
  readonly client: Client;
  readonly copiedId: number | null;
  readonly onDownload: (invoice: Invoice) => void;
  readonly onShare: (invoice: Invoice, client: Client) => Promise<void>;
}) {
  const isCopied = copiedId === invoice.id;

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <div className="font-semibold text-[13px]">Receipt #{invoice.id}</div>
          <div className="text-[11px] text-gray-400">
            {formatDate(invoice.date)} &middot; Due {formatDate(invoice.dueDate)}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={INVOICE_STATUS_BADGE[invoice.status]}>
            {invoice.status}
          </Badge>
          <span className="font-extrabold text-sm">{formatCurrency(invoice.total)}</span>
        </div>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-lg p-2 mb-2">
        {invoice.items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between text-[11px] py-0.5"
          >
            <span className="text-gray-600 truncate mr-2">
              {item.description} {item.quantity > 1 ? `x${item.quantity}` : ""}
            </span>
            <span className="font-semibold text-gray-700 shrink-0">
              {formatCurrency(item.total)}
            </span>
          </div>
        ))}
        {invoice.tax > 0 && (
          <div className="flex justify-between text-[11px] py-0.5 border-t border-gray-200 mt-1 pt-1">
            <span className="text-gray-400">Tax</span>
            <span className="font-semibold text-gray-500">{formatCurrency(invoice.tax)}</span>
          </div>
        )}
      </div>

      {/* Payment info */}
      {invoice.paidDate && (
        <div className="text-[10px] text-gray-400 mb-2">
          Paid {formatDate(invoice.paidDate)} via {invoice.paymentMethod}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1.5">
        <button
          onClick={() => onDownload(invoice)}
          className="bg-gray-100 text-gray-600 border-none rounded-lg px-3 py-1.5 text-[11px] font-semibold cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
        <button
          onClick={() => onShare(invoice, client)}
          className="bg-gray-100 text-gray-600 border-none rounded-lg px-3 py-1.5 text-[11px] font-semibold cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          {isCopied ? "Copied!" : "Share"}
        </button>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  bg,
  fg,
  href,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly bg: string;
  readonly fg: string;
  readonly href?: string;
}) {
  const classes = `${bg} ${fg} flex-1 flex items-center justify-center gap-1.5 border-none rounded-xl py-3 font-semibold text-[13px] cursor-pointer hover:opacity-85 transition-opacity no-underline`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {icon}
        {label}
      </a>
    );
  }

  return (
    <button className={classes}>
      {icon}
      {label}
    </button>
  );
}
