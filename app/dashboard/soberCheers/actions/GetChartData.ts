'use server';

import prisma from '@/app/lib/db';

type ChartResult<T> = { success: boolean; data?: T; error?: string };

export interface DashboardSummaryData {
  totalParticipants: number;
  totalProvinces: number;
  totalRegions: number;
  avgAge: number;
}

function yearWhere(year?: number) {
  if (!year) return {};
  return {
    createdAt: {
      gte: new Date(`${year}-01-01T00:00:00.000Z`),
      lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
    },
  };
}

// ── Available years ────────────────────────────────────────────────────────
export async function getAvailableSoberCheersYears(): Promise<number[]> {
  try {
    const rows = await prisma.soberCheers.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const years = [...new Set(rows.map(r => r.createdAt.getFullYear()))].sort();
    const current = new Date().getFullYear();
    return [...new Set([...years, current])].sort();
  } catch {
    return [new Date().getFullYear()];
  }
}

// ── Summary ────────────────────────────────────────────────────────────────
export async function getDashboardSummary(year?: number): Promise<ChartResult<DashboardSummaryData>> {
  try {
    const where = yearWhere(year);
    const [totalParticipants, provinces, all] = await Promise.all([
      prisma.soberCheers.count({ where }),
      prisma.soberCheers.findMany({ select: { province: true }, distinct: ['province'], where }),
      prisma.soberCheers.findMany({ select: { type: true, birthday: true }, where }),
    ]);

    const totalProvinces = provinces.length;
    const totalRegions = new Set(all.map(r => r.type).filter(Boolean)).size;
    const ages = all
      .map(r => r.birthday ? Math.floor((Date.now() - new Date(r.birthday).getTime()) / (365.25 * 24 * 3600 * 1000)) : null)
      .filter((a): a is number => a !== null && a > 0);
    const avgAge = ages.length ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : 0;

    return { success: true, data: { totalParticipants, totalProvinces, totalRegions, avgAge } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Total count ────────────────────────────────────────────────────────────
export async function getTotalCount(year?: number): Promise<ChartResult<number>> {
  try {
    const count = await prisma.soberCheers.count({ where: yearWhere(year) });
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Gender ─────────────────────────────────────────────────────────────────
export async function getGenderChartData(year?: number): Promise<ChartResult<{ name: string; value: number }[]>> {
  try {
    const rows = await prisma.soberCheers.groupBy({
      by: ['gender'], where: yearWhere(year),
      _count: { gender: true },
      orderBy: { _count: { gender: 'desc' } },
    });
    return { success: true, data: rows.map(r => ({ name: r.gender || 'ไม่ระบุ', value: r._count.gender })) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Top 10 Provinces ───────────────────────────────────────────────────────
export async function getTop10ProvincesChartData(year?: number): Promise<ChartResult<{ name: string; value: number }[]>> {
  try {
    const rows = await prisma.soberCheers.groupBy({
      by: ['province'], where: yearWhere(year),
      _count: { province: true },
      orderBy: { _count: { province: 'desc' } },
      take: 10,
    });
    return { success: true, data: rows.map(r => ({ name: r.province, value: r._count.province })) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Age groups ─────────────────────────────────────────────────────────────
export async function getAgeGroupChartData(year?: number): Promise<ChartResult<{ name: string; value: number }[]>> {
  try {
    const rows = await prisma.soberCheers.findMany({ select: { birthday: true }, where: yearWhere(year) });
    const groups: Record<string, number> = {
      'น้อยกว่า 20': 0, '20-29': 0, '30-39': 0, '40-49': 0, '50-59': 0, '60 ขึ้นไป': 0,
    };
    rows.forEach(r => {
      if (!r.birthday) return;
      const age = Math.floor((Date.now() - new Date(r.birthday).getTime()) / (365.25 * 24 * 3600 * 1000));
      if (age < 20) groups['น้อยกว่า 20']++;
      else if (age < 30) groups['20-29']++;
      else if (age < 40) groups['30-39']++;
      else if (age < 50) groups['40-49']++;
      else if (age < 60) groups['50-59']++;
      else groups['60 ขึ้นไป']++;
    });
    return { success: true, data: Object.entries(groups).map(([name, value]) => ({ name, value })) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Drinking frequency ─────────────────────────────────────────────────────
export async function getDrinkingFrequencyChartData(year?: number): Promise<ChartResult<{ name: string; value: number }[]>> {
  try {
    const where = { ...yearWhere(year), drinkingFrequency: { not: null } } as any;
    const rows = await prisma.soberCheers.groupBy({
      by: ['drinkingFrequency'], where,
      _count: { drinkingFrequency: true },
      orderBy: { _count: { drinkingFrequency: 'desc' } },
    });
    return { success: true, data: rows.map(r => ({ name: r.drinkingFrequency!, value: r._count.drinkingFrequency })) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Alcohol consumption ────────────────────────────────────────────────────
export async function getAlcoholConsumptionChartData(year?: number): Promise<ChartResult<{ name: string; value: number }[]>> {
  try {
    const rows = await prisma.soberCheers.groupBy({
      by: ['alcoholConsumption'], where: yearWhere(year),
      _count: { alcoholConsumption: true },
      orderBy: { _count: { alcoholConsumption: 'desc' } },
    });
    return { success: true, data: rows.map(r => ({ name: r.alcoholConsumption, value: r._count.alcoholConsumption })) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Provinces with data ────────────────────────────────────────────────────
export async function getProvincesWithData(year?: number): Promise<ChartResult<{ province: string; count: number }[]>> {
  try {
    const rows = await prisma.soberCheers.groupBy({
      by: ['province'], where: yearWhere(year),
      _count: { province: true },
      orderBy: { _count: { province: 'desc' } },
    });
    return { success: true, data: rows.map(r => ({ province: r.province, count: r._count.province })) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Type/Region counts ─────────────────────────────────────────────────────
export async function getTypeRegionCounts(year?: number): Promise<ChartResult<{ name: string; value: number }[]>> {
  try {
    const where = { ...yearWhere(year), type: { not: null } } as any;
    const rows = await prisma.soberCheers.groupBy({
      by: ['type'], where,
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } },
    });
    return { success: true, data: rows.map(r => ({ name: r.type!, value: r._count.type })) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Intent period ──────────────────────────────────────────────────────────
export async function getIntentPeriodChartData(year?: number): Promise<ChartResult<{ data: { name: string; value: number }[]; total: number }>> {
  try {
    const where = { ...yearWhere(year), intentPeriod: { not: null } } as any;
    const rows = await prisma.soberCheers.groupBy({
      by: ['intentPeriod'], where,
      _count: { intentPeriod: true },
      orderBy: { _count: { intentPeriod: 'desc' } },
    });
    const data = rows.map(r => ({
      name: r.intentPeriod === 'Unknown' ? 'เลิกดื่มมาแล้วมากกว่า 3 ปี หรือ ไม่เคยดื่มเลยตลอดชีวิต' : r.intentPeriod!,
      value: r._count.intentPeriod,
    }));
    return { success: true, data: { data, total: data.reduce((s, r) => s + r.value, 0) } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Monthly expense ────────────────────────────────────────────────────────
export async function getMonthlyExpenseSummary(year?: number): Promise<ChartResult<{ total: number; average: number; participantCount: number }>> {
  try {
    const where = { ...yearWhere(year), monthlyExpense: { not: null, gt: 0 } } as any;
    const result = await prisma.soberCheers.aggregate({
      _sum: { monthlyExpense: true },
      _avg: { monthlyExpense: true },
      _count: { monthlyExpense: true },
      where,
    });
    return {
      success: true,
      data: {
        total: result._sum.monthlyExpense || 0,
        average: Math.round(result._avg.monthlyExpense || 0),
        participantCount: result._count.monthlyExpense,
      },
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Health impact ──────────────────────────────────────────────────────────
export async function getHealthImpactChartData(year?: number): Promise<ChartResult<{ name: string; value: number }[]>> {
  try {
    const rows = await prisma.soberCheers.groupBy({
      by: ['healthImpact'], where: yearWhere(year),
      _count: { healthImpact: true },
      orderBy: { _count: { healthImpact: 'desc' } },
    });
    return { success: true, data: rows.map(r => ({ name: r.healthImpact, value: r._count.healthImpact })) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Motivations ────────────────────────────────────────────────────────────
export async function getMotivationsChartData(year?: number): Promise<ChartResult<{ motivationCounts: Record<string, number>; totalResponses: number }>> {
  try {
    const rows = await prisma.soberCheers.findMany({ select: { motivations: true }, where: yearWhere(year) });
    const counts: Record<string, number> = {};
    let totalResponses = 0;
    rows.forEach(r => {
      const motivations = Array.isArray(r.motivations) ? r.motivations
        : typeof r.motivations === 'string' ? JSON.parse(r.motivations) : [];
      motivations.forEach((m: string) => { counts[m] = (counts[m] || 0) + 1; totalResponses++; });
    });
    return { success: true, data: { motivationCounts: counts, totalResponses } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}
