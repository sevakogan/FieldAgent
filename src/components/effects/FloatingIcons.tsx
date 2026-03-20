"use client";

import { useState, useEffect } from "react";

const ALL_ICONS = [
  "\u{1F3E0}", "\u{1F527}", "\u{1F30A}", "\u{1F4A7}", "\u{1F33F}", "\u2728",
  "\u{1F9F9}", "\u{1F4F1}", "\u{1F4CB}", "\u{1F4B3}", "\u{1F4CD}", "\u2B50",
  "\u{1F3CA}", "\u{1F9FD}", "\u{1F511}",
] as const;

const MOBILE_COUNT = 5;

interface IconConfig {
  readonly icon: string;
  readonly top: string;
  readonly left: string;
  readonly size: number;
  readonly opacity: number;
  readonly floatDuration: number;
  readonly floatDistance: number;
  readonly delay: number;
}

function generateIconConfigs(count: number): readonly IconConfig[] {
  return ALL_ICONS.slice(0, count).map((icon, i) => ({
    icon,
    top: `${(i * 7.3 + 3) % 90}%`,
    left: `${(i * 11.7 + 5) % 90}%`,
    size: 20 + (i % 3) * 5,
    opacity: 0.06 + (i % 4) * 0.01,
    floatDuration: 6 + (i % 4) * 2,
    floatDistance: 10 + (i % 3) * 5,
    delay: i * 0.3,
  }));
}

export function FloatingIcons() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const count = isMobile ? MOBILE_COUNT : ALL_ICONS.length;
  const configs = generateIconConfigs(count);

  return (
    <>
      <style>{`
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(var(--float-distance)) rotate(180deg); }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {configs.map((config) => (
          <span
            key={config.icon}
            className="absolute select-none"
            style={{
              top: config.top,
              left: config.left,
              fontSize: config.size,
              opacity: config.opacity,
              "--float-distance": `-${config.floatDistance}px`,
              animation: `iconFloat ${config.floatDuration}s ease-in-out ${config.delay}s infinite`,
            } as React.CSSProperties}
          >
            {config.icon}
          </span>
        ))}
      </div>
    </>
  );
}
