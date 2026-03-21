"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminClients, createAdminClient_record, getAdminCompanies } from "@/lib/actions/admin";

type Client = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string;
  company_id: string;
  created_at: string;
};

type Company = {
  id: string;
  name: string;
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCompanyId, setNewCompanyId] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    const [clientResult, companyResult] = await Promise.all([
      getAdminClients(),
      getAdminCompanies(),
    ]);
    if (clientResult.success && clientResult.data) setClients(clientResult.data);
    else setError(clientResult.error ?? "Failed to load");
    if (companyResult.success && companyResult.data) {
      setCompanies(companyResult.data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      if (companyResult.data.length > 0 && !newCompanyId) {
        setNewCompanyId(companyResult.data[0].id);
      }
    }
    setLoading(false);
  }, [newCompanyId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const handleCreate = async () => {
    if (!newName.trim() || !newEmail.trim() || !newCompanyId) return;
    setCreating(true);
    const result = await createAdminClient_record({
      fullName: newName,
      email: newEmail,
      phone: newPhone || undefined,
      companyId: newCompanyId,
    });
    if (result.success) {
      setToast({ message: "Client created", type: "success" });
      setShowCreate(false);
      setNewName(""); setNewEmail(""); setNewPhone("");
      await fetchData();
    } else {
      setToast({ message: result.error ?? "Failed", type: "error" });
    }
    setCreating(false);
  };

  const filtered = clients.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.company_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type === "success" ? "bg-[#34C759] text-white" : "bg-[#FF3B30] text-white"}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Clients</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">All clients across all companies</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showCreate ? "bg-[#FF3B30] text-white" : "bg-[#007AFF] text-white hover:bg-[#0066DD]"}`}
        >
          {showCreate ? "Cancel" : "+ Invite Client"}
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 p-5 bg-white rounded-2xl border border-[#E5E5EA] space-y-3">
          <h3 className="text-sm font-bold text-[#1C1C1E]">Invite New Client</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Full Name *" value={newName} onChange={e => setNewName(e.target.value)} className="px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
            <input type="email" placeholder="Email *" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
            <input type="tel" placeholder="Phone (optional)" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
            <select value={newCompanyId} onChange={e => setNewCompanyId(e.target.value)} className="px-3 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30">
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim() || !newEmail.trim()}
            className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
          >
            {creating ? "Creating..." : "Invite Client"}
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder="Search clients..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full sm:w-80 h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] mb-4 focus:outline-none focus:ring-2 focus:ring-[#8E8E93]/30"
      />

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" /></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <p className="text-[#8E8E93] text-sm">No clients yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5EA]">
                <th className="text-left p-4 text-[11px] font-semibold text-[#8E8E93] uppercase">Name</th>
                <th className="text-left p-4 text-[11px] font-semibold text-[#8E8E93] uppercase">Email</th>
                <th className="text-left p-4 text-[11px] font-semibold text-[#8E8E93] uppercase">Phone</th>
                <th className="text-left p-4 text-[11px] font-semibold text-[#8E8E93] uppercase">Company</th>
                <th className="text-left p-4 text-[11px] font-semibold text-[#8E8E93] uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F7]">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="p-4 text-[13px] font-medium text-[#1C1C1E]">{c.full_name}</td>
                  <td className="p-4 text-[13px] text-[#8E8E93]">{c.email}</td>
                  <td className="p-4 text-[13px] text-[#8E8E93]">{c.phone ?? "—"}</td>
                  <td className="p-4 text-[13px] text-[#8E8E93]">{c.company_name}</td>
                  <td className="p-4 text-[13px] text-[#C7C7CC]">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
