export const SERVICE_COLORS: Record<string, string> = {
  "Lawn Mowing": "bg-green-500",
  "Pool Cleaning": "bg-blue-500",
  "Pressure Washing": "bg-orange-500",
  "Hedge Trimming": "bg-emerald-500",
  "Leaf Cleanup": "bg-amber-500",
} as const;

const DEFAULT_COLOR = "bg-violet-500";

export function getServiceColor(service: string): string {
  return SERVICE_COLORS[service] ?? DEFAULT_COLOR;
}
