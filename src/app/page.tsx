import Link from "next/link";

const CAPABILITIES = [
  {
    title: "Schedule.",
    subtitle: "Effortlessly.",
    description: "Drag, drop, done. Assign jobs to crew members with a tap. See your entire week at a glance.",
  },
  {
    title: "Invoice.",
    subtitle: "Instantly.",
    description: "Send professional invoices the moment a job is complete. Accept Zelle, Venmo, Cash App, or Stripe.",
  },
  {
    title: "Manage.",
    subtitle: "Seamlessly.",
    description: "Your crew sees their schedule. Your clients see their history. Everyone stays in sync.",
  },
] as const;

const TIERS = [
  { label: "Starter", props: "1–10", price: "$20" },
  { label: "Growth", props: "11–30", price: "$40", featured: true },
  { label: "Pro", props: "31–75", price: "$79" },
  { label: "Enterprise", props: "75+", price: "Custom" },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white text-[#1d1d1f] antialiased">
      {/* Nav — frosted glass, ultra-minimal */}
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

      {/* Hero — massive type, extreme whitespace */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-32 text-center px-6">
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
      </section>

      {/* Stat strip — minimal, no background */}
      <div className="border-y border-black/[0.04] py-10">
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

      {/* Features — Apple's stacked full-width sections */}
      <section id="features" className="pt-24 md:pt-32">
        {CAPABILITIES.map((cap, i) => (
          <div key={cap.title} className={`py-20 md:py-28 ${i % 2 === 1 ? "bg-[#f5f5f7]" : "bg-white"}`}>
            <div className="max-w-[980px] mx-auto px-6 text-center">
              <h2 className="font-semibold text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] mb-3">
                {cap.title}
                <br />
                <span className="text-[#86868b]">{cap.subtitle}</span>
              </h2>
              <p className="text-[#86868b] text-lg md:text-[21px] leading-[1.38] max-w-[500px] mx-auto mt-4">
                {cap.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Why FieldPay — grid of values */}
      <section className="bg-white py-24 md:py-32">
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

      {/* Pricing — clean, typographic */}
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
                className={`rounded-2xl p-7 transition-shadow ${
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
            <Link href="/login" className="bg-[#0071e3] text-white font-medium text-sm px-7 py-2.5 rounded-full hover:bg-[#0077ED] transition-colors no-underline inline-block">
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials — large quote style */}
      <section className="bg-white py-24 md:py-32">
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

      {/* Final CTA — dramatic dark */}
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

      {/* Footer — minimal */}
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
