"use client";

import { useState } from "react";

const COMPANIES = [
  { id: "1", name: "Sparkle Clean Co.", plan: "Professional", status: "active", mrr: 149, addresses: 45, owner: "Maria Johnson", joined: "2024-08-15" },
  { id: "2", name: "Fresh Start LLC", plan: "Starter", status: "active", mrr: 49, addresses: 12, owner: "James Lee", joined: "2024-09-01" },
  { id: "3", name: "Elite Maids Inc.", plan: "Enterprise", status: "active", mrr: 299, addresses: 120, owner: "Sarah Davis", joined: "2024-07-20" },
  { id: "4", name: "CleanPro Services", plan: "Professional", status: "trial", mrr: 0, addresses: 8, owner: "Tom Wilson", joined: "2024-10-01" },
  { id: "5", name: "TidyUp Boston", plan: "Starter", status: "active", mrr: 49, addresses: 18, owner: "Amy Chen", joined: "2024-06-10" },
  { id: "6", name: "Pristine Homes", plan: "Enterprise", status: "suspended", mrr: 0, addresses: 78, owner: "Robert Kim", joined: "2024-05-22" },
  { id: "7", name: "GreenClean Atlanta", plan: "Professional", status: "active", mrr: 149, addresses: 55, owner: "Nadia Ross", joined: "2024-08-30" },
  { id: "8", name: "BrightSpace Co.", plan: "Starter", status: "churned", mrr: 0, addresses: 0, owner: "Derek Hill", joined: "2024-03-15" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#34C759]/10 text-[#34C759]",
  trial: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  suspended: "bg-[#FF3B30]/10 text-[#FF3B30]",
  churned: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

export default function AdminCompaniesPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = COMPANIES.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Companies</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Manage all companies on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search companies or owners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Company</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Plan</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">MRR</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Addresses</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-semibold text-[#1C1C1E]">{c.name}</div>
                    <div className="text-[11px] text-[#8E8E93]">{c.owner}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#1C1C1E]">{c.plan}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-[#1C1C1E]">${c.mrr}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{c.addresses}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[13px] text-[#C7C7CC]">No companies match your filters.</div>
        )}
      </div>
    </>
  );
}
