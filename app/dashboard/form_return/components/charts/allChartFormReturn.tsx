'use client';

import { useEffect, useState } from 'react';
import { FileText, Users, TrendingUp, RefreshCw } from 'lucide-react';
import {
  getFormReturnChartData,
  getAvailableFormReturnYears,
  FormReturnYearData,
} from '../../actions/GetChartData';
import StatsCard from './StatsCard';
import ProvinceChart from './ProvinceChart';
import TypeChart from './TypeChart';
import MonthlyChart from './MonthlyChart';
import OrganizationTypeChart from './OrganizationTypeChart';
import Loading from '@/components/ui/Loading';

// ── Chart card wrapper ─────────────────────────────────────────────────────
function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
interface Props {
  initialYear?: number;
}

export default function DashboardFormReturn({ initialYear }: Props = {}) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(initialYear ?? currentYear);
  const [years, setYears] = useState<number[]>([currentYear]);
  const [data, setData] = useState<FormReturnYearData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (y: number) => {
    setLoading(true);
    const [chartData, availYears] = await Promise.all([
      getFormReturnChartData(y),
      getAvailableFormReturnYears(),
    ]);
    setData(chartData);
    // รวมปีจาก DB + ปีปัจจุบันจาก client เสมอ
    setYears([...new Set([...availYears, currentYear])].sort());
    setLoading(false);
  };

  useEffect(() => { loadData(initialYear ?? currentYear); }, []);

  const handleYearChange = (y: number) => { setYear(y); loadData(y); };

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Form Return Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">ข้อมูลการคืนฟอร์มงดเหล้าเข้าพรรษา</p>
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
          <button onClick={() => loadData(year)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? <Loading size="lg" /> : !data ? null : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="ฟอร์มทั้งหมด" value={data.stats.totalForms} icon="📋" />
            <StatsCard title="องค์กรที่เข้าร่วม" value={data.stats.totalOrganizations} icon="🏢" />
            <StatsCard title="ผู้ลงนามรวม" value={data.stats.totalSigners} icon="✍️" />
            <StatsCard title="ส่งใน 7 วัน" value={data.stats.recentForms} icon="📅" />
          </div>

          {/* Row 1 — Province + Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="จังหวัดที่มีการส่งฟอร์มมากที่สุด">
              {data.provinceData.length > 0 ? (
                <ProvinceChart data={data.provinceData} />
              ) : <p className="text-sm text-gray-400 text-center py-8">ไม่มีข้อมูล</p>}
            </ChartCard>
            <ChartCard title="ประเภทพื้นที่">
              {data.typeData.length > 0 ? (
                <TypeChart data={data.typeData} />
              ) : <p className="text-sm text-gray-400 text-center py-8">ไม่มีข้อมูล</p>}
            </ChartCard>
          </div>

          {/* Row 2 — Monthly */}
          <ChartCard title="การส่งฟอร์มรายเดือน">
            {data.monthlyData.some(m => m.count > 0) ? (
              <MonthlyChart data={data.monthlyData} />
            ) : <p className="text-sm text-gray-400 text-center py-8">ไม่มีข้อมูล</p>}
          </ChartCard>

          {/* Row 3 — Organization type */}
          <ChartCard title="สังกัดองค์กร (Top 10)">
            {data.organizationTypeData.length > 0 ? (
              <OrganizationTypeChart data={data.organizationTypeData} />
            ) : <p className="text-sm text-gray-400 text-center py-8">ไม่มีข้อมูล</p>}
          </ChartCard>
        </>
      )}
    </div>
  );
}
