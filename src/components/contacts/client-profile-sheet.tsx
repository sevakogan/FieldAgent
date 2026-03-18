"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, JOB_STATUS_STYLES } from "@/lib/utils";
import { getJobsByClient } from "@/lib/db/jobs";
import { getInvoicesByClient } from "@/lib/db/invoices";
import type { Client, Job, JobStatus } from "@/types";

interface ClientProfileSheetProps {
  readonly client: Client | null;
  readonly onClose: () => void;
}

const JOB_BADGE: Record<JobStatus, "success" | "warning" | "info"> = {
  done: "success",
  active: "warning",
  upcoming: "info",
};

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function ClientProfileSheet({ client, onClose }: ClientProfileSheetProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [mrr, setMrr] = useState(0);
  const [outstanding, setOutstanding] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    Promise.all([
      getJobsByClient(client.id),
      getInvoicesByClient(client.id),
    ]).then(([jobsData, invoicesData]) => {
      setJobs(jobsData);
      const unpaid = invoicesData
        .filter((inv) => ["unpaid", "overdue", "partial"].includes(inv.status))
        .reduce((sum, inv) => sum + inv.total, 0);
      setOutstanding(unpaid);
      // MRR would need properties query — use outstanding as proxy for now
      setMrr(0); // loaded on full profile page
    }).catch(console.error).finally(() => setLoading(false));
  }, [client?.id]);

  if (!client) return null;

  const ini = getInitials(client.name);
  const recentJobs = jobs.slice(0, 5);

  const handleNavigateToProfile = () => {
    onClose();
    router.push(`/clients/${client.id}`);
  };

  return (
    <BottomSheet open={!!client} onClose={onClose}>
      {/* Centered header */}
      <div className="flex flex-col items-center pt-2 mb-5">
        <div className="mb-3"><Avatar initials={ini} size="lg" /></div>
        <h2 className="text-[22px] font-bold text-gray-900 mb-1">{client.name}</h2>
        {client.tag && (
          <div className="flex gap-1.5 mb-1">
            <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-0.5 text-[13px] font-medium">{client.tag}</span>
          </div>
        )}
        <div className="text-[15px] text-gray-400">{client.phone ?? client.email ?? "—"}</div>
      </div>

      {/* Quick actions */}
      <div className="flex justify-center gap-6 mb-6">
        {[
          { icon: "📞", label: "Call",    action: () => client.phone && (window.location.href = `tel:${client.phone}`) },
          { icon: "💬", label: "Message", action: () => client.phone && (window.location.href = `sms:${client.phone}`) },
          { icon: "✉️", label: "Email",   action: () => client.email && (window.location.href = `mailto:${client.email}`) },
          { icon: "👤", label: "Profile", action: handleNavigateToProfile },
        ].map((a) => (
          <button key={a.label} onClick={a.action}
            className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl hover:bg-gray-200 transition-colors">
              {a.icon}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="bg-white rounded-2xl overflow-hidden mb-5">
        <div className="flex items-center divide-x divide-gray-100">
          <div className="flex-1 text-center py-3 px-2">
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Jobs</div>
            <div className="text-[17px] font-bold text-gray-900">{jobs.length}</div>
          </div>
          <div className="flex-1 text-center py-3 px-2">
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Outstanding</div>
            <div className={`text-[17px] font-bold ${outstanding > 0 ? "text-red-500" : "text-green-600"}`}>
              {outstanding > 0 ? formatCurrency(outstanding) : "Paid"}
            </div>
          </div>
          <div className="flex-1 text-center py-3 px-2">
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Active</div>
            <div className="text-[17px] font-bold text-gray-900">
              {jobs.filter((j) => j.status === "active").length}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="mb-5">
        <h4 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Recent Jobs</h4>
        <div className="bg-white rounded-2xl overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-[15px] px-4 py-4">Loading...</p>
          ) : recentJobs.length === 0 ? (
            <p className="text-gray-400 text-[15px] px-4 py-4">No jobs yet.</p>
          ) : (
            recentJobs.map((job, idx) => {
              const status = JOB_STATUS_STYLES[job.status];
              return (
                <div
                  key={job.id}
                  className={`flex items-center justify-between px-4 py-3 min-h-[44px] ${idx !== recentJobs.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <div>
                    <div className="font-semibold text-[15px]">{job.service}</div>
                    <div className="text-[13px] text-gray-400">
                      {job.time ?? ""} · {job.worker ?? ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Badge variant={JOB_BADGE[job.status]}>{status.label}</Badge>
                    <span className="font-bold text-[15px]">{formatCurrency(job.total)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <button
        onClick={handleNavigateToProfile}
        className="w-full bg-transparent border-none text-blue-500 text-[15px] font-semibold py-3 cursor-pointer hover:text-blue-600 transition-colors"
      >
        View Full Profile →
      </button>
    </BottomSheet>
  );
}
