"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminResellers, createAdminReseller, updateResellerStatus } from "@/lib/actions/admin";

type Reseller = {
  id: string;
  brand_name: string | null;
  slug: string | null;
  margin_percentage: number | null;
  status: string;
  properties_count: number | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#34C759]/10 text-[#34C759]",
  pending: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  inactive: "bg-[#8E8E93]/10 text-[#8E8E93]",
  suspended: "bg-[#FF3B30]/10 text-[#FF3B30]",
};

export default function AdminResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchResellers = useCallback(async () => {
    const result = await getAdminResellers();
    if (result.success && result.data) {
      setResellers(result.data);
    } else {
      setError(result.error ?? "Unknown error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResellers();
  }, [fetchResellers]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    setActionLoading(id);
    const result = await updateResellerStatus(id, newStatus);
    if (result.success) {
      setToast({ message: `Reseller ${newStatus === "active" ? "activated" : "suspended"}`, type: "success" });
      await fetchResellers();
    } else {
      setToast({ message: result.error ?? "Failed to update status", type: "error" });
    }
    setActionLoading(null);
  };

  const filtered = resellers.filter(
    (r) =>
      (r.brand_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.user_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

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
        Failed to load resellers: {error}
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
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Resellers</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Manage reseller partnerships and commissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-10 px-5 rounded-xl bg-[#007AFF] text-white text-[13px] font-semibold hover:bg-[#0066DD] transition-colors"
        >
          Add Reseller
        </button>
      </div>

      <input
        type="text"
        placeholder="Search resellers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30 mb-6"
      />

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Reseller</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Properties</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Margin %</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Created</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-semibold text-[#1C1C1E]">{r.brand_name ?? "Unnamed"}</div>
                    <div className="text-[11px] text-[#8E8E93]">{r.user_name ?? "—"} · {r.user_email ?? "—"}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[r.status] ?? "bg-[#F2F2F7] text-[#8E8E93]"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#1C1C1E]">{r.properties_count ?? 0}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-[#8E8E93]">{r.margin_percentage ?? 0}%</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleToggleStatus(r.id, r.status)}
                      disabled={actionLoading === r.id}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50 ${
                        r.status === "active"
                          ? "bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20"
                          : "bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20"
                      }`}
                    >
                      {actionLoading === r.id ? "..." : r.status === "active" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[13px] text-[#C7C7CC]">
            {resellers.length === 0 ? "No resellers yet." : "No resellers match your search."}
          </div>
        )}
      </div>

      {showModal && (
        <AddResellerModal
          onClose={() => setShowModal(false)}
          onCreated={async () => {
            setShowModal(false);
            setToast({ message: "Reseller created successfully", type: "success" });
            await fetchResellers();
          }}
        />
      )}
    </>
  );
}

function AddResellerModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [brandName, setBrandName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [marginPct, setMarginPct] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!brandName.trim() || !userEmail.trim() || !slug.trim()) {
      setFormError("Brand name, email, and slug are required.");
      return;
    }

    const margin = parseFloat(marginPct);
    if (isNaN(margin) || margin < 0 || margin > 100) {
      setFormError("Margin must be a number between 0 and 100.");
      return;
    }

    setSubmitting(true);
    const result = await createAdminReseller({
      brand_name: brandName.trim(),
      user_email: userEmail.trim(),
      margin_percentage: margin,
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
    });

    if (result.success) {
      onCreated();
    } else {
      setFormError(result.error ?? "Failed to create reseller");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F2F2F7]">
          <h2 className="text-[18px] font-bold text-[#1C1C1E]">Add Reseller</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="bg-[#FF3B30]/10 text-[#FF3B30] rounded-xl p-3 text-[13px]">{formError}</div>
          )}
          <div>
            <label className="block text-[12px] font-semibold text-[#8E8E93] mb-1.5">Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              placeholder="Acme Cleaning Co."
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#8E8E93] mb-1.5">User Email</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              placeholder="reseller@example.com"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#8E8E93] mb-1.5">Margin %</label>
            <input
              type="number"
              value={marginPct}
              onChange={(e) => setMarginPct(e.target.value)}
              className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              placeholder="15"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#8E8E93] mb-1.5">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              placeholder="acme-cleaning"
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
              {submitting ? "Creating..." : "Create Reseller"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
