"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface Step {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

const STEPS: readonly Step[] = [
  {
    icon: "\uD83D\uDCC5",
    title: "Schedule the job",
    description: "Assign to your crew with one tap",
  },
  {
    icon: "\uD83D\uDCF8",
    title: "Worker does the work",
    description: "Photos, GPS tracking, checklists \u2014 all automatic",
  },
  {
    icon: "\u2705",
    title: "Client approves",
    description: "Client sees proof, taps approve, gets charged",
  },
] as const;

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: [0, 0, 0.58, 1] as const,
    },
  }),
};

const iconBounce = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 15,
    },
  },
};

function ConnectingLine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.3"],
  });
  const dashOffset = useTransform(scrollYProgress, [0, 1], [200, 0]);

  return (
    <div ref={ref} className="hidden sm:flex absolute top-16 left-0 right-0 justify-center pointer-events-none">
      <svg
        width="100%"
        height="4"
        viewBox="0 0 800 4"
        fill="none"
        className="max-w-2xl"
        preserveAspectRatio="none"
      >
        <motion.line
          x1="0"
          y1="2"
          x2="800"
          y2="2"
          stroke="#007AFF"
          strokeWidth="2"
          strokeDasharray="8 6"
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
    </div>
  );
}

function StepCard({ step, index }: { readonly step: Step; readonly index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={stepVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="flex flex-col items-center text-center gap-4"
    >
      <motion.div
        variants={iconBounce}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="w-16 h-16 rounded-full bg-[#007AFF]/10 flex items-center justify-center"
      >
        <span className="text-3xl">{step.icon}</span>
      </motion.div>

      <div className="w-8 h-8 rounded-full bg-[#007AFF] text-white text-sm font-bold flex items-center justify-center">
        {index + 1}
      </div>

      <h3
        className="text-xl font-bold text-[#1C1C1E]"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {step.title}
      </h3>
      <p
        className="text-sm text-[#AEAEB2] max-w-[200px]"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {step.description}
      </p>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-3xl sm:text-[40px] font-extrabold text-[#1C1C1E] text-center mb-20"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          How it works
        </h2>

        <div className="relative">
          <ConnectingLine />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
            {STEPS.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <p
            className="text-[#636366] text-lg mb-5"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Be the first to experience it
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] text-white font-semibold text-base rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-[#007AFF]/20"
          >
            Join Waitlist
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
