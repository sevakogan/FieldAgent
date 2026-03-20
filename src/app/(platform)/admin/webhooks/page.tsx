"use client";

import { useState } from "react";

const WEBHOOK_LOGS = [
  { id: "1", event: "payment.succeeded", source: "Stripe", endpoint: "/api/webhooks/stripe", status: "success", statusCode: 200, duration: "120ms", timestamp: "2024-10-05 14:32:01" },
  { id: "2", event: "payment.failed", source: "Stripe", endpoint: "/api/webhooks/stripe", status: "success", statusCode: 200, duration: "95ms", timestamp: "2024-10-05 14:28:15" },
  { id: "3", event: "subscription.updated", source: "Stripe", endpoint: "/api/webhooks/stripe", status: "success", statusCode: 200, duration: "145ms", timestamp: "2024-10-05 13:55:40" },
  { id: "4", event: "invoice.created", source: "Stripe", endpoint: "/api/webhooks/stripe", status: "failed", statusCode: 500, duration: "3200ms", timestamp: "2024-10-05 13:12:22" },
  { id: "5", event: "customer.created", source: "Stripe", endpoint: "/api/webhooks/stripe", status: "success", statusCode: 200, duration: "88ms", timestamp: "2024-10-05 12:45:10" },
  { id: "6", event: "sms.delivered", source: "Twilio", endpoint: "/api/webhooks/twilio", status: "success", statusCode: 200, duration: "55ms", timestamp: "2024-10-05 12:30:05" },
  { id: "7", event: "sms.failed", source: "Twilio", endpoint: "/api/webhooks/twilio", status: "failed", statusCode: 422, duration: "180ms", timestamp: "2024-10-05 11:22:33" },
  { id: "8", event: "email.opened", source: "SendGrid", endpoint: "/api/webhooks/sendgrid", status: "success", statusCode: 200, duration: "42ms", timestamp: "2024-10-05 10:15:00" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  success: "bg-[#34C759]/10 text-[#34C759]",
  failed: "bg-[#FF3B30]/10 text-[#FF3B30]",
};

export default function AdminWebhooksPage() {
  const [filterSource, setFilterSource] = useState("all");

  const sources = ["all", ...Array.from(new Set(WEBHOOK_LOGS.map((l) => l.source)))];
  const filtered = WEBHOOK_LOGS.filter((l) => filterSource === "all" || l.source === filterSource);

  const successRate = Math.round((WEBHOOK_LOGS.filter((l) => l.status === "success").length / WEBHOOK_LOGS.length) * 100);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Webhook Logs</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Monitor incoming webhook deliveries and failures</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Total Events (24h)</div>
          <div className="text-[22px] font-bold text-[#1C1C1E]">{WEBHOOK_LOGS.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Success Rate</div>
          <div className="text-[22px] font-bold text-[#34C759]">{successRate}%</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <div className="text-[12px] text-[#8E8E93] font-medium mb-1">Failed Events</div>
          <div className="text-[22px] font-bold text-[#FF3B30]">{WEBHOOK_LOGS.filter((l) => l.status === "failed").length}</div>
        </div>
      </div>

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

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Event</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Source</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Code</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Duration</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-mono font-semibold text-[#1C1C1E]">{log.event}</div>
                    <div className="text-[10px] text-[#C7C7CC]">{log.endpoint}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#8E8E93]">{log.source}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[log.status]}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-mono text-[#8E8E93]">{log.statusCode}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{log.duration}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93] font-mono">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
