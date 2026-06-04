'use server';

import prisma from '@/app/lib/db';
import { revalidatePath } from 'next/cache';

const DRINKER_STATUSES = ['ดื่ม (ย้อนหลังไป 1 ปี)', 'เลิกดื่มมาแล้วมากกว่า 1 ปี แต่ยังไม่ถึง 3 ปี'];

export interface CreateSoberCheersData {
  firstName: string;
  lastName: string;
  gender: string;
  birthday: string;
  addressLine1: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  type: string;
  phone?: string;
  job: string;
  alcoholConsumption: string;
  drinkingFrequency?: string | null;
  intentPeriod?: string | null;
  monthlyExpense?: number | null;
  motivations: string[];
  healthImpact: string;
}

export async function createSoberCheers(data: CreateSoberCheersData): Promise<{ success: boolean; message: string }> {
  try {
    if (!data.firstName?.trim()) return { success: false, message: 'กรุณากรอกชื่อ' };
    if (!data.lastName?.trim()) return { success: false, message: 'กรุณากรอกนามสกุล' };
    if (!data.gender) return { success: false, message: 'กรุณาเลือกเพศ' };
    if (!data.birthday) return { success: false, message: 'กรุณากรอกวันเกิด' };
    if (!data.job) return { success: false, message: 'กรุณาเลือกอาชีพ' };
    if (!data.alcoholConsumption) return { success: false, message: 'กรุณาเลือกสถานะการดื่ม' };
    if (!data.healthImpact) return { success: false, message: 'กรุณาเลือกผลกระทบต่อสุขภาพ' };

    if (data.phone?.trim() && !/^[0-9]{10}$/.test(data.phone.trim())) {
      return { success: false, message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก' };
    }

    const isDrinker = DRINKER_STATUSES.includes(data.alcoholConsumption);

    await prisma.soberCheers.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        gender: data.gender,
        birthday: new Date(data.birthday),
        addressLine1: data.addressLine1.trim(),
        district: data.district.trim(),
        amphoe: data.amphoe.trim(),
        province: data.province.trim(),
        zipcode: data.zipcode.trim(),
        type: data.type?.trim() || null,
        phone: data.phone?.trim() || null,
        job: data.job,
        alcoholConsumption: data.alcoholConsumption,
        drinkingFrequency: isDrinker ? (data.drinkingFrequency || null) : null,
        intentPeriod: isDrinker ? (data.intentPeriod || null) : null,
        monthlyExpense: isDrinker ? (data.monthlyExpense || null) : null,
        motivations: data.motivations,
        healthImpact: data.healthImpact,
      },
    });

    revalidatePath('/soberCheers');
    revalidatePath('/dashboard/soberCheers');
    return { success: true, message: 'ลงทะเบียนสำเร็จ' };
  } catch (error) {
    console.error('createSoberCheers error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' };
  }
}
