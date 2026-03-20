"use client";

import { useState } from "react";

const REFERRAL_LINK = "https://kleanhq.com/r/CTECH25";

const REFERRALS = [
  { id: "1", referred: "Sparkle Clean Co.", contact: "Maria Johnson", code: "CTECH25", status: "converted", reward: 75, date: "2024-08-15" },
  { id: "2", referred: "Fresh Start LLC", contact: "James Lee", code: "CTECH25", status: "converted", reward: 75, date: "2024-09-01" },
  { id: "3", referred: "GreenClean Atlanta", contact: "Nadia Ross", code: "CTECH25", status: "converted", reward: 75, date: "2024-08-30" },
  { id: "4", referred: "CleanPro Services", contact: "Tom Wilson", code: "CTECH25", status: "pending", reward: 0, date: "2024-10-01" },
  { id: "5", referred: "Pending Signup", contact: "Unknown", code: "CTECH25", status: "pending", reward: 0, date: "2024-10-03" },
  { id: "6", referred: "Expired Lead", contact: "Jane Smith", code: "CTECH25", status: "expired", reward: 0, date: "2024-06-15" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  converted: "bg-[#34C759]/10 text-[#34C759]",
  pending: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  expired: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

export default function ResellerReferralsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(REFERRAL_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalRewards = REFERRALS.filter((r) => r.status === "converted").reduce((sum, r) => sum + r.reward, 0);
  const conversionRate = Math.round((REFERRALS.filter((r) => r.status === "converted").length / REFERRALS.length) * 100);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Referrals</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Share your link and earn rewards for each signup</p>
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-6">
        <div className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Your Referral Link</div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 px-4 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA] flex items-center">
            <span className="text-[13px] font-mono text-[#1C1C1E] truncate">{REFERRAL_LINK}</span>
          </div>
          <button
            onClick={handleCopy}
            className={`h-10 px-5 rounded-xl text-[13px] font-semibold transition-colors ${
              copied ? "bg-[#34C759] text-white" : "bg-[#AF52DE] text-white hover:bg-[#9B3DC8]"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
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
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Rewards Earned</div>
          <div className="text-[22px] font-bold text-[#AF52DE]">${totalRewards}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F2F2F7]">
          <h2 className="text-[16px] font-bold text-[#1C1C1E]">Referral History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Referred</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Reward</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {REFERRALS.map((r) => (
                <tr key={r.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-semibold text-[#1C1C1E]">{r.referred}</div>
                    <div className="text-[11px] text-[#8E8E93]">{r.contact}</div>
                  </td>
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
