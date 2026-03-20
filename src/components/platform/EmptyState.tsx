'use client';

import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F2F2F7] text-[#8E8E93]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#1C1C1E] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#8E8E93] max-w-[300px] mb-6">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="h-[44px] px-6 rounded-[12px] bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] active:bg-[#0055B3] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
