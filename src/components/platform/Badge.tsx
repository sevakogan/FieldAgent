'use client';

import { type ReactNode } from 'react';

type BadgeColor =
  | 'blue'
  | 'yellow'
  | 'lilac'
  | 'mint'
  | 'peach'
  | 'coral'
  | 'rose'
  | 'slate'
  | 'green';

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  blue: 'bg-[#007AFF]/15 text-[#007AFF]',
  yellow: 'bg-[#FFD60A]/20 text-[#B8860B]',
  lilac: 'bg-[#AF52DE]/15 text-[#AF52DE]',
  mint: 'bg-[#5AC8FA]/15 text-[#2E8EB8]',
  peach: 'bg-[#FF9F0A]/15 text-[#CC7F08]',
  coral: 'bg-[#FF6B6B]/15 text-[#FF6B6B]',
  rose: 'bg-[#FF2D55]/15 text-[#FF2D55]',
  slate: 'bg-[#8E8E93]/15 text-[#8E8E93]',
  green: 'bg-[#34C759]/15 text-[#248A3D]',
};

export function Badge({
  color = 'blue',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        text-xs font-semibold
        ${colorClasses[color]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
