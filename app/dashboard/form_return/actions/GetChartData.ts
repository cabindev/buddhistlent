'use server';

import prisma from '@/app/lib/db';

export interface FormReturnYearData {
  stats: {
    totalForms: number;
    totalOrganizations: number;
    totalSigners: number;
    recentForms: number;
  };
  provinceData: { province: string; count: number; percentage: number }[];
  typeData: { type: string; count: number; percentage: number }[];
  organizationTypeData: { type: string; count: number; percentage: number }[];
  monthlyData: { month: string; count: number }[];
}

function yearRange(year: number) {
  return {
    gte: new Date(`${year}-01-01T00:00:00.000Z`),
    lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
  };
}

const MONTH_NAMES = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export async function getFormReturnChartData(year?: number): Promise<FormReturnYearData> {
  const where = year ? { createdAt: yearRange(year) } : {};
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  try {
    const [total, orgs, signers, recent, provinces, types, monthly, allOrgs] = await Promise.all([
      prisma.form_return.count({ where }),

      prisma.form_return.groupBy({
        by: ['organizationName'], where,
        _count: { organizationName: true },
      }),

      prisma.form_return.aggregate({
        _sum: { numberOfSigners: true }, where,
      }),

      prisma.form_return.count({
        where: { ...where, createdAt: { gte: sevenDaysAgo } },
      }),

      prisma.form_return.groupBy({
        by: ['province'],
        where: { ...where, province: { not: '' } },
        _count: { province: true },
        orderBy: { _count: { province: 'desc' } },
      }),

      prisma.form_return.groupBy({
        by: ['type'],
        where: { ...where, type: { not: '' } },
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } },
      }),

      prisma.form_return.findMany({
        select: { createdAt: true },
        where,
        orderBy: { createdAt: 'asc' },
      }),

      prisma.form_return.findMany({
        select: { organizationName: true },
        where,
      }),
    ]);

    // Monthly aggregation
    const monthCounts: Record<string, number> = {};
    MONTH_NAMES.forEach(m => { monthCounts[m] = 0; });
    monthly.forEach(r => {
      const m = MONTH_NAMES[r.createdAt.getMonth()];
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    });

    // Organization type aggregation
    const orgTypeCounts: Record<string, number> = {};
    allOrgs.forEach(r => {
      const key = r.organizationName?.trim() || 'ไม่ระบุ';
      orgTypeCounts[key] = (orgTypeCounts[key] || 0) + 1;
    });

    return {
      stats: {
        totalForms: total,
        totalOrganizations: orgs.length,
        totalSigners: signers._sum.numberOfSigners || 0,
        recentForms: recent,
      },
      provinceData: provinces.map(r => ({
        province: r.province,
        count: r._count.province,
        percentage: total > 0 ? Math.round((r._count.province / total) * 100 * 10) / 10 : 0,
      })),
      typeData: types.map(r => ({
        type: r.type,
        count: r._count.type,
        percentage: total > 0 ? Math.round((r._count.type / total) * 100 * 10) / 10 : 0,
      })),
      organizationTypeData: Object.entries(orgTypeCounts)
        .map(([type, count]) => ({
          type,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      monthlyData: MONTH_NAMES.map(month => ({ month, count: monthCounts[month] })),
    };
  } catch (error) {
    console.error('getFormReturnChartData error:', error);
    return {
      stats: { totalForms: 0, totalOrganizations: 0, totalSigners: 0, recentForms: 0 },
      provinceData: [], typeData: [], organizationTypeData: [], monthlyData: [],
    };
  }
}

export async function getAvailableFormReturnYears(): Promise<number[]> {
  try {
    const rows = await prisma.form_return.findMany({
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
