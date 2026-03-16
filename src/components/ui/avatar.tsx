import { AVATAR_COLORS } from "@/lib/utils";

interface AvatarProps {
  readonly initials: string;
  readonly size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "w-8 h-8 text-xs rounded-lg",
  md: "w-10 h-10 text-sm rounded-xl",
  lg: "w-16 h-16 text-xl rounded-2xl",
} as const;

export function Avatar({ initials, size = "md" }: AvatarProps) {
  const color = AVATAR_COLORS[initials] ?? "#7c3aed";

  return (
    <div
      className={`${SIZES[size]} shrink-0 flex items-center justify-center font-extrabold text-white tracking-tight`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
