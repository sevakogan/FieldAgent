"use client";

import { useState } from "react";

const INITIAL_SETTINGS = {
  platformName: "KleanHQ",
  supportEmail: "support@kleanhq.com",
  defaultTimezone: "America/Los_Angeles",
  maintenanceMode: false,
  signupsEnabled: true,
  waitlistEnabled: true,
  maxTrialDays: 14,
  defaultCurrency: "USD",
  smtpHost: "smtp.sendgrid.net",
  smtpPort: "587",
  stripeMode: "live",
  twilioEnabled: true,
  analyticsEnabled: true,
  referralReward: 50,
  maxPromoDiscount: 50,
} as const;

type SettingKey = keyof typeof INITIAL_SETTINGS;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [saved, setSaved] = useState(false);

  const updateSetting = (key: SettingKey, value: string | boolean | number) => {
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
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Platform Settings</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Global configuration for KleanHQ</p>
        </div>
        <button
          onClick={handleSave}
          className={`h-9 px-5 rounded-xl text-[13px] font-semibold transition-colors ${
            saved ? "bg-[#34C759] text-white" : "bg-[#8E8E93] text-white hover:bg-[#636366]"
          }`}
        >
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* General */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Platform Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => updateSetting("platformName", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSetting("supportEmail", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Default Timezone</label>
              <select
                value={settings.defaultTimezone}
                onChange={(e) => updateSetting("defaultTimezone", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              >
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/New_York">Eastern Time</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Default Currency</label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => updateSetting("defaultCurrency", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Access Control</h2>
          <div className="space-y-4">
            {[
              { key: "maintenanceMode" as SettingKey, label: "Maintenance Mode", desc: "Disable all user access except super admins" },
              { key: "signupsEnabled" as SettingKey, label: "Signups Enabled", desc: "Allow new company registrations" },
              { key: "waitlistEnabled" as SettingKey, label: "Waitlist Enabled", desc: "Queue new signups instead of instant access" },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-[13px] font-semibold text-[#1C1C1E]">{toggle.label}</div>
                  <div className="text-[11px] text-[#8E8E93]">{toggle.desc}</div>
                </div>
                <button
                  onClick={() => updateSetting(toggle.key, !settings[toggle.key])}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    settings[toggle.key] ? "bg-[#34C759]" : "bg-[#E5E5EA]"
                  }`}
                >
                  <div className={`w-5.5 h-5.5 bg-white rounded-full shadow-sm absolute top-[3px] transition-transform ${
                    settings[toggle.key] ? "translate-x-[22px]" : "translate-x-[3px]"
                  }`} />
                </button>
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Trial Period (days)</label>
              <input
                type="number"
                value={settings.maxTrialDays}
                onChange={(e) => updateSetting("maxTrialDays", Number(e.target.value))}
                className="w-32 h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              />
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Stripe Mode</label>
              <select
                value={settings.stripeMode}
                onChange={(e) => updateSetting("stripeMode", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              >
                <option value="live">Live</option>
                <option value="test">Test</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">SMTP Host</label>
              <input
                type="text"
                value={settings.smtpHost}
                onChange={(e) => updateSetting("smtpHost", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              />
            </div>
          </div>
          <div className="space-y-4 mt-4">
            {[
              { key: "twilioEnabled" as SettingKey, label: "Twilio SMS", desc: "SMS notifications for crews and clients" },
              { key: "analyticsEnabled" as SettingKey, label: "Analytics Tracking", desc: "Platform-wide usage analytics" },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-[13px] font-semibold text-[#1C1C1E]">{toggle.label}</div>
                  <div className="text-[11px] text-[#8E8E93]">{toggle.desc}</div>
                </div>
                <button
                  onClick={() => updateSetting(toggle.key, !settings[toggle.key])}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    settings[toggle.key] ? "bg-[#34C759]" : "bg-[#E5E5EA]"
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

        {/* Referrals & Promos */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Referrals & Promos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Referral Reward ($)</label>
              <input
                type="number"
                value={settings.referralReward}
                onChange={(e) => updateSetting("referralReward", Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1.5">Max Promo Discount (%)</label>
              <input
                type="number"
                value={settings.maxPromoDiscount}
                onChange={(e) => updateSetting("maxPromoDiscount", Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
