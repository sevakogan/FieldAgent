"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAdminCompanies, updateCompanyStatus, createAdminCompany, updateCompany, canDeleteCompany, deleteCompany } from "@/lib/actions/admin";
import { StatusBadge } from "@/components/platform/Badge";
import { Button } from "@/components/platform/Button";

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


export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Create company form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newBusinessType, setNewBusinessType] = useState("cleaning");
  const [creating, setCreating] = useState(false);
  const [skipPayment, setSkipPayment] = useState(false);
  const router = useRouter();

  // Edit state
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editOwnerName, setEditOwnerName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [deleteStep, setDeleteStep] = useState<"check" | "confirm1" | "confirm2">("check");
  const [deleteReason, setDeleteReason] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreateCompany = async () => {
    if (!newName.trim() || !newOwnerEmail.trim() || !newOwnerName.trim()) return;
    setCreating(true);
    const result = await createAdminCompany({
      name: newName,
      ownerEmail: newOwnerEmail,
      ownerName: newOwnerName,
      businessType: newBusinessType,
    });
    if (result.success) {
      setToast({ message: "Company created successfully", type: "success" });
      setShowCreate(false);
      setNewName(""); setNewOwnerEmail(""); setNewOwnerName(""); setNewBusinessType("cleaning");
      await fetchCompanies();
    } else {
      setToast({ message: result.error ?? "Failed to create company", type: "error" });
    }
    setCreating(false);
  };

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

  const handleStartEdit = (c: Company) => {
    setEditingCompany(c);
    setEditName(c.name);
    setEditType(c.business_type ?? "cleaning");
    setEditOwnerName(c.owner_name ?? "");
  };

  const handleSaveEdit = async () => {
    if (!editingCompany) return;
    setSaving(true);
    const result = await updateCompany(editingCompany.id, {
      name: editName,
      business_type: editType,
      ownerName: editOwnerName,
    });
    if (result.success) {
      setToast({ message: "Company updated", type: "success" });
      setEditingCompany(null);
      await fetchCompanies();
    } else {
      setToast({ message: result.error ?? "Failed to update", type: "error" });
    }
    setSaving(false);
  };

  const handleStartDelete = async (c: Company) => {
    setDeleteTarget(c);
    setDeleteStep("check");
    setDeleteReason(null);

    // Check if they can be deleted
    const result = await canDeleteCompany(c.id);
    if (result.success && result.data) {
      if (result.data.canDelete) {
        setDeleteStep("confirm1");
      } else {
        setDeleteReason(result.data.reason ?? "Cannot delete");
        setDeleteStep("check"); // stays on check with reason shown
      }
    } else {
      setDeleteReason(result.error ?? "Failed to check");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteCompany(deleteTarget.id);
    if (result.success) {
      setToast({ message: `"${deleteTarget.name}" deleted permanently`, type: "success" });
      setDeleteTarget(null);
      await fetchCompanies();
    } else {
      setToast({ message: result.error ?? "Failed to delete", type: "error" });
    }
    setDeleting(false);
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

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Companies</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">Manage all companies on the platform</p>
        </div>
        <Button
          variant={showCreate ? 'danger' : 'primary'}
          size="sm"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? 'Cancel' : '+ Create Company'}
        </Button>
      </div>

      {/* Create Company Form */}
      {showCreate && (
        <div className="mb-6 p-5 bg-white rounded-2xl border border-[#E5E5EA] space-y-3">
          <h3 className="text-sm font-bold text-[#1C1C1E]">New Company</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Company Name *" value={newName} onChange={e => setNewName(e.target.value)} className="px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
            <select value={newBusinessType} onChange={e => setNewBusinessType(e.target.value)} className="px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30">
              <option value="cleaning">Cleaning</option>
              <option value="lawn_care">Lawn Care</option>
              <option value="pool_service">Pool Service</option>
              <option value="pressure_washing">Pressure Washing</option>
              <option value="pest_control">Pest Control</option>
              <option value="handyman">Handyman</option>
              <option value="other">Other</option>
            </select>
            <input type="text" placeholder="Owner Full Name *" value={newOwnerName} onChange={e => setNewOwnerName(e.target.value)} className="px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
            <input type="email" placeholder="Owner Email *" value={newOwnerEmail} onChange={e => setNewOwnerEmail(e.target.value)} className="px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={skipPayment}
              onChange={e => setSkipPayment(e.target.checked)}
              className="w-4 h-4 rounded border-[#E5E5EA] text-[#007AFF] focus:ring-[#007AFF]/30"
            />
            <span className="text-sm text-[#1C1C1E]">Skip payment setup</span>
            <span className="text-xs text-[#8E8E93]">(company can start immediately)</span>
          </label>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateCompany}
            disabled={creating || !newName.trim() || !newOwnerEmail.trim() || !newOwnerName.trim()}
            loading={creating}
          >
            {creating ? 'Creating...' : 'Create Company'}
          </Button>
        </div>
      )}

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
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleStartEdit(c)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant={c.status === "suspended" ? "success" : "danger"}
                        size="sm"
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        disabled={actionLoading === c.id}
                        loading={actionLoading === c.id}
                      >
                        {actionLoading === c.id ? "..." : c.status === "suspended" ? "Activate" : "Suspend"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStartDelete(c)}
                      >
                        Delete
                      </Button>
                    </div>
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

      {/* ── Edit Modal ── */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingCompany(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1C1C1E] mb-4">Edit Company</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#8E8E93] mb-1">Company Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8E8E93] mb-1">Business Type</label>
                <select value={editType} onChange={e => setEditType(e.target.value)} className="w-full px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30">
                  <option value="cleaning">Cleaning</option>
                  <option value="lawn_care">Lawn Care</option>
                  <option value="pool_service">Pool Service</option>
                  <option value="pressure_washing">Pressure Washing</option>
                  <option value="pest_control">Pest Control</option>
                  <option value="handyman">Handyman</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8E8E93] mb-1">Owner Name</label>
                <input type="text" value={editOwnerName} onChange={e => setEditOwnerName(e.target.value)} className="w-full px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="primary" size="sm" onClick={handleSaveEdit} disabled={saving || !editName.trim()} loading={saving} className="flex-1">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditingCompany(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal (double confirm) ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            {deleteStep === "check" && deleteReason ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#FF9F0A]/10 flex items-center justify-center text-lg">⚠️</div>
                  <h3 className="text-lg font-bold text-[#1C1C1E]">Cannot Delete</h3>
                </div>
                <p className="text-sm text-[#3C3C43] mb-5">{deleteReason}</p>
                <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)} className="w-full">
                  OK
                </Button>
              </>
            ) : deleteStep === "confirm1" ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#FF3B30]/10 flex items-center justify-center text-lg">🗑️</div>
                  <h3 className="text-lg font-bold text-[#1C1C1E]">Delete &quot;{deleteTarget.name}&quot;?</h3>
                </div>
                <p className="text-sm text-[#3C3C43] mb-5">
                  This will permanently remove the company, all its jobs, invoices, addresses, team members, and client links. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button variant="danger" size="sm" onClick={() => setDeleteStep("confirm2")} className="flex-1">
                    Yes, Delete
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </>
            ) : deleteStep === "confirm2" ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#FF3B30] flex items-center justify-center text-white text-lg">⚠️</div>
                  <h3 className="text-lg font-bold text-[#FF3B30]">Final Confirmation</h3>
                </div>
                <p className="text-sm text-[#3C3C43] mb-2">
                  You are about to <strong>permanently delete</strong> &quot;{deleteTarget.name}&quot; and all associated data.
                </p>
                <p className="text-xs text-[#FF3B30] font-semibold mb-5">
                  This is irreversible. Are you absolutely sure?
                </p>
                <div className="flex gap-3">
                  <Button variant="danger" size="sm" onClick={handleConfirmDelete} disabled={deleting} loading={deleting} className="flex-1">
                    {deleting ? "Deleting..." : "DELETE PERMANENTLY"}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#8E8E93] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
