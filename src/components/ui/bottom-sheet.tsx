"use client";

interface BottomSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
  readonly title?: string;
}

export function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-end md:items-center md:justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full md:max-w-sm bg-white rounded-t-3xl md:rounded-3xl animate-slide-up md:animate-fade-in overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 md:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <h3 className="font-extrabold text-base">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-lg hover:bg-gray-200 transition-colors"
            >
              &times;
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-8 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
