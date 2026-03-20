'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface TimePickerProps {
  label?: string;
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  startHour?: number;
  endHour?: number;
  intervalMinutes?: number;
  error?: string;
  className?: string;
}

function generateSlots(
  startHour: number,
  endHour: number,
  interval: number
): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      slots.push(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      );
    }
  }
  return slots;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function TimePicker({
  label,
  value,
  onChange,
  placeholder = 'Select time',
  startHour = 6,
  endHour = 22,
  intervalMinutes = 30,
  error,
  className = '',
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const slots = useMemo(
    () => generateSlots(startHour, endHour, intervalMinutes),
    [startHour, endHour, intervalMinutes]
  );

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

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={containerRef}>
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
        <span className={value ? 'text-[#1C1C1E]' : 'text-[#AEAEB2]'}>
          {value ? formatTime(value) : placeholder}
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
            className="relative z-50 mt-1 rounded-[12px] border border-[#E5E5EA] bg-white shadow-lg overflow-hidden"
          >
            <ul className="max-h-[260px] overflow-y-auto py-1">
              {slots.map((slot) => (
                <li key={slot}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange?.(slot);
                      handleClose();
                    }}
                    className={`
                      w-full px-4 py-2.5 text-left text-sm min-h-[44px] flex items-center
                      transition-colors hover:bg-[#F2F2F7]
                      ${slot === value ? 'text-[#007AFF] font-semibold' : 'text-[#1C1C1E]'}
                    `}
                  >
                    {formatTime(slot)}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-xs text-[#FF3B30]">{error}</p>}
    </div>
  );
}
