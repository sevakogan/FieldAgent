"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/client", icon: "🏠", label: "Home" },
  { href: "/client/request", icon: "➕", label: "Request" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
] as const;

export function ClientNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2.5 px-4 md:hidden z-50">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href}
            className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold no-underline transition-colors ${active ? "text-brand" : "text-gray-400"}`}>
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
