'use client';

interface StatProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

const trendColors: Record<string, string> = {
  up: 'text-[#34C759]',
  down: 'text-[#FF3B30]',
  neutral: 'text-[#8E8E93]',
};

const trendArrows: Record<string, string> = {
  up: 'M5 15l7-7 7 7',
  down: 'M19 9l-7 7-7-7',
  neutral: 'M5 12h14',
};

export function Stat({ label, value, trend, className = '' }: StatProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide">
        {label}
      </span>
      <span className="text-2xl font-bold text-[#1C1C1E]">{value}</span>
      {trend && (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            trendColors[trend.direction]
          }`}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={trendArrows[trend.direction]}
            />
          </svg>
          {Math.abs(trend.value)}%
        </span>
      )}
    </div>
  );
}
