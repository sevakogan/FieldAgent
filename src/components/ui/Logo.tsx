"use client";

import Image from "next/image";

interface LogoProps {
  readonly size?: number;
  readonly className?: string;
}

export function Logo({ size = 48, className = "" }: LogoProps) {
  const glowSize = size * 1.6;
  const glowOffset = (glowSize - size) / 2;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Glow behind logo */}
      <div
        className="absolute animate-logo-glow"
        style={{
          width: glowSize,
          height: glowSize,
          top: -glowOffset,
          left: -glowOffset,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(90,200,250,0.35) 0%, rgba(0,122,255,0.25) 30%, rgba(175,82,222,0.2) 60%, transparent 80%)",
          filter: `blur(${size * 0.25}px)`,
        }}
      />

      <Image
        src="/logo2.png"
        alt="KleanHQ"
        width={size}
        height={size}
        className="relative z-10 object-contain"
        priority
      />
    </div>
  );
}
