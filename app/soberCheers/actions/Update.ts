'use server';

import prisma from '@/app/lib/db';
import { revalidatePath } from 'next/cache';

const DRINKER_STATUSES = ['ดื่ม (ย้อนหลังไป 1 ปี)', 'เลิกดื่มมาแล้วมากกว่า 1 ปี แต่ยังไม่ถึง 3 ปี'];

export interface UpdateSoberCheersData {
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthday?: string;
  addressLine1?: string;
  district?: string;
  amphoe?: string;
  province?: string;
  zipcode?: string;
  type?: string;
  phone?: string;
  job?: string;
  alcoholConsumption?: string;
  drinkingFrequency?: string | null;
  intentPeriod?: string | null;
  monthlyExpense?: number | null;
  motivations?: string[];
  healthImpact?: string;
}

export async function updateSoberCheers(id: number, data: UpdateSoberCheersData): Promise<{ success: boolean; message: string }> {
  try {
    const existing = await prisma.soberCheers.findUnique({ where: { id } });
    if (!existing) return { success: false, message: 'ไม่พบข้อมูล' };

    if (data.phone?.trim() && !/^[0-9]{10}$/.test(data.phone.trim())) {
      return { success: false, message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก' };
    }

    const alcohol = data.alcoholConsumption ?? existing.alcoholConsumption;
    const isDrinker = DRINKER_STATUSES.includes(alcohol);

    const updateData: any = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.birthday !== undefined) updateData.birthday = new Date(data.birthday);
    if (data.addressLine1 !== undefined) updateData.addressLine1 = data.addressLine1.trim();
    if (data.district !== undefined) updateData.district = data.district.trim();
    if (data.amphoe !== undefined) updateData.amphoe = data.amphoe.trim();
    if (data.province !== undefined) updateData.province = data.province.trim();
    if (data.zipcode !== undefined) updateData.zipcode = data.zipcode.trim();
    if (data.type !== undefined) updateData.type = data.type?.trim() || null;
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (data.job !== undefined) updateData.job = data.job;
    if (data.alcoholConsumption !== undefined) updateData.alcoholConsumption = data.alcoholConsumption;
    if (data.healthImpact !== undefined) updateData.healthImpact = data.healthImpact;
    if (data.motivations !== undefined) updateData.motivations = data.motivations;

    updateData.drinkingFrequency = isDrinker ? (data.drinkingFrequency ?? existing.drinkingFrequency) : null;
    updateData.intentPeriod = isDrinker ? (data.intentPeriod ?? existing.intentPeriod) : null;
    updateData.monthlyExpense = isDrinker ? (data.monthlyExpense ?? existing.monthlyExpense) : null;

    await prisma.soberCheers.update({ where: { id }, data: updateData });

    revalidatePath('/soberCheers');
    revalidatePath(`/soberCheers/edit/${id}`);
    revalidatePath('/dashboard/soberCheers');
    return { success: true, message: 'อัปเดตข้อมูลสำเร็จ' };
  } catch (error) {
    console.error('updateSoberCheers error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' };
  }
}
