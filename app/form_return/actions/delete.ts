// app/form_return/actions/delete.ts
'use server';

import { unlink } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import prisma from '@/app/lib/db';

export async function deleteFormReturn(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!id || isNaN(id)) {
      return { success: false, error: 'ID ไม่ถูกต้อง' };
    }

    // ตรวจสอบว่ามีข้อมูลอยู่จริง
    const form = await prisma.form_return.findUnique({
      where: { id }
    });

    if (!form) {
      return { success: false, error: 'ไม่พบข้อมูลที่จะลบ' };
    }

    // ลบรูปภาพที่เกี่ยวข้อง
    const deleteImage = async (imagePath: string | null) => {
      if (imagePath) {
        try {
          const filePath = path.join(process.cwd(), 'public', imagePath);
          await unlink(filePath);
        } catch (err) {
          console.error('Failed to delete image:', err);
        }
      }
    };

    await Promise.all([
      deleteImage(form.image1),
      deleteImage(form.image2)
    ]);

    // ลบข้อมูลจาก database
    await prisma.form_return.delete({
      where: { id }
    });

    // Revalidate cache
    revalidatePath('/form_return');
    revalidatePath('/dashboard/formReturn');

    return { success: true };
  } catch (error) {
    console.error('Error deleting form return:', error);
    return { success: false, error: 'เกิดข้อผิดพลาดในการลบข้อมูล' };
  }
}

export async function deleteMultipleFormReturns(ids: number[]): Promise<{
  success: boolean;
  deletedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let deletedCount = 0;

  for (const id of ids) {
    try {
      const result = await deleteFormReturn(id);
      if (result.success) {
        deletedCount++;
      } else {
        errors.push(`ID ${id}: ${result.error}`);
      }
    } catch (error) {
      errors.push(`ID ${id}: เกิดข้อผิดพลาดไม่ทราบสาเหตุ`);
    }
  }

  return {
    success: deletedCount > 0,
    deletedCount,
    errors
  };
}

// Soft delete (เปลี่ยนสถานะแทนการลบจริง)
export async function softDeleteFormReturn(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!id || isNaN(id)) {
      return { success: false, error: 'ID ไม่ถูกต้อง' };
    }

    const form = await prisma.form_return.findUnique({
      where: { id }
    });

    if (!form) {
      return { success: false, error: 'ไม่พบข้อมูลที่จะลบ' };
    }

    // อัพเดทสถานะแทนการลบ (ต้องเพิ่ม field deletedAt ใน schema)
    // await prisma.form_return.update({
    //   where: { id },
    //   data: {
    //     deletedAt: new Date()
    //   }
    // });

    revalidatePath('/form_return');
    revalidatePath('/dashboard/formReturn');

    return { success: true };
  } catch (error) {
    console.error('Error soft deleting form return:', error);
    return { success: false, error: 'เกิดข้อผิดพลาดในการลบข้อมูล' };
  }
}