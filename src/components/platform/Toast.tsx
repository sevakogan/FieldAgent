'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  open: boolean;
  onClose: () => void;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  className?: string;
}

const variantConfig: Record<
  ToastVariant,
  { bg: string; icon: string; iconPath: string }
> = {
  success: {
    bg: 'bg-[#34C759]',
    icon: 'text-white',
    iconPath: 'M5 13l4 4L19 7',
  },
  error: {
    bg: 'bg-[#FF3B30]',
    icon: 'text-white',
    iconPath: 'M6 18L18 6M6 6l12 12',
  },
  info: {
    bg: 'bg-[#007AFF]',
    icon: 'text-white',
    iconPath: 'M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z',
  },
};

export function Toast({
  open,
  onClose,
  message,
  variant = 'info',
  duration = 3000,
  className = '',
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, onClose, duration]);

  const config = variantConfig[variant];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-[100]
            flex items-center gap-3 px-5 py-3 rounded-[16px]
            shadow-lg min-w-[280px] max-w-[90vw]
            ${config.bg}
            ${className}
          `}
        >
          <svg
            className={`h-5 w-5 flex-shrink-0 ${config.icon}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={config.iconPath}
            />
          </svg>
          <span className="text-sm font-medium text-white flex-1">
            {message}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 h-[44px] w-[44px] flex items-center justify-center -mr-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
