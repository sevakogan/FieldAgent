"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface Feature {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly tint: string;
  readonly accent: string;
}

const FEATURES: readonly Feature[] = [
  {
    icon: "\uD83D\uDCC5",
    title: "Schedule & Dispatch",
    description:
      "Assign jobs to your crew. Drag-and-drop calendar. Auto-assign by distance.",
    tint: "bg-gradient-to-br from-blue-50 to-blue-100/60",
    accent: "border-l-4 border-blue-400",
  },
  {
    icon: "\uD83D\uDCF8",
    title: "Photo Verification",
    description:
      "Before & after proof. Timestamp + GPS on every photo. Client sees the transformation.",
    tint: "bg-gradient-to-br from-green-50 to-emerald-100/60",
    accent: "border-l-4 border-green-400",
  },
  {
    icon: "\uD83D\uDCB3",
    title: "Automatic Payments",
    description:
      "Stripe-powered. Per job or monthly. Client approves \u2192 payment fires. Zero chasing.",
    tint: "bg-gradient-to-br from-yellow-50 to-amber-100/60",
    accent: "border-l-4 border-yellow-400",
  },
  {
    icon: "\uD83D\uDD17",
    title: "STR Integrations",
    description:
      "Airbnb, VRBO, Hospitable, Hostaway, Guesty. Checkout \u2192 auto-schedule cleaning.",
    tint: "bg-gradient-to-br from-purple-50 to-violet-100/60",
    accent: "border-l-4 border-purple-400",
  },
  {
    icon: "\uD83E\uDD16",
    title: "AI Assistant",
    description:
      "Ask anything. \u201CWhat\u2019s my schedule today?\u201D Voice input. Role-based. Takes actions for you.",
    tint: "bg-gradient-to-br from-pink-50 to-rose-100/60",
    accent: "border-l-4 border-pink-400",
  },
  {
    icon: "\uD83D\uDD0D",
    title: "Find a Pro",
    description:
      "Marketplace. Clients search for service providers. Pros register free. Get found. Get hired.",
    tint: "bg-gradient-to-br from-teal-50 to-cyan-100/60",
    accent: "border-l-4 border-teal-400",
  },
] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0, 0, 0.58, 1] as const,
    },
  }),
};

function FeatureCard({ feature, index }: { readonly feature: Feature; readonly index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover={{ y: -8, boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
      className={`${feature.tint} ${feature.accent} rounded-2xl p-6 shadow-sm border border-white/60 cursor-default backdrop-blur-sm`}
    >
      <motion.span
        className="text-4xl block mb-4"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring" as const, stiffness: 400, damping: 10 }}
      >
        {feature.icon}
      </motion.span>
      <h3
        className="text-lg font-bold text-[#1C1C1E] mb-2"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {feature.title}
      </h3>
      <p
        className="text-sm text-[#AEAEB2] leading-relaxed"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {feature.description}
      </p>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl sm:text-[40px] font-extrabold text-[#1C1C1E] text-center mb-16"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Everything you need. Nothing you don&apos;t.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        <div className="text-center mt-14">
          <p
            className="text-[#636366] text-lg mb-5"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Join the waitlist to be first in line
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] text-white font-semibold text-base rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-[#007AFF]/20"
          >
            Join Waitlist
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
