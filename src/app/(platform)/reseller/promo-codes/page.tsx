"use client";

import { useState, useEffect } from "react";
import { fetchPromoCodes, createPromoCode } from "@/lib/actions/reseller";
import { StatusBadge } from "@/components/platform/Badge";
import { Button } from "@/components/platform/Button";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  status: string;
  created_at: string;
}


function formatDiscount(type: string, value: number): string {
  if (type === "percentage") return `${value}%`;
  return `$${value}`;
}

export default function ResellerPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [noReseller, setNoReseller] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");

  useEffect(() => {
    fetchPromoCodes().then((result) => {
      if (result === null) {
        setNoReseller(true);
      } else {
        setCodes(result);
      }
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!newCode.trim() || !discountValue.trim()) return;
    setCreating(true);

    const result = await createPromoCode({
      code: newCode.trim(),
      discountType,
      discountValue: Number(discountValue),
      maxUses: Number(maxUses) || 0,
    });

    if (result.success) {
      // Refresh list
      const refreshed = await fetchPromoCodes();
      if (refreshed) setCodes(refreshed);
      setShowCreate(false);
      setNewCode("");
      setDiscountValue("");
      setMaxUses("");
    }

    setCreating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#AF52DE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (noReseller) {
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

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Promo Codes</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Create discount codes to share with prospects</p>
        </div>
        <Button variant="purple" size="sm" onClick={() => setShowCreate(!showCreate)}>
          + Create Code
        </Button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-6">
          <h3 className="text-[14px] font-bold text-[#1C1C1E] mb-4">New Promo Code</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Code</label>
              <input
                type="text"
                placeholder="e.g. CTECH25"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] font-mono uppercase placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Discount Value</label>
              <input
                type="number"
                placeholder={discountType === "percentage" ? "20" : "50"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Max Uses</label>
              <input
                type="number"
                placeholder="50 (0 = unlimited)"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleCreate} disabled={creating || !newCode.trim() || !discountValue.trim()} loading={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      )}

      {codes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#AF52DE]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#AF52DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="text-[15px] font-bold text-[#1C1C1E] mb-1">No promo codes yet</h3>
          <p className="text-[13px] text-[#8E8E93]">Create your first promo code to share with prospects.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Code</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Discount</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Usage</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((promo) => (
                  <tr key={promo.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-mono font-bold text-[#1C1C1E]">{promo.code}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">
                      {formatDiscount(promo.discount_type, promo.discount_value)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-[12px] text-[#8E8E93]">
                        {promo.current_uses}/{promo.max_uses ?? "\u221E"}
                      </div>
                      {promo.max_uses && (
                        <div className="w-16 h-1.5 bg-[#F2F2F7] rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-[#AF52DE] rounded-full"
                            style={{ width: `${Math.min((promo.current_uses / promo.max_uses) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={promo.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">
                      {new Date(promo.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
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
