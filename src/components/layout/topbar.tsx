"use client";

import { usePathname } from "next/navigation";
import { useDialer } from "./dialer-provider";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/contacts":  "Contacts",
  "/jobs":      "Jobs",
  "/business":  "Business",
  "/settings":  "Settings",
  "/referrals": "Referrals",
};

export function Topbar() {
  const pathname = usePathname();
  const { open } = useDialer();
  const title = PAGE_TITLES[pathname] ?? "KleanHQ";

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-[#E5E5EA] px-5 md:px-7 py-3 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="font-bold text-[17px] tracking-[-0.3px] text-black">{title}</h1>
        <p className="text-[12px] text-[#636366] mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 bg-[#E8F9ED] rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse inline-block" />
          <span className="text-[11px] font-semibold text-[#1C7A35]">Live</span>
        </div>

        {/* Dial button — desktop only */}
        <button
          onClick={open}
          className="hidden md:inline-flex items-center gap-1.5 bg-black text-white rounded-full px-3.5 py-1.5 text-[13px] font-semibold hover:bg-[#1C1C1E] transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/>
          </svg>
          Dial
        </button>

        {/* Avatar */}
        <div className="w-[32px] h-[32px] bg-black rounded-full flex items-center justify-center text-white font-bold text-[13px] cursor-pointer">
          J
        </div>
      </div>
    </header>
  );
}
