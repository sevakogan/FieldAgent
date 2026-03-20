"use client";

import { motion } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly className?: string;
  readonly children: React.ReactNode;
  readonly disabled?: boolean;
  readonly type?: "button" | "submit" | "reset";
  readonly onClick?: () => void;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[#007AFF] to-[#AF52DE] text-white shadow-lg shadow-[#007AFF]/25",
  secondary:
    "bg-white text-[#1C1C1E] border border-[#E5E5EA] hover:border-[#007AFF]/30",
  ghost: "bg-transparent text-[#3C3C43] hover:bg-[#F2F2F7]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  type = "button",
  onClick,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
      className={`
        inline-flex items-center justify-center rounded-full font-medium
        transition-colors duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
