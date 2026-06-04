'use server';

import prisma from '@/app/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteSoberCheers(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const existing = await prisma.soberCheers.findUnique({ where: { id } });
    if (!existing) return { success: false, message: 'ไม่พบข้อมูล' };

    await prisma.soberCheers.delete({ where: { id } });

    revalidatePath('/soberCheers');
    revalidatePath('/dashboard/soberCheers');
    return { success: true, message: 'ลบข้อมูลสำเร็จ' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'ไม่สามารถลบข้อมูลได้' };
  }
}
