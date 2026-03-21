"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminHelpArticles, createHelpArticle, deleteHelpArticle } from "@/lib/actions/admin";

type HelpArticle = {
  id: string;
  title: string;
  category: string | null;
  content: string | null;
  views: number | null;
  helpful_count: number | null;
  status: string;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  published: "bg-[#34C759]/10 text-[#34C759]",
  draft: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
};

export default function AdminHelpPage() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchArticles = useCallback(async () => {
    const result = await getAdminHelpArticles();
    if (result.success && result.data) {
      setArticles(result.data);
    } else {
      setError(result.error ?? "Unknown error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    const result = await deleteHelpArticle(id);
    if (result.success) {
      setToast({ message: "Article deleted", type: "success" });
      await fetchArticles();
    } else {
      setToast({ message: result.error ?? "Failed to delete article", type: "error" });
    }
    setActionLoading(null);
  };

  const categories = ["all", ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean) as string[]))];

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || a.category === filterCategory;
    return matchSearch && matchCategory;
  });

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
        Failed to load help articles: {error}
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-[13px] font-semibold shadow-lg transition-all ${
          toast.type === "success" ? "bg-[#34C759] text-white" : "bg-[#FF3B30] text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Help Articles</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Manage knowledge base articles for users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-10 px-5 rounded-xl bg-[#007AFF] text-white text-[13px] font-semibold hover:bg-[#0066DD] transition-colors"
        >
          New Article
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
        {categories.length > 1 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[13px] text-[#C7C7CC]">
            {articles.length === 0 ? "No help articles yet." : "No articles match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Article</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Category</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Views</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Helpful</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Created</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((article) => (
                  <tr key={article.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">{article.title}</td>
                    <td className="px-5 py-3.5">
                      {article.category ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2F2F7] text-[#8E8E93]">
                          {article.category}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[article.status] ?? "bg-[#F2F2F7] text-[#8E8E93]"}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{(article.views ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{(article.helpful_count ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{new Date(article.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(article.id)}
                        disabled={actionLoading === article.id}
                        className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === article.id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <NewArticleModal
          onClose={() => setShowModal(false)}
          onCreated={async () => {
            setShowModal(false);
            setToast({ message: "Article created successfully", type: "success" });
            await fetchArticles();
          }}
        />
      )}
    </>
  );
}

function NewArticleModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !category.trim() || !content.trim()) {
      setFormError("All fields are required.");
      return;
    }

    setSubmitting(true);
    const result = await createHelpArticle({
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
    });

    if (result.success) {
      onCreated();
    } else {
      setFormError(result.error ?? "Failed to create article");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F2F2F7]">
          <h2 className="text-[18px] font-bold text-[#1C1C1E]">New Article</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="bg-[#FF3B30]/10 text-[#FF3B30] rounded-xl p-3 text-[13px]">{formError}</div>
          )}
          <div>
            <label className="block text-[12px] font-semibold text-[#8E8E93] mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              placeholder="How to get started..."
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#8E8E93] mb-1.5">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              placeholder="Getting Started"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#8E8E93] mb-1.5">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 resize-none"
              placeholder="Write your article content here..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-[#E5E5EA] text-[13px] font-semibold text-[#8E8E93] hover:bg-[#F2F2F7] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-[#007AFF] text-white text-[13px] font-semibold hover:bg-[#0066DD] transition-colors disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
