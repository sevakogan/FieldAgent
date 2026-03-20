'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizeMap: Record<string, number> = {
  sm: 20,
  md: 32,
  lg: 48,
};

export function LoadingSpinner({
  size = 'md',
  color = '#007AFF',
  className = '',
}: LoadingSpinnerProps) {
  const px = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      <motion.svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={0.2}
        />
        <path
          d="M12 2a10 10 0 019.8 8"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
}
