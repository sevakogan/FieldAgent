"use client";

const STATS = [
  { label: "My Companies", value: "34", change: "+3 this month", changeUp: true },
  { label: "Monthly Earnings", value: "$3,720", change: "+12%", changeUp: true },
  { label: "Total Earned", value: "$42,800", change: "All time", changeUp: true },
  { label: "Active Referrals", value: "8", change: "5 pending", changeUp: true },
] as const;

const RECENT_COMPANIES = [
  { name: "Sparkle Clean Co.", plan: "Professional", mrr: 149, margin: 15, earning: 22.35, status: "active", joined: "3d ago" },
  { name: "Fresh Start LLC", plan: "Starter", mrr: 49, margin: 15, earning: 7.35, status: "active", joined: "1w ago" },
  { name: "CleanPro Services", plan: "Professional", mrr: 149, margin: 15, earning: 22.35, status: "trial", joined: "2w ago" },
] as const;

const PAYOUTS = [
  { date: "Oct 1, 2024", amount: 3200, companies: 31, status: "paid" },
  { date: "Sep 1, 2024", amount: 2950, companies: 29, status: "paid" },
  { date: "Aug 1, 2024", amount: 2700, companies: 27, status: "paid" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#34C759]/10 text-[#34C759]",
  trial: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  paid: "bg-[#34C759]/10 text-[#34C759]",
};

export default function ResellerOverviewPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Welcome back, Alex</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">CleanTech Resellers dashboard overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{stat.label}</div>
            <div className="text-[24px] font-bold text-[#1C1C1E] tracking-tight">{stat.value}</div>
            <div className="text-[12px] font-semibold mt-1 text-[#34C759]">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Recent Companies</h2>
          <div className="space-y-3">
            {RECENT_COMPANIES.map((c) => (
              <div key={c.name} className="flex items-center justify-between py-2.5 border-b border-[#F2F2F7] last:border-0">
                <div>
                  <div className="text-[13px] font-semibold text-[#1C1C1E]">{c.name}</div>
                  <div className="text-[11px] text-[#8E8E93]">{c.plan} · {c.joined}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#AF52DE]">+${c.earning.toFixed(2)}/mo</div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_STYLES[c.status]}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payouts */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Recent Payouts</h2>
          <div className="space-y-3">
            {PAYOUTS.map((p) => (
              <div key={p.date} className="flex items-center justify-between py-2.5 border-b border-[#F2F2F7] last:border-0">
                <div>
                  <div className="text-[13px] font-semibold text-[#1C1C1E]">{p.date}</div>
                  <div className="text-[11px] text-[#8E8E93]">{p.companies} companies</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#1C1C1E]">${p.amount.toLocaleString()}</div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_STYLES[p.status]}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
