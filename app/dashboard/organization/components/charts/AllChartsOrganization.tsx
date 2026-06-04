'use client';
import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Building2, MapPin, Users, TrendingUp, RefreshCw } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import {
  getOrganizationDashboardSummary,
  getProvinceDistributionChartData,
  getOrganizationTypeChartData,
  getOrganizationCategoryChartData,
  getMonthlySubmissionChartData,
  getSignersChartData,
  getAvailableYears,
} from '../../actions/GetChartData';

// ── Types ──────────────────────────────────────────────────────────────────
interface Summary {
  totalOrganizations: number;
  totalProvinces: number;
  totalCategories: number;
  totalSigners: number;
  avgSignersPerOrganization: number;
  recentOrganizations: number;
}

// ── Shared chart card ──────────────────────────────────────────────────────
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

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, loading }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; loading?: boolean }) {
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
            {sub && <span className="text-sm font-normal text-gray-400 ml-1">{sub}</span>}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DashboardOrganization() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [years, setYears] = useState<number[]>([]);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [provinces, setProvinces] = useState<{ name: string; value: number }[]>([]);
  const [types, setTypes] = useState<{ name: string; value: number }[]>([]);
  const [categories, setCategories] = useState<{ name: string; value: number }[]>([]);
  const [monthly, setMonthly] = useState<{ month: string; count: number }[]>([]);
  const [signers, setSigners] = useState<{ range: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (y: number) => {
    setLoading(true);
    const [sumRes, provRes, typeRes, catRes, monRes, signRes] = await Promise.all([
      getOrganizationDashboardSummary(y),
      getProvinceDistributionChartData(y),
      getOrganizationTypeChartData(y),
      getOrganizationCategoryChartData(y),
      getMonthlySubmissionChartData(y),
      getSignersChartData(y),
    ]);
    if (sumRes.success && sumRes.data) setSummary(sumRes.data);
    if (provRes.success && provRes.data) setProvinces(provRes.data);
    if (typeRes.success && typeRes.data) setTypes(typeRes.data);
    if (catRes.success && catRes.data) setCategories(catRes.data);
    if (monRes.success && monRes.data) setMonthly(monRes.data);
    if (signRes.success && signRes.data) setSigners(signRes.data);
    setLoading(false);
  };

  useEffect(() => {
    getAvailableYears().then(r => {
      const available = r.data ?? [];
      // always show current year even if no data yet
      const merged = [...new Set([...available, currentYear])].sort();
      setYears(merged);
    });
    loadData(currentYear);
  }, []);

  const handleYearChange = (y: number) => {
    setYear(y);
    loadData(y);
  };

  // ── Chart options ──────────────────────────────────────────────────────
  const baseTooltip = {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    textStyle: { color: '#374151', fontSize: 12 },
  };

  const provinceOption = {
    tooltip: { ...baseTooltip, trigger: 'axis' },
    grid: { left: '2%', right: '2%', bottom: '15%', top: '5%', containLabel: true },
    xAxis: { type: 'category', data: provinces.slice(0, 15).map(p => p.name), axisLabel: { rotate: 35, fontSize: 10, color: '#6B7280' } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10, color: '#6B7280' }, splitLine: { lineStyle: { color: '#F3F4F6' } } },
    series: [{ type: 'bar', data: provinces.slice(0, 15).map(p => p.value), itemStyle: { color: '#10B981', borderRadius: [3, 3, 0, 0] } }],
  };

  const typeOption = {
    tooltip: { ...baseTooltip, trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, left: 'center', textStyle: { fontSize: 10 } },
    series: [{
      type: 'pie', radius: ['40%', '65%'], center: ['50%', '42%'],
      label: { show: false },
      data: types.map((t, i) => ({
        name: t.name, value: t.value,
        itemStyle: { color: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#059669'][i % 6] },
      })),
    }],
  };

  const categoryOption = {
    tooltip: { ...baseTooltip, trigger: 'axis' },
    grid: { left: '2%', right: '2%', bottom: '20%', top: '5%', containLabel: true },
    xAxis: { type: 'category', data: categories.slice(0, 10).map(c => c.name.length > 10 ? c.name.slice(0, 10) + '…' : c.name), axisLabel: { rotate: 35, fontSize: 9, color: '#6B7280' } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10, color: '#6B7280' }, splitLine: { lineStyle: { color: '#F3F4F6' } } },
    series: [{ type: 'bar', data: categories.slice(0, 10).map(c => c.value), itemStyle: { color: '#6366F1', borderRadius: [3, 3, 0, 0] } }],
  };

  const monthlyOption = {
    tooltip: { ...baseTooltip, trigger: 'axis' },
    grid: { left: '2%', right: '2%', bottom: '15%', top: '5%', containLabel: true },
    xAxis: { type: 'category', data: monthly.map(m => m.month), axisLabel: { fontSize: 10, color: '#6B7280' } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10, color: '#6B7280' }, splitLine: { lineStyle: { color: '#F3F4F6' } } },
    series: [{
      type: 'bar', data: monthly.map(m => m.count),
      itemStyle: { color: '#F59E0B', borderRadius: [3, 3, 0, 0] },
      areaStyle: { color: 'rgba(245, 158, 11, 0.1)' },
    }],
  };

  const signersOption = {
    tooltip: { ...baseTooltip, trigger: 'axis' },
    grid: { left: '2%', right: '2%', bottom: '10%', top: '5%', containLabel: true },
    xAxis: { type: 'category', data: signers.map(s => s.range), axisLabel: { fontSize: 10, color: '#6B7280' } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10, color: '#6B7280' }, splitLine: { lineStyle: { color: '#F3F4F6' } } },
    series: [{ type: 'bar', data: signers.map(s => s.count), itemStyle: { color: '#8B5CF6', borderRadius: [3, 3, 0, 0] } }],
  };

  return (
    <div className="p-6 space-y-5">

      {/* Header + Year tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Organization Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">ข้อมูลองค์กรที่เข้าร่วมโครงการงดเหล้าเข้าพรรษา</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {years.map(y => (
              <button
                key={y}
                onClick={() => handleYearChange(y)}
                className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  year === y ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
          <button
            onClick={() => loadData(year)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="รีเฟรช"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <Loading size="lg" />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Building2 className="w-5 h-5" />} label="องค์กรทั้งหมด" value={summary?.totalOrganizations ?? 0} sub="องค์กร" />
            <StatCard icon={<MapPin className="w-5 h-5" />} label="จังหวัดที่เข้าร่วม" value={summary?.totalProvinces ?? 0} sub="จังหวัด" />
            <StatCard icon={<Users className="w-5 h-5" />} label="ผู้ลงนามรวม" value={summary?.totalSigners ?? 0} sub="คน" />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} label="เฉลี่ยผู้ลงนาม/องค์กร" value={summary?.avgSignersPerOrganization ?? 0} sub="คน" />
          </div>

          {/* Row 1 — Province + Type */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="จังหวัดที่มีองค์กรมากที่สุด (Top 15)" className="lg:col-span-2">
              {provinces.length ? (
                <ReactECharts option={provinceOption} style={{ height: 300 }} opts={{ renderer: 'svg' }} />
              ) : <p className="text-sm text-gray-400 text-center py-8">ไม่มีข้อมูล</p>}
            </ChartCard>
            <ChartCard title="ประเภทองค์กร">
              {types.length ? (
                <ReactECharts option={typeOption} style={{ height: 300 }} opts={{ renderer: 'svg' }} />
              ) : <p className="text-sm text-gray-400 text-center py-8">ไม่มีข้อมูล</p>}
            </ChartCard>
          </div>

          {/* Row 2 — Monthly + Signers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="การลงทะเบียนรายเดือน">
              {monthly.length ? (
                <ReactECharts option={monthlyOption} style={{ height: 260 }} opts={{ renderer: 'svg' }} />
              ) : <p className="text-sm text-gray-400 text-center py-8">ไม่มีข้อมูล</p>}
            </ChartCard>
            <ChartCard title="การกระจายจำนวนผู้ลงนาม">
              {signers.length ? (
                <ReactECharts option={signersOption} style={{ height: 260 }} opts={{ renderer: 'svg' }} />
              ) : <p className="text-sm text-gray-400 text-center py-8">ไม่มีข้อมูล</p>}
            </ChartCard>
          </div>

          {/* Row 3 — Category */}
          <ChartCard title="หมวดหมู่องค์กร">
            {categories.length ? (
              <ReactECharts option={categoryOption} style={{ height: 280 }} opts={{ renderer: 'svg' }} />
            ) : <p className="text-sm text-gray-400 text-center py-8">ไม่มีข้อมูล</p>}
          </ChartCard>

          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'ลงทะเบียนใน 7 วัน', value: summary?.recentOrganizations ?? 0, sub: 'องค์กร' },
              { label: 'หมวดหมู่ที่เปิดใช้', value: summary?.totalCategories ?? 0, sub: 'ประเภท' },
              { label: 'จังหวัดที่เข้าร่วม', value: summary?.totalProvinces ?? 0, sub: `/ ${year}` },
              { label: 'ผู้ลงนามเฉลี่ย', value: summary?.avgSignersPerOrganization ?? 0, sub: 'คน/องค์กร' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center">
                <p className="text-2xl font-semibold text-gray-900">{s.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
