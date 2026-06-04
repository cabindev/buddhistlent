'use client';

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  trend?: number;
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4">
      <div className="text-2xl w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className="text-xl font-semibold text-gray-900">
          {new Intl.NumberFormat('th-TH').format(value)}
        </p>
        {trend !== undefined && (
          <p className={`text-xs mt-0.5 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend).toFixed(1)}%
          </p>
        )}
      </div>
    </div>
  );
}
