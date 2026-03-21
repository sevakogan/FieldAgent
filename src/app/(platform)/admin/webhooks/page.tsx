"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminWebhooks, retryWebhook } from "@/lib/actions/admin";
import { StatusBadge } from "@/components/platform/Badge";
import { Button } from "@/components/platform/Button";

type WebhookLog = {
  id: string;
  source: string | null;
  event_type: string | null;
  status: string;
  processed_at: string | null;
  created_at: string;
};


export default function AdminWebhooksPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchWebhooks = useCallback(async () => {
    const result = await getAdminWebhooks();
    if (result.success && result.data) {
      setLogs(result.data);
    } else {
      setError(result.error ?? "Unknown error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRetry = async (id: string) => {
    setActionLoading(id);
    const result = await retryWebhook(id);
    if (result.success) {
      setToast({ message: "Webhook queued for retry", type: "success" });
      await fetchWebhooks();
    } else {
      setToast({ message: result.error ?? "Failed to retry webhook", type: "error" });
    }
    setActionLoading(null);
  };

  const sources = ["all", ...Array.from(new Set(logs.map((l) => l.source).filter(Boolean) as string[]))];
  const filtered = logs.filter((l) => filterSource === "all" || l.source === filterSource);
  const successRate = logs.length > 0 ? Math.round((logs.filter((l) => l.status === "success").length / logs.length) * 100) : 0;

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
        Failed to load webhooks: {error}
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
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Webhook Logs</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Monitor incoming webhook deliveries and failures</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Total Events</div>
          <div className="text-[22px] font-bold text-[#1C1C1E]">{logs.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Success Rate</div>
          <div className="text-[22px] font-bold text-[#34C759]">{successRate}%</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Failed Events</div>
          <div className="text-[22px] font-bold text-[#FF3B30]">{logs.filter((l) => l.status === "failed").length}</div>
        </div>
      </div>

      {sources.length > 1 && (
        <div className="flex gap-2 mb-6">
          {sources.map((source) => (
            <button
              key={source}
              onClick={() => setFilterSource(source)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                filterSource === source
                  ? "bg-[#8E8E93] text-white"
                  : "bg-white text-[#8E8E93] border border-[#E5E5EA] hover:bg-[#F2F2F7]"
              }`}
            >
              {source === "all" ? "All Sources" : source}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[13px] text-[#C7C7CC]">No webhook logs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Event</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Source</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Timestamp</th>
                  <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-[13px] font-mono font-semibold text-[#1C1C1E]">{log.event_type ?? "—"}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#8E8E93]">{log.source ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#8E8E93] font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {log.status === "failed" && (
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleRetry(log.id)}
                          disabled={actionLoading === log.id}
                          loading={actionLoading === log.id}
                        >
                          {actionLoading === log.id ? "..." : "Retry"}
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
