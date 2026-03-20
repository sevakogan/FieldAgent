'use client';

import { type TextareaHTMLAttributes, forwardRef, useState } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxCharacters?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      maxCharacters,
      className = '',
      id,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const [charCount, setCharCount] = useState(
      String(value ?? defaultValue ?? '').length
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

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
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          maxLength={maxCharacters}
          className={`
            w-full min-h-[100px] rounded-[8px] border bg-white px-3 py-2.5
            text-[#1C1C1E] text-base placeholder:text-[#AEAEB2]
            outline-none transition-colors duration-150 resize-y
            focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]
            ${error ? 'border-[#FF3B30]' : 'border-[#E5E5EA]'}
            ${className}
          `}
          {...props}
        />
        <div className="flex justify-between">
          <div>
            {error && <p className="text-xs text-[#FF3B30]">{error}</p>}
            {helperText && !error && (
              <p className="text-xs text-[#AEAEB2]">{helperText}</p>
            )}
          </div>
          {maxCharacters && (
            <p
              className={`text-xs ${
                charCount >= maxCharacters
                  ? 'text-[#FF3B30]'
                  : 'text-[#AEAEB2]'
              }`}
            >
              {charCount}/{maxCharacters}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
