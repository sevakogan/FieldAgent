"use client";

import { useState } from "react";

const RESELLERS = [
  { id: "1", name: "CleanTech Resellers", contact: "Alex Morgan", email: "alex@cleantech.io", companies: 34, revenue: 12400, margin: 15, status: "active" },
  { id: "2", name: "ProClean Partners", contact: "Lisa Wang", email: "lisa@proclean.co", companies: 22, revenue: 8200, margin: 12, status: "active" },
  { id: "3", name: "ServiceHub Group", contact: "Dan Brown", email: "dan@servicehub.com", companies: 18, revenue: 5900, margin: 10, status: "active" },
  { id: "4", name: "CleanStack Inc.", contact: "Rachel Green", email: "rachel@cleanstack.io", companies: 8, revenue: 2100, margin: 15, status: "pending" },
  { id: "5", name: "MaidTech Solutions", contact: "Kevin Park", email: "kevin@maidtech.co", companies: 0, revenue: 0, margin: 12, status: "inactive" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#34C759]/10 text-[#34C759]",
  pending: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  inactive: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

export default function AdminResellersPage() {
  const [search, setSearch] = useState("");

  const filtered = RESELLERS.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.contact.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Resellers</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Manage reseller partnerships and commissions</p>
        </div>
        <button className="h-9 px-4 rounded-xl bg-[#8E8E93] text-white text-[13px] font-semibold hover:bg-[#636366] transition-colors">
          + Add Reseller
        </button>
      </div>

      <input
        type="text"
        placeholder="Search resellers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30 mb-6"
      />

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Reseller</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Companies</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Revenue</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-semibold text-[#1C1C1E]">{r.name}</div>
                    <div className="text-[11px] text-[#8E8E93]">{r.contact} · {r.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#1C1C1E]">{r.companies}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-[#1C1C1E]">${r.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{r.margin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
