'use client';

import { motion } from 'framer-motion';

interface Segment {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  segments,
  value,
  onChange,
  className = '',
}: SegmentedControlProps) {
  return (
    <div
      className={`inline-flex p-1 rounded-[10px] bg-[#F2F2F7] ${className}`}
    >
      {segments.map((seg) => {
        const isActive = seg.value === value;
        return (
          <button
            key={seg.value}
            type="button"
            onClick={() => onChange(seg.value)}
            className="relative px-4 min-h-[36px] min-w-[44px] rounded-[8px] text-sm font-semibold transition-colors z-0"
          >
            {isActive && (
              <motion.div
                layoutId="segment-indicator"
                className="absolute inset-0 bg-white rounded-[8px] shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 ${
                isActive ? 'text-[#1C1C1E]' : 'text-[#8E8E93]'
              }`}
            >
              {seg.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
