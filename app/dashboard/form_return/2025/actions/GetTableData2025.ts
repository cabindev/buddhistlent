'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface FormReturn2025TableData {
  id: number;
  firstName: string;
  lastName: string;
  organizationName: string;
  addressLine1: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  type: string;
  phoneNumber: string;
  numberOfSigners: number;
  createdAt: Date;
}

export async function getFormReturn2025TableData(page: number = 1, limit: number = 10): Promise<{
  data: FormReturn2025TableData[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    const year2025Start = new Date('2025-01-01T00:00:00.000Z');
    const year2025End = new Date('2026-01-01T00:00:00.000Z');
    
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      prisma.form_return.findMany({
        where: {
          createdAt: { gte: year2025Start, lt: year2025End }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          organizationName: true,
          addressLine1: true,
          district: true,
          amphoe: true,
          province: true,
          zipcode: true,
          type: true,
          phoneNumber: true,
          numberOfSigners: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.form_return.count({
        where: {
          createdAt: { gte: year2025Start, lt: year2025End }
        }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      totalPages,
      currentPage: page
    };

  } catch (error) {
    console.error('Error fetching form return 2025 table data:', error);
    return {
      data: [],
      total: 0,
      totalPages: 0,
      currentPage: page
    };
  } finally {
    await prisma.$disconnect();
  }
}