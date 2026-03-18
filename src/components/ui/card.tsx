interface CardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly padding?: "sm" | "md" | "lg" | "none";
}

const PADDING = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-5",
} as const;

/* iOS grouped inset card — white surface on #F2F2F7 background */
export function Card({ children, className = "", padding = "md" }: CardProps) {
  return (
    <div className={`bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)] ${PADDING[padding]} ${className}`}>
      {children}
    </div>
  );
}
