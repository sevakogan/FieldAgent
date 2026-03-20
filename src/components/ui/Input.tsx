"use client";

import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, className = "", id: externalId, ...props }, ref) {
    const generatedId = useId();
    const inputId = externalId ?? generatedId;

    const borderColor = error
      ? "border-[#FF2D55] focus:border-[#FF2D55] focus:shadow-[0_0_0_3px_rgba(255,45,85,0.15)]"
      : "border-[#E5E5EA] focus:border-[#007AFF] focus:shadow-[0_0_0_3px_rgba(0,122,255,0.15)]";

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
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-xl bg-white px-4 py-3 text-[#1C1C1E]
            border ${borderColor}
            outline-none transition-all duration-200
            placeholder:text-[#AEAEB2]
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-[#FF2D55]">{error}</p>
        )}
      </div>
    );
  }
);
