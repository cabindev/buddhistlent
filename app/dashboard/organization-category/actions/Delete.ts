// app/dashboard/organization-category/actions/Delete.ts
'use server';

import prisma from '@/app/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteOrganizationCategory(id: number): Promise<{ success: boolean; message: string }> {
  try {
    // ตรวจสอบว่า category มีอยู่หรือไม่
    const existingCategory = await prisma.organizationCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            organizations: true
          }
        }
      }
    });
    
    if (!existingCategory) {
      throw new Error('ไม่พบองค์กรที่ต้องการลบ');
    }
    
    // ตรวจสอบว่ามีข้อมูล Organization ที่เชื่อมโยงอยู่หรือไม่
    if (existingCategory._count.organizations > 0) {
      throw new Error(`ไม่สามารถลบองค์กรนี้ได้ เนื่องจากมีข้อมูลส่งคืนอยู่ ${existingCategory._count.organizations} รายการ`);
    }
    
    await prisma.organizationCategory.delete({
      where: { id }
    });
    
    // Revalidate cache
    revalidatePath('/organization-category');
    revalidatePath('/organization');
    
    return {
      success: true,
      message: 'ลบองค์กรเรียบร้อยแล้ว'
    };
  } catch (error) {
    console.error('Error deleting organization category:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete organization category';
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

// Soft delete (เปลี่ยนสถานะเป็น inactive แทนการลบ)
export async function softDeleteOrganizationCategory(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const existingCategory = await prisma.organizationCategory.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      throw new Error('ไม่พบองค์กรที่ต้องการ');
    }
    
    await prisma.organizationCategory.update({
      where: { id },
      data: {
        isActive: false
      }
    });
    
    revalidatePath('/organization-category');
    revalidatePath('/organization');
    
    return {
      success: true,
      message: 'ปิดใช้งานองค์กรเรียบร้อยแล้ว'
    };
  } catch (error) {
    console.error('Error soft deleting organization category:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate organization category';
    
    return {
      success: false,
      message: errorMessage
    };
  }
}