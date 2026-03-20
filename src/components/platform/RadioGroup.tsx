'use client';

import { motion } from 'framer-motion';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  label,
  disabled = false,
  direction = 'vertical',
  className = '',
}: RadioGroupProps) {
  return (
    <fieldset
      className={`flex flex-col gap-2 ${className}`}
      disabled={disabled}
    >
      {label && (
        <legend className="text-sm font-medium text-[#1C1C1E] mb-1">
          {label}
        </legend>
      )}
      <div
        className={`flex gap-3 ${
          direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        }`}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              disabled={disabled}
              className={`
                inline-flex items-center gap-3 min-h-[44px]
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span
                className={`
                  flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center
                  rounded-full border-2 transition-colors
                  ${
                    isSelected
                      ? 'border-[#007AFF]'
                      : 'border-[#D1D1D6]'
                  }
                `}
              >
                <motion.span
                  initial={false}
                  animate={{
                    scale: isSelected ? 1 : 0,
                    opacity: isSelected ? 1 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="h-[12px] w-[12px] rounded-full bg-[#007AFF]"
                />
              </span>
              <span className="text-sm font-medium text-[#1C1C1E]">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
