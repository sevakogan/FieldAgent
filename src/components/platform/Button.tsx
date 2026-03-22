'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'purple' | 'gradient' | 'dashed'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  pill?: boolean
  count?: number
}

const VARIANT_STYLES: Record<string, string> = {
  primary: 'bg-[#007AFF] text-white hover:bg-[#0066D6] active:bg-[#0055B3]',
  secondary: 'bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA] active:bg-[#D1D1D6]',
  ghost: 'bg-transparent text-[#007AFF] hover:bg-[#007AFF]/8 active:bg-[#007AFF]/15',
  danger: 'bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/18 active:bg-[#FF3B30]/25',
  success: 'bg-[#34C759]/10 text-[#248A3D] hover:bg-[#34C759]/18 active:bg-[#34C759]/25',
  warning: 'bg-[#FF9F0A]/10 text-[#CC7F08] hover:bg-[#FF9F0A]/18 active:bg-[#FF9F0A]/25',
  purple: 'bg-[#AF52DE]/10 text-[#AF52DE] hover:bg-[#AF52DE]/18 active:bg-[#AF52DE]/25',
  gradient: 'bg-gradient-to-r from-[#AF52DE] to-[#007AFF] text-white hover:opacity-90 active:opacity-80',
  dashed: 'bg-transparent text-[#8E8E93] border-2 border-dashed border-[#C7C7CC] hover:border-[#8E8E93] hover:text-[#636366]',
}

const SIZE_STYLES: Record<string, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  children,
  onClick,
  type = 'button',
  className = '',
  pill = true,
  count,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-150 select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        min-h-[44px]
        ${pill ? 'rounded-2xl' : 'rounded-xl'}
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0 flex items-center">{icon}</span>
      ) : null}
      {children}
      {count !== undefined && (
        <span className="ml-0.5 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
          {count}
        </span>
      )}
      {iconRight && <span className="flex-shrink-0 flex items-center">{iconRight}</span>}
    </motion.button>
  )
}
