"use client";

import { usePathname } from "next/navigation";
import { useDialer } from "./dialer-provider";

const PAGE_TITLES: Record<string, string> = {
  "/":         "Dashboard",
  "/contacts": "Contacts",
  "/jobs":     "Jobs",
  "/business": "Business",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const { open } = useDialer();
  const title = PAGE_TITLES[pathname] ?? "FieldPay";

  return (
    <header className="bg-white border-b border-gray-100 px-5 md:px-7 py-3 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="font-extrabold text-[17px] tracking-tight">{title}</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-[11px] font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Live
        </span>
        <button
          onClick={open}
          className="hidden md:inline-flex bg-brand-dark text-white border-none rounded-[10px] px-4 py-2 text-[13px] font-semibold items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer"
        >
          📞 Dial
        </button>
        <div className="w-[34px] h-[34px] bg-brand-dark rounded-[10px] flex items-center justify-center text-white font-extrabold text-[13px] cursor-pointer">
          J
        </div>
      </div>
    </header>
  );
}
