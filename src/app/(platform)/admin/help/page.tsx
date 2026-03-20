"use client";

import { useState } from "react";

const HELP_ARTICLES = [
  { id: "1", title: "Getting Started with KleanHQ", category: "Onboarding", status: "published", views: 4200, helpful: 89, updated: "2024-09-15" },
  { id: "2", title: "Setting Up Your First Crew", category: "Crews", status: "published", views: 3100, helpful: 92, updated: "2024-09-20" },
  { id: "3", title: "Managing Client Addresses", category: "Clients", status: "published", views: 2800, helpful: 85, updated: "2024-08-30" },
  { id: "4", title: "Creating and Sending Invoices", category: "Billing", status: "published", views: 2400, helpful: 78, updated: "2024-09-10" },
  { id: "5", title: "Configuring SMS Notifications", category: "Settings", status: "published", views: 1900, helpful: 82, updated: "2024-09-25" },
  { id: "6", title: "Understanding the Revenue Dashboard", category: "Analytics", status: "draft", views: 0, helpful: 0, updated: "2024-10-02" },
  { id: "7", title: "Referral Program Guide", category: "Growth", status: "published", views: 1200, helpful: 91, updated: "2024-09-05" },
  { id: "8", title: "API Integration Guide", category: "Developer", status: "draft", views: 0, helpful: 0, updated: "2024-10-04" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  published: "bg-[#34C759]/10 text-[#34C759]",
  draft: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
};

export default function AdminHelpPage() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(HELP_ARTICLES.map((a) => a.category)))];

  const filtered = HELP_ARTICLES.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || a.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Help Articles</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Manage knowledge base articles for users</p>
        </div>
        <button className="h-9 px-4 rounded-xl bg-[#8E8E93] text-white text-[13px] font-semibold hover:bg-[#636366] transition-colors">
          + New Article
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Article</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Category</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Views</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Helpful %</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Updated</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((article) => (
                <tr key={article.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">{article.title}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2F2F7] text-[#8E8E93]">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[article.status]}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{article.views.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{article.helpful > 0 ? `${article.helpful}%` : "—"}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{article.updated}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button className="text-[11px] font-semibold text-[#007AFF] hover:underline">Edit</button>
                      <button className="text-[11px] font-semibold text-[#FF3B30] hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[13px] text-[#C7C7CC]">No articles match your search.</div>
        )}
      </div>
    </>
  );
}
