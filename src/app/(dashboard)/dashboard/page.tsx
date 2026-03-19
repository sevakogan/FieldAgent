"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PendingRequests } from "@/components/dashboard/pending-requests";
import { formatCurrency, JOB_STATUS_STYLES } from "@/lib/utils";
import { getAuthContext } from "@/lib/db/auth";
import { getClients } from "@/lib/db/clients";
import { getJobs } from "@/lib/db/jobs";
import { getLeads } from "@/lib/db/leads";
import type { Client, Job, Lead } from "@/types";

const JOB_BADGE_VARIANT = {
  done: "success",
  active: "warning",
  upcoming: "info",
} as const;

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const auth = await getAuthContext();
      if (!auth) { setLoading(false); return; }
      const [c, j, l] = await Promise.all([
        getClients(auth.companyId),
        getJobs(auth.companyId),
        getLeads(auth.companyId),
      ]);
      setClients(c);
      setJobs(j);
      setLeads(l);
      setLoading(false);
    })();
  }, []);

  const todayKey = new Date().toISOString().split("T")[0];
  const todayJobs = jobs.filter((j) => j.date === todayKey);
  const newLeads = leads.filter((l) => l.status === "new").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Quick Actions — top row */}
      <div className="flex gap-2 mb-5">
        {[
          { icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          ), label: "New Job",    bg: "bg-[#E8F9ED]", fg: "text-[#1C7A35]", href: "/jobs" },
          { icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          ), label: "Add Client", bg: "bg-[#E8F0FE]", fg: "text-[#1A56DB]", href: "/contacts" },
          { icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          ), label: "Message",    bg: "bg-[#F3E8FF]", fg: "text-[#7C3AED]", href: "/contacts" },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`${action.bg} ${action.fg} flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold hover:opacity-80 transition-opacity`}
          >
            {action.icon}
            {action.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-5">
        <StatCard label="Monthly Revenue" value={formatCurrency(clients.length)} accent={`${clients.length} clients`} />
        <StatCard label="Jobs Today" value={String(todayJobs.length)} accent={`${newLeads} new leads`} />
      </div>

      <PendingRequests />

      <Card className="mb-5" padding="lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-extrabold text-[15px] tracking-tight">Today&apos;s Jobs</h2>
          <Link href="/jobs" className="text-xs text-gray-500 font-medium bg-white border border-gray-200 rounded-[10px] px-3 py-1.5 hover:border-gray-300 transition-colors">
            View all
          </Link>
        </div>

        {todayJobs.length === 0 ? (
          <p className="text-gray-400 text-[13px] py-2">No jobs scheduled for today.</p>
        ) : (
          todayJobs.map((job) => {
            const status = JOB_STATUS_STYLES[job.status];
            const clientName = job.clients?.name ?? "";
            const ini = getInitials(clientName);
            return (
              <div key={job.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <Avatar initials={ini} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px] mb-0.5">{clientName}</div>
                  <div className="text-[11px] text-gray-400 truncate">{job.time ?? ""} · {job.service}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-sm mb-1">{formatCurrency(job.total)}</div>
                  <Badge variant={JOB_BADGE_VARIANT[job.status]}>{status.label}</Badge>
                </div>
              </div>
            );
          })
        )}
      </Card>

    </>
  );
}
