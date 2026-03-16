"use client";

import { useDialer } from "@/components/layout/dialer-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Dialpad } from "./dialpad";
import { CALLS } from "@/lib/mock-data";

export function DialerSheet() {
  const { isOpen, close } = useDialer();

  return (
    <BottomSheet open={isOpen} onClose={close} title="Dialer">
      {/* Business line */}
      <div className="bg-brand-dark rounded-2xl px-5 py-4 text-white mb-4">
        <div className="text-[10px] font-semibold tracking-[2px] text-white/30 mb-1">BUSINESS LINE</div>
        <div className="text-xl font-black tracking-wide">(786) 555-0100</div>
        <div className="text-[10px] text-white/30 mt-1">Twilio · WhatsApp Active</div>
      </div>

      {/* Dialpad */}
      <Dialpad />

      {/* Recent calls */}
      <div className="mt-5">
        <div className="font-bold text-sm mb-3">Recent Calls</div>
        {CALLS.map((call, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-base shrink-0">
                {call.out ? "↑" : "↓"}
              </div>
              <div>
                <div className="font-semibold text-[13px]">{call.name}</div>
                <div className="text-[11px] text-gray-400">{call.num} · {call.ago}</div>
              </div>
            </div>
            <span className="text-xs text-gray-500 font-medium">{call.dur}</span>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
