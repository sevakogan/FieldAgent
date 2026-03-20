"use client";

import { useRef } from "react";
import { useInView, useAnimation } from "framer-motion";
import { useEffect } from "react";

interface ScrollAnimationResult {
  readonly ref: React.RefObject<HTMLDivElement | null>;
  readonly controls: ReturnType<typeof useAnimation>;
  readonly isInView: boolean;
}

/**
 * Hook for Framer Motion scroll-triggered animations.
 * Returns a ref to attach to the element, animation controls, and inView state.
 *
 * @param threshold - Amount of element visible before triggering (0-1). Default 0.2.
 * @param triggerOnce - Whether to only trigger once. Default true.
 */
export function useScrollAnimation(
  threshold: number = 0.2,
  triggerOnce: boolean = true
): ScrollAnimationResult {
  const ref = useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();
  const isInView = useInView(ref, {
    amount: threshold,
    once: triggerOnce,
  });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return { ref, controls, isInView };
}
