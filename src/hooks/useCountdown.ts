"use client";

import { useState, useEffect } from "react";

interface CountdownValues {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

const DEFAULT_LAUNCH_DATE = "2026-06-01T09:00:00-04:00";

const INITIAL: CountdownValues = { days: 0, hours: 0, minutes: 0, seconds: 0 };

function computeCountdown(targetMs: number): CountdownValues {
  const diff = targetMs - Date.now();
  if (diff <= 0) return INITIAL;

  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function useCountdown(targetDate?: string): CountdownValues {
  const launchDate = targetDate ?? DEFAULT_LAUNCH_DATE;
  const targetMs = new Date(launchDate).getTime();

  const [countdown, setCountdown] = useState<CountdownValues>(INITIAL);

  useEffect(() => {
    // Compute immediately on mount (client only)
    setCountdown(computeCountdown(targetMs));

    const interval = setInterval(() => {
      setCountdown(computeCountdown(targetMs));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetMs]);

  return countdown;
}
