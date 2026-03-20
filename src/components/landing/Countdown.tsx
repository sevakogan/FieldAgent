"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCountdown } from "@/hooks/useCountdown";

interface TimeBlockProps {
  readonly value: number;
  readonly label: string;
}

function TimeBlock({ value, label }: TimeBlockProps) {
  const display = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-24 sm:w-28 sm:h-32 bg-white rounded-2xl shadow-sm border border-[#E5E5EA] overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.42, 0, 0.58, 1] as const }}
            className="text-4xl sm:text-5xl font-bold text-[#1C1C1E]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span
        className="text-xs sm:text-sm font-medium text-[#AEAEB2] uppercase tracking-wider"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const { days, hours, minutes, seconds } = useCountdown();

  const blocks = [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
    { value: seconds, label: "Seconds" },
  ] as const;

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      {blocks.map((block) => (
        <TimeBlock key={block.label} value={block.value} label={block.label} />
      ))}
    </div>
  );
}
