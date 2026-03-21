"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminFeedback, updateFeedbackStatus } from "@/lib/actions/admin";

type FeedbackItem = {
  id: string;
  type: string | null;
  title: string | null;
  description: string | null;
  status: string;
  votes: number | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
};

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
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchFeedback = useCallback(async () => {
    const result = await getAdminFeedback();
    if (result.success && result.data) {
      setFeedback(result.data);
    } else {
      setError(result.error ?? "Unknown error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleMarkReviewed = async (id: string) => {
    setActionLoading(id);
    const result = await updateFeedbackStatus(id, "reviewed");
    if (result.success) {
      setToast({ message: "Feedback marked as reviewed", type: "success" });
      await fetchFeedback();
    } else {
      setToast({ message: result.error ?? "Failed to update feedback", type: "error" });
    }
    setActionLoading(null);
  };

  const filtered = feedback.filter((f) => filterType === "all" || f.type === filterType);

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
        Failed to load feedback: {error}
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

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <p className="text-[14px] font-semibold text-[#8E8E93]">
            {feedback.length === 0 ? "No feedback yet" : "No feedback matches this filter"}
          </p>
          <p className="text-[12px] text-[#C7C7CC] mt-1">User feedback will appear here once submitted.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((fb) => (
            <div key={fb.id} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {fb.type && (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${TYPE_STYLES[fb.type] ?? "bg-[#F2F2F7] text-[#8E8E93]"}`}>
                      {fb.type}
                    </span>
                  )}
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[fb.status] ?? "bg-[#F2F2F7] text-[#8E8E93]"}`}>
                    {fb.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {fb.votes !== null && fb.votes > 0 && (
                    <div className="text-[12px] font-semibold text-[#8E8E93]">
                      {fb.votes} vote{fb.votes !== 1 ? "s" : ""}
                    </div>
                  )}
                  {fb.status === "new" && (
                    <button
                      onClick={() => handleMarkReviewed(fb.id)}
                      disabled={actionLoading === fb.id}
                      className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === fb.id ? "..." : "Mark Reviewed"}
                    </button>
                  )}
                </div>
              </div>
              <h3 className="text-[14px] font-bold text-[#1C1C1E] mb-1">{fb.title ?? "Untitled"}</h3>
              <p className="text-[13px] text-[#8E8E93] leading-relaxed mb-3">{fb.description ?? ""}</p>
              <div className="text-[11px] text-[#C7C7CC]">
                {fb.user_name ?? fb.user_email ?? "Anonymous"} · {new Date(fb.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
