import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PendingRequests } from "@/components/dashboard/pending-requests";
import { formatCurrency, JOB_STATUS_STYLES } from "@/lib/utils";
import { CLIENTS, JOBS, LEADS } from "@/lib/mock-data";
import Link from "next/link";

const JOB_BADGE_VARIANT = {
  done: "success",
  active: "warning",
  upcoming: "info",
} as const;

export default function DashboardPage() {
  const mrr = CLIENTS.reduce((sum, c) => sum + c.mrr, 0);
  const newLeads = LEADS.filter((l) => l.status === "new").length;

  return (
    <>
      {/* Stats — 2 cards on mobile, 2 on desktop */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-5">
        <StatCard label="Monthly Revenue" value={formatCurrency(mrr)} accent={`↑ 12% vs last month`} />
        <StatCard label="Jobs Today" value={String(JOBS.length)} accent={`${newLeads} new leads`} />
      </div>

      {/* Pending Job Requests from Clients */}
      <PendingRequests />

      {/* Today's Jobs */}
      <Card className="mb-5" padding="lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-extrabold text-[15px] tracking-tight">Today&apos;s Jobs</h2>
          <Link
            href="/jobs"
            className="text-xs text-gray-500 font-medium bg-white border border-gray-200 rounded-[10px] px-3 py-1.5 hover:border-gray-300 transition-colors"
          >
            View all
          </Link>
        </div>
        {JOBS.map((job) => {
          const status = JOB_STATUS_STYLES[job.st];
          return (
            <div key={job.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <Avatar initials={job.ini} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] mb-0.5">{job.client}</div>
                <div className="text-[11px] text-gray-400 truncate">{job.time} · {job.svc}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-extrabold text-sm mb-1">{formatCurrency(job.total)}</div>
                <Badge variant={JOB_BADGE_VARIANT[job.st]}>{status.label}</Badge>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Quick Actions — 3 on mobile */}
      <Card padding="lg">
        <h2 className="font-extrabold text-[15px] tracking-tight mb-3.5">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: "➕", label: "New Job",    bg: "bg-green-50",  fg: "text-green-700", href: "/jobs" },
            { icon: "👤", label: "Add Client", bg: "bg-blue-50",   fg: "text-blue-700",  href: "/contacts" },
            { icon: "💬", label: "Message",    bg: "bg-purple-50", fg: "text-purple-700", href: "/contacts" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`${action.bg} rounded-[14px] p-4 flex flex-col items-center gap-2 text-center hover:-translate-y-0.5 hover:shadow-md transition-all`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className={`${action.fg} font-bold text-[12px]`}>{action.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}
