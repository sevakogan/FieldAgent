"use client";

import { useState } from "react";

const WAITLIST_ENTRIES = [
  { id: "1", name: "John Miller", email: "john@cleanspace.io", company: "CleanSpace Pro", type: "company", position: 1, date: "2024-10-01", status: "waiting" },
  { id: "2", name: "Emma Stone", email: "emma@tidyhomes.co", company: "Tidy Homes LLC", type: "company", position: 2, date: "2024-10-02", status: "waiting" },
  { id: "3", name: "Carlos Mendez", email: "carlos@sparkleup.com", company: "SparkleUp Services", type: "company", position: 3, date: "2024-10-02", status: "waiting" },
  { id: "4", name: "Aisha Khan", email: "aisha@cleanventures.io", company: "Clean Ventures", type: "reseller", position: 4, date: "2024-10-03", status: "waiting" },
  { id: "5", name: "Mike Brown", email: "mike@proshine.com", company: "ProShine Atlanta", type: "company", position: 5, date: "2024-10-03", status: "invited" },
  { id: "6", name: "Lisa Park", email: "lisa@neatfreaks.co", company: "Neat Freaks Inc.", type: "company", position: 6, date: "2024-10-04", status: "invited" },
  { id: "7", name: "David Chen", email: "david@cleanfirst.io", company: "CleanFirst Group", type: "reseller", position: 7, date: "2024-10-04", status: "approved" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  waiting: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  invited: "bg-[#007AFF]/10 text-[#007AFF]",
  approved: "bg-[#34C759]/10 text-[#34C759]",
};

export default function AdminWaitlistPage() {
  const [filterType, setFilterType] = useState("all");

  const filtered = WAITLIST_ENTRIES.filter((e) => filterType === "all" || e.type === filterType);
  const waitingCount = WAITLIST_ENTRIES.filter((e) => e.status === "waiting").length;

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Waitlist</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">{waitingCount} pending approvals · {WAITLIST_ENTRIES.length} total entries</p>
        </div>
        <button className="h-9 px-4 rounded-xl bg-[#34C759] text-white text-[13px] font-semibold hover:bg-[#2DA44E] transition-colors">
          Approve Selected
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "company", "reseller"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-colors ${
              filterType === type
                ? "bg-[#8E8E93] text-white"
                : "bg-white text-[#8E8E93] border border-[#E5E5EA] hover:bg-[#F2F2F7]"
            }`}
          >
            {type === "all" ? "All Types" : type}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3 w-8">
                  <input type="checkbox" className="rounded border-[#D1D1D6]" />
                </th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">#</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Applicant</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Applied</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-5 py-3.5">
                    <input type="checkbox" className="rounded border-[#D1D1D6]" />
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#8E8E93] font-mono">{entry.position}</td>
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-semibold text-[#1C1C1E]">{entry.name}</div>
                    <div className="text-[11px] text-[#8E8E93]">{entry.company} · {entry.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize bg-[#F2F2F7] text-[#8E8E93]">
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[entry.status]}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{entry.date}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button className="text-[11px] font-semibold text-[#34C759] hover:underline">Approve</button>
                      <button className="text-[11px] font-semibold text-[#FF3B30] hover:underline">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
