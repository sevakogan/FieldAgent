'use client';

import { type ReactNode } from 'react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  backButton?: boolean;
  onBack?: () => void;
  trailing?: ReactNode;
  className?: string;
}

export function TopBar({
  title,
  subtitle,
  backButton = false,
  onBack,
  trailing,
  className = '',
}: TopBarProps) {
  return (
    <header
      className={`
        sticky top-0 z-30 bg-white/80 backdrop-blur-xl
        border-b border-[#E5E5EA]
        ${className}
      `}
    >
      <div className="flex items-center gap-3 px-4 min-h-[56px]">
        {backButton && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-full hover:bg-[#F2F2F7] transition-colors -ml-2"
          >
            <svg
              className="h-5 w-5 text-[#007AFF]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#1C1C1E] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#8E8E93] truncate">{subtitle}</p>
          )}
        </div>
        {trailing && <div className="flex-shrink-0">{trailing}</div>}
      </div>
    </header>
  );
}
