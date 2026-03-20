'use client';

import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#1C1C1E]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEAEB2]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-[44px] rounded-[8px] border bg-white px-3
              text-[#1C1C1E] text-base placeholder:text-[#AEAEB2]
              outline-none transition-colors duration-150
              focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-[#FF3B30]' : 'border-[#E5E5EA]'}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[#FF3B30]">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[#AEAEB2]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
