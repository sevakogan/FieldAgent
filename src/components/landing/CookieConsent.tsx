"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if no choice has been made
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChoice = useCallback((choice: "accepted" | "declined") => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E5E5EA]/60 p-5 flex flex-col sm:flex-row items-center gap-4">
            <p
              className="text-sm text-[#636366] flex-1"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              We use cookies to improve your experience.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleChoice("declined")}
                className="px-4 py-2 text-sm font-medium text-[#AEAEB2] hover:text-[#1C1C1E] transition-colors rounded-lg cursor-pointer"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => handleChoice("accepted")}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0071E3] rounded-xl transition-colors cursor-pointer"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
