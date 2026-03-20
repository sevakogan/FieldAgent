"use client";

const REVENUE_MONTHS = [
  { month: "May 2024", mrr: 98200, newBiz: 12400, churn: 3200, net: 107400 },
  { month: "Jun 2024", mrr: 107400, newBiz: 14800, churn: 2900, net: 119300 },
  { month: "Jul 2024", mrr: 119300, newBiz: 18200, churn: 4100, net: 133400 },
  { month: "Aug 2024", mrr: 133400, newBiz: 21500, churn: 3800, net: 151100 },
  { month: "Sep 2024", mrr: 151100, newBiz: 19800, churn: 5200, net: 165700 },
  { month: "Oct 2024", mrr: 165700, newBiz: 23100, churn: 4300, net: 184500 },
] as const;

const TOP_PLANS = [
  { plan: "Enterprise", companies: 89, mrr: 26611, pct: 14.4 },
  { plan: "Professional", companies: 534, mrr: 79566, pct: 43.1 },
  { plan: "Starter", companies: 624, mrr: 30576, pct: 16.6 },
  { plan: "Trial", companies: 187, mrr: 0, pct: 0 },
] as const;

const REVENUE_STATS = [
  { label: "Current MRR", value: "$184,500" },
  { label: "ARR", value: "$2.21M" },
  { label: "Net New MRR", value: "$18,800" },
  { label: "Churn Rate", value: "2.3%" },
] as const;

export default function AdminRevenuePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Revenue Dashboard</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">MRR growth, churn, and plan breakdown</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {REVENUE_STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{stat.label}</div>
            <div className="text-[22px] font-bold text-[#1C1C1E] tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* MRR Trend Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F2F2F7]">
            <h2 className="text-[16px] font-bold text-[#1C1C1E]">MRR Trend</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Month</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Start MRR</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">New Biz</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Churn</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">End MRR</th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_MONTHS.map((row) => (
                  <tr key={row.month} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">{row.month}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">${row.mrr.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-[#34C759] font-semibold">+${row.newBiz.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-[#FF3B30] font-semibold">-${row.churn.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] font-bold text-[#1C1C1E]">${row.net.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Plan Breakdown</h2>
          <div className="space-y-4">
            {TOP_PLANS.map((plan) => (
              <div key={plan.plan}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-semibold text-[#1C1C1E]">{plan.plan}</span>
                  <span className="text-[12px] text-[#8E8E93]">{plan.companies} companies</span>
                </div>
                <div className="w-full h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8E8E93] rounded-full transition-all"
                    style={{ width: `${Math.max(plan.pct, 2)}%` }}
                  />
                </div>
                <div className="text-[11px] text-[#8E8E93] mt-1">${plan.mrr.toLocaleString()}/mo · {plan.pct}% of MRR</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
