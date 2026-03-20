'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  error,
  disabled = false,
  className = '',
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = searchable
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const selected = options.find((o) => o.value === value);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

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
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`
          relative w-full h-[44px] rounded-[8px] border bg-white px-3
          text-left text-base outline-none transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${open ? 'border-[#007AFF] ring-1 ring-[#007AFF]' : ''}
          ${error ? 'border-[#FF3B30]' : 'border-[#E5E5EA]'}
        `}
      >
        <span className={selected ? 'text-[#1C1C1E]' : 'text-[#AEAEB2]'}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AEAEB2] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
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
            className="relative z-50 w-full mt-1 rounded-[12px] border border-[#E5E5EA] bg-white shadow-lg overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-[#E5E5EA]">
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-[36px] rounded-[8px] border border-[#E5E5EA] bg-[#F2F2F7] px-3 text-sm outline-none focus:border-[#007AFF]"
                />
              </div>
            )}
            <ul className="max-h-[220px] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-[#AEAEB2]">
                  No results
                </li>
              ) : (
                filtered.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange?.(option.value);
                        handleClose();
                      }}
                      className={`
                        w-full px-3 py-2.5 text-left text-sm min-h-[44px] flex items-center
                        transition-colors hover:bg-[#F2F2F7]
                        ${
                          option.value === value
                            ? 'text-[#007AFF] font-semibold'
                            : 'text-[#1C1C1E]'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-xs text-[#FF3B30]">{error}</p>}
    </div>
  );
}
