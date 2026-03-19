"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtime } from "@/hooks/useRealtime";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
  },
  {
    href: "/contacts",
    label: "Contacts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ),
  },
  {
    href: "/jobs",
    label: "Jobs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
      </svg>
    ),
  },
  {
    href: "/jobs?view=calendar",
    label: "Calendar",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
      </svg>
    ),
  },
  {
    href: "/business",
    label: "Business",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
      </svg>
    ),
  },
  {
    href: "/referrals",
    label: "Referrals",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-2.18c.07-.44.18-.88.18-1.33C18 2.53 15.48 1 13 1c-1.7 0-3.19.8-4.15 2.07L7 5l-1.85-1.93A4.94 4.94 0 002 4.67C2 7.15 4.02 9 6.5 9H11v1H6c-2.76 0-5 2.24-5 5s2.24 5 5 5h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.06 7.06 0 00-1.62-.94l-.36-2.54A.484.484 0 0014 3h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.04.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.48.48 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
      </svg>
    ),
  },
] as const;

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");
  const [companyName, setCompanyName] = useState("My Business");
  const [clientCount, setClientCount] = useState(0);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const loadCounts = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();
    if (!profile) return;
    setCompanyId(profile.company_id);
    const { data: company } = await supabase.from("companies").select("name").eq("id", profile.company_id).single();
    if (company) setCompanyName(company.name);
    const { count } = await supabase.from("clients").select("*", { count: "exact", head: true }).eq("company_id", profile.company_id);
    setClientCount(count ?? 0);
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);
  useRealtime("clients", companyId, loadCounts);

  const isNavActive = (href: string) => {
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      const params = new URLSearchParams(query);
      return pathname === path && params.get("view") === currentView;
    }
    if (href === "/jobs") return pathname === "/jobs" && !currentView;
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname === href;
  };

  return (
    <aside className="hidden md:flex w-[220px] fixed top-0 left-0 bottom-0 bg-[#1C1C1E] flex-col p-4 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-6">
        <div className="w-[34px] h-[34px] bg-[#007AFF] rounded-[10px] flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
        </div>
        <div>
          <div className="font-bold text-[14px] text-white tracking-[-0.3px]">FieldPay</div>
          <div className="text-[11px] text-white/40 mt-0.5 truncate max-w-[130px]">{companyName}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13.5px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-white/12 text-white"
                  : "text-white/45 hover:bg-white/7 hover:text-white/80"
              }`}
            >
              <span className={`shrink-0 ${isActive ? "text-[#007AFF]" : "text-white/35"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Clients widget */}
      <div className="bg-white/[0.07] rounded-[12px] px-4 py-3 mb-3">
        <div className="text-[10px] font-semibold tracking-[1.5px] text-white/30 mb-1.5">CLIENTS</div>
        <div className="text-[28px] font-bold text-white tracking-tight leading-none">{clientCount}</div>
        <div className="text-[11px] text-white/30 mt-1">active clients</div>
      </div>

      {/* Build info footer */}
      <div className="px-1 pb-1">
        <div className="text-[10px] text-white/20 leading-relaxed">
          <span className="font-semibold text-white/30">v{process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0"}</span>
          <span className="mx-1.5 text-white/15">·</span>
          <span>{process.env.NEXT_PUBLIC_BUILD_DATE ?? "—"}</span>
        </div>
        <div className="text-[9px] text-white/15 mt-0.5 font-mono">
          #{process.env.NEXT_PUBLIC_BUILD_ID ?? "dev"}
        </div>
      </div>
    </aside>
  );
}

export function Sidebar() {
  return (
    <Suspense>
      <SidebarContent />
    </Suspense>
  );
}
