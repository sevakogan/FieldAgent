"use client";

const STATS = [
  { label: "Total Companies", value: "1,247", change: "+12%", changeUp: true },
  { label: "Platform MRR", value: "$184,500", change: "+8.3%", changeUp: true },
  { label: "Active Addresses", value: "32,891", change: "+5.1%", changeUp: true },
  { label: "Total Revenue", value: "$2.21M", change: "+22%", changeUp: true },
] as const;

const RECENT_SIGNUPS = [
  { name: "Sparkle Clean Co.", plan: "Professional", date: "2h ago", mrr: "$149" },
  { name: "Fresh Start LLC", plan: "Starter", date: "5h ago", mrr: "$49" },
  { name: "Elite Maids Inc.", plan: "Enterprise", date: "8h ago", mrr: "$299" },
  { name: "CleanPro Services", plan: "Professional", date: "1d ago", mrr: "$149" },
  { name: "TidyUp Boston", plan: "Starter", date: "1d ago", mrr: "$49" },
] as const;

const ACTIVITY = [
  { action: "New company signup", detail: "Sparkle Clean Co. — Professional plan", time: "2h ago" },
  { action: "Reseller payout processed", detail: "CleanTech Resellers — $3,200", time: "4h ago" },
  { action: "Promo code created", detail: "SUMMER25 — 25% off first 3 months", time: "6h ago" },
  { action: "Webhook failure", detail: "Stripe payment.failed — 3 retries", time: "8h ago" },
  { action: "Waitlist approved", detail: "12 companies moved to onboarding", time: "1d ago" },
] as const;

export default function AdminOverviewPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Platform Overview</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Monitor KleanHQ across all companies and resellers</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{stat.label}</div>
            <div className="text-[24px] font-bold text-[#1C1C1E] tracking-tight">{stat.value}</div>
            <div className={`text-[12px] font-semibold mt-1 ${stat.changeUp ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
              {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Recent Signups</h2>
          <div className="space-y-3">
            {RECENT_SIGNUPS.map((company) => (
              <div key={company.name} className="flex items-center justify-between py-2 border-b border-[#F2F2F7] last:border-0">
                <div>
                  <div className="text-[13px] font-semibold text-[#1C1C1E]">{company.name}</div>
                  <div className="text-[11px] text-[#8E8E93]">{company.plan} · {company.date}</div>
                </div>
                <div className="text-[13px] font-bold text-[#1C1C1E]">{company.mrr}/mo</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Activity Feed</h2>
          <div className="space-y-3">
            {ACTIVITY.map((item) => (
              <div key={item.detail} className="flex gap-3 py-2 border-b border-[#F2F2F7] last:border-0">
                <div className="w-2 h-2 rounded-full bg-[#8E8E93] mt-1.5 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-[#1C1C1E]">{item.action}</div>
                  <div className="text-[11px] text-[#8E8E93]">{item.detail}</div>
                  <div className="text-[10px] text-[#C7C7CC] mt-0.5">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
