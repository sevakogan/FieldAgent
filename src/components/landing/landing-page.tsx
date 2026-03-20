"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

/* ─── Animated Gradient Background ─── */

function AnimatedHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let mouseX = 0.5;
    let mouseY = 0.5;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    };
    canvas.addEventListener("mousemove", handleMouse);

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Animated gradient orbs that follow mouse subtly
      const orbs = [
        { x: 0.3 + mouseX * 0.1, y: 0.2 + mouseY * 0.1, r: 0.5, color: "rgba(0,113,227,0.06)", speed: 0.0003 },
        { x: 0.7 - mouseX * 0.1, y: 0.6 - mouseY * 0.1, r: 0.4, color: "rgba(52,199,89,0.05)", speed: 0.0005 },
        { x: 0.5 + Math.sin(t * 0.0002) * 0.1, y: 0.8, r: 0.6, color: "rgba(175,82,222,0.04)", speed: 0.0004 },
      ];

      for (const orb of orbs) {
        const cx = (orb.x + Math.sin(t * orb.speed) * 0.05) * w;
        const cy = (orb.y + Math.cos(t * orb.speed * 1.3) * 0.05) * h;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r * w);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      animationId = requestAnimationFrame(draw);
    };
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 0 }}
    />
  );
}

/* ─── SVG Device Mockups ─── */

function PhoneMockup({ children, className = "" }: { readonly children: React.ReactNode; readonly className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 280, height: 560 }}>
      <div className="absolute inset-0 rounded-[40px] bg-[#1d1d1f] shadow-2xl shadow-black/20" />
      <div className="absolute top-[14px] left-[14px] right-[14px] bottom-[14px] rounded-[28px] bg-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#1d1d1f] rounded-b-2xl z-10" />
        <div className="pt-[34px] h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

function LaptopMockup({ children, className = "" }: { readonly children: React.ReactNode; readonly className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 640, maxWidth: "100%" }}>
      <div className="relative rounded-t-xl bg-[#1d1d1f] p-[8px] pb-0">
        <div className="rounded-t-lg bg-white overflow-hidden" style={{ aspectRatio: "16/10" }}>
          {children}
        </div>
      </div>
      <div className="relative">
        <div className="h-[14px] bg-[#c4c4c6] rounded-b-md" />
        <div className="h-[4px] bg-[#a1a1a3] mx-[20%] rounded-b-lg" />
      </div>
    </div>
  );
}

/* ─── Mock App Screens ─── */

function DashboardScreen() {
  return (
    <div className="p-3 text-[10px] bg-white h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[8px] text-[#86868b]">Good morning</div>
          <div className="font-semibold text-[12px] text-[#1d1d1f]">Sunshine Services</div>
        </div>
        <div className="w-7 h-7 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-[9px] font-bold">SS</div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <div className="bg-[#f5f5f7] rounded-lg p-2 text-center">
          <div className="font-bold text-[14px] text-[#1d1d1f]">$4,280</div>
          <div className="text-[7px] text-[#86868b]">This month</div>
        </div>
        <div className="bg-[#f5f5f7] rounded-lg p-2 text-center">
          <div className="font-bold text-[14px] text-[#1d1d1f]">12</div>
          <div className="text-[7px] text-[#86868b]">Jobs today</div>
        </div>
        <div className="bg-[#f5f5f7] rounded-lg p-2 text-center">
          <div className="font-bold text-[14px] text-[#1d1d1f]">3</div>
          <div className="text-[7px] text-[#86868b]">Crew active</div>
        </div>
      </div>
      <div className="text-[8px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Today&apos;s Jobs</div>
      {[
        { time: "8:00 AM", client: "Johnson — Lawn", status: "done", color: "#34c759" },
        { time: "9:30 AM", client: "Oak Park — Pool", status: "active", color: "#0071e3" },
        { time: "11:00 AM", client: "Airbnb #12 — Turnover", status: "upcoming", color: "#86868b" },
        { time: "1:00 PM", client: "Sunset — Pressure Wash", status: "upcoming", color: "#86868b" },
        { time: "2:30 PM", client: "Chen — Lawn + Trim", status: "upcoming", color: "#86868b" },
      ].map((job) => (
        <div key={job.client} className="flex items-center gap-2 py-1.5 border-b border-black/[0.04]">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: job.color }} />
          <div className="text-[9px] text-[#86868b] w-[42px] flex-shrink-0">{job.time}</div>
          <div className="text-[9px] text-[#1d1d1f] font-medium flex-1">{job.client}</div>
          <div className="text-[7px] font-medium px-1.5 py-0.5 rounded-full" style={{
            backgroundColor: job.status === "done" ? "#34c75920" : job.status === "active" ? "#0071e320" : "#86868b15",
            color: job.color
          }}>{job.status}</div>
        </div>
      ))}
      <div className="absolute bottom-0 left-0 right-0 border-t border-black/[0.04] bg-white/90 backdrop-blur px-4 py-1.5 flex justify-around">
        {["Home", "Jobs", "Contacts", "Settings"].map((tab, idx) => (
          <div key={tab} className={`text-center ${idx === 0 ? "text-[#0071e3]" : "text-[#86868b]"}`}>
            <div className="w-4 h-4 mx-auto mb-0.5 rounded bg-current opacity-20" />
            <div className="text-[7px] font-medium">{tab}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoiceScreen() {
  return (
    <div className="p-4 bg-white h-full">
      <div className="font-semibold text-[14px] text-[#1d1d1f] mb-4">Invoice #1047</div>
      <div className="bg-[#f5f5f7] rounded-xl p-3 mb-3">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-[10px] text-[#86868b]">Bill to</div>
            <div className="text-[11px] font-semibold text-[#1d1d1f]">Johnson Residence</div>
            <div className="text-[9px] text-[#86868b]">1234 Oak Street</div>
          </div>
          <div className="px-2 py-0.5 bg-[#34c759]/10 rounded-full">
            <span className="text-[8px] font-semibold text-[#34c759]">PAID</span>
          </div>
        </div>
        <div className="border-t border-black/[0.06] pt-2 space-y-1.5">
          <div className="flex justify-between text-[9px]">
            <span className="text-[#86868b]">Lawn Mowing</span>
            <span className="text-[#1d1d1f] font-medium">$45.00</span>
          </div>
          <div className="flex justify-between text-[9px]">
            <span className="text-[#86868b]">Pool Chemical Balance</span>
            <span className="text-[#1d1d1f] font-medium">$35.00</span>
          </div>
          <div className="flex justify-between text-[9px]">
            <span className="text-[#86868b]">Pressure Washing</span>
            <span className="text-[#1d1d1f] font-medium">$65.00</span>
          </div>
          <div className="border-t border-black/[0.06] pt-1.5 flex justify-between text-[10px]">
            <span className="font-semibold text-[#1d1d1f]">Total</span>
            <span className="font-bold text-[#1d1d1f]">$145.00</span>
          </div>
        </div>
      </div>
      <div className="text-[8px] font-semibold text-[#86868b] uppercase tracking-wider mb-2">Pay via</div>
      <div className="grid grid-cols-2 gap-1.5">
        {["Zelle", "Venmo", "Cash App", "Stripe"].map((m) => (
          <div key={m} className="bg-[#f5f5f7] rounded-lg py-2 text-center text-[9px] font-medium text-[#1d1d1f]">
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

function CrewScreen() {
  return (
    <div className="p-5 bg-white h-full">
      <div className="font-semibold text-[16px] text-[#1d1d1f] mb-1">Crew</div>
      <div className="text-[11px] text-[#86868b] mb-5">3 members active today</div>
      {[
        { name: "Carlos Rodriguez", role: "Lawn Lead", jobs: 4, avatar: "CR", color: "#0071e3" },
        { name: "Miguel Santos", role: "Pool Tech", jobs: 3, avatar: "MS", color: "#34c759" },
        { name: "Sarah Kim", role: "Cleaning Lead", jobs: 2, avatar: "SK", color: "#ff9500" },
      ].map((member) => (
        <div key={member.name} className="flex items-center gap-3 py-3 border-b border-black/[0.04]">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: member.color }}>
            {member.avatar}
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-semibold text-[#1d1d1f]">{member.name}</div>
            <div className="text-[9px] text-[#86868b]">{member.role} · {member.jobs} jobs today</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#34c759]" />
        </div>
      ))}
      <div className="mt-4 border border-dashed border-[#86868b]/30 rounded-xl py-3 text-center">
        <div className="text-[#0071e3] text-[11px] font-medium">+ Invite crew member</div>
      </div>
    </div>
  );
}

/* ─── Interactive Schedule (hover effects) ─── */

function ScheduleScreenWide() {
  const days = ["Mon 10", "Tue 11", "Wed 12", "Thu 13", "Fri 14"];
  const jobs = [
    { day: 0, start: 0, len: 2, title: "Johnson — Lawn", crew: "Carlos", color: "#0071e3" },
    { day: 0, start: 3, len: 1, title: "Oak Park — Pool", crew: "Team A", color: "#34c759" },
    { day: 1, start: 1, len: 2, title: "Airbnb #12 — Turnover", crew: "Sarah", color: "#ff9500" },
    { day: 1, start: 4, len: 1, title: "Sunset — Pressure Wash", crew: "Carlos", color: "#af52de" },
    { day: 2, start: 0, len: 1, title: "Chen — Pool Service", crew: "Miguel", color: "#ff3b30" },
    { day: 2, start: 2, len: 2, title: "Lakewood — Full Clean", crew: "Team A", color: "#0071e3" },
    { day: 3, start: 1, len: 1, title: "Park Ave — Lawn", crew: "Carlos", color: "#34c759" },
    { day: 3, start: 3, len: 2, title: "Riverside — Pool + Lawn", crew: "Team A", color: "#ff9500" },
    { day: 4, start: 0, len: 2, title: "Downtown — Deep Clean", crew: "Sarah", color: "#af52de" },
    { day: 4, start: 3, len: 1, title: "Smith — Lawn Mowing", crew: "Carlos", color: "#0071e3" },
  ];
  const hours = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM"];

  return (
    <div className="p-4 bg-white h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <div className="text-[14px] font-semibold text-[#1d1d1f]">Week of March 10</div>
          <div className="text-[10px] text-[#86868b]">12 jobs · 3 crew members</div>
        </div>
        <div className="flex gap-1.5">
          <div className="px-2.5 py-1 bg-[#0071e3] rounded-md text-[9px] font-medium text-white cursor-pointer hover:bg-[#0077ED] transition-colors">+ New Job</div>
          <div className="px-2.5 py-1 bg-[#f5f5f7] rounded-md text-[9px] font-medium text-[#1d1d1f]">Week</div>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-[40px_repeat(5,1fr)] gap-px bg-black/[0.04] rounded-lg overflow-hidden">
        <div className="bg-[#f5f5f7] p-1" />
        {days.map((d) => (
          <div key={d} className="bg-[#f5f5f7] p-1.5 text-center hover:bg-[#e8e8ed] transition-colors cursor-pointer">
            <div className="text-[9px] font-semibold text-[#1d1d1f]">{d}</div>
          </div>
        ))}
        {hours.map((h, hi) => (
          <React.Fragment key={h}>
            <div className="bg-white p-1 flex items-start justify-end">
              <span className="text-[8px] text-[#86868b]">{h}</span>
            </div>
            {days.map((_, di) => {
              const job = jobs.find((j) => j.day === di && j.start === hi);
              return (
                <div key={`${di}-${hi}`} className="bg-white hover:bg-[#f5f5f7] transition-colors p-0.5 min-h-[28px] relative cursor-pointer group">
                  {job && (
                    <div
                      className="rounded-md px-1.5 py-1 text-white transition-all duration-200 group-hover:scale-[1.03] group-hover:shadow-lg"
                      style={{
                        backgroundColor: job.color,
                        height: `${job.len * 100}%`,
                        minHeight: 24,
                      }}
                    >
                      <div className="text-[8px] font-semibold leading-tight truncate">{job.title}</div>
                      <div className="text-[7px] opacity-80 truncate">{job.crew}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ─── Industry Icons (SVG) ─── */

const INDUSTRIES = [
  {
    name: "Lawn Care",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-4-8-7.5-8-11a8 8 0 0116 0c0 3.5-4 7-8 11z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7M10 9h4" />
      </svg>
    ),
  },
  {
    name: "Pool Service",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 18c1.5-1 3-1.5 4.5 0s3 1 4.5 0 3-1.5 4.5 0 3 1 4.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 14c1.5-1 3-1.5 4.5 0s3 1 4.5 0 3-1.5 4.5 0 3 1 4.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10V4M16 10V4" />
      </svg>
    ),
  },
  {
    name: "Property Cleaning",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Pressure Washing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M8 7l4-4 4 4M6 12h12M8 17l4 4 4-4" />
      </svg>
    ),
  },
  {
    name: "Pest Control",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    name: "HVAC Service",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    name: "Window Cleaning",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    name: "Handyman",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
      </svg>
    ),
  },
] as const;

/* ─── Data ─── */

const TIERS = [
  { label: "Starter", props: "1–10", price: "$20" },
  { label: "Growth", props: "11–30", price: "$40", featured: true },
  { label: "Pro", props: "31–75", price: "$79" },
  { label: "Enterprise", props: "75+", price: "Custom" },
] as const;

/* ─── Page Content ─── */

export function LandingContent() {
  return (
    <div className="min-h-dvh bg-white text-[#1d1d1f] antialiased overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-black/[0.04]">
        <div className="max-w-[980px] mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="font-semibold text-[21px] tracking-[-0.02em] text-[#1d1d1f] no-underline">
            KleanHQ
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs text-[#1d1d1f]/60 hover:text-[#1d1d1f] transition-colors no-underline">Features</a>
            <a href="#industries" className="text-xs text-[#1d1d1f]/60 hover:text-[#1d1d1f] transition-colors no-underline">Industries</a>
            <a href="#pricing" className="text-xs text-[#1d1d1f]/60 hover:text-[#1d1d1f] transition-colors no-underline">Pricing</a>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-xs text-[#1d1d1f]/60 hover:text-[#1d1d1f] transition-colors no-underline hidden sm:inline">
              Sign in
            </Link>
            <Link href="/login" className="bg-[#0071e3] text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-[#0077ED] transition-colors no-underline">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero + Animated Background */}
      <section className="relative pt-24 pb-8 md:pt-36 md:pb-16 text-center px-6">
        <AnimatedHeroBackground />
        <div className="relative z-10">
          <p className="text-[#0071e3] font-semibold text-sm md:text-base tracking-[-0.01em] mb-4">
            The operating system for field service
          </p>
          <h1 className="font-semibold text-[48px] md:text-[80px] leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] max-w-[720px] mx-auto mb-6">
            Your business,
            <br />
            in your pocket.
          </h1>
          <p className="text-[#86868b] text-lg md:text-[21px] leading-[1.38] max-w-[540px] mx-auto mb-10 font-normal">
            Lawn care. Pool service. Property cleaning. Pressure washing.
            <br className="hidden md:block" />
            One app to schedule, invoice, and manage it all.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 md:mb-24">
            <Link href="/login?mode=signup" className="bg-[#0071e3] text-white font-medium text-base px-8 py-3 rounded-full hover:bg-[#0077ED] transition-colors no-underline">
              Start Free Trial
            </Link>
            <a href="#features" className="text-[#0071e3] font-medium text-base no-underline flex items-center gap-1.5 group">
              Learn more
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <PhoneMockup>
            <DashboardScreen />
          </PhoneMockup>
        </div>
      </section>

      {/* Stat strip */}
      <div className="border-y border-black/[0.04] py-10 mt-8">
        <div className="max-w-[980px] mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-[28px] md:text-[40px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">500+</div>
            <div className="text-[#86868b] text-xs md:text-sm mt-1">Service businesses</div>
          </div>
          <div>
            <div className="text-[28px] md:text-[40px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">10K+</div>
            <div className="text-[#86868b] text-xs md:text-sm mt-1">Jobs completed</div>
          </div>
          <div>
            <div className="text-[28px] md:text-[40px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">4.9</div>
            <div className="text-[#86868b] text-xs md:text-sm mt-1">Average rating</div>
          </div>
        </div>
      </div>

      {/* Industries section */}
      <section id="industries" className="py-20 md:py-28 bg-white">
        <div className="max-w-[980px] mx-auto px-6">
          <h2 className="font-semibold text-[32px] md:text-[48px] leading-[1.08] tracking-[-0.035em] text-[#1d1d1f] text-center mb-4">
            Built for every field service.
          </h2>
          <p className="text-[#86868b] text-lg md:text-[21px] leading-[1.38] text-center max-w-[500px] mx-auto mb-14">
            If you go to the job, KleanHQ goes with you.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.name}
                className="group bg-[#f5f5f7] hover:bg-[#1d1d1f] rounded-2xl p-5 text-center transition-all duration-300 cursor-pointer"
              >
                <div className="text-[#86868b] group-hover:text-white transition-colors duration-300 flex justify-center mb-3">
                  {ind.icon}
                </div>
                <div className="text-[13px] font-medium text-[#1d1d1f] group-hover:text-white transition-colors duration-300">
                  {ind.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature 1: Schedule — laptop mockup */}
      <section id="features" className="py-24 md:py-32 bg-[#f5f5f7]">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-semibold text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] mb-3">
              Schedule.
              <br />
              <span className="text-[#86868b]">Effortlessly.</span>
            </h2>
            <p className="text-[#86868b] text-lg md:text-[21px] leading-[1.38] max-w-[500px] mx-auto mt-4">
              Drag, drop, done. Assign jobs to crew members with a tap. See your entire week at a glance.
            </p>
          </div>
          <LaptopMockup>
            <ScheduleScreenWide />
          </LaptopMockup>
        </div>
      </section>

      {/* Feature 2: Invoice — phone mockup */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-semibold text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] mb-3">
              Invoice.
              <br />
              <span className="text-[#86868b]">Instantly.</span>
            </h2>
            <p className="text-[#86868b] text-lg md:text-[21px] leading-[1.38] max-w-[500px] mx-auto mt-4">
              Send professional invoices the moment a job is complete. Accept Zelle, Venmo, Cash App, or Stripe.
            </p>
          </div>
          <PhoneMockup>
            <InvoiceScreen />
          </PhoneMockup>
        </div>
      </section>

      {/* Feature 3: Manage — phone mockup */}
      <section className="py-24 md:py-32 bg-[#f5f5f7]">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-semibold text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] mb-3">
              Manage.
              <br />
              <span className="text-[#86868b]">Seamlessly.</span>
            </h2>
            <p className="text-[#86868b] text-lg md:text-[21px] leading-[1.38] max-w-[500px] mx-auto mt-4">
              Your crew sees their schedule. Your clients see their history. Everyone stays in sync.
            </p>
          </div>
          <PhoneMockup>
            <CrewScreen />
          </PhoneMockup>
        </div>
      </section>

      {/* Why KleanHQ */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-[980px] mx-auto px-6">
          <h2 className="font-semibold text-[40px] md:text-[56px] leading-[1.07] tracking-[-0.035em] text-[#1d1d1f] text-center mb-4">
            Why KleanHQ.
          </h2>
          <p className="text-[#86868b] text-lg md:text-[21px] leading-[1.38] text-center max-w-[500px] mx-auto mb-16">
            Built by operators, for operators.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
            {[
              { title: "Job scheduling", desc: "Assign, reschedule, and track every job across your entire crew — lawn, pool, cleaning, or any service." },
              { title: "Instant invoicing", desc: "Generate and send invoices the second a job is marked complete. Get paid faster." },
              { title: "Crew portal", desc: "Each crew member sees only their assigned schedule. Nothing more, nothing less." },
              { title: "Client portal", desc: "Clients view history, download receipts, and request new services on their own." },
              { title: "SMS & notifications", desc: "Automated alerts via SMS, WhatsApp, email, and push for you and your clients." },
              { title: "Revenue dashboard", desc: "MRR, job totals, and growth metrics across all your service lines — one view." },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-semibold text-[#1d1d1f] text-lg tracking-[-0.01em] mb-2">{item.title}</h3>
                <p className="text-[#86868b] text-[15px] leading-[1.47]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[#f5f5f7] py-24 md:py-32">
        <div className="max-w-[980px] mx-auto px-6">
          <h2 className="font-semibold text-[40px] md:text-[56px] leading-[1.07] tracking-[-0.035em] text-[#1d1d1f] text-center mb-4">
            Simple pricing.
          </h2>
          <p className="text-[#86868b] text-lg md:text-[21px] leading-[1.38] text-center max-w-[500px] mx-auto mb-16">
            One property = one address. Pick the plan that fits.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-[880px] mx-auto">
            {TIERS.map((t) => (
              <div
                key={t.label}
                className={`rounded-2xl p-7 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                  "featured" in t
                    ? "bg-[#1d1d1f] text-white shadow-lg"
                    : "bg-white text-[#1d1d1f]"
                }`}
              >
                <div className={`text-sm font-medium mb-6 ${"featured" in t ? "text-white/50" : "text-[#86868b]"}`}>
                  {t.label}
                </div>
                <div className="mb-1">
                  <span className="text-[36px] font-semibold tracking-[-0.03em]">{t.price}</span>
                  {t.price !== "Custom" && (
                    <span className={`text-sm ${"featured" in t ? "text-white/40" : "text-[#86868b]"}`}>/mo</span>
                  )}
                </div>
                <div className={`text-sm ${"featured" in t ? "text-white/40" : "text-[#86868b]"}`}>
                  {t.props} properties
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/login?mode=signup" className="bg-[#0071e3] text-white font-medium text-sm px-7 py-2.5 rounded-full hover:bg-[#0077ED] transition-colors no-underline inline-block">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              { quote: "Went from spreadsheets to getting paid in 2 days. My crew loves it.", name: "Carlos R.", co: "Rivera Lawn & Pool" },
              { quote: "The client portal saves me 5 hours a week answering 'when is my next service?'", name: "Sandra O.", co: "Ortiz Property Services" },
              { quote: "I manage lawn, pool, and cleaning crews — all from one dashboard.", name: "Mike T.", co: "Thompson Home Services" },
            ].map((t) => (
              <div key={t.name}>
                <p className="text-[#1d1d1f] text-[17px] leading-[1.47] font-normal mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="text-[#86868b] text-sm">
                  <span className="text-[#1d1d1f] font-medium">{t.name}</span> — {t.co}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#1d1d1f] py-28 md:py-36">
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <h2 className="font-semibold text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.035em] text-white mb-5">
            Ready to grow?
          </h2>
          <p className="text-white/50 text-lg md:text-[21px] leading-[1.38] mb-10">
            14-day free trial. No credit card required.
          </p>
          <Link href="/login?mode=signup" className="bg-[#0071e3] text-white font-medium text-base px-8 py-3 rounded-full hover:bg-[#0077ED] transition-colors no-underline inline-block">
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.04] bg-[#f5f5f7]">
        <div className="max-w-[980px] mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#86868b]">
            © 2026 TheLevelTeam LLC
          </div>
          <div className="flex items-center gap-6 text-xs text-[#86868b]">
            <Link href="/privacy" className="hover:text-[#1d1d1f] transition-colors no-underline">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1d1d1f] transition-colors no-underline">Terms</Link>
            <Link href="/login" className="hover:text-[#1d1d1f] transition-colors no-underline">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
