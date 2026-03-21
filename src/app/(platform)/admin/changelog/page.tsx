"use client";

import { useState, useEffect, useCallback } from "react";
import { getChangelogEntries, createChangelogEntry, deleteChangelogEntry } from "@/lib/actions/admin";

type ChangelogEntry = {
  id: string;
  title: string;
  content: string | null;
  version: string | null;
  entry_type: string | null;
  created_at: string;
};

const TYPE_STYLES: Record<string, string> = {
  feature: "bg-[#34C759]/10 text-[#34C759]",
  improvement: "bg-[#007AFF]/10 text-[#007AFF]",
  fix: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
};

const EMPTY_FORM = { version: "", title: "", description: "", type: "feature" };

export default function AdminChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    getChangelogEntries().then((result) => {
      if (result.success && result.data) {
        setEntries(result.data);
      } else {
        setError(result.error ?? "Unknown error");
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!form.version.trim() || !form.title.trim()) return;
    setSaving(true);
    const result = await createChangelogEntry({
      version: form.version.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
    });
    if (result.success) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchData();
    } else {
      setError(result.error ?? "Failed to create entry");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteChangelogEntry(id);
    if (result.success) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
    setDeletingId(null);
  };

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#8E8E93] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Changelog</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Product updates visible to all users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0066DD] transition-colors"
        >
          {showForm ? "Cancel" : "+ New Entry"}
        </button>
      </div>

      {error && (
        <div className="bg-[#FF3B30]/10 text-[#FF3B30] rounded-2xl p-4 text-[13px] mb-6">{error}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-6">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">New Changelog Entry</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1 block">Version</label>
              <input
                type="text"
                placeholder="e.g. v1.2.0"
                value={form.version}
                onChange={(e) => updateForm("version", e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => updateForm("type", e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              >
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
                <option value="fix">Fix</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1 block">Title</label>
            <input
              type="text"
              placeholder="What changed?"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div className="mb-4">
            <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1 block">Description</label>
            <textarea
              placeholder="Describe the change..."
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 resize-none"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !form.version.trim() || !form.title.trim()}
            className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0066DD] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Entry"}
          </button>
        </div>
      )}

      {entries.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <div className="text-[#C7C7CC] mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-[#8E8E93]">No changelog entries</p>
          <p className="text-[12px] text-[#C7C7CC] mt-1">
            Click &quot;+ New Entry&quot; to add your first changelog entry.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-2">
                  {entry.version && (
                    <span className="text-[12px] font-mono font-bold text-[#1C1C1E] bg-[#F2F2F7] px-2 py-0.5 rounded">
                      {entry.version}
                    </span>
                  )}
                  {entry.entry_type && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${TYPE_STYLES[entry.entry_type] ?? "bg-[#F2F2F7] text-[#8E8E93]"}`}>
                      {entry.entry_type}
                    </span>
                  )}
                  <span className="text-[11px] text-[#8E8E93]">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  className="text-[#FF3B30] text-[12px] font-semibold hover:underline disabled:opacity-50"
                >
                  {deletingId === entry.id ? "Deleting..." : "Delete"}
                </button>
              </div>
              <h3 className="text-[14px] font-bold text-[#1C1C1E] mb-1">{entry.title}</h3>
              {entry.content && (
                <p className="text-[13px] text-[#8E8E93]">{entry.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
