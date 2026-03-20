"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShareButtons } from "@/components/landing/ShareButtons";
import { useState, useCallback } from "react";
import { getCopyLink } from "@/lib/utils/share";

interface WaitlistSuccessProps {
  readonly position: number;
  readonly referralCode: string;
  readonly referredBy?: string;
}

function OdometerDigit({ digit }: { readonly digit: string }) {
  return (
    <motion.span
      key={digit}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
      className="inline-block"
    >
      {digit}
    </motion.span>
  );
}

export function WaitlistSuccess({
  position,
  referralCode,
  referredBy,
}: WaitlistSuccessProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const referralLink = getCopyLink(referralCode);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }, [referralLink]);

  const positionDigits = String(position).split("");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.58, 1] as const }}
        className="text-center"
      >
        {/* Celebration emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring" as const,
            stiffness: 400,
            damping: 15,
            delay: 0.1,
          }}
          className="text-5xl mb-4"
        >
          🎉
        </motion.div>

        <h2
          className="text-3xl font-bold text-[#1C1C1E] mb-2"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          You&apos;re in!
        </h2>

        {/* Position number - odometer style */}
        <div className="my-6">
          <div className="text-sm text-[#AEAEB2] font-medium mb-1">
            Your position
          </div>
          <div
            className="text-6xl font-bold text-[#007AFF] tracking-tight"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            #
            {positionDigits.map((d, i) => (
              <OdometerDigit key={`${i}-${d}`} digit={d} />
            ))}
          </div>
        </div>

        {/* Referred by */}
        {referredBy && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-[#636366] mb-4"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Referred by: <span className="font-semibold">{referredBy}</span>
          </motion.p>
        )}

        {/* Share CTA */}
        <p
          className="text-[#636366] text-sm mb-6"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          Share to move up — every referral bumps you higher
        </p>

        <div className="mb-6">
          <ShareButtons referralCode={referralCode} />
        </div>

        {/* Referral link - copyable */}
        <div className="mb-4">
          <div className="text-xs text-[#AEAEB2] mb-2">Your referral link</div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F2F2F7] rounded-xl text-sm text-[#1C1C1E] font-mono hover:bg-[#E5E5EA] transition-colors cursor-pointer"
          >
            kleanhq.com/r/{referralCode}
            <svg
              className="w-4 h-4 text-[#AEAEB2]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          {linkCopied && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-[#34C759] mt-1 font-medium"
            >
              Copied to clipboard!
            </motion.p>
          )}
        </div>

        {/* Friends referred count */}
        <p className="text-xs text-[#AEAEB2]">0 friends referred</p>
      </motion.div>
    </AnimatePresence>
  );
}
