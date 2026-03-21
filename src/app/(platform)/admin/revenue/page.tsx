"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminRevenue } from "@/lib/actions/admin";

type MonthRow = {
  month: string;
  paid: number;
  total: number;
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);
}

function groupByMonth(invoices: Array<{ total: number; status: string; created_at: string }>): MonthRow[] {
  const map = new Map<string, { paid: number; total: number }>();

  for (const inv of invoices) {
    const d = new Date(inv.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = map.get(key) ?? { paid: 0, total: 0 };
    existing.total += inv.total ?? 0;
    if (inv.status === "paid") {
      existing.paid += inv.total ?? 0;
    }
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
}

function formatMonth(ym: string): string {
  const [year, month] = ym.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function AdminRevenuePage() {
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminRevenue().then((result) => {
      if (result.success && result.data) {
        setMonths(groupByMonth(result.data.invoices));
      } else {
        setError(result.error ?? "Unknown error");
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#8E8E93] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FF3B30]/10 text-[#FF3B30] rounded-2xl p-5 text-[13px]">
        Failed to load revenue: {error}
      </div>
    );
  }

  const currentMrr = months.length > 0 ? months[months.length - 1].paid : 0;
  const totalPaid = months.reduce((sum, m) => sum + m.paid, 0);

  const stats = [
    { label: "Current MRR", value: formatCurrency(currentMrr) },
    { label: "Total Revenue", value: formatCurrency(totalPaid) },
    { label: "Months Tracked", value: months.length.toString() },
  ];

  const [csvCopied, setCsvCopied] = useState(false);

  const handleExportCsv = () => {
    const header = "Month,Paid,Total Invoiced";
    const rows = months.map((row) => `${formatMonth(row.month)},${(row.paid / 100).toFixed(2)},${(row.total / 100).toFixed(2)}`);
    const csv = [header, ...rows].join("\n");
    navigator.clipboard.writeText(csv);
    setCsvCopied(true);
    setTimeout(() => setCsvCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Revenue Dashboard</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">MRR growth by month from paid invoices</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/invoices"
            className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0066DD] transition-colors"
          >
            Create Invoice
          </Link>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E5EA] rounded-xl text-[13px] font-semibold hover:bg-[#F2F2F7] transition-colors"
          >
            {csvCopied ? "Copied!" : "Export CSV"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{stat.label}</div>
            <div className="text-[22px] font-bold text-[#1C1C1E] tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F2F2F7]">
          <h2 className="text-[16px] font-bold text-[#1C1C1E]">Monthly Revenue</h2>
        </div>
        {months.length === 0 ? (
          <div className="text-center py-12 text-[13px] text-[#C7C7CC]">No invoice data yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Month</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Paid</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Total Invoiced</th>
                </tr>
              </thead>
              <tbody>
                {months.map((row) => (
                  <tr key={row.month} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">{formatMonth(row.month)}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-[#34C759] font-semibold">{formatCurrency(row.paid)}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{formatCurrency(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
