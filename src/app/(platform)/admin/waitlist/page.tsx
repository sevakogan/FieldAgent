"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminWaitlist, approveWaitlistEntry, rejectWaitlistEntry } from "@/lib/actions/admin";
import { StatusBadge } from "@/components/platform/Badge";
import { Button } from "@/components/platform/Button";

type WaitlistEntry = Record<string, unknown>;


export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchWaitlist = useCallback(async () => {
    const result = await getAdminWaitlist();
    if (result.success && result.data) {
      setEntries(result.data);
    } else {
      setError(result.error ?? "Unknown error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWaitlist();
  }, [fetchWaitlist]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleApprove = async (id: string) => {
    setActionLoading(`approve-${id}`);
    const result = await approveWaitlistEntry(id);
    if (result.success) {
      setToast({ message: "Entry approved", type: "success" });
      await fetchWaitlist();
    } else {
      setToast({ message: result.error ?? "Failed to approve", type: "error" });
    }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(`reject-${id}`);
    const result = await rejectWaitlistEntry(id);
    if (result.success) {
      setToast({ message: "Entry rejected", type: "success" });
      await fetchWaitlist();
    } else {
      setToast({ message: result.error ?? "Failed to reject", type: "error" });
    }
    setActionLoading(null);
  };

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
        Failed to load waitlist: {error}
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
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Waitlist</h1>
          <p className="text-[14px] text-[#8E8E93] mt-1">{entries.length} total entries</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <div className="text-[#C7C7CC] mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-[#8E8E93]">No waitlist entries</p>
          <p className="text-[12px] text-[#C7C7CC] mt-1">New applicants will appear here when the waitlist is active.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const id = entry.id as string;
                  const name = (entry.name as string) ?? (entry.full_name as string) ?? "—";
                  const email = (entry.email as string) ?? "—";
                  const status = (entry.status as string) ?? "waiting";
                  const date = (entry.created_at as string) ?? "";
                  const isPending = status === "waiting" || status === "invited";
                  return (
                    <tr key={id ?? idx} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">{name}</td>
                      <td className="px-5 py-3.5 text-[13px] text-[#8E8E93]">{email}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{date ? new Date(date).toLocaleDateString() : "—"}</td>
                      <td className="px-5 py-3.5 text-right">
                        {isPending && id && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(id)}
                              disabled={actionLoading === `approve-${id}`}
                              loading={actionLoading === `approve-${id}`}
                            >
                              {actionLoading === `approve-${id}` ? "..." : "Approve"}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(id)}
                              disabled={actionLoading === `reject-${id}`}
                              loading={actionLoading === `reject-${id}`}
                            >
                              {actionLoading === `reject-${id}` ? "..." : "Reject"}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
