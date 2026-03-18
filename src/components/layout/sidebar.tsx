"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Dashboard", icon: "📊" },
  { href: "/contacts",           label: "Contacts",  icon: "👥" },
  { href: "/jobs",               label: "Jobs",      icon: "🔧" },
  { href: "/jobs?view=calendar", label: "Calendar",  icon: "📅" },
  { href: "/business",           label: "Business",  icon: "💰" },
  { href: "/referrals",          label: "Referrals", icon: "🎁" },
  { href: "/settings",           label: "Settings",  icon: "⚙️" },
] as const;

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");
  const [companyName, setCompanyName] = useState("My Business");
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();
      if (!profile) return;
      const { data: company } = await supabase.from("companies").select("name").eq("id", profile.company_id).single();
      if (company) setCompanyName(company.name);
      const { count } = await supabase.from("clients").select("*", { count: "exact", head: true }).eq("company_id", profile.company_id);
      setClientCount(count ?? 0);
    })();
  }, []);

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
    <aside className="hidden md:flex w-[220px] fixed top-0 left-0 bottom-0 bg-brand-dark flex-col p-5 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-7">
        <div className="w-[34px] h-[34px] bg-white rounded-[10px] flex items-center justify-center text-lg shrink-0">🌿</div>
        <div>
          <div className="font-extrabold text-sm text-white tracking-tight">FieldPay</div>
          <div className="text-[11px] text-white/30 mt-0.5">{companyName}</div>
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
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-all ${
                isActive ? "bg-white/12 text-white font-semibold" : "text-white/45 hover:bg-white/7 hover:text-white/85"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Clients widget */}
      <div className="bg-white/6 rounded-[14px] p-4 mb-3">
        <div className="text-[10px] font-semibold tracking-[1.5px] text-white/30 mb-2">CLIENTS</div>
        <div className="text-[28px] font-black text-white tracking-tight leading-none">{clientCount}</div>
        <div className="text-[11px] text-white/30 mt-1.5">active clients</div>
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
