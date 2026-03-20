"use client";

const REVENUE_MONTHS = [
  { month: "May 2024", companies: 25, totalMrr: 3725, margin: 15, earning: 558.75 },
  { month: "Jun 2024", companies: 27, totalMrr: 4023, margin: 15, earning: 603.45 },
  { month: "Jul 2024", companies: 28, totalMrr: 4172, margin: 15, earning: 625.80 },
  { month: "Aug 2024", companies: 30, totalMrr: 4470, margin: 15, earning: 670.50 },
  { month: "Sep 2024", companies: 31, totalMrr: 4619, margin: 15, earning: 692.85 },
  { month: "Oct 2024", companies: 34, totalMrr: 5066, margin: 15, earning: 759.90 },
] as const;

const STATS = [
  { label: "Current Monthly Earning", value: "$759.90" },
  { label: "Total Earned (All Time)", value: "$42,800" },
  { label: "Margin Rate", value: "15%" },
  { label: "Avg per Company", value: "$22.35" },
] as const;

const PENDING_PAYOUT = {
  amount: 759.90,
  companies: 34,
  period: "October 2024",
  payoutDate: "Nov 1, 2024",
};

export default function ResellerRevenuePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Revenue</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Margin earnings from your referred companies</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{stat.label}</div>
            <div className="text-[22px] font-bold text-[#1C1C1E] tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Pending Payout */}
      <div className="bg-gradient-to-r from-[#AF52DE]/10 to-[#5856D6]/10 rounded-2xl border border-[#AF52DE]/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] text-[#AF52DE] font-semibold uppercase tracking-wider mb-1">Next Payout</div>
            <div className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">${PENDING_PAYOUT.amount.toFixed(2)}</div>
            <div className="text-[12px] text-[#8E8E93] mt-1">{PENDING_PAYOUT.companies} companies · {PENDING_PAYOUT.period}</div>
          </div>
          <div className="text-right">
            <div className="text-[12px] text-[#8E8E93] mb-1">Payout Date</div>
            <div className="text-[15px] font-bold text-[#1C1C1E]">{PENDING_PAYOUT.payoutDate}</div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F2F2F7]">
          <h2 className="text-[16px] font-bold text-[#1C1C1E]">Monthly Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Month</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Companies</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Total MRR</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Margin %</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">My Earning</th>
              </tr>
            </thead>
            <tbody>
              {REVENUE_MONTHS.map((row) => (
                <tr key={row.month} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">{row.month}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{row.companies}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">${row.totalMrr.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{row.margin}%</td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-bold text-[#AF52DE]">${row.earning.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
