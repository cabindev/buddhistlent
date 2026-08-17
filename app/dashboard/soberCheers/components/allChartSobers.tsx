'use client';
import React, { useEffect, useState } from 'react';
import { getDashboardSummary, getTotalCount, getAvailableSoberCheersYears, getAffiliationBreakdown, AffiliationBreakdown } from '../actions/GetChartData';

const ZONES = [
  'กรุงเทพมหานคร', 'กลาง', 'ตะวันตก', 'ตะวันออก', 'อีสานบน',
  'อีสานล่าง', 'เหนือบน', 'เหนือล่าง', 'ใต้บน', 'ใต้ล่าง',
];
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
import JobChart from './jobChart';
import AffiliationChart from './affiliationChart';

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, loading }: { label: string; value: string | number; unit: string; loading?: boolean }) {
  return (
    <div className="bg-white border border-[oklch(95%_0.196_126.665)] rounded-lg px-4 py-3">
      <p className="text-[11px] font-normal text-black/50 mb-1">{label}</p>
      {loading ? (
        <div className="h-5 w-14 bg-[oklch(97%_0.196_126.665)] rounded animate-pulse" />
      ) : (
        <p className="text-base font-medium text-black">
          {typeof value === 'number' ? value.toLocaleString() : value}
          <span className="text-xs font-normal text-black/40 ml-1">{unit}</span>
        </p>
      )}
    </div>
  );
}

// ── Affiliation breakdown — จำนวนคนของแต่ละสังกัด ──────────────────────────
function AffiliationBreakdownCard({ data, loading }: { data: AffiliationBreakdown | null; loading?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const COLLAPSED = 8;

  if (loading) {
    return (
      <div className="bg-white border border-[oklch(95%_0.196_126.665)] rounded-lg px-5 py-4 space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-[oklch(97%_0.196_126.665)] rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="bg-white border border-[oklch(95%_0.196_126.665)] rounded-lg px-5 py-8 text-center text-xs text-black/40">
        ไม่มีข้อมูลสังกัด
      </div>
    );
  }

  const max = data.items[0].value;
  const shown = expanded ? data.items : data.items.slice(0, COLLAPSED);
  const pct = (v: number) => data.totalParticipants ? (v / data.totalParticipants) * 100 : 0;

  return (
    <div className="bg-white border border-[oklch(95%_0.196_126.665)] rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-[oklch(97%_0.196_126.665)] flex items-center justify-between gap-3">
        <h3 className="text-xs font-medium text-black">จำนวนผู้ลงทะเบียนแต่ละสังกัด</h3>
        <span className="text-[11px] text-black/40">
          {data.totalAffiliations.toLocaleString()} สังกัด
          {data.unspecified > 0 && ` · ไม่ระบุ ${data.unspecified.toLocaleString()} คน`}
        </span>
      </div>

      <div className="divide-y divide-[oklch(97%_0.196_126.665)]">
        {shown.map((item, i) => (
          <div key={item.name} className="px-5 py-2.5 flex items-center gap-3">
            <span className="w-5 text-[11px] text-black/30 tabular-nums">{i + 1}</span>
            <span className="flex-1 min-w-0 text-xs text-black/70 truncate" title={item.name}>{item.name}</span>
            <div className="hidden sm:block w-32 h-1.5 bg-[oklch(97%_0.196_126.665)] rounded-full overflow-hidden">
              <div className="h-full bg-[oklch(68%_0.196_126.665)] rounded-full"
                style={{ width: `${max ? (item.value / max) * 100 : 0}%` }} />
            </div>
            <span className="w-20 text-right text-xs font-medium text-black tabular-nums">
              {item.value.toLocaleString()} <span className="text-[11px] font-normal text-black/40">คน</span>
            </span>
            <span className="w-12 text-right text-[11px] text-black/40 tabular-nums">{pct(item.value).toFixed(1)}%</span>
          </div>
        ))}
      </div>

      {data.items.length > COLLAPSED && (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full px-5 py-2.5 text-[11px] text-black/50 hover:text-[oklch(56%_0.196_126.665)] hover:bg-[oklch(97%_0.196_126.665)] border-t border-[oklch(97%_0.196_126.665)] transition-colors">
          {expanded ? 'ย่อรายการ' : `ดูทั้งหมด ${data.items.length.toLocaleString()} สังกัด`}
        </button>
      )}
    </div>
  );
}

// ── Chart Card ─────────────────────────────────────────────────────────────
function ChartCard({ title, children, className = '', minHeight = 'min-h-[360px]' }: {
  title: string; children: React.ReactNode; className?: string; minHeight?: string;
}) {
  return (
    <div className={`bg-white border border-[oklch(95%_0.196_126.665)] rounded-lg overflow-hidden ${className}`}>
      <div className="px-5 py-3 border-b border-[oklch(97%_0.196_126.665)]">
        <h3 className="text-xs font-medium text-black">{title}</h3>
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
  const [zone, setZone] = useState('');
  const [stats, setStats] = useState({ totalParticipants: 0, totalProvinces: 0, totalRegions: 0, avgAge: 0 });
  const [affiliations, setAffiliations] = useState<AffiliationBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async (y: number, z: string) => {
    setLoading(true);
    const [sumResult, affResult, availYears] = await Promise.all([
      getDashboardSummary(y, z || undefined),
      getAffiliationBreakdown(y, z || undefined),
      getAvailableSoberCheersYears(),
    ]);
    if (sumResult.success && sumResult.data) setStats(sumResult.data);
    setAffiliations(affResult.success && affResult.data ? affResult.data : null);
    setYears([...new Set([...availYears, currentYear])].sort());
    setLoading(false);
  };

  useEffect(() => { loadStats(currentYear, ''); }, []);

  const handleYearChange = (y: number) => { setYear(y); loadStats(y, zone); };
  const handleZoneChange = (z: string) => { setZone(z); loadStats(year, z); };

  return (
    <div className="p-6 space-y-5 bg-white">

      {/* Header + Year tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-base font-medium text-black">Sober Cheers Dashboard</h1>
          <p className="text-xs text-black/50 mt-0.5">ข้อมูลผู้เข้าร่วมโครงการงดเหล้าเข้าพรรษา</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={zone} onChange={e => handleZoneChange(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-[oklch(95%_0.196_126.665)] bg-white text-black/70 focus:outline-none focus:ring-2 focus:ring-[oklch(93%_0.196_126.665)]">
            <option value="">ทุกโซน</option>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <div className="flex bg-[oklch(97%_0.196_126.665)] rounded-lg p-1 gap-1">
            {years.map(y => (
              <button key={y} onClick={() => handleYearChange(y)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  year === y ? 'bg-[oklch(68%_0.196_126.665)] text-white' : 'text-black/50 hover:text-black'
                }`}
              >{y}</button>
            ))}
          </div>
          <button onClick={() => loadStats(year, zone)}
            className="px-2.5 py-1 text-xs text-black/40 hover:text-[oklch(68%_0.196_126.665)] hover:bg-[oklch(97%_0.196_126.665)] rounded-lg transition-colors">
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="ผู้ลงทะเบียนทั้งหมด" value={stats.totalParticipants} unit="คน" loading={loading} />
        <StatCard label="จังหวัดที่เข้าร่วม" value={stats.totalProvinces} unit="จังหวัด" loading={loading} />
        <StatCard label="ภูมิภาคที่เข้าร่วม" value={stats.totalRegions} unit="ภาค" loading={loading} />
        <StatCard label="สังกัดที่เข้าร่วม" value={affiliations?.totalAffiliations ?? 0} unit="สังกัด" loading={loading} />
        <StatCard label="อายุเฉลี่ย" value={stats.avgAge} unit="ปี" loading={loading} />
      </div>

      {/* จำนวนผู้ลงทะเบียนแยกตามสังกัด */}
      <AffiliationBreakdownCard data={affiliations} loading={loading} />

      {/* Charts — ส่ง year+zone ให้ทุก component, key บังคับ re-mount เมื่อเปลี่ยนตัวกรอง */}
      <div key={`${year}-${zone}`}>
        {/* Row 1 — Region + Gender */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-4">
          <ChartCard title="การกระจายตามภูมิภาค" className="xl:col-span-3" minHeight="min-h-[420px]">
            <TypeChart year={year} zone={zone || undefined} />
          </ChartCard>
          <ChartCard title="การแบ่งตามเพศ" className="xl:col-span-2" minHeight="min-h-[420px]">
            <GenderChart year={year} zone={zone || undefined} />
          </ChartCard>
        </div>

        {/* Row 2 — Province ranking */}
        <ChartCard title="อันดับจังหวัดที่มีผู้ลงทะเบียนมากที่สุด" minHeight="min-h-[560px]" className="mb-4">
          <ProvinceCount year={year} zone={zone || undefined} />
        </ChartCard>

        {/* Row 3 — Map */}
        <ChartCard title="แผนที่การกระจายตามจังหวัด" minHeight="min-h-[560px]" className="mb-4">
          <ProvinceMap year={year} zone={zone || undefined} />
        </ChartCard>

        {/* Row 4 — Drinking frequency */}
        <ChartCard title="ความถี่ในการดื่มแอลกอฮอล์" minHeight="min-h-[460px]" className="mb-4">
          <DrinkingFrequencyChart year={year} zone={zone || undefined} />
        </ChartCard>

        {/* Row 5 — Consumption + Intent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ChartCard title="ปริมาณการบริโภคแอลกอฮอล์" minHeight="min-h-[380px]">
            <AlcoholConsumptionChart year={year} zone={zone || undefined} />
          </ChartCard>
          <ChartCard title="ระยะเวลาที่ตั้งใจงด" minHeight="min-h-[380px]">
            <IntentPeriodChart year={year} zone={zone || undefined} />
          </ChartCard>
        </div>

        {/* Row 6 — Expense + Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ChartCard title="ค่าใช้จ่ายรายเดือน" minHeight="min-h-[380px]">
            <MonthlyExpenseSummary year={year} zone={zone || undefined} />
          </ChartCard>
          <ChartCard title="ผลกระทบต่อสุขภาพ" minHeight="min-h-[380px]">
            <HealthImpactChart year={year} zone={zone || undefined} />
          </ChartCard>
        </div>

        {/* Row 7 — Motivations */}
        <ChartCard title="แรงจูงใจในการงดเหล้า" minHeight="min-h-[420px]">
          <MotiVation year={year} zone={zone || undefined} />
        </ChartCard>

        {/* Row 8 — Occupation + Affiliation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <ChartCard title="อาชีพ" minHeight="min-h-[420px]">
            <JobChart year={year} zone={zone || undefined} />
          </ChartCard>
          <ChartCard title="สังกัด" minHeight="min-h-[420px]">
            <AffiliationChart year={year} zone={zone || undefined} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
