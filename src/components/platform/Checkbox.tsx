'use client';

import { motion } from 'framer-motion';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  return (
    <label
      className={`inline-flex items-center gap-3 min-h-[44px] ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[8px]
          border-2 transition-colors duration-150
          ${
            checked
              ? 'bg-[#007AFF] border-[#007AFF]'
              : 'bg-white border-[#D1D1D6]'
          }
        `}
      >
        <motion.svg
          initial={false}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </button>
      {label && (
        <span className="text-sm font-medium text-[#1C1C1E]">{label}</span>
      )}
    </label>
  );
}
