"use client";

import { useState } from "react";

const CHANGELOG_ENTRIES = [
  {
    id: "1",
    version: "1.4.0",
    title: "Crew Scheduling Overhaul",
    description: "Drag-and-drop calendar for crew assignments, automatic conflict detection, and optimized route suggestions.",
    type: "feature",
    date: "2024-10-01",
    published: true,
  },
  {
    id: "2",
    version: "1.3.2",
    title: "Invoice PDF Fix",
    description: "Fixed an issue where invoice PDFs would render blank on certain browsers. Improved PDF generation performance by 40%.",
    type: "fix",
    date: "2024-09-25",
    published: true,
  },
  {
    id: "3",
    version: "1.3.1",
    title: "SMS Delivery Improvements",
    description: "Reduced SMS notification latency from 15+ minutes to under 30 seconds. Added delivery status tracking.",
    type: "improvement",
    date: "2024-09-18",
    published: true,
  },
  {
    id: "4",
    version: "1.3.0",
    title: "Client Self-Booking Portal",
    description: "Clients can now book, reschedule, and manage recurring cleanings through a branded portal without calling.",
    type: "feature",
    date: "2024-09-10",
    published: true,
  },
  {
    id: "5",
    version: "1.4.1",
    title: "Multi-language Crew App",
    description: "The crew mobile app now supports Spanish, Portuguese, and French. Language auto-detected from device settings.",
    type: "feature",
    date: "2024-10-08",
    published: false,
  },
] as const;

const TYPE_STYLES: Record<string, string> = {
  feature: "bg-[#007AFF]/10 text-[#007AFF]",
  fix: "bg-[#FF3B30]/10 text-[#FF3B30]",
  improvement: "bg-[#34C759]/10 text-[#34C759]",
};

export default function AdminChangelogPage() {
  const [showDrafts, setShowDrafts] = useState(true);

  const entries = showDrafts ? CHANGELOG_ENTRIES : CHANGELOG_ENTRIES.filter((e) => e.published);

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Changelog</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Product updates visible to all users</p>
        </div>
        <button className="h-9 px-4 rounded-xl bg-[#8E8E93] text-white text-[13px] font-semibold hover:bg-[#636366] transition-colors">
          + New Entry
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <label className="flex items-center gap-2 text-[13px] text-[#8E8E93] cursor-pointer">
          <input
            type="checkbox"
            checked={showDrafts}
            onChange={(e) => setShowDrafts(e.target.checked)}
            className="rounded border-[#D1D1D6]"
          />
          Show drafts
        </label>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className={`bg-white rounded-2xl border p-5 ${entry.published ? "border-[#E5E5EA]" : "border-dashed border-[#D1D1D6]"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono font-bold text-[#8E8E93] bg-[#F2F2F7] px-2 py-0.5 rounded-lg">v{entry.version}</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${TYPE_STYLES[entry.type]}`}>
                  {entry.type}
                </span>
                {!entry.published && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF9F0A]/10 text-[#FF9F0A]">
                    Draft
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button className="text-[11px] font-semibold text-[#007AFF] hover:underline">Edit</button>
                {!entry.published && (
                  <button className="text-[11px] font-semibold text-[#34C759] hover:underline">Publish</button>
                )}
              </div>
            </div>
            <h3 className="text-[15px] font-bold text-[#1C1C1E] mb-1">{entry.title}</h3>
            <p className="text-[13px] text-[#8E8E93] leading-relaxed">{entry.description}</p>
            <div className="text-[11px] text-[#C7C7CC] mt-3">{entry.date}</div>
          </div>
        ))}
      </div>
    </>
  );
}
