"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LiveCounter() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCount() {
      try {
        const res = await fetch("/api/waitlist/count", {
          signal: controller.signal,
        });
        if (res.ok) {
          const data: { total: number } = await res.json();
          setTotal(data.total);
        }
      } catch {
        // Silently fail on abort or network error
      }
    }

    fetchCount();
    return () => controller.abort();
  }, []);

  if (total === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#E5E5EA]/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75 animate-ping" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#34C759]" />
      </span>

      <span
        className="text-sm font-medium text-[#636366]"
        style={{ fontFamily: "DM Sans, sans-serif" }}
      >
        <span className="font-bold text-[#1C1C1E] tabular-nums">{total.toLocaleString()}</span>{" "}
        {total === 1 ? "person" : "people"} on the waitlist
      </span>
    </motion.div>
  );
}
