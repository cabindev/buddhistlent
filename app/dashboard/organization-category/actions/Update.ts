// app/dashboard/organization-category/actions/Update.ts
'use server';

import prisma from '@/app/lib/db';
import { revalidatePath } from 'next/cache';
import { UpdateOrganizationCategoryData, OrganizationCategory } from '@/types/organization';

export async function updateOrganizationCategory(id: number, data: UpdateOrganizationCategoryData): Promise<OrganizationCategory> {
  try {
    // ตรวจสอบว่า category มีอยู่หรือไม่
    const existingCategory = await prisma.organizationCategory.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      throw new Error('ไม่พบองค์กรที่ต้องการแก้ไข');
    }
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('ชื่อองค์กรเป็นข้อมูลที่จำเป็น');
      }
      
      if (data.name.trim().length > 200) {
        throw new Error('ชื่อองค์กรต้องไม่เกิน 200 ตัวอักษร');
      }
    }
    
    if (data.categoryType !== undefined) {
      if (!data.categoryType || data.categoryType.trim().length === 0) {
        throw new Error('ประเภทองค์กรเป็นข้อมูลที่จำเป็น');
      }
    }
    
    if (data.shortName !== undefined && data.shortName && data.shortName.trim().length > 50) {
      throw new Error('ชื่อย่อต้องไม่เกิน 50 ตัวอักษร');
    }
    
    // ตรวจสอบคำอธิบาย
    if (data.description !== undefined && data.description && data.description.trim().length > 1000) {
      throw new Error('คำอธิบายต้องไม่เกิน 1000 ตัวอักษร');
    }
    
    // ตรวจสอบชื่อซ้ำ (ถ้ามีการเปลี่ยนชื่อ)
    if (data.name && data.name.trim().toLowerCase() !== existingCategory.name.toLowerCase()) {
      const duplicateCategory = await prisma.organizationCategory.findFirst({
        where: { 
          name: data.name.trim(),
          id: { not: id }
        }
      });
      
      if (duplicateCategory) {
        throw new Error('ชื่อองค์กรนี้มีอยู่แล้ว');
      }
    }
    
    // เตรียมข้อมูลสำหรับอัปเดต
    const updateData: any = {};
    
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    
    if (data.shortName !== undefined) {
      updateData.shortName = data.shortName?.trim() || null;
    }
    
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }
    
    if (data.categoryType !== undefined) {
      updateData.categoryType = data.categoryType.trim();
    }
    
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }
    
    const updatedCategory = await prisma.organizationCategory.update({
      where: { id },
      data: updateData,
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
    
    return updatedCategory;
  } catch (error) {
    console.error('Error updating organization category:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถแก้ไของค์กรได้');
  }
}
