"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchResellerOverview } from "@/lib/actions/reseller";

interface Reseller {
  id: string;
  brand_name: string;
  margin_percentage: number;
}

interface Company {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface Stats {
  companiesCount: number;
  totalRevenue: number;
  marginEarnings: number;
  pendingInvoices: number;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#34C759]/10 text-[#34C759]",
  trial: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  inactive: "bg-[#8E8E93]/10 text-[#8E8E93]",
  paid: "bg-[#34C759]/10 text-[#34C759]",
  pending: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ResellerOverviewPage() {
  const [reseller, setReseller] = useState<Reseller | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<Stats>({ companiesCount: 0, totalRevenue: 0, marginEarnings: 0, pendingInvoices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResellerOverview().then((data) => {
      setReseller(data.reseller);
      setCompanies(data.companies);
      setStats(data.stats);
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

  if (!reseller) {
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
    { label: "My Companies", value: String(stats.companiesCount) },
    { label: "Margin Earnings", value: formatCurrency(stats.marginEarnings) },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue) },
    { label: "Pending Payouts", value: formatCurrency(stats.pendingInvoices) },
  ];

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Welcome back</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">{reseller.brand_name} dashboard overview</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/reseller/companies"
            className="px-4 py-2 bg-[#AF52DE] text-white rounded-xl text-[13px] font-semibold hover:bg-[#9B3DC8] transition-colors"
          >
            View Companies
          </Link>
          <Link
            href="/reseller/revenue"
            className="px-4 py-2 bg-white text-[#AF52DE] border border-[#AF52DE] rounded-xl text-[13px] font-semibold hover:bg-[#AF52DE]/5 transition-colors"
          >
            View Revenue
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{stat.label}</div>
            <div className="text-[24px] font-bold text-[#1C1C1E] tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Companies */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
        <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Recent Companies</h2>
        {companies.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-[13px] text-[#C7C7CC]">No companies yet. Start referring to grow your portfolio.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {companies.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-[#F2F2F7] last:border-0">
                <div>
                  <div className="text-[13px] font-semibold text-[#1C1C1E]">{c.name}</div>
                  <div className="text-[11px] text-[#8E8E93]">{timeAgo(c.created_at)}</div>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_STYLES[c.status] ?? "bg-[#8E8E93]/10 text-[#8E8E93]"}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
