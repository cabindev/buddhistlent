'use client';

import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../soberCheers/actions/GetChartData';
import { Users, MapPin, Globe, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  isAdmin: boolean;
}

interface StatsData {
  totalParticipants: number;
  totalProvinces: number;
  totalRegions: number;
  avgAge: number;
}

export default function DashboardStats({ isAdmin }: DashboardStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await getDashboardSummary();
      if (result.success && result.data) setStats(result.data);
      else setError(result.error || 'Failed to load stats');
    } catch {
      setError('Error loading dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="animate-pulse">
              <div className="w-6 h-6 bg-gray-200 rounded mb-2"></div>
              <div className="w-16 h-4 bg-gray-200 rounded mb-1"></div>
              <div className="w-20 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm">ไม่สามารถโหลดข้อมูลสถิติได้: {error}</p>
          <button onClick={loadStats} className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  const statsConfig = [
    { title: 'ผู้เข้าร่วมทั้งหมด', value: stats.totalParticipants.toLocaleString(), icon: Users, description: 'ผู้ลงทะเบียนงดเหล้า' },
    { title: 'จังหวัดที่เข้าร่วม', value: stats.totalProvinces.toString(), icon: MapPin, description: 'จังหวัดทั่วประเทศ' },
    { title: 'ภูมิภาคที่เข้าร่วม', value: stats.totalRegions.toString(), icon: Globe, description: 'ภูมิภาค' },
    { title: 'อายุเฉลี่ย', value: `${stats.avgAge} ปี`, icon: TrendingUp, description: 'อายุเฉลี่ยผู้เข้าร่วม' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded bg-gray-50">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-gray-900">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-700">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
