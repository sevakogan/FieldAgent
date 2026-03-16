interface BadgeProps {
  readonly children: React.ReactNode;
  readonly variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
}

const VARIANTS = {
  default: "bg-gray-100 text-gray-600",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger:  "bg-red-100 text-red-700",
  info:    "bg-blue-100 text-blue-700",
  purple:  "bg-purple-100 text-purple-700",
} as const;

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span className={`${VARIANTS[variant]} rounded-md px-2 py-0.5 text-[10px] font-bold`}>
      {children}
    </span>
  );
}
