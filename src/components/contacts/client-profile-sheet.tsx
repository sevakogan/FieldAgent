"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, JOB_STATUS_STYLES } from "@/lib/utils";
import { JOBS } from "@/lib/mock-data";
import type { Client } from "@/types";

interface ClientProfileSheetProps {
  readonly client: Client | null;
  readonly onClose: () => void;
}

const JOB_BADGE = { done: "success", active: "warning", upcoming: "info" } as const;

export function ClientProfileSheet({ client, onClose }: ClientProfileSheetProps) {
  if (!client) return null;

  const clientJobs = JOBS.filter((j) => j.client === client.name);
  const lifetime = client.mrr * 14;

  return (
    <BottomSheet open={!!client} onClose={onClose} title={client.name}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <Avatar initials={client.ini} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-xl tracking-tight">{client.name}</span>
            {client.tag && (
              <span className="bg-yellow-50 text-yellow-700 rounded-md px-2 py-0.5 text-[10px] font-bold">
                {client.tag}
              </span>
            )}
          </div>
          <div className="text-[13px] text-gray-400">
            {client.phone} · {client.props} {client.props === 1 ? "property" : "properties"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="bg-green-50 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-gray-400 tracking-wider mb-1">MRR</div>
          <div className="font-black text-lg text-green-700">{formatCurrency(client.mrr)}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-gray-400 tracking-wider mb-1">LIFETIME</div>
          <div className="font-black text-lg text-brand">{formatCurrency(lifetime)}</div>
        </div>
        <div className={`rounded-xl p-3 ${client.bal > 0 ? "bg-red-50" : "bg-green-50"}`}>
          <div className="text-[10px] font-semibold text-gray-400 tracking-wider mb-1">BALANCE</div>
          <div className={`font-black text-lg ${client.bal > 0 ? "text-red-600" : "text-green-700"}`}>
            {client.bal > 0 ? formatCurrency(client.bal) : "Paid"}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-5">
        {[
          { icon: "📞", label: "Call",    bg: "bg-green-50",  fg: "text-green-700" },
          { icon: "💬", label: "Message", bg: "bg-blue-50",   fg: "text-blue-700" },
          { icon: "📋", label: "New Job", bg: "bg-yellow-50", fg: "text-yellow-700" },
          { icon: "💰", label: "Charge",  bg: "bg-purple-50", fg: "text-purple-700" },
        ].map((action) => (
          <button
            key={action.label}
            className={`${action.bg} ${action.fg} flex-1 border-none rounded-xl py-2.5 font-semibold text-xs cursor-pointer hover:opacity-80 transition-opacity`}
          >
            {action.icon} {action.label}
          </button>
        ))}
      </div>

      {/* Recent Jobs */}
      <div>
        <h4 className="font-bold text-sm mb-3">Recent Jobs</h4>
        {clientJobs.length === 0 ? (
          <p className="text-gray-400 text-[13px]">No jobs yet.</p>
        ) : (
          clientJobs.map((job) => {
            const status = JOB_STATUS_STYLES[job.st];
            return (
              <div
                key={job.id}
                className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="font-semibold text-[13px]">{job.svc}</div>
                  <div className="text-[11px] text-gray-400">
                    {job.time} · {job.photos} photos · {job.worker}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge variant={JOB_BADGE[job.st]}>{status.label}</Badge>
                  <span className="font-extrabold text-sm">{formatCurrency(job.total)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </BottomSheet>
  );
}
