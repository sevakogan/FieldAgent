"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error";

interface ToastProps {
  readonly message: string;
  readonly type?: ToastType;
  readonly isVisible: boolean;
  readonly onDismiss: () => void;
}

const AUTO_DISMISS_MS = 3000;

const TYPE_STYLES: Record<ToastType, string> = {
  success: "bg-[#34C759] text-white",
  error: "bg-[#FF2D55] text-white",
};

const TYPE_ICONS: Record<ToastType, string> = {
  success: "\u2713",
  error: "\u2717",
};

export function Toast({
  message,
  type = "success",
  isVisible,
  onDismiss,
}: ToastProps) {
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(handleDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [isVisible, handleDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 30 }}
          className={`
            fixed bottom-6 left-1/2 z-50 -translate-x-1/2
            flex items-center gap-2 rounded-full px-5 py-3
            text-sm font-medium shadow-lg
            ${TYPE_STYLES[type]}
          `}
        >
          <span className="text-base">{TYPE_ICONS[type]}</span>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
