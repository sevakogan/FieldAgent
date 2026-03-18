import { Card } from "./card";

interface StatCardProps {
  readonly label: string;
  readonly value: string;
  readonly accent?: string;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <Card padding="sm">
      <div className="text-[11px] font-semibold text-[#8E8E93] tracking-[0.5px] mb-2 uppercase">
        {label}
      </div>
      <div className="text-[28px] font-bold tracking-[-0.5px] leading-none text-black">
        {value}
      </div>
      {accent && (
        <div className="text-[12px] font-medium text-[#007AFF] mt-2">{accent}</div>
      )}
    </Card>
  );
}
