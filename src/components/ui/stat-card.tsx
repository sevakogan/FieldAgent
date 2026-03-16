import { Card } from "./card";

interface StatCardProps {
  readonly label: string;
  readonly value: string;
  readonly accent?: string;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <Card>
      <div className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">
        {label.toUpperCase()}
      </div>
      <div className="text-3xl font-black tracking-tight leading-none">
        {value}
      </div>
      {accent && (
        <div className="text-xs font-semibold text-brand mt-2">{accent}</div>
      )}
    </Card>
  );
}
