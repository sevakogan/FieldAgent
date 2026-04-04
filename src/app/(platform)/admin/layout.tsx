"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import GodModeSwitcher from "@/components/platform/GodModeSwitcher";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { href: "/admin/companies", label: "Companies", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { href: "/admin/clients", label: "Clients", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { href: "/admin/billing", label: "Billing", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { href: "/admin/revenue", label: "Revenue", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/admin/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
] as const;

function NavIcon({ d }: { readonly d: string }) {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex min-h-dvh bg-[#F2F2F7]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[240px] flex-col fixed inset-y-0 left-0 bg-white/80 backdrop-blur-xl border-r border-[#E5E5EA] z-30">
        <div className="px-5 py-5 border-b border-[#E5E5EA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8E8E93] flex items-center justify-center">
              <span className="text-white text-xs font-bold">SA</span>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1C1C1E]">Super Admin</div>
              <div className="text-[11px] text-[#8E8E93]">KleanHQ Platform</div>
            </div>
          </div>
        </div>

        <GodModeSwitcher />

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  active
                    ? "bg-[#8E8E93]/12 text-[#1C1C1E] font-semibold"
                    : "text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]"
                }`}
              >
                <NavIcon d={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 border-t border-[#E5E5EA] pt-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] font-medium text-[#FF3B30] hover:bg-[#FF3B30]/8 transition-all"
          >
            <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-xl border-b border-[#E5E5EA] z-30 flex items-center px-4">
        <div className="w-7 h-7 rounded-lg bg-[#8E8E93] flex items-center justify-center mr-2.5">
          <span className="text-white text-[10px] font-bold">SA</span>
        </div>
        <span className="text-[14px] font-bold text-[#1C1C1E]">Super Admin</span>
      </div>

      {/* Main content */}
      <main className="md:ml-[240px] flex-1 min-h-dvh pt-14 md:pt-0">
        <div className="p-5 md:p-8 max-w-[1400px] mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav — bigger icons, labels, God Mode */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around items-center px-2"
        style={{ height: '84px', paddingBottom: 'env(safe-area-inset-bottom, 0px)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 ${
                active ? "text-[#007AFF]" : "text-[#1C1C1E]"
              }`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className={`text-[11px] font-bold ${active ? 'text-[#007AFF]' : 'text-[#1C1C1E]'}`}>{item.label}</span>
            </Link>
          );
        })}
        {/* God Mode — go to company dashboard */}
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[#AF52DE]"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-[11px] font-bold">My Co</span>
        </Link>
      </nav>
    </div>
  );
}
