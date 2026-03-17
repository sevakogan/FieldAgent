"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  if (!client) return null;

  const clientJobs = JOBS.filter((j) => j.client === client.name);
  const lifetime = client.mrr * 14;

  const handleNavigateToProfile = () => {
    onClose();
    router.push(`/clients/${client.id}`);
  };

  return (
    <BottomSheet open={!!client} onClose={onClose}>
      {/* Centered header with large avatar */}
      <div className="flex flex-col items-center pt-2 mb-5">
        <div className="mb-3">
          <Avatar initials={client.ini} size="lg" />
        </div>
        <h2 className="text-[22px] font-bold text-gray-900 mb-1">{client.name}</h2>
        {client.tag && (
          <div className="flex gap-1.5 mb-1">
            <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-0.5 text-[13px] font-medium">
              {client.tag}
            </span>
          </div>
        )}
        <div className="text-[15px] text-gray-400">{client.phone}</div>
      </div>

      {/* Quick action circles (Apple Contacts style) */}
      <div className="flex justify-center gap-6 mb-6">
        {[
          { icon: "📞", label: "Call" },
          { icon: "💬", label: "Message" },
          { icon: "✉️", label: "Email" },
          { icon: "📤", label: "Share" },
        ].map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl hover:bg-gray-200 transition-colors">
              {action.icon}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Stats row with thin separators */}
      <div className="bg-white rounded-2xl overflow-hidden mb-5">
        <div className="flex items-center divide-x divide-gray-100">
          <div className="flex-1 text-center py-3 px-2">
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">MRR</div>
            <div className="text-[17px] font-bold text-green-600">{formatCurrency(client.mrr)}</div>
          </div>
          <div className="flex-1 text-center py-3 px-2">
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Lifetime</div>
            <div className="text-[17px] font-bold text-gray-900">{formatCurrency(lifetime)}</div>
          </div>
          <div className="flex-1 text-center py-3 px-2">
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Balance</div>
            <div className={`text-[17px] font-bold ${client.bal > 0 ? "text-red-500" : "text-green-600"}`}>
              {client.bal > 0 ? formatCurrency(client.bal) : "Paid"}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs — Apple grouped list */}
      <div className="mb-5">
        <h4 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
          Recent Jobs
        </h4>
        <div className="bg-white rounded-2xl overflow-hidden">
          {clientJobs.length === 0 ? (
            <p className="text-gray-400 text-[15px] px-4 py-4">No jobs yet.</p>
          ) : (
            clientJobs.map((job, idx) => {
              const status = JOB_STATUS_STYLES[job.st];
              return (
                <div
                  key={job.id}
                  className={`flex items-center justify-between px-4 py-3 min-h-[44px] ${
                    idx !== clientJobs.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[15px]">{job.svc}</div>
                    <div className="text-[13px] text-gray-400">
                      {job.time} · {job.photos} photos · {job.worker}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Badge variant={JOB_BADGE[job.st]}>{status.label}</Badge>
                    <span className="font-bold text-[15px]">{formatCurrency(job.total)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* View Full Profile link */}
      <button
        onClick={handleNavigateToProfile}
        className="w-full bg-transparent border-none text-blue-500 text-[15px] font-semibold py-3 cursor-pointer hover:text-blue-600 transition-colors"
      >
        View Full Profile →
      </button>
    </BottomSheet>
  );
}
