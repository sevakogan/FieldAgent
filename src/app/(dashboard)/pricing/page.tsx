"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TIERS, getTier, type Tier } from "@/lib/pricing";

// ─── Tier progress bar ────────────────────────────────────────────
function TierProgressBar({ detectedTier }: { readonly detectedTier: Tier }) {
  return (
    <div className="mt-6 flex gap-1">
      {TIERS.map((t) => {
        const isActive = t.id === detectedTier.id;
        const isPast = TIERS.indexOf(t) < TIERS.indexOf(detectedTier);
        return (
          <div key={t.id} className="flex-1">
            <div
              className={`h-1 rounded-full ${
                isActive
                  ? "bg-green-500"
                  : isPast
                  ? "bg-white/30"
                  : "bg-white/[0.08]"
              }`}
            />
            <div
              className={`mt-1.5 text-[9px] font-bold tracking-wide ${
                isActive ? "text-green-500" : "text-white/25"
              }`}
            >
              {t.label.toUpperCase()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Property calculator (dark hero) ─────────────────────────────
function PropertyCalculator({
  currentProps,
  onChangeProps,
}: {
  readonly currentProps: number;
  readonly onChangeProps: (n: number) => void;
}) {
  const detectedTier = getTier(currentProps);
  const nextTier = TIERS[TIERS.indexOf(detectedTier) + 1];

  return (
    <div className="bg-[#111] rounded-3xl px-8 py-7 mb-8 text-white">
      <div className="flex items-center justify-between flex-wrap gap-5">
        {/* Left — input */}
        <div className="flex-1 min-w-[220px]">
          <div className="text-[11px] font-bold tracking-[1.5px] text-white/40 mb-2">
            HOW MANY PROPERTIES?
          </div>
          <div className="text-[13px] text-white/50 mb-4 leading-relaxed">
            Each unique address counts as one property. Enter your current count
            to see your plan.
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={500}
              value={currentProps}
              onChange={(e) =>
                onChangeProps(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-[90px] bg-white/[0.08] border border-white/15 rounded-[10px] py-2.5 px-3.5 text-xl font-extrabold text-white outline-none text-center"
            />
            <span className="text-sm text-white/40">properties</span>
          </div>
        </div>

        {/* Right — detected plan */}
        <div className="text-right">
          <div className="text-[11px] font-bold tracking-wide text-white/40 mb-2">
            YOUR PLAN
          </div>
          <div className="text-[36px] font-black tracking-[-1.5px] leading-none mb-1">
            {detectedTier.price ? `$${detectedTier.price}` : "Custom"}
            {detectedTier.price && (
              <span className="text-sm font-normal text-white/40">/mo</span>
            )}
          </div>
          <div className="text-base font-bold text-white/70 mb-1">
            {detectedTier.label}
          </div>
          <div className="text-[12px] text-white/35">
            {detectedTier.max === Infinity
              ? `${detectedTier.min}+ properties`
              : `${detectedTier.min}–${detectedTier.max} properties`}
          </div>
          {detectedTier.max !== Infinity && nextTier && (
            <div className="text-[11px] text-white/30 mt-2">
              {detectedTier.max - currentProps + 1} more properties →{" "}
              {nextTier.label}
            </div>
          )}
        </div>
      </div>

      <TierProgressBar detectedTier={detectedTier} />
    </div>
  );
}

// ─── Single tier card ─────────────────────────────────────────────
function TierCard({
  tier,
  isActive,
}: {
  readonly tier: Tier;
  readonly isActive: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 transition-all duration-200 ${
        isActive
          ? "bg-[#111] text-white shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
          : "bg-white text-[#111] shadow-sm"
      }`}
    >
      {/* Badge */}
      {tier.popular && !isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111] text-white rounded-full px-3 py-0.5 text-[10px] font-extrabold whitespace-nowrap">
          MOST POPULAR
        </div>
      )}
      {isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white rounded-full px-3 py-0.5 text-[10px] font-extrabold whitespace-nowrap">
          YOUR PLAN
        </div>
      )}

      {/* Tier name */}
      <div className="text-[11px] font-bold opacity-40 tracking-wide mb-2.5">
        {tier.label.toUpperCase()}
      </div>

      {/* Price */}
      <div className="mb-1.5">
        <span className="text-[36px] font-black tracking-[-1.5px] leading-none">
          {tier.price ? `$${tier.price}` : "Custom"}
        </span>
        {tier.price && (
          <span className="text-[12px] opacity-40 font-normal">/mo</span>
        )}
      </div>

      {/* Property range */}
      <div className="text-[12px] opacity-50 mb-1">
        {tier.max === Infinity
          ? `${tier.min}+ properties`
          : `${tier.min}–${tier.max} properties`}
      </div>

      {/* Tagline */}
      <div className="text-[12px] opacity-60 mb-5 leading-relaxed">
        {tier.tagline}
      </div>

      {/* Features */}
      <div className="mb-5 space-y-2">
        {tier.features.map((f) => (
          <div key={f} className="flex items-start gap-2">
            <span className="text-[12px] text-green-500 shrink-0 mt-px">
              ✓
            </span>
            <span className="text-[12px] opacity-75 leading-snug">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        className={`w-full rounded-xl py-2.5 text-[13px] font-bold transition-all duration-150 ${
          isActive
            ? "bg-white text-[#111] border-0"
            : tier.id === "enterprise"
            ? "bg-[#111] text-white border-0"
            : "bg-transparent text-[#555] border border-gray-200 hover:border-gray-300"
        }`}
      >
        {tier.cta}
      </button>
    </div>
  );
}

// ─── Property rule callout ────────────────────────────────────────
function PropertyRuleCallout() {
  return (
    <Card padding="lg" className="mb-5 flex gap-4 items-start">
      <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-[22px] shrink-0">
        📍
      </div>
      <div>
        <div className="font-extrabold text-[15px] mb-1.5">
          Different address = different property
        </div>
        <div className="text-[13px] text-gray-500 leading-7">
          Each unique service address counts as one property — regardless of who
          owns it. A client with a home, a rental, and a commercial unit is 3
          properties. Your tier updates automatically when you add or remove
          addresses. You&apos;re never charged mid-cycle — changes apply on your
          next billing date.
        </div>
      </div>
    </Card>
  );
}

// ─── Referral CTA ─────────────────────────────────────────────────
function ReferralCta() {
  return (
    <div className="bg-green-50 rounded-2xl p-6 shadow-sm flex items-center gap-4 flex-wrap">
      <span className="text-[32px]">🎁</span>
      <div className="flex-1 min-w-[180px]">
        <div className="font-extrabold text-[15px] mb-1">
          Refer an owner, get 30 days free
        </div>
        <div className="text-[12px] text-gray-500 leading-relaxed">
          Every owner you refer gets 45 days free. When they become a paying
          subscriber, you get 30 days free on your next billing cycle. Refer 5
          paying owners and unlock a milestone reward.
        </div>
      </div>
      <Link
        href="/referrals"
        className="shrink-0 bg-[#111] text-white rounded-[10px] px-5 py-2.5 text-[13px] font-bold inline-flex items-center gap-1.5 hover:opacity-85 transition-opacity"
      >
        View Referrals
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function PricingPage() {
  const [currentProps, setCurrentProps] = useState(8);
  const detectedTier = getTier(currentProps);

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-extrabold text-lg tracking-tight">Pricing</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Simple tiers · different address = different property
        </p>
      </div>

      {/* Property calculator */}
      <PropertyCalculator
        currentProps={currentProps}
        onChangeProps={setCurrentProps}
      />

      {/* Tier cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-8">
        {TIERS.map((t) => (
          <TierCard key={t.id} tier={t} isActive={t.id === detectedTier.id} />
        ))}
      </div>

      {/* Property rule callout */}
      <PropertyRuleCallout />

      {/* Referral CTA */}
      <ReferralCta />
    </>
  );
}
