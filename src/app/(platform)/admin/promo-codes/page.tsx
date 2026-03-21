"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminPromoCodes, createPromoCode, updatePromoCodeStatus } from "@/lib/actions/admin";
import { StatusBadge } from "@/components/platform/Badge";
import { Button } from "@/components/platform/Button";

type PromoCode = {
  id: string;
  code: string;
  level: string | null;
  discount_type: string | null;
  discount_value: number | null;
  max_uses: number | null;
  current_uses: number | null;
  expires_at: string | null;
  status: string;
  created_at: string;
};


export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState("percentage");
  const [formValue, setFormValue] = useState("");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formExpires, setFormExpires] = useState("");

  const loadCodes = useCallback(() => {
    getAdminPromoCodes().then((result) => {
      if (result.success && result.data) {
        setCodes(result.data);
      } else {
        setError(result.error ?? "Unknown error");
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const handleCreate = async () => {
    if (!formCode || !formValue) return;
    setCreating(true);
    const result = await createPromoCode({
      code: formCode,
      discount_type: formType,
      discount_value: Number(formValue),
      max_uses: Number(formMaxUses) || 0,
      expires_at: formExpires,
    });
    setCreating(false);
    if (result.success) {
      setShowCreate(false);
      setFormCode("");
      setFormValue("");
      setFormMaxUses("");
      setFormExpires("");
      loadCodes();
    }
  };

  const handleDisable = async (id: string) => {
    await updatePromoCodeStatus(id, "disabled");
    loadCodes();
  };

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
        Failed to load promo codes: {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Promo Codes</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Create and manage promotional discount codes</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowCreate(!showCreate)}>
          + Create Code
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-6">
          <h3 className="text-[14px] font-bold text-[#1C1C1E] mb-4">New Promo Code</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Code</label>
              <input
                type="text"
                placeholder="e.g. SAVE20"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] font-mono uppercase placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Value</label>
              <input
                type="number"
                placeholder={formType === "percentage" ? "25" : "50"}
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Max Uses</label>
              <input
                type="number"
                placeholder="500"
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Expires</label>
              <input
                type="date"
                value={formExpires}
                onChange={(e) => setFormExpires(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleCreate}
              disabled={creating || !formCode || !formValue}
              loading={creating}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      )}

      {codes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <p className="text-[14px] font-semibold text-[#8E8E93]">No promo codes yet</p>
          <p className="text-[12px] text-[#C7C7CC] mt-1">Create your first promotional code above.</p>
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
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Expires</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((promo) => {
                  const usagePct = promo.max_uses && promo.max_uses > 0
                    ? ((promo.current_uses ?? 0) / promo.max_uses) * 100
                    : 0;
                  return (
                    <tr key={promo.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                      <td className="px-5 py-3.5 text-[13px] font-mono font-bold text-[#1C1C1E]">{promo.code}</td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">
                        {promo.discount_type === "percentage" ? `${promo.discount_value}%` : `$${promo.discount_value}`}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-[12px] text-[#8E8E93]">{promo.current_uses ?? 0}/{promo.max_uses ?? "∞"}</div>
                        {promo.max_uses && promo.max_uses > 0 && (
                          <div className="w-16 h-1.5 bg-[#F2F2F7] rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-[#8E8E93] rounded-full" style={{ width: `${Math.min(usagePct, 100)}%` }} />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={promo.status} />
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">
                        {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {promo.status === "active" && (
                          <Button variant="danger" size="sm" onClick={() => handleDisable(promo.id)}>
                            Disable
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
