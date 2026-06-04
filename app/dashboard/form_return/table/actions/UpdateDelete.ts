'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Interface for updating Form Return data
interface UpdateFormReturnData {
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
}

// 📝 Update Form Return record
export async function updateFormReturn(id: number, data: UpdateFormReturnData): Promise<ActionResult<any>> {
  try {
    const updatedRecord = await prisma.form_return.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        organizationName: data.organizationName,
        addressLine1: data.addressLine1,
        district: data.district,
        amphoe: data.amphoe,
        province: data.province,
        zipcode: data.zipcode,
        type: data.type,
        phoneNumber: data.phoneNumber,
        numberOfSigners: data.numberOfSigners,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: updatedRecord,
    };

  } catch (error) {
    console.error('Error updating form return record:', error);
    return {
      success: false,
      error: 'ไม่สามารถอัพเดทข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// 🗑️ Delete Form Return record
export async function deleteFormReturn(id: number): Promise<ActionResult<any>> {
  try {
    const deletedRecord = await prisma.form_return.delete({
      where: { id },
    });

    return {
      success: true,
      data: deletedRecord,
    };

  } catch (error) {
    console.error('Error deleting form return record:', error);
    return {
      success: false,
      error: 'ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// 📋 Get single Form Return record for editing
export async function getFormReturnById(id: number): Promise<ActionResult<any>> {
  try {
    const record = await prisma.form_return.findUnique({
      where: { id },
    });

    if (!record) {
      return {
        success: false,
        error: 'ไม่พบข้อมูลที่ต้องการแก้ไข',
      };
    }

    return {
      success: true,
      data: record,
    };

  } catch (error) {
    console.error('Error fetching form return record:', error);
    return {
      success: false,
      error: 'ไม่สามารถโหลดข้อมูลได้',
    };
  } finally {
    await prisma.$disconnect();
  }
}