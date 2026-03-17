"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Home",     icon: "📊" },
  { href: "/contacts",           label: "Contacts", icon: "👥" },
  { href: "/jobs",               label: "Jobs",     icon: "🔧" },
  { href: "/jobs?view=calendar", label: "Calendar", icon: "📅" },
  { href: "/settings",           label: "Settings", icon: "⚙️" },
] as const;

function MobileNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");

  const isNavActive = (href: string) => {
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      const params = new URLSearchParams(query);
      return pathname === path && params.get("view") === currentView;
    }
    if (href === "/jobs") return pathname === "/jobs" && !currentView;
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-[100] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = isNavActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[9px] font-bold transition-colors ${
              isActive ? "text-gray-900" : "text-gray-400"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  return (
    <Suspense>
      <MobileNavContent />
    </Suspense>
  );
}
