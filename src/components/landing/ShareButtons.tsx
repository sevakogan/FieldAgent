"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  getCopyLink,
  getSMSLink,
  getEmailLink,
  getWhatsAppLink,
} from "@/lib/utils/share";

interface ShareButtonsProps {
  readonly referralCode: string;
}

const BUTTONS = [
  { key: "copy", label: "Copy", emoji: "\uD83D\uDCCB" },
  { key: "sms", label: "SMS", emoji: "\uD83D\uDCAC" },
  { key: "email", label: "Email", emoji: "\uD83D\uDCE7" },
  { key: "whatsapp", label: "WhatsApp", emoji: "\uD83D\uDC9A" },
  { key: "instagram", label: "Instagram", emoji: "\uD83D\uDCF8" },
] as const;

export function ShareButtons({ referralCode }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(
    async (key: string) => {
      switch (key) {
        case "copy": {
          const link = getCopyLink(referralCode);
          try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = link;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
          break;
        }
        case "sms":
          window.open(getSMSLink(referralCode), "_blank");
          break;
        case "email":
          window.open(getEmailLink(referralCode), "_blank");
          break;
        case "whatsapp":
          window.open(getWhatsAppLink(referralCode), "_blank");
          break;
        case "instagram": {
          // Download branded share image
          try {
            const res = await fetch("/api/waitlist/share-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ referralCode }),
            });
            if (res.ok) {
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `kleanhq-invite-${referralCode}.svg`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          } catch {
            // Silently fail - user can still share manually
          }
          break;
        }
      }
    },
    [referralCode]
  );

  return (
    <div className="flex items-center justify-center gap-3">
      {BUTTONS.map((btn, i) => (
        <motion.button
          key={btn.key}
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          onClick={() => handleClick(btn.key)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#E5E5EA]/60 hover:bg-white hover:shadow-md transition-all min-w-[64px]"
        >
          <span className="text-xl">{btn.emoji}</span>
          <span
            className="text-[11px] font-medium text-[#636366]"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            {btn.key === "copy" && copied ? "Copied!" : btn.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
