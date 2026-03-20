"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PLANS = [
  {
    name: "FREE TRIAL",
    price: "Free",
    period: "",
    features: [
      "15 days free (30 if referred)",
      "No credit card required",
      "All features included",
      "Full onboarding support",
    ],
    accent: "#5AC8FA",
    featured: false,
  },
  {
    name: "STANDARD",
    price: "$7",
    period: "/addr/mo",
    features: [
      "All features included",
      "Unlimited users",
      "Volume discounts available",
      "Priority support",
    ],
    accent: "#007AFF",
    featured: true,
  },
  {
    name: "ANNUAL",
    price: "$6.30",
    period: "/addr/mo",
    features: [
      "10% savings vs monthly",
      "Billed yearly",
      "All features included",
      "Dedicated account manager",
    ],
    accent: "#AF52DE",
    featured: false,
  },
] as const;

function PricingCard({
  plan,
  index,
}: {
  readonly plan: (typeof PLANS)[number];
  readonly index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className={`relative rounded-2xl p-7 transition-all duration-200 hover:scale-[1.02] ${
        plan.featured
          ? "bg-[#1C1C1E] text-white shadow-xl shadow-black/10"
          : "bg-white text-[#1C1C1E] border border-[#E5E5EA]/60 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
      }`}
    >
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#007AFF] text-white text-xs font-bold rounded-full">
          MOST POPULAR
        </div>
      )}

      <div
        className={`text-xs font-bold tracking-widest mb-5 ${
          plan.featured ? "text-white/50" : "text-[#AEAEB2]"
        }`}
      >
        {plan.name}
      </div>

      <div className="mb-6">
        <span className="text-[40px] font-bold tracking-[-0.03em]">
          {plan.price}
        </span>
        {plan.period && (
          <span
            className={`text-sm ${
              plan.featured ? "text-white/40" : "text-[#AEAEB2]"
            }`}
          >
            {plan.period}
          </span>
        )}
      </div>

      <ul className="space-y-3 mb-7">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              style={{ color: plan.accent }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span
              className={`text-sm leading-tight ${
                plan.featured ? "text-white/70" : "text-[#636366]"
              }`}
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
          plan.featured
            ? "bg-[#007AFF] text-white hover:bg-[#0071E3]"
            : "bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA]"
        }`}
      >
        Join Waitlist
      </button>
    </motion.div>
  );
}

export function PricingPreview() {
  return (
    <section className="py-20 md:py-28 bg-[#F2F2F7]">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex flex-col items-center gap-4 mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-xs font-bold tracking-widest uppercase">
            Coming Soon
          </span>
          <h2
            className="text-center font-bold text-[32px] md:text-[44px] leading-[1.1] tracking-[-0.03em] text-[#1C1C1E]"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Simple, transparent pricing
          </h2>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[880px] mx-auto mb-12">
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        {/* Notes */}
        <div className="max-w-2xl mx-auto space-y-3 mb-12">
          {[
            {
              icon: "sparkles",
              text: "AI features included at no extra cost during beta.",
            },
            {
              icon: "users",
              text: "Resellers get white-label pricing. Contact us.",
            },
            {
              icon: "heart",
              text: "Indie pros (solo operators) always get the best rate.",
            },
          ].map((note) => (
            <div
              key={note.text}
              className="flex items-center gap-3 text-sm text-[#636366]"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#AEAEB2] flex-shrink-0" />
              {note.text}
            </div>
          ))}
        </div>

        {/* Migration CTA card */}
        <div className="max-w-2xl mx-auto rounded-2xl border-2 border-[#FF9F0A]/30 bg-gradient-to-br from-[#FFF8EF] to-white p-8 text-center">
          <h3
            className="text-xl font-bold text-[#1C1C1E] mb-2"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Switching from Jobber, Housecall Pro, ServiceTitan...?
          </h3>
          <p
            className="text-[#636366] text-sm mb-5"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            We&apos;ll migrate your data for free. Zero downtime. Full support.
          </p>
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 text-[#007AFF] font-semibold text-sm hover:underline"
          >
            Join the Waitlist
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
