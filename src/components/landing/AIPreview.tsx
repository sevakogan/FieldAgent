"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface ChatMessage {
  readonly role: "user" | "ai";
  readonly content: string;
  readonly isCard?: boolean;
}

const CHAT_MESSAGES: readonly ChatMessage[] = [
  {
    role: "user",
    content: "What\u2019s my schedule today?",
  },
  {
    role: "ai",
    content:
      "Here\u2019s your schedule for today:\n\n9:00 AM \u2014 Pool cleaning @ 123 Oak St\n11:00 AM \u2014 Lawn service @ 456 Pine Ave\n1:30 PM \u2014 HVAC maintenance @ 789 Elm Dr\n3:00 PM \u2014 Deep clean @ 321 Maple Ln",
  },
  {
    role: "user",
    content: "Schedule a pool service for Mrs. Chen next Tuesday",
  },
  {
    role: "ai",
    content:
      "Pool Service \u2014 Mrs. Chen\nTuesday, Mar 25 \u00B7 10:00 AM\n123 Willow Creek Dr\nAssigned to: Marcus J.\nEstimate: $85",
    isCard: true,
  },
] as const;

const ROLE_BADGES = ["Owner AI", "Client AI", "Worker AI"] as const;
const BADGE_COLORS = ["#007AFF", "#AF52DE", "#FF6B6B"] as const;

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-[#AEAEB2]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

function ChatBubble({
  message,
  showCard,
}: {
  readonly message: ChatMessage;
  readonly showCard: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
          isUser
            ? "bg-[#007AFF] text-white rounded-br-md"
            : "bg-white text-[#1C1C1E] border border-[#E5E5EA] rounded-bl-md"
        }`}
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {message.content}
        {message.isCard && showCard && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-[#E5E5EA]">
            <button className="px-4 py-1.5 text-xs font-medium text-[#AEAEB2] bg-[#F2F2F7] rounded-full">
              Cancel
            </button>
            <button className="px-4 py-1.5 text-xs font-medium text-white bg-[#007AFF] rounded-full">
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    let current = 0;
    const totalMessages = CHAT_MESSAGES.length;

    function showNext() {
      if (current >= totalMessages) return;

      const nextMessage = CHAT_MESSAGES[current];
      if (nextMessage && nextMessage.role === "ai") {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          current++;
          setVisibleCount(current);
          setTimeout(showNext, 800);
        }, 1200);
      } else {
        current++;
        setVisibleCount(current);
        setTimeout(showNext, 800);
      }
    }

    const timeout = setTimeout(showNext, 400);
    return () => clearTimeout(timeout);
  }, [isInView]);

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-white">
      <div className="max-w-2xl mx-auto">
        <h2
          className="text-3xl sm:text-[40px] font-extrabold text-[#1C1C1E] text-center mb-16"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Your AI-powered co-pilot
        </h2>

        <div className="bg-[#F2F2F7] rounded-3xl p-4 sm:p-6 border border-[#E5E5EA] shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E5E5EA]">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
            <div className="w-3 h-3 rounded-full bg-[#FFD60A]" />
            <div className="w-3 h-3 rounded-full bg-[#5AC8FA]" />
            <span
              className="ml-2 text-xs text-[#AEAEB2] font-medium"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              KleanHQ Assistant
            </span>
          </div>

          <div className="space-y-3 min-h-[280px]">
            {CHAT_MESSAGES.slice(0, visibleCount).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChatBubble message={msg} showCard={true} />
              </motion.div>
            ))}
            {showTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white rounded-2xl border border-[#E5E5EA] rounded-bl-md">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-sm text-[#AEAEB2]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          60 days free. Then $5/mo. Workers always free.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-3 mt-4"
        >
          {ROLE_BADGES.map((badge, i) => (
            <span
              key={badge}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{
                backgroundColor: BADGE_COLORS[i],
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {badge}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9 }}
          className="text-center mt-10"
        >
          <p
            className="text-[#636366] text-base mb-4"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Get early access to KleanHQ AI
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#007AFF] to-[#AF52DE] text-white font-semibold text-base rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-[#007AFF]/20"
          >
            Join Waitlist
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
