"use client";

import { useState } from "react";

const FEEDBACK = [
  { id: "1", user: "Maria Johnson", company: "Sparkle Clean Co.", type: "feature", subject: "Route optimization for crews", message: "It would be great to have automatic route optimization when assigning multiple jobs to a crew for the day.", rating: 4, status: "reviewed", date: "2024-10-04" },
  { id: "2", user: "James Lee", company: "Fresh Start LLC", type: "bug", subject: "Invoice PDF not downloading", message: "When I click download on an invoice, it shows a blank page instead of the PDF. Happens on Chrome and Safari.", rating: 2, status: "in_progress", date: "2024-10-03" },
  { id: "3", user: "Sarah Davis", company: "Elite Maids Inc.", type: "feature", subject: "Client self-booking portal", message: "Clients should be able to book recurring cleanings through a portal without calling us every time.", rating: 5, status: "new", date: "2024-10-03" },
  { id: "4", user: "Nadia Ross", company: "GreenClean Atlanta", type: "praise", subject: "Love the new scheduling view", message: "The calendar drag-and-drop scheduling is amazing! Our dispatchers save 30 minutes a day now.", rating: 5, status: "reviewed", date: "2024-10-02" },
  { id: "5", user: "Tom Wilson", company: "CleanPro Services", type: "bug", subject: "SMS notifications delayed", message: "Client notification texts are arriving 15-20 minutes after the crew checks in. Used to be instant.", rating: 3, status: "new", date: "2024-10-01" },
  { id: "6", user: "Amy Chen", company: "TidyUp Boston", type: "feature", subject: "Multi-language support", message: "Many of our crew members speak Spanish. Having the crew app in Spanish would be very helpful.", rating: 4, status: "backlog", date: "2024-09-28" },
] as const;

const TYPE_STYLES: Record<string, string> = {
  feature: "bg-[#007AFF]/10 text-[#007AFF]",
  bug: "bg-[#FF3B30]/10 text-[#FF3B30]",
  praise: "bg-[#34C759]/10 text-[#34C759]",
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  reviewed: "bg-[#007AFF]/10 text-[#007AFF]",
  in_progress: "bg-[#AF52DE]/10 text-[#AF52DE]",
  backlog: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

export default function AdminFeedbackPage() {
  const [filterType, setFilterType] = useState("all");

  const filtered = FEEDBACK.filter((f) => filterType === "all" || f.type === filterType);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Feedback</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">User feedback, bug reports, and feature requests</p>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "feature", "bug", "praise"].map((type) => (
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

      <div className="space-y-4">
        {filtered.map((fb) => (
          <div key={fb.id} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${TYPE_STYLES[fb.type]}`}>
                  {fb.type}
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[fb.status]}`}>
                  {fb.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? "text-[#FF9F0A]" : "text-[#E5E5EA]"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <h3 className="text-[14px] font-bold text-[#1C1C1E] mb-1">{fb.subject}</h3>
            <p className="text-[13px] text-[#8E8E93] leading-relaxed mb-3">{fb.message}</p>
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-[#C7C7CC]">{fb.user} · {fb.company} · {fb.date}</div>
              <button className="text-[11px] font-semibold text-[#007AFF] hover:underline">Reply</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
