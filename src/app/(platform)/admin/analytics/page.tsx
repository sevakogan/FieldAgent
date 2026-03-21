"use client";

import { useState, useEffect } from "react";
import { getAdminAnalytics } from "@/lib/actions/admin";

type AnalyticsData = {
  totalUsers: number;
  totalCompanies: number;
  companies: Array<{ id: string; name: string; created_at: string }>;
};

function groupSignupsByMonth(companies: Array<{ created_at: string }>): Array<{ month: string; count: number }> {
  const map = new Map<string, number>();
  for (const c of companies) {
    const d = new Date(c.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

function formatMonth(ym: string): string {
  const [year, month] = ym.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csvCopied, setCsvCopied] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getAdminAnalytics().then((result) => {
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error ?? "Unknown error");
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
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
        Failed to load analytics: {error}
      </div>
    );
  }

  if (!data) return null;

  const signupsByMonth = groupSignupsByMonth(data.companies);
  const maxCount = Math.max(...signupsByMonth.map((s) => s.count), 1);

  const stats = [
    { label: "Total Users", value: data.totalUsers.toLocaleString() },
    { label: "Total Companies", value: data.totalCompanies.toLocaleString() },
    { label: "Months Active", value: signupsByMonth.length.toString() },
  ];

  const handleExportCsv = () => {
    if (!data) return;
    const signupsByMonth = groupSignupsByMonth(data.companies);
    const header = "Month,Signups";
    const rows = signupsByMonth.map((s) => `${formatMonth(s.month)},${s.count}`);
    const summary = `\nTotal Users,${data.totalUsers}\nTotal Companies,${data.totalCompanies}`;
    const csv = [header, ...rows, summary].join("\n");
    navigator.clipboard.writeText(csv);
    setCsvCopied(true);
    setTimeout(() => setCsvCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Analytics</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Platform usage metrics and growth</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            disabled={!data}
            className="px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E5EA] rounded-xl text-[13px] font-semibold hover:bg-[#F2F2F7] transition-colors disabled:opacity-50"
          >
            {csvCopied ? "Copied!" : "Export Data"}
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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{m.label}</div>
            <div className="text-[22px] font-bold text-[#1C1C1E] tracking-tight">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Signups by Month */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-6">
        <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Company Signups by Month</h2>
        {signupsByMonth.length === 0 ? (
          <p className="text-[13px] text-[#C7C7CC] text-center py-6">No signup data yet.</p>
        ) : (
          <div className="space-y-3">
            {signupsByMonth.map((s) => (
              <div key={s.month}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-semibold text-[#1C1C1E]">{formatMonth(s.month)}</span>
                  <span className="text-[12px] text-[#8E8E93]">{s.count} signups</span>
                </div>
                <div className="w-full h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8E8E93] rounded-full transition-all"
                    style={{ width: `${(s.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart placeholder */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-8 text-center">
        <div className="text-[#C7C7CC] mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-[14px] font-semibold text-[#8E8E93]">Advanced Charts Coming Soon</p>
        <p className="text-[12px] text-[#C7C7CC] mt-1">Interactive time-series, cohort analysis, and funnel visualization</p>
      </div>
    </>
  );
}
