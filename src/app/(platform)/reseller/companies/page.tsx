"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchResellerCompanies, inviteCompanyAsReseller } from "@/lib/actions/reseller";
import { StatusBadge } from "@/components/platform/Badge";
import { Button } from "@/components/platform/Button";

interface Company {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

interface ResellerCompaniesData {
  companies: Company[];
  marginPercentage: number;
}


function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const EMPTY_INVITE = { companyName: "", ownerEmail: "" };

export default function ResellerCompaniesPage() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ResellerCompaniesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState(EMPTY_INVITE);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetchResellerCompanies().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInvite = async () => {
    if (!inviteForm.companyName.trim() || !inviteForm.ownerEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    const result = await inviteCompanyAsReseller({
      companyName: inviteForm.companyName.trim(),
      ownerEmail: inviteForm.ownerEmail.trim(),
    });
    if (result.success) {
      setInviteForm(EMPTY_INVITE);
      setShowInvite(false);
      fetchData();
    } else {
      setInviteError(result.error ?? "Failed to invite company");
    }
    setInviting(false);
  };

  const updateInvite = (field: string, value: string) => {
    setInviteForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#AF52DE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-[#AF52DE]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#AF52DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-[18px] font-bold text-[#1C1C1E] mb-1">No Reseller Account Found</h2>
        <p className="text-[13px] text-[#8E8E93]">Contact support to set up your reseller account.</p>
      </div>
    );
  }

  const { companies } = data;
  const filtered = companies.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">My Companies</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">
            {companies.length} {companies.length === 1 ? "company" : "companies"}
          </p>
        </div>
        <Button variant={showInvite ? "danger" : "purple"} size="sm" onClick={() => setShowInvite(!showInvite)}>
          {showInvite ? "Cancel" : "+ Invite Company"}
        </Button>
      </div>

      {showInvite && (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-6">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] mb-4">Invite a Company</h2>
          {inviteError && (
            <div className="bg-[#FF3B30]/10 text-[#FF3B30] rounded-xl p-3 text-[13px] mb-4">{inviteError}</div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1 block">Company Name</label>
              <input
                type="text"
                placeholder="Acme Cleaning Co."
                value={inviteForm.companyName}
                onChange={(e) => updateInvite("companyName", e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1 block">Owner Email</label>
              <input
                type="email"
                placeholder="owner@company.com"
                value={inviteForm.ownerEmail}
                onChange={(e) => updateInvite("ownerEmail", e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30"
              />
            </div>
          </div>
          <Button variant="purple" size="sm" onClick={handleInvite} disabled={inviting || !inviteForm.companyName.trim() || !inviteForm.ownerEmail.trim()} loading={inviting}>
            {inviting ? "Inviting..." : "Send Invite"}
          </Button>
        </div>
      )}

      <input
        type="text"
        placeholder="Search companies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/30 mb-6"
      />

      {companies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#AF52DE]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#AF52DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-[15px] font-bold text-[#1C1C1E] mb-1">No companies yet</h3>
          <p className="text-[13px] text-[#8E8E93]">Companies you refer will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Company</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-[13px] font-semibold text-[#1C1C1E]">{c.name}</div>
                      {c.slug && <div className="text-[11px] text-[#8E8E93]">{c.slug}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[13px] text-[#C7C7CC]">No companies match your search.</div>
          )}
        </div>
      )}
    </>
  );
}
