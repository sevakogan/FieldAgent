"use client";

import { useState } from "react";

const COMPANIES = [
  { id: "1", name: "Sparkle Clean Co.", owner: "Maria Johnson", plan: "Professional", mrr: 149, margin: 15, earning: 22.35, status: "active", addresses: 45, joined: "2024-08-15" },
  { id: "2", name: "Fresh Start LLC", owner: "James Lee", plan: "Starter", mrr: 49, margin: 15, earning: 7.35, status: "active", addresses: 12, joined: "2024-09-01" },
  { id: "3", name: "Elite Maids Inc.", owner: "Sarah Davis", plan: "Enterprise", mrr: 299, margin: 15, earning: 44.85, status: "active", addresses: 120, joined: "2024-07-20" },
  { id: "4", name: "CleanPro Services", owner: "Tom Wilson", plan: "Professional", mrr: 149, margin: 15, earning: 22.35, status: "trial", addresses: 8, joined: "2024-10-01" },
  { id: "5", name: "TidyUp Boston", owner: "Amy Chen", plan: "Starter", mrr: 49, margin: 15, earning: 7.35, status: "active", addresses: 18, joined: "2024-06-10" },
  { id: "6", name: "GreenClean Atlanta", owner: "Nadia Ross", plan: "Professional", mrr: 149, margin: 15, earning: 22.35, status: "active", addresses: 55, joined: "2024-08-30" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#34C759]/10 text-[#34C759]",
  trial: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  churned: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

export default function ResellerCompaniesPage() {
  const [search, setSearch] = useState("");

  const filtered = COMPANIES.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.owner.toLowerCase().includes(search.toLowerCase())
  );

  const totalEarning = COMPANIES.filter((c) => c.status === "active").reduce((sum, c) => sum + c.earning, 0);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">My Companies</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">{COMPANIES.length} companies · ${totalEarning.toFixed(2)}/mo in margin earnings</p>
      </div>

      <input
        type="text"
        placeholder="Search companies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30 mb-6"
      />

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Company</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Plan</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">MRR</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">My Earning</th>
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
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">${c.mrr}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-bold text-[#AF52DE]">${c.earning.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{c.addresses}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[13px] text-[#C7C7CC]">No companies match your search.</div>
        )}
      </div>
    </>
  );
}
