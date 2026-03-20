'use client';

import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
}: ToggleProps) {
  return (
    <label
      className={`inline-flex items-center gap-3 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-[31px] w-[51px] flex-shrink-0 rounded-full
          transition-colors duration-200
          min-w-[51px] min-h-[44px] items-center
          ${checked ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}
        `}
      >
        <motion.span
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-md"
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-[#1C1C1E]">{label}</span>
      )}
    </label>
  );
}
