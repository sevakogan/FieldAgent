"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const PROS = [
  {
    name: "Carlos Rivera",
    rating: 4.9,
    reviews: 87,
    services: ["Pool Cleaning", "Chemical Balance"],
    priceRange: "$45–$90",
    distance: "2.3 mi",
    initials: "CR",
    color: "#007AFF",
  },
  {
    name: "Maria Santos",
    rating: 5.0,
    reviews: 124,
    services: ["Deep Clean", "Turnover Ready"],
    priceRange: "$80–$150",
    distance: "3.1 mi",
    initials: "MS",
    color: "#AF52DE",
  },
  {
    name: "James Thompson",
    rating: 4.8,
    reviews: 56,
    services: ["Lawn Mowing", "Landscaping"],
    priceRange: "$35–$75",
    distance: "1.7 mi",
    initials: "JT",
    color: "#5AC8FA",
  },
] as const;

function StarRating({ rating, reviews }: { readonly rating: number; readonly reviews: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${
              i < Math.floor(rating) ? "text-[#FFD60A]" : "text-[#E5E5EA]"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs font-semibold text-[#1C1C1E]">{rating}</span>
      <span className="text-xs text-[#AEAEB2]">({reviews})</span>
    </div>
  );
}

function ProCard({
  pro,
  index,
}: {
  readonly pro: (typeof PROS)[number];
  readonly index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0, 0, 0.58, 1] as const }}
      className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#E5E5EA]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow"
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: pro.color }}
        >
          {pro.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-[#1C1C1E] text-[15px] truncate">
              {pro.name}
            </h4>
            <span className="text-xs text-[#AEAEB2] flex-shrink-0">
              {pro.distance}
            </span>
          </div>
          <StarRating rating={pro.rating} reviews={pro.reviews} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {pro.services.map((service) => (
          <span
            key={service}
            className="px-2.5 py-1 bg-[#F2F2F7] rounded-full text-xs font-medium text-[#636366]"
          >
            {service}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#1C1C1E]">
          {pro.priceRange}
        </span>
        <button
          type="button"
          className="px-4 py-1.5 bg-[#007AFF] text-white text-xs font-semibold rounded-full hover:bg-[#0071E3] transition-colors"
        >
          View Profile
        </button>
      </div>
    </motion.div>
  );
}

export function MarketplacePreview() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2
            className="font-bold text-[32px] md:text-[44px] leading-[1.1] tracking-[-0.03em] text-[#1C1C1E] mb-4"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Need a pro? Find one instantly.
          </h2>

          {/* Mock search bar */}
          <div className="max-w-md mx-auto mt-8 mb-10">
            <div className="flex items-center gap-3 bg-[#F2F2F7] rounded-2xl px-5 py-3.5 border border-[#E5E5EA]/60">
              <svg
                className="w-5 h-5 text-[#AEAEB2] flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span
                className="text-[#AEAEB2] text-[15px]"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                Pool service near Miami, FL
              </span>
            </div>
          </div>
        </div>

        {/* Pro cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {PROS.map((pro, i) => (
            <ProCard key={pro.name} pro={pro} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p
            className="text-[#636366] text-lg mb-6"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Free to register. Get found. Get hired.
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3.5 bg-[#AF52DE] text-white font-semibold text-base rounded-full hover:bg-[#9B3DC8] transition-colors shadow-lg shadow-[#AF52DE]/20"
          >
            Join the Waitlist
          </button>
        </div>
      </div>
    </section>
  );
}
