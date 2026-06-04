// app/dashboard/organization-category/actions/Get.ts
'use server';

import prisma from '@/app/lib/db';
import { OrganizationCategory, OrganizationCategoryFilters } from '@/types/organization';

// ดึงข้อมูลทั้งหมด
export async function getAllOrganizationCategories(filters?: OrganizationCategoryFilters): Promise<OrganizationCategory[]> {
  try {
    // ตรวจสอบการเชื่อมต่อฐานข้อมูลก่อน
    await prisma.$connect();
    
    const where: any = {};
    
    // Filter by search
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { shortName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { categoryType: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    
    // Filter by category type
    if (filters?.categoryType) {
      where.categoryType = filters.categoryType;
    }
    
    // Filter by active status
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    // Sorting
    let orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy = [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ];
    }
    
    const organizationCategories = await prisma.organizationCategory.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            organizations: true
          }
        }
      }
    });
    
    return organizationCategories;
  } catch (error) {
    console.error('Error fetching organization categories:', error);
    
    // ให้ error message ที่ชัดเจนกว่า
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อ');
      }
      if (error.message.includes('relation') || error.message.includes('table')) {
        throw new Error('ไม่พบตารางฐานข้อมูล กรุณาตรวจสอบ schema และ migration');
      }
      throw new Error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
    
    throw new Error('ไม่สามารถดึงข้อมูลองค์กรได้');
  } finally {
    await prisma.$disconnect();
  }
}

// ดึงข้อมูลที่ active (สำหรับ dropdown)
export async function getActiveOrganizationCategories(): Promise<OrganizationCategory[]> {
  try {
    await prisma.$connect();
    
    const organizationCategories = await prisma.organizationCategory.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    return organizationCategories;
  } catch (error) {
    console.error('Error fetching active organization categories:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
      }
      throw new Error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
    
    throw new Error('ไม่สามารถดึงข้อมูลองค์กรได้');
  } finally {
    await prisma.$disconnect();
  }
}

// ดึงข้อมูลตาม ID
export async function getOrganizationCategoryById(id: number): Promise<OrganizationCategory | null> {
  try {
    await prisma.$connect();
    
    const organizationCategory = await prisma.organizationCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            organizations: true
          }
        }
      }
    });
    
    return organizationCategory;
  } catch (error) {
    console.error('Error fetching organization category by ID:', error);
    
    if (error instanceof Error) {
      throw new Error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
    
    throw new Error('ไม่สามารถดึงข้อมูลองค์กรได้');
  } finally {
    await prisma.$disconnect();
  }
}