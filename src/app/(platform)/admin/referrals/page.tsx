"use client";

import { useState, useEffect } from "react";
import { getAdminReferrals, updateReferralStatus } from "@/lib/actions/admin";

type Referral = {
  id: string;
  referrer_type: string | null;
  referred_email: string | null;
  referral_code: string | null;
  status: string;
  reward_type: string | null;
  reward_value: number | null;
  created_at: string;
  company_name: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  converted: "bg-[#34C759]/10 text-[#34C759]",
  pending: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  signed_up: "bg-[#007AFF]/10 text-[#007AFF]",
  qualified: "bg-[#AF52DE]/10 text-[#AF52DE]",
  rewarded: "bg-[#34C759]/10 text-[#34C759]",
  expired: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

const REFERRAL_STATUSES = ["pending", "signed_up", "qualified", "rewarded", "expired"] as const;

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    getAdminReferrals().then((result) => {
      if (result.success && result.data) {
        setReferrals(result.data);
      } else {
        setError(result.error ?? "Unknown error");
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const result = await updateReferralStatus(id, newStatus);
    if (result.success) {
      setReferrals((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    }
    setUpdatingId(null);
  };

  const filtered = referrals.filter((r) => filterStatus === "all" || r.status === filterStatus);
  const converted = referrals.filter((r) => r.status === "converted" || r.status === "rewarded");
  const totalRewards = converted.reduce((sum, r) => sum + (r.reward_value ?? 0), 0);
  const conversionRate = referrals.length > 0 ? Math.round((converted.length / referrals.length) * 100) : 0;

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
        Failed to load referrals: {error}
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Referrals</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Track all referral activity across the platform</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Total Referrals</div>
          <div className="text-[22px] font-bold text-[#1C1C1E]">{referrals.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Conversion Rate</div>
          <div className="text-[22px] font-bold text-[#34C759]">{conversionRate}%</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Rewards Value</div>
          <div className="text-[22px] font-bold text-[#1C1C1E]">${totalRewards}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "pending", "signed_up", "qualified", "rewarded", "expired"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-colors ${
              filterStatus === status
                ? "bg-[#8E8E93] text-white"
                : "bg-white text-[#8E8E93] border border-[#E5E5EA] hover:bg-[#F2F2F7]"
            }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[13px] text-[#C7C7CC]">
            {referrals.length === 0 ? "No referrals yet." : "No referrals match this filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Company</th>
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
                      <div className="text-[13px] font-semibold text-[#1C1C1E]">{r.company_name ?? "\u2014"}</div>
                      <div className="text-[11px] text-[#8E8E93]">{r.referrer_type ?? "\u2014"}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#1C1C1E]">{r.referred_email ?? "\u2014"}</td>
                    <td className="px-5 py-3.5 text-[12px] font-mono text-[#8E8E93]">{r.referral_code ?? "\u2014"}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        disabled={updatingId === r.id}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 ${
                          STATUS_STYLES[r.status] ?? "bg-[#F2F2F7] text-[#8E8E93]"
                        } ${updatingId === r.id ? "opacity-50" : ""}`}
                      >
                        {REFERRAL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-[#1C1C1E]">
                      {r.reward_value && r.reward_value > 0 ? `$${r.reward_value}` : "\u2014"}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{new Date(r.created_at).toLocaleDateString()}</td>
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
