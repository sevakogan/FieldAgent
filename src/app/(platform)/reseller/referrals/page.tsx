"use client";

import { useState, useEffect } from "react";
import { fetchResellerReferrals } from "@/lib/actions/reseller";
import { StatusBadge } from "@/components/platform/Badge";

interface Referral {
  id: string;
  referred_email: string;
  referral_code: string;
  status: string;
  reward_value: number;
  created_at: string;
}

interface ReferralsData {
  referrals: Referral[];
  resellerSlug: string;
}


function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ResellerReferralsPage() {
  const [data, setData] = useState<ReferralsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchResellerReferrals().then((result) => {
      setData(result);
      setLoading(false);
    });
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

  const { referrals, resellerSlug } = data;
  const referralLink = `https://kleanhq.com/r/${resellerSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalReferrals = referrals.length;
  const convertedCount = referrals.filter((r) => r.status === "converted").length;
  const conversionRate = totalReferrals > 0 ? Math.round((convertedCount / totalReferrals) * 100) : 0;
  const totalRewards = referrals.reduce((sum, r) => sum + (r.reward_value ?? 0), 0);

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
            <span className="text-[13px] font-mono text-[#1C1C1E] truncate">{referralLink}</span>
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
          <div className="text-[22px] font-bold text-[#1C1C1E]">{totalReferrals}</div>
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

      {referrals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#AF52DE]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#AF52DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-[15px] font-bold text-[#1C1C1E] mb-1">No referrals yet</h3>
          <p className="text-[13px] text-[#8E8E93]">Share your referral link to start earning rewards.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F2F2F7]">
            <h2 className="text-[16px] font-bold text-[#1C1C1E]">Referral History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Referred Email</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Code</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Reward</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">{r.referred_email}</td>
                    <td className="px-5 py-3.5 text-[12px] font-mono text-[#8E8E93]">{r.referral_code}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-[#1C1C1E]">
                      {r.reward_value > 0 ? `$${r.reward_value}` : "\u2014"}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{formatDate(r.created_at)}</td>
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
