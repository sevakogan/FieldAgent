"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ─── Types ─── */

interface Screen {
  readonly id: number;
  readonly label: string;
  readonly component: () => React.ReactNode;
}

/* ─── Status Bar ─── */

function StatusBar({ dark = false }: { readonly dark?: boolean }) {
  const textColor = dark ? "text-white" : "text-[#1C1C1E]";
  return (
    <div className={`flex items-center justify-between px-5 pt-2 pb-1 text-[10px] font-semibold ${textColor}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <div className="flex gap-[2px]">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-[3px] rounded-sm ${dark ? "bg-white" : "bg-[#1C1C1E]"}`}
              style={{ height: 4 + i * 2, opacity: i <= 3 ? 1 : 0.3 }}
            />
          ))}
        </div>
        <span className="ml-1">100%</span>
        <div className={`w-5 h-2.5 rounded-sm border ${dark ? "border-white" : "border-[#1C1C1E]"} relative`}>
          <div
            className={`absolute inset-[1px] rounded-[1px] ${dark ? "bg-white" : "bg-[#1C1C1E]"}`}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Screen 1: Client View — My Properties ─── */

function Screen1_Properties() {
  return (
    <div className="h-full bg-[#F2F2F7] flex flex-col">
      <StatusBar />
      {/* Header */}
      <div className="px-5 pt-2 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[10px] text-[#8E8E93]">Good morning, Mrs. Chen</p>
            <h2 className="text-[16px] font-bold text-[#1C1C1E] tracking-tight">
              My Properties
            </h2>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">KC</span>
          </div>
        </div>
      </div>

      {/* Property Card */}
      <div className="px-4 flex-1">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.04]">
          {/* Map placeholder */}
          <div className="h-24 bg-gradient-to-br from-[#E8F0FE] to-[#D4E4FA] rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute border-b border-[#007AFF]/20"
                  style={{ top: `${15 + i * 16}%`, left: 0, right: 0 }}
                />
              ))}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute border-r border-[#007AFF]/20"
                  style={{ left: `${10 + i * 20}%`, top: 0, bottom: 0 }}
                />
              ))}
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-[20px] mb-0.5">📍</div>
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[8px] font-medium text-[#1C1C1E] shadow-sm">
                123 Ocean Drive
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[13px] font-semibold text-[#1C1C1E]">
                🏠 123 Ocean Drive, Miami
              </p>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">
                Pool Service · Weekly
              </p>
            </div>
            <span className="px-2.5 py-1 bg-[#34C759]/10 rounded-full text-[10px] font-semibold text-[#34C759]">
              Scheduled ✓
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5EA]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
            <p className="text-[11px] text-[#1C1C1E]">
              <span className="font-medium">Next:</span> Tomorrow, 9:00 AM
            </p>
          </div>
        </div>

        {/* Second property hint */}
        <div className="bg-white/60 rounded-2xl p-4 mt-3 border border-black/[0.04]">
          <p className="text-[12px] font-medium text-[#8E8E93]">
            🏡 456 Palm Ave, Miami Beach
          </p>
          <p className="text-[10px] text-[#AEAEB2] mt-0.5">
            Lawn Care · Bi-weekly
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <BottomTabBar activeTab="Home" />
    </div>
  );
}

/* ─── Screen 2: Worker Arrives ─── */

function Screen2_WorkerArrives() {
  return (
    <div className="h-full bg-[#F2F2F7] flex flex-col">
      <StatusBar />

      {/* Push notification */}
      <div className="px-3 pt-1 mb-2">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl p-3 shadow-lg border border-black/[0.04] flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-[#007AFF] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[12px]">🔔</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[#1C1C1E]">
              KleanHQ
            </p>
            <p className="text-[10px] text-[#8E8E93] truncate">
              Jose is 10 min away from your property
            </p>
          </div>
          <span className="text-[9px] text-[#AEAEB2] flex-shrink-0">now</span>
        </motion.div>
      </div>

      {/* Map view */}
      <div className="flex-1 mx-3 mb-2 relative">
        <div className="h-full bg-gradient-to-b from-[#D4E4FA] to-[#E8F0FE] rounded-2xl overflow-hidden relative">
          {/* Grid lines for map feel */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute border-b border-[#007AFF]/30"
                style={{ top: `${i * 14}%`, left: 0, right: 0 }}
              />
            ))}
            {[...Array(6)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute border-r border-[#007AFF]/30"
                style={{ left: `${i * 20}%`, top: 0, bottom: 0 }}
              />
            ))}
          </div>

          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M 30 35 Q 45 50 55 55 T 70 72"
              fill="none"
              stroke="#007AFF"
              strokeWidth="1.5"
              strokeDasharray="3,2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </svg>

          {/* Worker dot (moving) */}
          <motion.div
            className="absolute z-10"
            initial={{ left: "25%", top: "28%" }}
            animate={{ left: "42%", top: "42%" }}
            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          >
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-[#007AFF] border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#007AFF]/20 rounded-full blur-[2px]" />
            </div>
          </motion.div>

          {/* Destination pin */}
          <div className="absolute right-[22%] bottom-[22%] z-10">
            <div className="text-[22px] drop-shadow-md">📍</div>
          </div>
        </div>
      </div>

      {/* Worker card */}
      <div className="mx-3 mb-2">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9500] to-[#FF6B00] flex items-center justify-center">
              <span className="text-white text-[12px] font-bold">JR</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-[#1C1C1E]">
                  Jose Rodriguez
                </p>
                <span className="text-[10px] text-[#FF9500] font-medium">
                  ⭐ 4.9
                </span>
              </div>
              <p className="text-[10px] text-[#007AFF] font-medium">En route</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#8E8E93]">ETA</p>
              <p className="text-[12px] font-semibold text-[#1C1C1E]">9:00 AM</p>
            </div>
          </div>
        </div>
      </div>

      <BottomTabBar activeTab="Track" />
    </div>
  );
}

/* ─── Screen 3: Before & After Photos ─── */

function Screen3_BeforeAfter() {
  return (
    <div className="h-full bg-white flex flex-col">
      <StatusBar />
      <div className="px-4 pt-2 pb-2">
        <p className="text-[10px] text-[#8E8E93]">Pool Service · 123 Ocean Drive</p>
        <h2 className="text-[15px] font-bold text-[#1C1C1E] tracking-tight">
          Job Photos
        </h2>
      </div>

      {/* Before / After split */}
      <div className="px-4 flex gap-2 mb-3">
        {/* Before */}
        <div className="flex-1">
          <div className="h-32 bg-gradient-to-b from-[#B8D4E3] to-[#8FB8CC] rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[28px]">🍂</span>
            </div>
            {/* Scattered leaves */}
            <div className="absolute top-3 left-4 text-[12px] rotate-12">🍃</div>
            <div className="absolute bottom-8 right-3 text-[10px] -rotate-6">🍂</div>
            <div className="absolute top-8 right-6 text-[8px] rotate-45">🍃</div>
          </div>
          <div className="mt-1.5 text-center">
            <span className="text-[9px] font-bold text-[#FF3B30] tracking-wider uppercase">
              Before
            </span>
          </div>
        </div>

        {/* After */}
        <div className="flex-1">
          <div className="h-32 bg-gradient-to-b from-[#4FC3F7] to-[#29B6F6] rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[28px]">✨</span>
            </div>
            {/* Water shimmer */}
            <div className="absolute top-4 left-5 text-[10px]">💧</div>
            <div className="absolute bottom-6 right-4 text-[8px]">✨</div>
          </div>
          <div className="mt-1.5 text-center">
            <span className="text-[9px] font-bold text-[#34C759] tracking-wider uppercase">
              After
            </span>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mx-4 mb-3 flex items-center gap-2">
        <div className="flex-1 h-px bg-[#E5E5EA]" />
        <span className="text-[9px] text-[#AEAEB2] font-medium">
          9:47 AM · GPS verified
        </span>
        <div className="flex-1 h-px bg-[#E5E5EA]" />
      </div>

      {/* Worker info */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF9500] to-[#FF6B00] flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">JR</span>
          </div>
          <p className="text-[11px] text-[#1C1C1E]">
            <span className="font-semibold">Jose R.</span>
            <span className="text-[#8E8E93]"> · Pool Chemical Balance</span>
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="px-4 flex-1">
        <div className="bg-[#F2F2F7] rounded-xl p-3 space-y-2">
          {[
            "Skim debris",
            "Check pH levels",
            "Add chlorine",
            "Brush walls",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#34C759] flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[11px] text-[#1C1C1E]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomTabBar activeTab="Jobs" />
    </div>
  );
}

/* ─── Screen 4: Client Approves & Pays ─── */

function Screen4_ApproveAndPay() {
  return (
    <div className="h-full bg-white flex flex-col">
      <StatusBar />
      <div className="flex-1 px-4 pt-3 flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-[28px] mb-1">🎉</div>
          <h2 className="text-[16px] font-bold text-[#1C1C1E]">Job Complete!</h2>
          <p className="text-[11px] text-[#8E8E93] mt-0.5">
            Jose finished your pool service
          </p>
        </div>

        {/* Before/After thumbnails */}
        <div className="flex gap-2 mb-4 justify-center">
          <div className="w-16 h-16 bg-gradient-to-b from-[#B8D4E3] to-[#8FB8CC] rounded-lg flex items-center justify-center">
            <span className="text-[14px]">🍂</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-[#AEAEB2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <div className="w-16 h-16 bg-gradient-to-b from-[#4FC3F7] to-[#29B6F6] rounded-lg flex items-center justify-center">
            <span className="text-[14px]">✨</span>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-[#F2F2F7] rounded-2xl p-4 mb-4 text-center">
          <p className="text-[10px] text-[#8E8E93] mb-1">Amount Due</p>
          <p className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">
            $85.00
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#F2F2F7] rounded-xl text-[11px] font-semibold text-[#007AFF]">
            💬 Message Jose
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#007AFF] rounded-xl text-[11px] font-semibold text-white">
            ✅ Approve & Pay
          </button>
        </div>

        {/* Tip option */}
        <div className="text-center">
          <p className="text-[10px] text-[#8E8E93] mb-2">Add a tip?</p>
          <div className="flex gap-2 justify-center">
            {["$5", "$10", "$20", "Custom"].map((tip) => (
              <button
                key={tip}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-colors ${
                  tip === "$10"
                    ? "bg-[#007AFF] text-white"
                    : "bg-[#F2F2F7] text-[#1C1C1E]"
                }`}
              >
                {tip}
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomTabBar activeTab="Jobs" />
    </div>
  );
}

/* ─── Screen 5: Worker Gets Paid (Dark Theme) ─── */

function Screen5_WorkerPaid() {
  return (
    <div className="h-full bg-[#1C1C1E] flex flex-col">
      <StatusBar dark />
      <div className="flex-1 px-4 pt-3 flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-[28px] mb-1">💰</div>
          <h2 className="text-[16px] font-bold text-white">Payment Received!</h2>
        </div>

        {/* Amount card */}
        <div className="bg-[#2C2C2E] rounded-2xl p-4 mb-3 text-center">
          <p className="text-[28px] font-bold text-white tracking-tight">
            $85.00
            <span className="text-[14px] text-[#34C759]"> + $10.00 tip</span>
          </p>
          <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
            <p className="text-[11px] text-[#8E8E93]">
              From: <span className="text-white font-medium">Mrs. Chen</span> · Pool Service
            </p>
            <p className="text-[11px] text-[#8E8E93]">
              Deposited to: <span className="text-white font-medium">····4521</span>
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-[#2C2C2E] rounded-xl p-3 text-center">
            <p className="text-[9px] text-[#8E8E93] mb-0.5">Today</p>
            <p className="text-[16px] font-bold text-white">$340</p>
          </div>
          <div className="flex-1 bg-[#2C2C2E] rounded-xl p-3 text-center">
            <p className="text-[9px] text-[#8E8E93] mb-0.5">This Week</p>
            <p className="text-[16px] font-bold text-white">$1,420</p>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-[#2C2C2E] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD60A] to-[#FF9500] flex items-center justify-center">
            <span className="text-[16px]">⭐</span>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-white">
              Mrs. Chen rated you 5 stars
            </p>
            <div className="flex gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-[10px] text-[#FFD60A]">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dark tab bar */}
      <div className="px-4 py-3 border-t border-white/[0.06] flex justify-around">
        {["Home", "Jobs", "Earnings", "Profile"].map((tab) => (
          <div
            key={tab}
            className={`text-center ${tab === "Earnings" ? "text-[#007AFF]" : "text-[#8E8E93]"}`}
          >
            <div className="w-5 h-5 mx-auto mb-0.5 rounded bg-current opacity-20" />
            <span className="text-[9px] font-medium">{tab}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Shared Tab Bar ─── */

function BottomTabBar({ activeTab }: { readonly activeTab: string }) {
  const tabs = ["Home", "Jobs", "Track", "Messages"];
  return (
    <div className="px-4 py-2 border-t border-[#E5E5EA] bg-white/90 backdrop-blur-sm flex justify-around">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`text-center ${tab === activeTab ? "text-[#007AFF]" : "text-[#8E8E93]"}`}
        >
          <div className="w-5 h-5 mx-auto mb-0.5 rounded bg-current opacity-20" />
          <span className="text-[9px] font-medium">{tab}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Screen Data ─── */

const SCREENS: readonly Screen[] = [
  { id: 0, label: "Your Home", component: Screen1_Properties },
  { id: 1, label: "Worker Arrives", component: Screen2_WorkerArrives },
  { id: 2, label: "Before & After", component: Screen3_BeforeAfter },
  { id: 3, label: "Approve & Pay", component: Screen4_ApproveAndPay },
  { id: 4, label: "Worker Gets Paid", component: Screen5_WorkerPaid },
] as const;

const AUTO_ADVANCE_MS = 4000;

/* ─── Main Component ─── */

export default function AppWalkthrough() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToScreen = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SCREENS.length);
  }, []);

  /* Auto-advance timer */
  useEffect(() => {
    if (!isInView || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(goNext, AUTO_ADVANCE_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isInView, isPaused, goNext]);

  /* Pause on hover / touch, resume on leave */
  const handlePause = useCallback(() => setIsPaused(true), []);
  const handleResume = useCallback(() => setIsPaused(false), []);

  const handlePhoneClick = useCallback(() => {
    goNext();
    /* Reset timer on manual click */
    setIsPaused(false);
  }, [goNext]);

  const ActiveScreenComponent = SCREENS[activeIndex]?.component ?? Screen1_Properties;

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p
            className="text-[#007AFF] text-sm font-semibold mb-3 tracking-wide uppercase"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            App Preview
          </p>
          <h2
            className="text-3xl sm:text-[40px] font-extrabold text-[#1C1C1E] leading-tight"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            See KleanHQ in action
          </h2>
          <p
            className="text-[#636366] text-base mt-3 max-w-md mx-auto"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            From booking to payment — one seamless experience for clients and workers.
          </p>
        </motion.div>

        {/* Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div
            className="relative mx-auto cursor-pointer"
            style={{ width: 300, height: 600 }}
            onMouseEnter={handlePause}
            onMouseLeave={handleResume}
            onClick={handlePhoneClick}
            role="button"
            tabIndex={0}
            aria-label={`App walkthrough screen ${activeIndex + 1} of ${SCREENS.length}. Click to advance.`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePhoneClick();
              }
            }}
          >
            {/* Phone bezel */}
            <div className="absolute inset-0 rounded-[40px] bg-[#1d1d1f] shadow-2xl shadow-black/30" />

            {/* Screen area */}
            <div className="absolute top-[12px] left-[12px] right-[12px] bottom-[12px] rounded-[30px] bg-white overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[24px] bg-[#1d1d1f] rounded-b-2xl z-20" />

              {/* Screen Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <ActiveScreenComponent />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-white/20 rounded-full" />
          </div>
        </motion.div>

        {/* Screen label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="text-center mb-4"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={activeIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-semibold text-[#1C1C1E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {SCREENS[activeIndex]?.label}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {SCREENS.map((screen, i) => (
            <button
              key={screen.id}
              onClick={() => goToScreen(i)}
              aria-label={`Go to screen: ${screen.label}`}
              className="relative p-1"
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "bg-[#007AFF] scale-125"
                    : "bg-[#D1D1D6] hover:bg-[#AEAEB2]"
                }`}
              />
            </button>
          ))}
        </div>

        {/* CTA area */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p
            className="text-[#636366] text-base mb-5"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            See the full experience on launch day
          </p>
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("waitlist")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#007AFF] to-[#AF52DE] text-white font-semibold text-base rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-[#007AFF]/20"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Join Waitlist
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>

          {/* View labels */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {[
              { label: "Client View", color: "#007AFF" },
              { label: "Worker View", color: "#FF6B6B" },
              { label: "AI Assistant", color: "#AF52DE" },
            ].map((badge) => (
              <span
                key={badge.label}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-white"
                style={{
                  backgroundColor: badge.color,
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
