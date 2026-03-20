'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  color = '#007AFF',
  showLabel = false,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between">
          <span className="text-xs font-medium text-[#8E8E93]">Progress</span>
          <span className="text-xs font-semibold text-[#1C1C1E]">
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div
        className={`w-full rounded-full bg-[#F2F2F7] overflow-hidden ${sizeClasses[size]}`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
