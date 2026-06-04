'use client';
import React, { useEffect, useState } from 'react';
import { Users, MapPin, Globe, TrendingUp, RefreshCw } from 'lucide-react';
import { getDashboardSummary, getTotalCount, getAvailableSoberCheersYears } from '../actions/GetChartData';
import AlcoholConsumptionChart from './consumptionChart';
import GenderChart from './genderChart';
import TypeChart from './type';
import DrinkingFrequencyChart from './drinkingFrequency';
import IntentPeriodChart from './intentPeriod';
import MonthlyExpenseSummary from './monthlyExpense';
import HealthImpactChart from './healthyImpact';
import MotiVation from './motivations';
import ProvinceCount from './ProvinceCount';
import ProvinceMap from './ProvinceMap';

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, unit, loading }: { icon: React.ReactNode; label: string; value: string | number; unit: string; loading?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4">
      <div className="p-2.5 bg-gray-50 rounded-lg text-gray-500">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        {loading ? (
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
        ) : (
          <p className="text-xl font-semibold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
            <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ── Chart Card ─────────────────────────────────────────────────────────────
function ChartCard({ title, children, className = '', minHeight = 'min-h-[360px]' }: {
  title: string; children: React.ReactNode; className?: string; minHeight?: string;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>
      <div className={`p-4 ${minHeight}`}>{children}</div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardSober() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [years, setYears] = useState<number[]>([currentYear]);
  const [stats, setStats] = useState({ totalParticipants: 0, totalProvinces: 0, totalRegions: 0, avgAge: 0 });
  const [loading, setLoading] = useState(true);

  const loadStats = async (y: number) => {
    setLoading(true);
    const [sumResult, availYears] = await Promise.all([
      getDashboardSummary(y),
      getAvailableSoberCheersYears(),
    ]);
    if (sumResult.success && sumResult.data) setStats(sumResult.data);
    setYears([...new Set([...availYears, currentYear])].sort());
    setLoading(false);
  };

  useEffect(() => { loadStats(currentYear); }, []);

  const handleYearChange = (y: number) => { setYear(y); loadStats(y); };

  return (
    <div className="p-6 space-y-5">

      {/* Header + Year tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sober Cheers Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">ข้อมูลผู้เข้าร่วมโครงการงดเหล้าเข้าพรรษา</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {years.map(y => (
              <button key={y} onClick={() => handleYearChange(y)}
                className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  year === y ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >{y}</button>
            ))}
          </div>
          <button onClick={() => loadStats(year)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="ผู้ลงทะเบียนทั้งหมด" value={stats.totalParticipants} unit="คน" loading={loading} />
        <StatCard icon={<MapPin className="w-5 h-5" />} label="จังหวัดที่เข้าร่วม" value={stats.totalProvinces} unit="จังหวัด" loading={loading} />
        <StatCard icon={<Globe className="w-5 h-5" />} label="ภูมิภาคที่เข้าร่วม" value={stats.totalRegions} unit="ภาค" loading={loading} />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="อายุเฉลี่ย" value={stats.avgAge} unit="ปี" loading={loading} />
      </div>

      {/* Charts — ส่ง year ให้ทุก component, key={year} บังคับ re-mount เมื่อเปลี่ยนปี */}
      <div key={year}>
        {/* Row 1 — Region + Gender */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-4">
          <ChartCard title="การกระจายตามภูมิภาค" className="xl:col-span-3" minHeight="min-h-[420px]">
            <TypeChart year={year} />
          </ChartCard>
          <ChartCard title="การแบ่งตามเพศ" className="xl:col-span-2" minHeight="min-h-[420px]">
            <GenderChart year={year} />
          </ChartCard>
        </div>

        {/* Row 2 — Province ranking */}
        <ChartCard title="อันดับจังหวัดที่มีผู้ลงทะเบียนมากที่สุด" minHeight="min-h-[560px]" className="mb-4">
          <ProvinceCount year={year} />
        </ChartCard>

        {/* Row 3 — Map */}
        <ChartCard title="แผนที่การกระจายตามจังหวัด" minHeight="min-h-[560px]" className="mb-4">
          <ProvinceMap year={year} />
        </ChartCard>

        {/* Row 4 — Drinking frequency */}
        <ChartCard title="ความถี่ในการดื่มแอลกอฮอล์" minHeight="min-h-[460px]" className="mb-4">
          <DrinkingFrequencyChart year={year} />
        </ChartCard>

        {/* Row 5 — Consumption + Intent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ChartCard title="ปริมาณการบริโภคแอลกอฮอล์" minHeight="min-h-[380px]">
            <AlcoholConsumptionChart year={year} />
          </ChartCard>
          <ChartCard title="ระยะเวลาที่ตั้งใจงด" minHeight="min-h-[380px]">
            <IntentPeriodChart year={year} />
          </ChartCard>
        </div>

        {/* Row 6 — Expense + Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ChartCard title="ค่าใช้จ่ายรายเดือน" minHeight="min-h-[380px]">
            <MonthlyExpenseSummary year={year} />
          </ChartCard>
          <ChartCard title="ผลกระทบต่อสุขภาพ" minHeight="min-h-[380px]">
            <HealthImpactChart year={year} />
          </ChartCard>
        </div>

        {/* Row 7 — Motivations */}
        <ChartCard title="แรงจูงใจในการงดเหล้า" minHeight="min-h-[420px]">
          <MotiVation year={year} />
        </ChartCard>
      </div>
    </div>
  );
}
