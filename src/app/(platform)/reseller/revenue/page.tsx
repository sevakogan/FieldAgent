"use client";

import { useState, useEffect } from "react";
import { fetchResellerRevenue } from "@/lib/actions/reseller";

interface MonthlyRevenue {
  month: string;
  invoiceTotal: number;
  marginEarning: number;
  invoiceCount: number;
}

interface RevenueData {
  marginPercentage: number;
  monthlyBreakdown: MonthlyRevenue[];
  totalEarned: number;
  currentMonthEarning: number;
  pendingPayout: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function ResellerRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [csvCopied, setCsvCopied] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetchResellerRevenue().then((result) => {
      setData(result);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#AF52DE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-[#AF52DE]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#AF52DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-[18px] font-bold text-[#1C1C1E] mb-1">No Reseller Account Found</h2>
        <p className="text-[13px] text-[#8E8E93]">Contact support to set up your reseller account.</p>
      </div>
    );
  }

  const statCards = [
    { label: "Current Monthly Earning", value: formatCurrency(data.currentMonthEarning) },
    { label: "Total Earned (All Time)", value: formatCurrency(data.totalEarned) },
    { label: "Margin Rate", value: `${data.marginPercentage}%` },
    { label: "Pending Payout", value: formatCurrency(data.pendingPayout) },
  ];

  const handleExportCsv = () => {
    if (!data) return;
    const header = "Month,Invoices,Total Revenue,Margin %,My Earning";
    const rows = data.monthlyBreakdown.map((row) =>
      `${row.month},${row.invoiceCount},${row.invoiceTotal.toFixed(2)},${data.marginPercentage}%,${row.marginEarning.toFixed(2)}`
    );
    const csv = [header, ...rows].join("\n");
    navigator.clipboard.writeText(csv);
    setCsvCopied(true);
    setTimeout(() => setCsvCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Revenue</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Margin earnings from your referred companies</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            disabled={!data}
            className="px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E5EA] rounded-xl text-[13px] font-semibold hover:bg-[#F2F2F7] transition-colors disabled:opacity-50"
          >
            {csvCopied ? "Copied!" : "Export CSV"}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E5EA] rounded-xl text-[13px] font-semibold hover:bg-[#F2F2F7] transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{stat.label}</div>
            <div className="text-[22px] font-bold text-[#1C1C1E] tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Monthly Breakdown */}
      {data.monthlyBreakdown.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#AF52DE]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#AF52DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-[15px] font-bold text-[#1C1C1E] mb-1">No revenue yet</h3>
          <p className="text-[13px] text-[#8E8E93]">Revenue will appear here once invoices are paid.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F2F2F7]">
            <h2 className="text-[16px] font-bold text-[#1C1C1E]">Monthly Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Month</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Invoices</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Total Revenue</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Margin %</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">My Earning</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyBreakdown.map((row) => (
                  <tr key={row.month} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">{row.month}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{row.invoiceCount}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{formatCurrency(row.invoiceTotal)}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{data.marginPercentage}%</td>
                    <td className="px-5 py-3.5 text-right text-[13px] font-bold text-[#AF52DE]">{formatCurrency(row.marginEarning)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
