import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, JOB_STATUS_STYLES } from "@/lib/utils";
import { JOBS } from "@/lib/mock-data";

const JOB_ICONS = { done: "✅", active: "⚙️", upcoming: "🗓" } as const;
const JOB_BADGE = { done: "success", active: "warning", upcoming: "info" } as const;

export default function JobsPage() {
  const sorted = [...JOBS].sort((a, b) => {
    const order = { active: 0, upcoming: 1, done: 2 };
    return order[a.st] - order[b.st];
  });

  return (
    <>
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <h2 className="font-extrabold text-base tracking-tight">All Jobs</h2>
        <button className="bg-brand-dark text-white border-none rounded-[10px] px-4 py-2 text-[13px] font-semibold cursor-pointer hover:opacity-85 transition-opacity inline-flex items-center gap-1.5">
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
                  📍 {job.addr} · {job.svc} · {job.time} · {job.worker}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {job.photos > 0 && (
                  <span className="text-[11px] text-gray-400">📷 {job.photos}</span>
                )}
                <span className="font-black text-xl tracking-tight">{formatCurrency(job.total)}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
