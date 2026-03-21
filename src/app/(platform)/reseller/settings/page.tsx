"use client";

import { useState, useEffect } from "react";
import { fetchResellerSettings, updateResellerSettings } from "@/lib/actions/reseller";
import { StatusBadge } from "@/components/platform/Badge";

interface ResellerSettings {
  id: string;
  brand_name: string;
  brand_color: string;
  custom_domain: string;
  margin_percentage: number;
  slug: string;
  logo_url: string;
  whitelabel_badge: boolean;
  status: string;
}

export default function ResellerSettingsPage() {
  const [reseller, setReseller] = useState<ResellerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Editable form fields
  const [brandName, setBrandName] = useState("");
  const [brandColor, setBrandColor] = useState("#AF52DE");
  const [customDomain, setCustomDomain] = useState("");
  const [marginPercentage, setMarginPercentage] = useState("");

  useEffect(() => {
    fetchResellerSettings().then((data) => {
      if (data) {
        setReseller(data);
        setBrandName(data.brand_name ?? "");
        setBrandColor(data.brand_color ?? "#AF52DE");
        setCustomDomain(data.custom_domain ?? "");
        setMarginPercentage(String(data.margin_percentage ?? 0));
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!reseller) return;
    setSaving(true);
    setError("");
    setSaved(false);

    const result = await updateResellerSettings(reseller.id, {
      brand_name: brandName,
      brand_color: brandColor,
      custom_domain: customDomain,
      margin_percentage: Number(marginPercentage) || 0,
    });

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(result.error ?? "Failed to save settings");
    }

    setSaving(false);
  };

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

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Settings</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Manage your reseller profile and branding</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`h-9 px-5 rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-50 ${
            saved ? "bg-[#34C759] text-white" : "bg-[#AF52DE] text-white hover:bg-[#9B3DC8]"
          }`}
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20">
          <p className="text-[13px] text-[#FF3B30] font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Branding */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-[#E5E5EA] cursor-pointer"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] font-mono text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Custom Domain</label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="partners.yourdomain.com"
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Margin Percentage</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={marginPercentage}
                  onChange={(e) => setMarginPercentage(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
                />
                <span className="text-[14px] font-semibold text-[#8E8E93]">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info (read-only) */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Account Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Slug</label>
              <div className="h-10 px-3 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA] flex items-center">
                <span className="text-[13px] text-[#8E8E93]">{reseller.slug}</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Status</label>
              <div className="h-10 px-3 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA] flex items-center">
                <StatusBadge status={reseller.status} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Whitelabel Badge</label>
              <div className="h-10 px-3 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA] flex items-center">
                <span className="text-[13px] text-[#8E8E93]">{reseller.whitelabel_badge ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Logo URL</label>
              <div className="h-10 px-3 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA] flex items-center">
                <span className="text-[13px] text-[#8E8E93] truncate">{reseller.logo_url || "No logo set"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
