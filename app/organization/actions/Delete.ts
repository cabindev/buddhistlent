// app/organization/actions/Delete.ts
'use server';

import prisma from '@/app/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteOrganization(id: number): Promise<{ success: boolean; message: string }> {
  try {
    // Check if organization exists
    const existingOrganization = await prisma.organization.findUnique({
      where: { id }
    });
    
    if (!existingOrganization) {
      throw new Error('ไม่พบข้อมูลที่ต้องการลบ');
    }
    
    await prisma.organization.delete({
      where: { id }
    });
    
    // Revalidate cache
    revalidatePath('/organization');
    
    return {
      success: true,
      message: 'ลบข้อมูลเรียบร้อยแล้ว'
    };
  } catch (error) {
    console.error('Error deleting organization:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถลบข้อมูลได้';
    
    return {
      success: false,
      message: errorMessage
    };
  }
}