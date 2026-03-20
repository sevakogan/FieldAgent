"use client";

import { motion } from "framer-motion";

interface SegmentedControlProps {
  readonly options: readonly string[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly className?: string;
}

const LAYOUT_ID = "segmented-indicator";

export function SegmentedControl({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps) {
  return (
    <div className={`inline-flex rounded-xl bg-[#F2F2F7] p-1 ${className}`}>
      {options.map((option) => {
        const isActive = option === value;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`
              relative z-10 rounded-lg px-4 py-2 text-sm font-medium
              transition-colors duration-200 cursor-pointer
              ${isActive ? "text-white" : "text-[#3C3C43]"}
            `}
          >
            {isActive && (
              <motion.div
                layoutId={LAYOUT_ID}
                className="absolute inset-0 rounded-lg bg-[#007AFF]"
                transition={{ type: "spring" as const, stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
