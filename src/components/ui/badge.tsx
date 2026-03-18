interface BadgeProps {
  readonly children: React.ReactNode;
  readonly variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
}

const VARIANTS = {
  default: "bg-[#E5E5EA] text-[#636366]",
  success: "bg-[#E8F9ED] text-[#1C7A35]",
  warning: "bg-[#FFF3E0] text-[#C65000]",
  danger:  "bg-[#FFE5E3] text-[#C0271A]",
  info:    "bg-[#E3F0FF] text-[#0055C4]",
  purple:  "bg-[#EEE6FF] text-[#5A2D9C]",
} as const;

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span className={`${VARIANTS[variant]} rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight`}>
      {children}
    </span>
  );
}
