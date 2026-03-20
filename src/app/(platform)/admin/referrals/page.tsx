"use client";

import { useState } from "react";

const REFERRALS = [
  { id: "1", referrer: "Maria Johnson", referrerCompany: "Sparkle Clean Co.", referred: "CleanPro Services", code: "SPARKLE20", status: "converted", reward: 50, date: "2024-09-28" },
  { id: "2", referrer: "Sarah Davis", referrerCompany: "Elite Maids Inc.", referred: "BrightSpace Co.", code: "ELITE15", status: "converted", reward: 50, date: "2024-09-15" },
  { id: "3", referrer: "Alex Morgan", referrerCompany: "CleanTech Resellers", referred: "GreenClean Atlanta", code: "CTECH25", status: "converted", reward: 75, date: "2024-08-30" },
  { id: "4", referrer: "Amy Chen", referrerCompany: "TidyUp Boston", referred: "Pending Signup", code: "TIDY10", status: "pending", reward: 0, date: "2024-10-02" },
  { id: "5", referrer: "James Lee", referrerCompany: "Fresh Start LLC", referred: "Pending Signup", code: "FRESH20", status: "pending", reward: 0, date: "2024-10-03" },
  { id: "6", referrer: "Nadia Ross", referrerCompany: "GreenClean Atlanta", referred: "Expired Link", code: "GREEN30", status: "expired", reward: 0, date: "2024-07-01" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  converted: "bg-[#34C759]/10 text-[#34C759]",
  pending: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  expired: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

export default function AdminReferralsPage() {
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = REFERRALS.filter((r) => filterStatus === "all" || r.status === filterStatus);

  const totalRewards = REFERRALS.filter((r) => r.status === "converted").reduce((sum, r) => sum + r.reward, 0);
  const conversionRate = Math.round((REFERRALS.filter((r) => r.status === "converted").length / REFERRALS.length) * 100);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Referrals</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Track all referral activity across the platform</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Total Referrals</div>
          <div className="text-[22px] font-bold text-[#1C1C1E]">{REFERRALS.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Conversion Rate</div>
          <div className="text-[22px] font-bold text-[#34C759]">{conversionRate}%</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Rewards Paid</div>
          <div className="text-[22px] font-bold text-[#1C1C1E]">${totalRewards}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "converted", "pending", "expired"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-colors ${
              filterStatus === status
                ? "bg-[#8E8E93] text-white"
                : "bg-white text-[#8E8E93] border border-[#E5E5EA] hover:bg-[#F2F2F7]"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Referrer</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Referred</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Code</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Reward</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-semibold text-[#1C1C1E]">{r.referrer}</div>
                    <div className="text-[11px] text-[#8E8E93]">{r.referrerCompany}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#1C1C1E]">{r.referred}</td>
                  <td className="px-5 py-3.5 text-[12px] font-mono text-[#8E8E93]">{r.code}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-[#1C1C1E]">{r.reward > 0 ? `$${r.reward}` : "—"}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
