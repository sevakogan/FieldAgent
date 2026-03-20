"use client";

import { useState, useEffect } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";

const GLOW_SIZE = 200;
const HALF_GLOW = GLOW_SIZE / 2;

export function CursorGlow() {
  const { x, y } = useMousePosition();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsDesktop(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!isDesktop) return null;

  return (
    <div
      className="pointer-events-none fixed z-10"
      style={{
        left: x - HALF_GLOW,
        top: y - HALF_GLOW,
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(90,200,250,0.05) 0%, transparent 70%)",
      }}
    />
  );
}
