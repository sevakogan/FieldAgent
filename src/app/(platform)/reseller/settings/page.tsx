"use client";

import { useState } from "react";

const INITIAL_SETTINGS = {
  companyName: "CleanTech Resellers",
  contactName: "Alex Morgan",
  email: "alex@cleantech.io",
  phone: "+1 (555) 234-5678",
  website: "https://cleantech.io",
  payoutMethod: "ach",
  bankName: "Chase Bank",
  accountLast4: "4242",
  logoUrl: "",
  brandColor: "#AF52DE",
  customDomain: "",
  notifyNewSignup: true,
  notifyPayout: true,
  notifyReferralConverted: true,
  weeklyDigest: true,
} as const;

type SettingKey = keyof typeof INITIAL_SETTINGS;

export default function ResellerSettingsPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [saved, setSaved] = useState(false);

  const updateSetting = (key: SettingKey, value: string | boolean) => {
    setSettings({ ...settings, [key]: value });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Settings</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Manage your reseller profile and branding</p>
        </div>
        <button
          onClick={handleSave}
          className={`h-9 px-5 rounded-xl text-[13px] font-semibold transition-colors ${
            saved ? "bg-[#34C759] text-white" : "bg-[#AF52DE] text-white hover:bg-[#9B3DC8]"
          }`}
        >
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => updateSetting("companyName", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Contact Name</label>
              <input
                type="text"
                value={settings.contactName}
                onChange={(e) => updateSetting("contactName", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => updateSetting("email", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => updateSetting("phone", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Website</label>
              <input
                type="url"
                value={settings.website}
                onChange={(e) => updateSetting("website", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.brandColor}
                  onChange={(e) => updateSetting("brandColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-[#E5E5EA] cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.brandColor}
                  onChange={(e) => updateSetting("brandColor", e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] font-mono text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Custom Domain</label>
              <input
                type="text"
                value={settings.customDomain}
                onChange={(e) => updateSetting("customDomain", e.target.value)}
                placeholder="partners.cleantech.io"
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Company Logo</label>
            <div className="w-full h-32 rounded-xl border-2 border-dashed border-[#E5E5EA] flex items-center justify-center cursor-pointer hover:border-[#AF52DE]/40 transition-colors">
              <div className="text-center">
                <div className="text-[#C7C7CC] mb-1">
                  <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[12px] text-[#8E8E93]">Click to upload logo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payout */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Payout Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Payout Method</label>
              <select
                value={settings.payoutMethod}
                onChange={(e) => updateSetting("payoutMethod", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              >
                <option value="ach">ACH Transfer</option>
                <option value="wire">Wire Transfer</option>
                <option value="check">Check</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Bank Account</label>
              <div className="h-10 px-3 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA] flex items-center justify-between">
                <span className="text-[13px] text-[#1C1C1E]">{settings.bankName} ****{settings.accountLast4}</span>
                <button className="text-[11px] font-semibold text-[#007AFF]">Update</button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Notifications</h2>
          <div className="space-y-4">
            {[
              { key: "notifyNewSignup" as SettingKey, label: "New Signup", desc: "Get notified when a referred company signs up" },
              { key: "notifyPayout" as SettingKey, label: "Payout Processed", desc: "Confirmation when your monthly payout is sent" },
              { key: "notifyReferralConverted" as SettingKey, label: "Referral Converted", desc: "When a referred lead converts to a paying customer" },
              { key: "weeklyDigest" as SettingKey, label: "Weekly Digest", desc: "Summary of your portfolio performance every Monday" },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-[13px] font-semibold text-[#1C1C1E]">{toggle.label}</div>
                  <div className="text-[11px] text-[#8E8E93]">{toggle.desc}</div>
                </div>
                <button
                  onClick={() => updateSetting(toggle.key, !settings[toggle.key])}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    settings[toggle.key] ? "bg-[#AF52DE]" : "bg-[#E5E5EA]"
                  }`}
                >
                  <div className={`w-5.5 h-5.5 bg-white rounded-full shadow-sm absolute top-[3px] transition-transform ${
                    settings[toggle.key] ? "translate-x-[22px]" : "translate-x-[3px]"
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
