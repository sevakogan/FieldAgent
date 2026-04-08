'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar } from './Calendar';

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
  className = '',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [handleClose]);

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <span className="text-sm font-medium text-[#1C1C1E]">{label}</span>
      )}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`
          relative w-full h-[44px] rounded-[8px] border bg-white px-3
          text-left text-base outline-none transition-colors
          ${open ? 'border-[#007AFF] ring-1 ring-[#007AFF]' : ''}
          ${error ? 'border-[#FF3B30]' : 'border-[#E5E5EA]'}
        `}
      >
        <span className={displayValue ? 'text-[#1C1C1E]' : 'text-[#AEAEB2]'}>
          {displayValue || placeholder}
        </span>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AEAEB2]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute left-0 top-full z-50 mt-1"
          >
            <Calendar
              selectedDate={value}
              onSelectDate={(date) => {
                onChange?.(date);
                handleClose();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-xs text-[#FF3B30]">{error}</p>}
    </div>
  );
}
