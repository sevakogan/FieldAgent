/** Format cents to dollar string */
export function formatCurrency(cents: number): string {
  return "$" + (cents || 0).toLocaleString();
}

export const AVATAR_COLORS: Record<string, string> = {
  ML: "#7c3aed",
  JS: "#2563eb",
  AR: "#d97706",
  DC: "#059669",
  SW: "#db2777",
};

export const JOB_STATUS_STYLES = {
  done: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Done", icon: "bg-emerald-100" },
  active: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Active", icon: "bg-yellow-100" },
  upcoming: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Scheduled", icon: "bg-indigo-100" },
} as const;

export const LEAD_STATUS_STYLES = {
  new: { bg: "bg-emerald-100", text: "text-emerald-700" },
  contacted: { bg: "bg-blue-100", text: "text-blue-700" },
  quoted: { bg: "bg-yellow-100", text: "text-yellow-700" },
  won: { bg: "bg-purple-100", text: "text-purple-700" },
  lost: { bg: "bg-red-100", text: "text-red-700" },
} as const;
