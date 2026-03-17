import React from "react";
import Link from "next/link";

/* ─── SVG Device Mockups ─── */

function PhoneMockup({ children, className = "" }: { readonly children: React.ReactNode; readonly className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 280, height: 560 }}>
      {/* Phone frame */}
      <div className="absolute inset-0 rounded-[40px] bg-[#1d1d1f] shadow-2xl shadow-black/20" />
      {/* Screen */}
      <div className="absolute top-[14px] left-[14px] right-[14px] bottom-[14px] rounded-[28px] bg-white overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#1d1d1f] rounded-b-2xl z-10" />
        {/* Screen content */}
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
      {/* Screen */}
      <div className="relative rounded-t-xl bg-[#1d1d1f] p-[8px] pb-0">
        <div className="rounded-t-lg bg-white overflow-hidden" style={{ aspectRatio: "16/10" }}>
          {children}
        </div>
      </div>
      {/* Base */}
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
          <div className="font-semibold text-[12px] text-[#1d1d1f]">Rivera Lawn Care</div>
        </div>
        <div className="w-7 h-7 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-[9px] font-bold">CR</div>
      </div>
      {/* Stats row */}
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
      {/* Jobs list */}
      <div className="text-[8px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Today&apos;s Jobs</div>
      {[
        { time: "8:00 AM", client: "Johnson Residence", status: "done", color: "#34c759" },
        { time: "9:30 AM", client: "Oak Park HOA", status: "active", color: "#0071e3" },
        { time: "11:00 AM", client: "Martinez Home", status: "upcoming", color: "#86868b" },
        { time: "1:00 PM", client: "Sunset Villas", status: "upcoming", color: "#86868b" },
        { time: "2:30 PM", client: "Chen Property", status: "upcoming", color: "#86868b" },
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
      {/* Bottom nav */}
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

function ScheduleScreen() {
  return (
    <div className="p-4 text-[11px] bg-white h-full">
      <div className="font-semibold text-[14px] text-[#1d1d1f] mb-3">Schedule</div>
      {/* Week view */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={`${d}-${i}`} className="text-center">
            <div className="text-[8px] text-[#86868b] mb-1">{d}</div>
            <div className={`text-[9px] w-6 h-6 flex items-center justify-center mx-auto rounded-full font-medium ${
              i === 2 ? "bg-[#0071e3] text-white" : "text-[#1d1d1f]"
            }`}>{10 + i}</div>
          </div>
        ))}
      </div>
      {/* Timeline */}
      <div className="relative ml-2 border-l-2 border-[#0071e3]/20 pl-4 space-y-3">
        {[
          { time: "8:00", title: "Johnson - Mowing", crew: "Carlos", color: "#34c759" },
          { time: "9:30", title: "Oak Park - Full Service", crew: "Team A", color: "#0071e3" },
          { time: "11:00", title: "Martinez - Trimming", crew: "Miguel", color: "#ff9500" },
          { time: "1:00", title: "Sunset Villas - Mowing", crew: "Carlos", color: "#af52de" },
        ].map((item) => (
          <div key={item.title} className="relative">
            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: item.color }} />
            <div className="text-[8px] text-[#86868b]">{item.time}</div>
            <div className="text-[10px] font-semibold text-[#1d1d1f]">{item.title}</div>
            <div className="text-[8px] text-[#86868b]">{item.crew}</div>
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
      {/* Invoice card */}
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
            <span className="text-[#86868b]">Edging & Trimming</span>
            <span className="text-[#1d1d1f] font-medium">$25.00</span>
          </div>
          <div className="flex justify-between text-[9px]">
            <span className="text-[#86868b]">Leaf Blowing</span>
            <span className="text-[#1d1d1f] font-medium">$15.00</span>
          </div>
          <div className="border-t border-black/[0.06] pt-1.5 flex justify-between text-[10px]">
            <span className="font-semibold text-[#1d1d1f]">Total</span>
            <span className="font-bold text-[#1d1d1f]">$85.00</span>
          </div>
        </div>
      </div>
      {/* Payment methods */}
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
        { name: "Carlos Rodriguez", role: "Lead", jobs: 4, avatar: "CR", color: "#0071e3" },
        { name: "Miguel Santos", role: "Crew", jobs: 3, avatar: "MS", color: "#34c759" },
        { name: "David Park", role: "Crew", jobs: 2, avatar: "DP", color: "#ff9500" },
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
      {/* Add crew button */}
      <div className="mt-4 border border-dashed border-[#86868b]/30 rounded-xl py-3 text-center">
        <div className="text-[#0071e3] text-[11px] font-medium">+ Invite crew member</div>
      </div>
    </div>
  );
}

/* ─── Data ─── */

const TIERS = [
  { label: "Starter", props: "1–10", price: "$20" },
  { label: "Growth", props: "11–30", price: "$40", featured: true },
  { label: "Pro", props: "31–75", price: "$79" },
  { label: "Enterprise", props: "75+", price: "Custom" },
] as const;

/* ─── Page ─── */

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white text-[#1d1d1f] antialiased overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-black/[0.04]">
        <div className="max-w-[980px] mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="font-semibold text-[21px] tracking-[-0.02em] text-[#1d1d1f] no-underline">
            FieldPay
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs text-[#1d1d1f]/60 hover:text-[#1d1d1f] transition-colors no-underline">Features</a>
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

      {/* Hero + Phone Mockup */}
      <section className="pt-24 pb-8 md:pt-36 md:pb-16 text-center px-6">
        <p className="text-[#0071e3] font-semibold text-sm md:text-base tracking-[-0.01em] mb-4">
          Field service management
        </p>
        <h1 className="font-semibold text-[48px] md:text-[80px] leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] max-w-[680px] mx-auto mb-6">
          Your business,
          <br />
          in your pocket.
        </h1>
        <p className="text-[#86868b] text-lg md:text-[21px] leading-[1.38] max-w-[500px] mx-auto mb-10 font-normal">
          Schedule jobs. Send invoices. Manage your crew.
          <br className="hidden md:block" />
          All from one beautifully simple app.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 md:mb-24">
          <Link href="/login" className="bg-[#0071e3] text-white font-medium text-base px-8 py-3 rounded-full hover:bg-[#0077ED] transition-colors no-underline">
            Start free trial
          </Link>
          <a href="#features" className="text-[#0071e3] font-medium text-base no-underline flex items-center gap-1.5 group">
            Learn more
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        {/* Hero phone */}
        <PhoneMockup>
          <DashboardScreen />
        </PhoneMockup>
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

      {/* Feature 1: Schedule — laptop mockup */}
      <section id="features" className="py-24 md:py-32 bg-white">
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
      <section className="py-24 md:py-32 bg-[#f5f5f7]">
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
      <section className="py-24 md:py-32 bg-white">
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

      {/* Why FieldPay */}
      <section className="bg-[#f5f5f7] py-24 md:py-32">
        <div className="max-w-[980px] mx-auto px-6">
          <h2 className="font-semibold text-[40px] md:text-[56px] leading-[1.07] tracking-[-0.035em] text-[#1d1d1f] text-center mb-4">
            Why FieldPay.
          </h2>
          <p className="text-[#86868b] text-lg md:text-[21px] leading-[1.38] text-center max-w-[500px] mx-auto mb-16">
            Built by operators, for operators.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
            {[
              { title: "Job scheduling", desc: "Assign, reschedule, and track every job across your entire crew." },
              { title: "Instant invoicing", desc: "Generate and send invoices the second a job is marked complete." },
              { title: "Crew portal", desc: "Each crew member sees only their assigned schedule. Nothing more." },
              { title: "Client portal", desc: "Clients view history, download receipts, and request new services." },
              { title: "SMS & notifications", desc: "Automated alerts via SMS, WhatsApp, email, and push." },
              { title: "Revenue dashboard", desc: "MRR, job totals, and growth metrics — all in one view." },
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
      <section id="pricing" className="bg-white py-24 md:py-32">
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
                className={`rounded-2xl p-7 transition-shadow ${
                  "featured" in t
                    ? "bg-[#1d1d1f] text-white shadow-lg"
                    : "bg-[#f5f5f7] text-[#1d1d1f]"
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
            <Link href="/login" className="bg-[#0071e3] text-white font-medium text-sm px-7 py-2.5 rounded-full hover:bg-[#0077ED] transition-colors no-underline inline-block">
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#f5f5f7] py-24 md:py-32">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              { quote: "Went from spreadsheets to getting paid in 2 days. My crew loves it.", name: "Carlos R.", co: "Rivera Lawn Care" },
              { quote: "The client portal saves me 5 hours a week answering 'when is my next service?'", name: "Sandra O.", co: "Ortiz Landscaping" },
              { quote: "I added 15 properties in my first month. The scheduling alone is worth it.", name: "Mike T.", co: "Thompson Green" },
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
          <Link href="/login" className="bg-[#0071e3] text-white font-medium text-base px-8 py-3 rounded-full hover:bg-[#0077ED] transition-colors no-underline inline-block">
            Get started
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

/* ─── Wide Schedule Screen (for laptop mockup) ─── */

function ScheduleScreenWide() {
  const days = ["Mon 10", "Tue 11", "Wed 12", "Thu 13", "Fri 14"];
  const jobs = [
    { day: 0, start: 0, len: 2, title: "Johnson - Mowing", crew: "Carlos", color: "#0071e3" },
    { day: 0, start: 3, len: 1, title: "Oak Park HOA", crew: "Team A", color: "#34c759" },
    { day: 1, start: 1, len: 2, title: "Martinez Home", crew: "Miguel", color: "#ff9500" },
    { day: 1, start: 4, len: 1, title: "Sunset Villas", crew: "Carlos", color: "#af52de" },
    { day: 2, start: 0, len: 1, title: "Chen Property", crew: "David", color: "#ff3b30" },
    { day: 2, start: 2, len: 2, title: "Lakewood Est.", crew: "Team A", color: "#0071e3" },
    { day: 3, start: 1, len: 1, title: "Park Ave Condo", crew: "Miguel", color: "#34c759" },
    { day: 3, start: 3, len: 2, title: "Riverside HOA", crew: "Team A", color: "#ff9500" },
    { day: 4, start: 0, len: 2, title: "Downtown Office", crew: "Carlos", color: "#af52de" },
    { day: 4, start: 3, len: 1, title: "Smith Residence", crew: "David", color: "#0071e3" },
  ];
  const hours = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM"];

  return (
    <div className="p-4 bg-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <div className="text-[14px] font-semibold text-[#1d1d1f]">Week of March 10</div>
          <div className="text-[10px] text-[#86868b]">12 jobs · 3 crew members</div>
        </div>
        <div className="flex gap-1.5">
          <div className="px-2.5 py-1 bg-[#0071e3] rounded-md text-[9px] font-medium text-white">+ New Job</div>
          <div className="px-2.5 py-1 bg-[#f5f5f7] rounded-md text-[9px] font-medium text-[#1d1d1f]">Week</div>
        </div>
      </div>
      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-[40px_repeat(5,1fr)] gap-px bg-black/[0.04] rounded-lg overflow-hidden">
        {/* Header row */}
        <div className="bg-[#f5f5f7] p-1" />
        {days.map((d) => (
          <div key={d} className="bg-[#f5f5f7] p-1.5 text-center">
            <div className="text-[9px] font-semibold text-[#1d1d1f]">{d}</div>
          </div>
        ))}
        {/* Time rows */}
        {hours.map((h, hi) => (
          <React.Fragment key={h}>
            <div className="bg-white p-1 flex items-start justify-end">
              <span className="text-[8px] text-[#86868b]">{h}</span>
            </div>
            {days.map((_, di) => {
              const job = jobs.find((j) => j.day === di && j.start === hi);
              return (
                <div key={`${di}-${hi}`} className="bg-white p-0.5 min-h-[28px] relative">
                  {job && (
                    <div
                      className="rounded-md px-1.5 py-1 text-white"
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
