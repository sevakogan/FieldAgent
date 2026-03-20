"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

interface Feature {
  readonly name: string;
  readonly description: string;
  readonly icon: string;
}

interface Tab {
  readonly key: string;
  readonly label: string;
  readonly color: string;
  readonly gradientFrom: string;
  readonly gradientTo: string;
  readonly borderColor: string;
  readonly badgeBg: string;
  readonly badgeText: string;
  readonly iconBg: string;
  readonly features: readonly Feature[];
}

const TABS: readonly Tab[] = [
  {
    key: "companies",
    label: "Companies",
    color: "#007AFF",
    gradientFrom: "from-blue-500/[0.06]",
    gradientTo: "to-blue-500/[0.02]",
    borderColor: "border-blue-200/60",
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-600",
    iconBg: "bg-blue-500/10",
    features: [
      { name: "Job scheduling & calendar", description: "Drag-and-drop scheduling with team availability views", icon: "📅" },
      { name: "Worker GPS live tracking", description: "Real-time location tracking for all active workers", icon: "📍" },
      { name: "Before/after photo & video", description: "Visual proof of work with timestamped media", icon: "📸" },
      { name: "Job checklists & templates", description: "Standardized workflows for consistent quality", icon: "✅" },
      { name: "Custom fields", description: "Pool readings, HVAC data, and any custom data points", icon: "🔧" },
      { name: "Worker expense add-ons", description: "Track materials and supply costs per job", icon: "🧾" },
      { name: "Automated invoicing & payments", description: "Generate and send invoices automatically on job completion", icon: "💳" },
      { name: "Revenue reports & analytics", description: "Track revenue, margins, and growth in real time", icon: "📊" },
      { name: "Worker payouts", description: "Pay workers via ACH, card, or Cash App", icon: "💰" },
      { name: "Quote / estimate builder", description: "Create professional quotes with line-item pricing", icon: "📝" },
      { name: "AI contract generation", description: "Auto-generate service agreements from job details", icon: "🤖" },
      { name: "Review automation", description: "Smart gate routes only happy clients to review sites", icon: "⭐" },
      { name: "Multi-company switching", description: "Manage multiple brands from a single dashboard", icon: "🔀" },
      { name: "Weather alerts", description: "Automatic notifications for outdoor job conditions", icon: "🌦️" },
      { name: "Seasonal pricing per month", description: "Set different rates for peak and off-peak seasons", icon: "📆" },
      { name: "Promo codes & coupons", description: "Create discounts to attract and retain clients", icon: "🏷️" },
      { name: "Client messaging", description: "SMS, WhatsApp, and in-app messaging in one inbox", icon: "💬" },
    ],
  },
  {
    key: "clients",
    label: "Clients",
    color: "#AF52DE",
    gradientFrom: "from-purple-500/[0.06]",
    gradientTo: "to-purple-500/[0.02]",
    borderColor: "border-purple-200/60",
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-600",
    iconBg: "bg-purple-500/10",
    features: [
      { name: "Client portal", description: "View jobs, approve work, and pay from one place", icon: "🏠" },
      { name: "STR integrations", description: "Airbnb, VRBO, Hospitable, Hostaway, Guesty", icon: "🔗" },
      { name: "Auto-pay setup", description: "Set it and forget it with automatic billing", icon: "🔄" },
      { name: "Before/after photo review", description: "See visual proof of completed work instantly", icon: "🖼️" },
      { name: "Tip your worker", description: "Show appreciation with in-app tipping", icon: "💵" },
      { name: "Pause/skip recurring services", description: "Flexible scheduling for vacations and breaks", icon: "⏸️" },
      { name: 'Live worker tracking', description: '"10 min away" — know exactly when they arrive', icon: "🗺️" },
      { name: "Document storage per property", description: "Gate codes, WiFi passwords, and special instructions", icon: "📁" },
      { name: "Invite companies to join KleanHQ", description: "Bring your favorite service providers on the platform", icon: "✉️" },
      { name: "Co-client access", description: "Share with partner, property manager, or assistant", icon: "👥" },
      { name: "Price transparency on all jobs", description: "Clear pricing with no hidden fees or surprises", icon: "💎" },
      { name: "Service request from portal", description: "Request one-off or recurring services in seconds", icon: "🛎️" },
    ],
  },
  {
    key: "workers",
    label: "Workers",
    color: "#FF6B6B",
    gradientFrom: "from-red-400/[0.06]",
    gradientTo: "to-red-400/[0.02]",
    borderColor: "border-red-200/60",
    badgeBg: "bg-red-400/10",
    badgeText: "text-red-500",
    iconBg: "bg-red-400/10",
    features: [
      { name: "Mobile-first app", description: "Built with iOS-quality design and feel", icon: "📱" },
      { name: "One-tap workflow", description: "Drive \u2192 Arrive \u2192 Upload \u2192 End in seconds", icon: "👆" },
      { name: "In-app camera with timestamp", description: "Overlay date, time, and location on every photo", icon: "🕐" },
      { name: "Video capture", description: "Record walkthrough videos for complete documentation", icon: "🎥" },
      { name: "Offline mode", description: "Download today\u2019s schedule and work without signal", icon: "📶" },
      { name: "Expense tracking with receipts", description: "Snap receipt photos and log expenses on the go", icon: "🧮" },
      { name: "Job checklists", description: "Never miss a step with guided task lists", icon: "📋" },
      { name: "Voice-powered AI assistant", description: "Hands-free job updates and note-taking", icon: "🎙️" },
      { name: "Portfolio auto-built", description: "Showcase your best work from completed jobs", icon: "🖼️" },
    ],
  },
  {
    key: "marketplace",
    label: "Marketplace",
    color: "#FF9F0A",
    gradientFrom: "from-orange-400/[0.06]",
    gradientTo: "to-orange-400/[0.02]",
    borderColor: "border-orange-200/60",
    badgeBg: "bg-orange-400/10",
    badgeText: "text-orange-600",
    iconBg: "bg-orange-400/10",
    features: [
      { name: '"Find a Pro"', description: "Clients search for service providers by category and location", icon: "🔍" },
      { name: "Independent Pro registration", description: "Free sign-up for solo professionals", icon: "🆓" },
      { name: "Referral system", description: "6 viral loops to grow your business organically", icon: "🔁" },
      { name: "Share to Instagram", description: "Auto-generated images from completed jobs", icon: "📤" },
      { name: "Waitlist with share-to-move-up", description: "Viral waitlist mechanics for early access", icon: "🚀" },
      { name: "Client self-service booking", description: "Let clients book directly from your page", icon: "🗓️" },
      { name: "Reseller white-label program", description: "Offer KleanHQ under your own brand", icon: "🏪" },
      { name: "Custom subdomains & domains", description: "Your brand, your URL, your identity", icon: "🌐" },
    ],
  },
] as const;

function FeatureCard({
  feature,
  tab,
  index,
}: {
  readonly feature: Feature;
  readonly tab: Tab;
  readonly index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.03, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group relative rounded-2xl border bg-gradient-to-br ${tab.gradientFrom} ${tab.gradientTo} ${tab.borderColor} p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-opacity-80`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tab.iconBg} text-lg transition-transform duration-200 group-hover:scale-110`}
        >
          {feature.icon}
        </div>
        <div className="min-w-0">
          <p
            className="text-sm font-semibold text-[#1C1C1E] leading-snug"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {feature.name}
          </p>
          <p
            className="mt-0.5 text-xs text-[#6E6E73] leading-relaxed"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SegmentedControl({
  tabs,
  activeKey,
  onSelect,
}: {
  readonly tabs: readonly Tab[];
  readonly activeKey: string;
  readonly onSelect: (key: string) => void;
}) {
  return (
    <div className="relative mx-auto inline-flex rounded-2xl bg-[#E5E5EA]/70 p-1 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onSelect(tab.key)}
            className={`relative z-10 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 sm:px-5 ${
              isActive ? "text-white" : "text-[#6E6E73] hover:text-[#3A3A3C]"
            }`}
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-bg"
                className="absolute inset-0 rounded-xl shadow-lg"
                style={{ backgroundColor: tab.color }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            <span
              className={`relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                isActive
                  ? "bg-white/20 text-white"
                  : `${tab.badgeBg} ${tab.badgeText}`
              }`}
            >
              {tab.features.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MobileTabSelect({
  tabs,
  activeKey,
  onSelect,
}: {
  readonly tabs: readonly Tab[];
  readonly activeKey: string;
  readonly onSelect: (key: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onSelect(tab.key)}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isActive ? "text-white shadow-lg" : "bg-[#E5E5EA]/70 text-[#6E6E73]"
            }`}
            style={{
              fontFamily: "var(--font-outfit)",
              ...(isActive ? { backgroundColor: tab.color } : {}),
            }}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                isActive ? "bg-white/20 text-white" : `${tab.badgeBg} ${tab.badgeText}`
              }`}
            >
              {tab.features.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function FullFeatureList() {
  const [activeKey, setActiveKey] = useState("companies");
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const activeTab = TABS.find((t) => t.key === activeKey) ?? TABS[0];
  const totalFeatures = TABS.reduce((sum, t) => sum + t.features.length, 0);

  return (
    <section ref={sectionRef} className="relative py-24 px-4 bg-[#F2F2F7] overflow-hidden">
      {/* COMING SOON floating badge */}
      <div className="absolute top-8 right-8 z-10 hidden sm:block">
        <div className="rounded-full bg-[#1C1C1E] px-4 py-1.5 shadow-xl">
          <span
            className="text-xs font-bold tracking-widest text-white/90"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            COMING SOON
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-[40px] font-extrabold text-[#1C1C1E] mb-3"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Built for the field
          </h2>
          <p
            className="text-[#6E6E73] text-base sm:text-lg"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Everything your team needs, nothing it doesn&apos;t
          </p>
        </div>

        {/* Desktop segmented control */}
        <div className="hidden sm:flex justify-center mb-10">
          <SegmentedControl tabs={TABS} activeKey={activeKey} onSelect={setActiveKey} />
        </div>

        {/* Mobile tab pills */}
        <div className="sm:hidden mb-8">
          <MobileTabSelect tabs={TABS} activeKey={activeKey} onSelect={setActiveKey} />
        </div>

        {/* Feature cards grid */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeKey}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {activeTab.features.map((feature, i) => (
                <FeatureCard
                  key={feature.name}
                  feature={feature}
                  tab={activeTab}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-14 text-center"
        >
          <p
            className="text-[#6E6E73] text-sm mb-5"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <span
              className="text-[#1C1C1E] font-bold text-base"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {totalFeatures}+ features
            </span>{" "}
            and counting
          </p>
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 rounded-full bg-[#1C1C1E] px-8 py-3.5 text-sm font-semibold text-white shadow-xl transition-all duration-200 hover:bg-[#3A3A3C] hover:shadow-2xl hover:scale-105 active:scale-[0.98]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Join Waitlist
            <span className="text-white/70">&rarr;</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
