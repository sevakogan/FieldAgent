'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-[#007AFF] text-white hover:bg-[#0066D6] active:bg-[#0055B3]',
  secondary: 'bg-[#E5E5EA] text-[#1C1C1E] hover:bg-[#D1D1D6] active:bg-[#C7C7CC]',
  ghost: 'bg-transparent text-[#007AFF] hover:bg-[#007AFF]/10 active:bg-[#007AFF]/20',
  danger: 'bg-[#FF3B30] text-white hover:bg-[#E0342B] active:bg-[#CC2D25]',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-[34px] px-3 text-sm rounded-[10px]',
  md: 'h-[44px] px-5 text-base rounded-[12px]',
  lg: 'h-[54px] px-7 text-lg rounded-[14px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-colors duration-150 select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        min-w-[44px] min-h-[44px]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading ? (
        <svg
          className="h-5 w-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
