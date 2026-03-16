interface CardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly padding?: "sm" | "md" | "lg";
}

const PADDING = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
} as const;

export function Card({ children, className = "", padding = "md" }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm ${PADDING[padding]} ${className}`}>
      {children}
    </div>
  );
}
