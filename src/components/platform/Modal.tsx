'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className = '',
}: ModalProps) {
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`
              relative z-10 w-full md:max-w-lg
              rounded-t-[20px] md:rounded-[20px]
              max-h-[90vh] overflow-y-auto
              ${className}
            `}
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
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
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
