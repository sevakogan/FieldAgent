'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';

interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onClear, className = '', ...props }, ref) => {
    const hasValue = value !== undefined && value !== '';

    return (
      <div className={`relative ${className}`}>
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={ref}
          type="search"
          value={value}
          className={`
            w-full h-[44px] rounded-[12px] bg-[#F2F2F7] pl-10 pr-10
            text-[#1C1C1E] text-sm placeholder:text-[#8E8E93]
            outline-none transition-colors
            focus:bg-white focus:ring-1 focus:ring-[#007AFF] focus:border-[#007AFF]
            border border-transparent
          `}
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-[30px] w-[30px] items-center justify-center rounded-full hover:bg-[#E5E5EA] transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4 text-[#8E8E93]"
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
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
