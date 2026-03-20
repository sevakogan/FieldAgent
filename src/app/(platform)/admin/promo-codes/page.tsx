"use client";

import { useState } from "react";

const PROMO_CODES = [
  { id: "1", code: "SUMMER25", discount: "25%", type: "percentage", duration: "3 months", uses: 142, maxUses: 500, status: "active", created: "2024-08-01", expires: "2024-12-31" },
  { id: "2", code: "WELCOME50", discount: "$50", type: "fixed", duration: "First month", uses: 89, maxUses: 200, status: "active", created: "2024-07-15", expires: "2025-01-31" },
  { id: "3", code: "PARTNER15", discount: "15%", type: "percentage", duration: "6 months", uses: 34, maxUses: 100, status: "active", created: "2024-09-01", expires: "2025-03-01" },
  { id: "4", code: "LAUNCH100", discount: "$100", type: "fixed", duration: "First month", uses: 500, maxUses: 500, status: "exhausted", created: "2024-06-01", expires: "2024-09-30" },
  { id: "5", code: "BETA20", discount: "20%", type: "percentage", duration: "12 months", uses: 250, maxUses: 250, status: "expired", created: "2024-01-01", expires: "2024-06-30" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#34C759]/10 text-[#34C759]",
  exhausted: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  expired: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

export default function AdminPromoCodesPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Promo Codes</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Create and manage promotional discount codes</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="h-9 px-4 rounded-xl bg-[#8E8E93] text-white text-[13px] font-semibold hover:bg-[#636366] transition-colors"
        >
          + Create Code
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-6">
          <h3 className="text-[14px] font-bold text-[#1C1C1E] mb-4">New Promo Code</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Code</label>
              <input type="text" placeholder="e.g. SAVE20" className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] font-mono uppercase placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Discount</label>
              <input type="text" placeholder="25% or $50" className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Max Uses</label>
              <input type="number" placeholder="500" className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Expires</label>
              <input type="date" className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowCreate(false)} className="h-9 px-4 rounded-xl border border-[#E5E5EA] text-[13px] font-semibold text-[#8E8E93] hover:bg-[#F2F2F7] transition-colors">
              Cancel
            </button>
            <button className="h-9 px-4 rounded-xl bg-[#34C759] text-white text-[13px] font-semibold hover:bg-[#2DA44E] transition-colors">
              Create
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Code</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Discount</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Duration</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Usage</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Expires</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {PROMO_CODES.map((promo) => (
                <tr key={promo.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-mono font-bold text-[#1C1C1E]">{promo.code}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">{promo.discount}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{promo.duration}</td>
                  <td className="px-5 py-3.5">
                    <div className="text-[12px] text-[#8E8E93]">{promo.uses}/{promo.maxUses}</div>
                    <div className="w-16 h-1.5 bg-[#F2F2F7] rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#8E8E93] rounded-full" style={{ width: `${(promo.uses / promo.maxUses) * 100}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[promo.status]}`}>
                      {promo.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{promo.expires}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button className="text-[11px] font-semibold text-[#007AFF] hover:underline">Edit</button>
                      <button className="text-[11px] font-semibold text-[#FF3B30] hover:underline">Disable</button>
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
