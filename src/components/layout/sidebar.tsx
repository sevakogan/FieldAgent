"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { CLIENTS } from "@/lib/mock-data";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/contacts",  label: "Contacts",  icon: "👥" },
  { href: "/jobs",      label: "Jobs",      icon: "🔧" },
  { href: "/business",  label: "Business",  icon: "💰" },
  { href: "/referrals", label: "Referrals", icon: "🎁" },
  { href: "/settings",  label: "Settings",  icon: "⚙️" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const mrr = CLIENTS.reduce((sum, c) => sum + c.mrr, 0);

  return (
    <aside className="hidden md:flex w-[220px] fixed top-0 left-0 bottom-0 bg-brand-dark flex-col p-5 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-7">
        <div className="w-[34px] h-[34px] bg-white rounded-[10px] flex items-center justify-center text-lg shrink-0">
          🌿
        </div>
        <div>
          <div className="font-extrabold text-sm text-white tracking-tight">FieldPay</div>
          <div className="text-[11px] text-white/30 mt-0.5">John&apos;s Lawn Care</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-all ${
                isActive
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/45 hover:bg-white/7 hover:text-white/85"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* MRR widget */}
      <div className="bg-white/6 rounded-[14px] p-4 mb-3">
        <div className="text-[10px] font-semibold tracking-[1.5px] text-white/30 mb-2">MRR</div>
        <div className="text-[28px] font-black text-white tracking-tight leading-none">
          {formatCurrency(mrr)}
        </div>
        <div className="text-[11px] text-white/30 mt-1.5">{CLIENTS.length} clients</div>
      </div>
    </aside>
  );
}
