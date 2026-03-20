"use client";

const METRICS = [
  { label: "Daily Active Users", value: "3,421", change: "+8%", changeUp: true },
  { label: "Avg Session Duration", value: "12m 34s", change: "+3%", changeUp: true },
  { label: "Bounce Rate", value: "24.3%", change: "-2.1%", changeUp: true },
  { label: "Page Views (24h)", value: "48,291", change: "+15%", changeUp: true },
] as const;

const TOP_PAGES = [
  { page: "/dashboard", views: 12400, unique: 3200 },
  { page: "/jobs", views: 8900, unique: 2800 },
  { page: "/clients", views: 7200, unique: 2100 },
  { page: "/contacts", views: 5400, unique: 1800 },
  { page: "/settings", views: 3100, unique: 1200 },
  { page: "/pricing", views: 2800, unique: 2400 },
] as const;

const SIGNUPS_BY_SOURCE = [
  { source: "Organic Search", signups: 342, pct: 38 },
  { source: "Referral Program", signups: 228, pct: 25 },
  { source: "Direct", signups: 180, pct: 20 },
  { source: "Social Media", signups: 98, pct: 11 },
  { source: "Paid Ads", signups: 54, pct: 6 },
] as const;

export default function AdminAnalyticsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Analytics</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Platform usage metrics and acquisition channels</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {METRICS.map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{m.label}</div>
            <div className="text-[22px] font-bold text-[#1C1C1E] tracking-tight">{m.value}</div>
            <div className={`text-[12px] font-semibold mt-1 ${m.changeUp ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
              {m.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Top Pages</h2>
          <div className="space-y-3">
            {TOP_PAGES.map((page) => (
              <div key={page.page} className="flex items-center justify-between py-2 border-b border-[#F2F2F7] last:border-0">
                <div className="text-[13px] font-mono text-[#1C1C1E]">{page.page}</div>
                <div className="text-right">
                  <div className="text-[13px] font-semibold text-[#1C1C1E]">{page.views.toLocaleString()}</div>
                  <div className="text-[10px] text-[#8E8E93]">{page.unique.toLocaleString()} unique</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signups by Source */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Signups by Source</h2>
          <div className="space-y-4">
            {SIGNUPS_BY_SOURCE.map((s) => (
              <div key={s.source}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-semibold text-[#1C1C1E]">{s.source}</span>
                  <span className="text-[12px] text-[#8E8E93]">{s.signups} signups</span>
                </div>
                <div className="w-full h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8E8E93] rounded-full transition-all" style={{ width: `${s.pct}%` }} />
                </div>
                <div className="text-[10px] text-[#C7C7CC] mt-0.5">{s.pct}% of total</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="mt-6 bg-white rounded-2xl border border-[#E5E5EA] p-8 text-center">
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
