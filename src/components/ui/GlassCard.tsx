import { type ReactNode } from "react";

interface GlassCardProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`
        rounded-2xl border border-white/20 bg-white/70
        shadow-lg backdrop-blur-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}
