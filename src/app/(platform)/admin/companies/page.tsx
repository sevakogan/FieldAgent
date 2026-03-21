"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminCompanies, updateCompanyStatus } from "@/lib/actions/admin";

type Company = {
  id: string;
  name: string;
  business_type: string | null;
  status: string;
  created_at: string;
  owner_id: string | null;
  owner_name: string | null;
  owner_email: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#34C759]/10 text-[#34C759]",
  trial: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  suspended: "bg-[#FF3B30]/10 text-[#FF3B30]",
  churned: "bg-[#8E8E93]/10 text-[#8E8E93]",
  pending: "bg-[#007AFF]/10 text-[#007AFF]",
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchCompanies = useCallback(async () => {
    const result = await getAdminCompanies();
    if (result.success && result.data) {
      setCompanies(result.data);
    } else {
      setError(result.error ?? "Unknown error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleToggleStatus = async (companyId: string, currentStatus: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    setActionLoading(companyId);
    const result = await updateCompanyStatus(companyId, newStatus);
    if (result.success) {
      setToast({ message: `Company ${newStatus === "active" ? "activated" : "suspended"}`, type: "success" });
      await fetchCompanies();
    } else {
      setToast({ message: result.error ?? "Failed to update status", type: "error" });
    }
    setActionLoading(null);
  };

  const filtered = companies.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.owner_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
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
        Failed to load companies: {error}
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
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Companies</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Manage all companies on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search companies or owners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="churned">Churned</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Company</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Created</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-semibold text-[#1C1C1E]">{c.name}</div>
                    <div className="text-[11px] text-[#8E8E93]">{c.owner_name ?? "No owner"}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#1C1C1E] capitalize">{c.business_type ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[c.status] ?? "bg-[#F2F2F7] text-[#8E8E93]"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleToggleStatus(c.id, c.status)}
                      disabled={actionLoading === c.id}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50 ${
                        c.status === "suspended"
                          ? "bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20"
                          : "bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20"
                      }`}
                    >
                      {actionLoading === c.id ? "..." : c.status === "suspended" ? "Activate" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[13px] text-[#C7C7CC]">
            {companies.length === 0 ? "No companies yet." : "No companies match your filters."}
          </div>
        )}
      </div>
    </>
  );
}
