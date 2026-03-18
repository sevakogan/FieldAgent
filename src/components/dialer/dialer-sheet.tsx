"use client";

import { useEffect, useState } from "react";
import { useDialer } from "@/components/layout/dialer-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Dialpad } from "./dialpad";
import { getAuthContext } from "@/lib/db/auth";
import { getCalls } from "@/lib/db/calls";
import type { Call } from "@/types";

export function DialerSheet() {
  const { isOpen, close } = useDialer();
  const [calls, setCalls] = useState<Call[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const auth = await getAuthContext();
      if (!auth) return;
      const data = await getCalls(auth.companyId);
      setCalls(data);
    })();
  }, [isOpen]);

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  }

  return (
    <BottomSheet open={isOpen} onClose={close} title="Dialer">
      {/* Business line */}
      <div className="bg-brand-dark rounded-2xl px-5 py-4 text-white mb-4">
        <div className="text-[10px] font-semibold tracking-[2px] text-white/30 mb-1">BUSINESS LINE</div>
        <div className="text-xl font-black tracking-wide">(786) 555-0100</div>
        <div className="text-[10px] text-white/30 mt-1">Twilio · WhatsApp Active</div>
      </div>

      <Dialpad />

      {/* Recent calls */}
      <div className="mt-5">
        <div className="font-bold text-sm mb-3">Recent Calls</div>
        {calls.length === 0 ? (
          <p className="text-gray-400 text-[13px] py-2">No recent calls.</p>
        ) : (
          calls.map((call) => (
            <div key={call.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-base shrink-0">
                  {call.outbound ? "↑" : "↓"}
                </div>
                <div>
                  <div className="font-semibold text-[13px]">{call.name ?? call.number ?? "Unknown"}</div>
                  <div className="text-[11px] text-gray-400">{call.number ?? ""} · {timeAgo(call.created_at)}</div>
                </div>
              </div>
              <span className="text-xs text-gray-500 font-medium">{call.duration ?? ""}</span>
            </div>
          ))
        )}
      </div>
    </BottomSheet>
  );
}
