"use client";

import { useDialer } from "@/components/layout/dialer-provider";

export function DialerFAB() {
  const { open } = useDialer();

  return (
    <button
      onClick={open}
      className="fixed bottom-20 right-5 md:hidden w-14 h-14 rounded-full bg-green-500 text-white text-2xl shadow-lg shadow-green-500/30 flex items-center justify-center z-[90] hover:bg-green-600 active:scale-95 transition-all cursor-pointer"
      aria-label="Open dialer"
    >
      📞
    </button>
  );
}
