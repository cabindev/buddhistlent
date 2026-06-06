'use client';

interface StatsCardProps {
  title: string;
  value: number;
  icon?: string;
  trend?: number;
}

export default function StatsCard({ title, value, trend }: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <p className="text-xs text-gray-500 mb-2">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 tabular-nums">
        {new Intl.NumberFormat('th-TH').format(value)}
      </p>
      {trend !== undefined && (
        <p className={`text-xs mt-1 ${trend > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
          {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend).toFixed(1)}%
        </p>
      )}
    </div>
  );
}
