"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminSettings, updateAdminSetting } from "@/lib/actions/admin";

type Setting = {
  key: string;
  value: string | null;
  description: string | null;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState<Map<string, string>>(new Map());

  const loadSettings = useCallback(() => {
    getAdminSettings().then((result) => {
      if (result.success && result.data) {
        setSettings(result.data);
      } else {
        setError(result.error ?? "Unknown error");
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (key: string, value: string) => {
    setDirty(new Map(dirty).set(key, value));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const entries = Array.from(dirty.entries());
    for (const [key, value] of entries) {
      await updateAdminSetting(key, value);
    }
    setDirty(new Map());
    setSaving(false);
    setSaved(true);
    loadSettings();
    setTimeout(() => setSaved(false), 2000);
  };

  const getValue = (key: string): string => {
    if (dirty.has(key)) return dirty.get(key)!;
    const s = settings.find((s) => s.key === key);
    return s?.value ?? "";
  };

  const isBooleanKey = (value: string | null): boolean => {
    return value === "true" || value === "false";
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
        Failed to load settings: {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Platform Settings</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Global configuration for KleanHQ</p>
        </div>
        <button
          onClick={handleSave}
          disabled={dirty.size === 0 && !saving}
          className={`h-9 px-5 rounded-xl text-[13px] font-semibold transition-colors ${
            saved
              ? "bg-[#34C759] text-white"
              : dirty.size > 0
                ? "bg-[#8E8E93] text-white hover:bg-[#636366]"
                : "bg-[#E5E5EA] text-[#C7C7CC] cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {settings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <p className="text-[14px] font-semibold text-[#8E8E93]">No platform settings configured</p>
          <p className="text-[12px] text-[#C7C7CC] mt-1">Add rows to the platform_settings table to manage configuration here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
          <div className="space-y-5">
            {settings.map((setting) => {
              const isBoolean = isBooleanKey(setting.value);
              const currentVal = getValue(setting.key);

              return (
                <div key={setting.key} className="flex items-start justify-between gap-4 py-2 border-b border-[#F2F2F7] last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#1C1C1E] font-mono">{setting.key}</div>
                    {setting.description && (
                      <div className="text-[11px] text-[#8E8E93] mt-0.5">{setting.description}</div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {isBoolean ? (
                      <button
                        onClick={() => handleChange(setting.key, currentVal === "true" ? "false" : "true")}
                        className={`w-12 h-7 rounded-full transition-colors relative ${
                          currentVal === "true" ? "bg-[#34C759]" : "bg-[#E5E5EA]"
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-[4px] transition-transform ${
                          currentVal === "true" ? "translate-x-[24px]" : "translate-x-[4px]"
                        }`} />
                      </button>
                    ) : (
                      <input
                        type="text"
                        value={currentVal}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        className="w-64 h-9 px-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#1C1C1E] font-mono focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
