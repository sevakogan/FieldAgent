'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type ReactNode, useEffect } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'right' | 'left';
  className?: string;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  side = 'right',
  className = '',
}: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const slideFrom = side === 'right' ? '100%' : '-100%';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          {/* Bottom sheet on mobile */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`
              md:hidden absolute bottom-0 left-0 right-0
              bg-white rounded-t-[20px] max-h-[85vh] overflow-y-auto
              ${className}
            `}
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#E5E5EA]" />
            </div>
            {title && (
              <div className="px-5 py-3 border-b border-[#E5E5EA]">
                <h2 className="text-lg font-bold text-[#1C1C1E]">{title}</h2>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>

          {/* Side panel on desktop */}
          <motion.div
            initial={{ x: slideFrom }}
            animate={{ x: 0 }}
            exit={{ x: slideFrom }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`
              hidden md:flex md:flex-col absolute top-0 bottom-0
              ${side === 'right' ? 'right-0' : 'left-0'}
              w-[400px] bg-white shadow-xl overflow-y-auto
              ${className}
            `}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#E5E5EA]">
              {title && (
                <h2 className="text-lg font-bold text-[#1C1C1E]">{title}</h2>
              )}
              <button
                type="button"
                onClick={onClose}
                className="ml-auto flex h-[44px] w-[44px] items-center justify-center rounded-full hover:bg-[#F2F2F7] transition-colors"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5 text-[#8E8E93]"
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
            </div>
            <div className="flex-1 p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
