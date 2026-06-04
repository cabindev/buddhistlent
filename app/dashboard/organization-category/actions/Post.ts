// app/dashboard/organization-category/actions/Post.ts
'use server';

import prisma from '@/app/lib/db';
import { revalidatePath } from 'next/cache';
import { CreateOrganizationCategoryData, OrganizationCategory } from '@/types/organization';

export async function createOrganizationCategory(data: CreateOrganizationCategoryData): Promise<OrganizationCategory> {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('ชื่อองค์กรเป็นข้อมูลที่จำเป็น');
    }
    
    if (!data.categoryType || data.categoryType.trim().length === 0) {
      throw new Error('ประเภทองค์กรเป็นข้อมูลที่จำเป็น');
    }
    
    // ตรวจสอบความยาวชื่อ
    if (data.name.trim().length > 200) {
      throw new Error('ชื่อองค์กรต้องไม่เกิน 200 ตัวอักษร');
    }
    
    if (data.shortName && data.shortName.trim().length > 50) {
      throw new Error('ชื่อย่อต้องไม่เกิน 50 ตัวอักษร');
    }
    
    // ตรวจสอบชื่อซ้ำ
    const existingCategory = await prisma.organizationCategory.findFirst({
      where: { 
        name: data.name.trim()
      }
    });
    
    if (existingCategory) {
      throw new Error('ชื่อองค์กรนี้มีอยู่แล้ว');
    }
    
    // ตรวจสอบคำอธิบาย
    if (data.description && data.description.trim().length > 1000) {
      throw new Error('คำอธิบายต้องไม่เกิน 1000 ตัวอักษร');
    }
    
    // หาลำดับถัดไป
    let sortOrder = data.sortOrder;
    if (!sortOrder) {
      const maxOrder = await prisma.organizationCategory.findFirst({
        orderBy: { sortOrder: 'desc' }
      });
      sortOrder = (maxOrder?.sortOrder || 0) + 1;
    }
    
    const organizationCategory = await prisma.organizationCategory.create({
      data: {
        name: data.name.trim(),
        shortName: data.shortName?.trim() || null,
        description: data.description?.trim() || null,
        categoryType: data.categoryType.trim(),
        isActive: data.isActive ?? true,
        sortOrder
      },
      include: {
        _count: {
          select: {
            organizations: true
          }
        }
      }
    });
    
    // Revalidate cache
    revalidatePath('/organization-category');
    revalidatePath('/organization');
    
    return organizationCategory;
  } catch (error) {
    console.error('Error creating organization category:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถสร้างองค์กรได้');
  }
}
