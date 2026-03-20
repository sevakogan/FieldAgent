"use client";

interface WaitlistStatsProps {
  readonly total: number;
  readonly typeCounts: Record<string, number>;
  readonly signupsToday: number;
  readonly signupsThisWeek: number;
}

const TYPE_LABELS: Record<string, string> = {
  company: "Company",
  client: "Client",
  reseller: "Reseller",
  pro: "Pro",
};

export default function WaitlistStats({
  total,
  typeCounts,
  signupsToday,
  signupsThisWeek,
}: WaitlistStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {/* Total */}
      <div className="col-span-2 rounded-xl bg-white p-6 shadow-sm sm:col-span-1">
        <p className="text-sm font-medium text-gray-500">Total Signups</p>
        <p className="mt-1 text-3xl font-bold text-[#007AFF]">{total}</p>
      </div>

      {/* By type */}
      {Object.entries(TYPE_LABELS).map(([key, label]) => (
        <div key={key} className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[#1C1C1E]">
            {typeCounts[key] ?? 0}
          </p>
        </div>
      ))}

      {/* Today */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Today</p>
        <p className="mt-1 text-2xl font-bold text-[#1C1C1E]">
          {signupsToday}
        </p>
      </div>

      {/* This week - hidden on very small screens if grid overflows */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">This Week</p>
        <p className="mt-1 text-2xl font-bold text-[#1C1C1E]">
          {signupsThisWeek}
        </p>
      </div>
    </div>
  );
}
