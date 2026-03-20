"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import Countdown from "./Countdown";

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0, 0, 0.58, 1] as const },
  },
};

const scalePulse = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0, 0, 0.58, 1] as const },
  },
};

function KleanHQLogo() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring" as const, stiffness: 260, damping: 20, delay: 0.1 }}
    >
      <Logo size={80} className="sm:hidden" />
      <Logo size={80} className="hidden sm:inline-flex" />
    </motion.div>
  );
}

function ScrollArrow() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: [0.42, 0, 0.58, 1] as const }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#AEAEB2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <motion.div
        className="flex flex-col items-center gap-6 text-center max-w-3xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <KleanHQLogo />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-4xl sm:text-[64px] leading-tight font-extrabold animate-gradient-text"
          style={{
            fontFamily: "var(--font-outfit)",
            backgroundImage: "linear-gradient(135deg, #007AFF 0%, #AF52DE 40%, #FF2D55 70%, #007AFF 100%)",
          }}
        >
          KleanHQ
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-lg sm:text-xl text-[#1C1C1E]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          The simplest way to run your field service business
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="text-sm sm:text-base text-[#AEAEB2]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Schedule. Dispatch. Track. Get Paid. All from your phone.
        </motion.p>

        <motion.div variants={scalePulse}>
          <span
            className="inline-block px-5 py-2 rounded-full text-white text-sm font-semibold tracking-wider uppercase shadow-lg"
            style={{
              background: "linear-gradient(135deg, #007AFF 0%, #AF52DE 50%, #FF2D55 100%)",
            }}
          >
            Coming Soon
          </span>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Countdown />
        </motion.div>
      </motion.div>

      <ScrollArrow />
    </section>
  );
}
