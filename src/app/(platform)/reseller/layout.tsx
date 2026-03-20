"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/reseller", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { href: "/reseller/companies", label: "My Companies", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { href: "/reseller/revenue", label: "Revenue", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/reseller/referrals", label: "Referrals", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
  { href: "/reseller/promo-codes", label: "Promo Codes", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
  { href: "/reseller/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
] as const;

function NavIcon({ d }: { readonly d: string }) {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function ResellerLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/reseller" ? pathname === "/reseller" : pathname.startsWith(href);

  return (
    <div className="flex min-h-dvh bg-[#F2F2F7]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[240px] flex-col fixed inset-y-0 left-0 bg-white/80 backdrop-blur-xl border-r border-[#E5E5EA] z-30">
        <div className="px-5 py-5 border-b border-[#E5E5EA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#AF52DE] to-[#5856D6] flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1C1C1E]">Reseller Portal</div>
              <div className="text-[11px] text-[#8E8E93]">CleanTech Resellers</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  active
                    ? "bg-[#AF52DE]/10 text-[#1C1C1E] font-semibold"
                    : "text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]"
                }`}
              >
                <NavIcon d={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E5E5EA]">
          <div className="text-[10px] text-[#C7C7CC] text-center">KleanHQ Reseller v1.0</div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-xl border-b border-[#E5E5EA] z-30 flex items-center px-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#AF52DE] to-[#5856D6] flex items-center justify-center mr-2.5">
          <span className="text-white text-[10px] font-bold">R</span>
        </div>
        <span className="text-[14px] font-bold text-[#1C1C1E]">Reseller Portal</span>
      </div>

      {/* Main content */}
      <main className="md:ml-[240px] flex-1 min-h-dvh pt-14 md:pt-0">
        <div className="p-5 md:p-8 max-w-[1200px] mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#E5E5EA] z-30 flex justify-around py-2 px-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 ${
                active ? "text-[#AF52DE]" : "text-[#C7C7CC]"
              }`}
            >
              <NavIcon d={item.icon} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
