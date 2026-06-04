'use server';

import prisma from '@/app/lib/db';

type R<T> = { success: boolean; data?: T; error?: string };

function yearRange(year: number) {
  return {
    gte: new Date(`${year}-01-01T00:00:00.000Z`),
    lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
  };
}

// ── Summary stats ──────────────────────────────────────────────────────────
export async function getOrganizationDashboardSummary(year?: number): Promise<R<{
  totalOrganizations: number;
  totalProvinces: number;
  totalCategories: number;
  totalSigners: number;
  avgSignersPerOrganization: number;
  recentOrganizations: number;
}>> {
  try {
    const where = year ? { createdAt: yearRange(year) } : {};
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    const [total, provinces, categories, signers, recent] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({ select: { province: true }, where }),
      prisma.organizationCategory.count({ where: { isActive: true } }),
      prisma.organization.findMany({ select: { numberOfSigners: true }, where }),
      prisma.organization.count({ where: { ...where, createdAt: { gte: sevenDaysAgo } } }),
    ]);

    const uniqueProvinces = new Set(provinces.map(p => p.province).filter(Boolean)).size;
    const signerNums = signers.map(s => s.numberOfSigners).filter((n): n is number => n !== null && n > 0);
    const totalSigners = signerNums.reduce((a, b) => a + b, 0);
    const avg = signerNums.length ? Math.round(totalSigners / signerNums.length) : 0;

    return {
      success: true,
      data: {
        totalOrganizations: total,
        totalProvinces: uniqueProvinces,
        totalCategories: categories,
        totalSigners,
        avgSignersPerOrganization: avg,
        recentOrganizations: recent,
      },
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Province distribution ──────────────────────────────────────────────────
export async function getProvinceDistributionChartData(year?: number): Promise<R<{ name: string; value: number }[]>> {
  try {
    const where = year ? { createdAt: yearRange(year) } : {};
    const rows = await prisma.organization.groupBy({
      by: ['province'],
      _count: { province: true },
      where: { ...where, province: { not: '' } },
      orderBy: { _count: { province: 'desc' } },
    });
    return {
      success: true,
      data: rows.filter(r => r.province).map(r => ({ name: r.province, value: r._count.province })),
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Organization type ──────────────────────────────────────────────────────
export async function getOrganizationTypeChartData(year?: number): Promise<R<{ name: string; value: number }[]>> {
  try {
    const where = year ? { createdAt: yearRange(year) } : {};
    const rows = await prisma.organization.findMany({ select: { type: true }, where });
    const counts: Record<string, number> = {};
    rows.forEach(r => {
      const key = r.type?.trim() || 'ไม่ระบุ';
      counts[key] = (counts[key] || 0) + 1;
    });
    return {
      success: true,
      data: Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Organization category ──────────────────────────────────────────────────
export async function getOrganizationCategoryChartData(year?: number): Promise<R<{ name: string; value: number }[]>> {
  try {
    const where = year ? { createdAt: yearRange(year) } : {};
    const rows = await prisma.organization.groupBy({
      by: ['organizationCategoryId'],
      _count: { organizationCategoryId: true },
      where,
      orderBy: { _count: { organizationCategoryId: 'desc' } },
    });
    const cats = await prisma.organizationCategory.findMany({ select: { id: true, name: true } });
    return {
      success: true,
      data: rows.map(r => ({
        name: cats.find(c => c.id === r.organizationCategoryId)?.name || 'ไม่ระบุ',
        value: r._count.organizationCategoryId,
      })).filter(r => r.value > 0),
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Monthly submissions ────────────────────────────────────────────────────
export async function getMonthlySubmissionChartData(year?: number): Promise<R<{ month: string; count: number }[]>> {
  try {
    const where = year ? { createdAt: yearRange(year) } : {};
    const rows = await prisma.organization.findMany({ select: { createdAt: true }, where, orderBy: { createdAt: 'asc' } });
    const counts: Record<string, number> = {};
    rows.forEach(r => {
      const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return {
      success: true,
      data: Object.entries(counts).map(([month, count]) => ({ month, count })),
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Signers distribution ───────────────────────────────────────────────────
export async function getSignersChartData(year?: number): Promise<R<{ range: string; count: number }[]>> {
  try {
    const where = year ? { createdAt: yearRange(year) } : {};
    const rows = await prisma.organization.findMany({ select: { numberOfSigners: true }, where });
    const groups: Record<string, number> = { '1-5': 0, '6-10': 0, '11-20': 0, '21-50': 0, '51-100': 0, '100+': 0 };
    rows.forEach(r => {
      const n = r.numberOfSigners ?? 0;
      if (n <= 5) groups['1-5']++;
      else if (n <= 10) groups['6-10']++;
      else if (n <= 20) groups['11-20']++;
      else if (n <= 50) groups['21-50']++;
      else if (n <= 100) groups['51-100']++;
      else groups['100+']++;
    });
    return {
      success: true,
      data: Object.entries(groups).filter(([, v]) => v > 0).map(([range, count]) => ({ range, count })),
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// ── Available years ────────────────────────────────────────────────────────
export async function getAvailableYears(): Promise<R<number[]>> {
  try {
    const rows = await prisma.organization.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'asc' } });
    const years = [...new Set(rows.map(r => r.createdAt.getFullYear()))].sort();
    return { success: true, data: years };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}
