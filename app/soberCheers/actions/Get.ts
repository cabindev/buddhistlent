'use server';

import prisma from '@/app/lib/db';

type ActionResult<T> = { success: boolean; data?: T; error?: string };

export interface SoberCheersFilters {
  search?: string;
  type?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function getAllSoberCheers(filters?: SoberCheersFilters): Promise<ActionResult<{
  items: any[];
  total: number;
  page: number;
  totalPages: number;
}>> {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.search?.trim()) {
      const s = filters.search.trim();
      where.OR = [
        { firstName: { contains: s } },
        { lastName: { contains: s } },
        { phone: { contains: s } },
        { district: { contains: s } },
        { amphoe: { contains: s } },
        { province: { contains: s } },
      ];
    }

    if (filters?.type) where.type = filters.type;

    const orderBy = { createdAt: (filters?.sortOrder || 'desc') as 'asc' | 'desc' };

    const [items, total] = await Promise.all([
      prisma.soberCheers.findMany({ where, orderBy, skip, take: limit }),
      prisma.soberCheers.count({ where }),
    ]);

    return {
      success: true,
      data: { items, total, page, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch' };
  }
}

export async function getSoberCheersById(id: number): Promise<ActionResult<any>> {
  try {
    const item = await prisma.soberCheers.findUnique({ where: { id } });
    if (!item) return { success: false, error: 'ไม่พบข้อมูล' };
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch' };
  }
}

export async function getSoberCheersCount(): Promise<ActionResult<number>> {
  try {
    const count = await prisma.soberCheers.count();
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

export async function getTypeRegions(): Promise<ActionResult<string[]>> {
  try {
    const rows = await prisma.soberCheers.findMany({
      select: { type: true },
      distinct: ['type'],
      where: { type: { not: null } },
      orderBy: { type: 'asc' },
    });
    return { success: true, data: rows.map(r => r.type!).filter(Boolean) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}

// สำหรับ dashboard table — ดึงทั้งหมดโดยไม่มี pagination (รองรับ year filter)
export async function getAllSoberCheersForTable(year?: number): Promise<ActionResult<any[]>> {
  try {
    const where = year ? {
      createdAt: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
      },
    } : {};
    const items = await prisma.soberCheers.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}
