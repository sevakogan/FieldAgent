"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useEffect } from "react";

interface StatItem {
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
}

const STATS: readonly StatItem[] = [
  { value: 95, suffix: "+", label: "Features" },
  { value: 6, suffix: "", label: "User Types" },
  { value: 8, suffix: "", label: "Integrations" },
  { value: 5, suffix: "", label: "Revenue Streams" },
] as const;

function AnimatedNumber({
  value,
  suffix,
  shouldAnimate,
  delay,
}: {
  readonly value: number;
  readonly suffix: string;
  readonly shouldAnimate: boolean;
  readonly delay: number;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    if (!shouldAnimate) return;

    const timeout = setTimeout(() => {
      const controls = animate(motionValue, value, {
        duration: 1.2,
        ease: [0, 0, 0.58, 1] as const,
      });
      return () => controls.stop();
    }, delay);

    return () => clearTimeout(timeout);
  }, [shouldAnimate, value, delay, motionValue]);

  return (
    <span className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 bg-gradient-to-br from-[#007AFF]/5 via-[#AF52DE]/5 to-[#5AC8FA]/5"
    >
      <div className="max-w-[980px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={
                isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.4, delay: i * 0.2 }}
            >
              <div
                className="text-[36px] md:text-[48px] font-bold tracking-[-0.03em] text-[#1C1C1E]"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  shouldAnimate={isInView}
                  delay={i * 200}
                />
              </div>
              <div
                className="text-sm text-[#AEAEB2] font-medium mt-1"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}

          {/* Infinity symbol - special case */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 4 * 0.2 }}
          >
            <div
              className="text-[36px] md:text-[48px] font-bold tracking-[-0.03em] text-[#1C1C1E]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              &infin;
            </div>
            <div
              className="text-sm text-[#AEAEB2] font-medium mt-1"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Viral Loops
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
