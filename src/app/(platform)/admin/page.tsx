"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminOverview } from "@/lib/actions/admin";

type OverviewData = {
  totalCompanies: number;
  mrr: number;
  totalRevenue: number;
  recentSignups: Array<{ id: string; name: string; status: string; created_at: string }>;
  recentActivity: Array<{ id: string; action: string; entity_type: string; entity_id: string; created_at: string }>;
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminOverview().then((result) => {
      if (result.success && result.data) {
        setData(result.data);
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
        Failed to load overview: {error}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Total Companies", value: data.totalCompanies.toLocaleString() },
    { label: "Platform MRR", value: formatCurrency(data.mrr) },
    { label: "Total Revenue", value: formatCurrency(data.totalRevenue) },
  ];

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Platform Overview</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Monitor KleanHQ across all companies and resellers</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/companies"
            className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0066DD] transition-colors"
          >
            Add Company
          </Link>
          <Link
            href="/admin/revenue"
            className="px-4 py-2 bg-white text-[#007AFF] border border-[#007AFF] rounded-xl text-[13px] font-semibold hover:bg-[#007AFF]/5 transition-colors"
          >
            View Revenue
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{stat.label}</div>
            <div className="text-[24px] font-bold text-[#1C1C1E] tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Recent Signups</h2>
          {data.recentSignups.length === 0 ? (
            <p className="text-[13px] text-[#C7C7CC] text-center py-6">No companies yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentSignups.map((company) => (
                <div key={company.id} className="flex items-center justify-between py-2 border-b border-[#F2F2F7] last:border-0">
                  <div>
                    <div className="text-[13px] font-semibold text-[#1C1C1E]">{company.name}</div>
                    <div className="text-[11px] text-[#8E8E93]">{company.status} · {timeAgo(company.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Activity Feed</h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-[13px] text-[#C7C7CC] text-center py-6">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((item) => (
                <div key={item.id} className="flex gap-3 py-2 border-b border-[#F2F2F7] last:border-0">
                  <div className="w-2 h-2 rounded-full bg-[#8E8E93] mt-1.5 shrink-0" />
                  <div>
                    <div className="text-[13px] font-semibold text-[#1C1C1E]">{item.action}</div>
                    <div className="text-[11px] text-[#8E8E93]">{item.entity_type} · {item.entity_id}</div>
                    <div className="text-[10px] text-[#C7C7CC] mt-0.5">{timeAgo(item.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
