"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminBilling } from "@/lib/actions/admin";
import { updateInvoiceStatus } from "@/lib/actions/invoices";
import { StatusBadge } from "@/components/platform/Badge";
import { Button } from "@/components/platform/Button";

type BillingData = {
  mrr: number;
  totalCollected: number;
  outstanding: number;
  overdueCount: number;
  invoices: Array<{
    id: string;
    total: number;
    status: string;
    created_at: string;
    company_name: string | null;
  }>;
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);
}


export default function AdminBillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchBilling = useCallback(async () => {
    const result = await getAdminBilling();
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error ?? "Unknown error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleMarkPaid = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    const result = await updateInvoiceStatus(invoiceId, "paid");
    if (result.success) {
      setToast({ message: "Invoice marked as paid", type: "success" });
      await fetchBilling();
    } else {
      setToast({ message: result.error ?? "Failed to update invoice", type: "error" });
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
        Failed to load billing: {error}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Monthly Recurring", value: formatCurrency(data.mrr) },
    { label: "Total Collected", value: formatCurrency(data.totalCollected) },
    { label: "Outstanding", value: formatCurrency(data.outstanding) },
    { label: "Overdue Invoices", value: data.overdueCount.toString() },
  ];

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
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Platform Billing</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Subscription revenue, invoices, and payment status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{stat.label}</div>
            <div className="text-[22px] font-bold text-[#1C1C1E] tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F2F2F7]">
          <h2 className="text-[16px] font-bold text-[#1C1C1E]">Recent Invoices</h2>
        </div>
        {data.invoices.length === 0 ? (
          <div className="text-center py-12 text-[13px] text-[#C7C7CC]">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Invoice</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Company</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-mono text-[#8E8E93]">{inv.id.slice(0, 8)}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">{inv.company_name ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right text-[13px] font-bold text-[#1C1C1E]">{formatCurrency(inv.total)}</td>
                    <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      {inv.status !== "paid" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleMarkPaid(inv.id)}
                          disabled={actionLoading === inv.id}
                          loading={actionLoading === inv.id}
                        >
                          {actionLoading === inv.id ? "..." : "Mark Paid"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
