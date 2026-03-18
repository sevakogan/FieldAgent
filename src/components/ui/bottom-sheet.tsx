"use client";

import { useEffect } from "react";

interface BottomSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
  readonly title?: string;
}

export function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  /* Lock body scroll while sheet is open */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-end md:items-center md:justify-center" onClick={onClose}>
      {/* Backdrop — iOS-style dark translucent */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Sheet */}
      <div
        className="relative w-full md:max-w-sm bg-[#F2F2F7] rounded-t-[20px] md:rounded-[20px] animate-slide-up md:animate-scale-in overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS drag handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-[4.5px] rounded-full bg-[#D1D1D6]" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 pt-1.5 pb-2">
            <h3 className="font-bold text-[17px] tracking-[-0.3px]">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 rounded-full bg-[#E5E5EA] flex items-center justify-center text-[#636366] hover:bg-[#D1D1D6] transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-5 pb-10 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}
