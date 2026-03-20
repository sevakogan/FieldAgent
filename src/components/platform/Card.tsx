'use client';

import { type ReactNode } from 'react';

interface CardProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  className?: string;
  padding?: boolean;
}

const variantClasses: Record<string, string> = {
  default: 'bg-white border border-[#E5E5EA]',
  outlined: 'bg-transparent border-2 border-[#E5E5EA]',
  elevated: 'bg-white shadow-md',
};

export function Card({
  header,
  footer,
  children,
  variant = 'default',
  className = '',
  padding = true,
}: CardProps) {
  return (
    <div
      className={`rounded-[16px] overflow-hidden ${variantClasses[variant]} ${className}`}
    >
      {header && (
        <div className="px-5 py-4 border-b border-[#E5E5EA]">{header}</div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-[#E5E5EA]">{footer}</div>
      )}
    </div>
  );
}
