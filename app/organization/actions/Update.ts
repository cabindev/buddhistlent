// app/organization/actions/Update.ts - แก้ไขการตรวจสอบเบอร์โทรศัพท์ให้อนุญาตเบอร์เดิม
'use server';
import prisma from '@/app/lib/db';
import { revalidatePath } from 'next/cache';

export interface UpdateOrganizationData {
  firstName?: string;
  lastName?: string;
  organizationCategoryId?: number;
  addressLine1?: string;
  district?: string;
  amphoe?: string;
  province?: string;
  zipcode?: string;
  type?: string;
  phoneNumber?: string;
  numberOfSigners?: number;
  image1?: string;
  image2?: string;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
}

export async function updateOrganization(id: number, data: UpdateOrganizationData): Promise<{ success: boolean; message: string }> {
  try {
    // ตรวจสอบว่าข้อมูลมีอยู่หรือไม่
    const existingOrganization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!existingOrganization) {
      throw new Error('ไม่พบข้อมูลที่ต้องการแก้ไข');
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (data.firstName !== undefined && !data.firstName?.trim()) {
      throw new Error('ชื่อเป็นข้อมูลที่จำเป็น');
    }

    if (data.lastName !== undefined && !data.lastName?.trim()) {
      throw new Error('นามสกุลเป็นข้อมูลที่จำเป็น');
    }

    if (data.zipcode !== undefined && !/^[0-9]{5}$/.test(data.zipcode)) {
      throw new Error('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก');
    }

    if (data.phoneNumber !== undefined && !/^[0-9]{10}$/.test(data.phoneNumber.replace(/[-\s]/g, ''))) {
      throw new Error('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
    }

    if (data.numberOfSigners !== undefined && data.numberOfSigners < 1) {
      throw new Error('จำนวนผู้ลงนามต้องมากกว่า 0');
    }

    // ตรวจสอบเบอร์โทรศัพท์ซ้ำ (ไม่รวมข้อมูลของตัวเอง)
    if (data.phoneNumber && data.phoneNumber.trim() !== '') {
      // ทำความสะอาดเบอร์โทรศัพท์ (เอาเฉพาะตัวเลข)
      const cleanPhone = data.phoneNumber.replace(/[-\s]/g, '');
      
      console.log('Checking phone duplicate for update:', {
        organizationId: id,
        phoneNumber: cleanPhone
      });
      
      // ตรวจสอบเบอร์โทรซ้ำ โดยไม่รวมข้อมูลของตัวเอง (id ปัจจุบัน)
      const phoneExists = await prisma.organization.findFirst({
        where: { 
          phoneNumber: cleanPhone,
          id: { not: id } // ไม่รวมข้อมูลของตัวเอง
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true
        }
      });
      
      console.log('Phone duplicate check result:', phoneExists);
      
      if (phoneExists) {
        return {
          success: false,
          message: `เบอร์โทรศัพท์ ${cleanPhone} ถูกใช้แล้วโดย ${phoneExists.firstName} ${phoneExists.lastName}`
        };
      }
    }

    // ตรวจสอบหมวดหมู่องค์กร (ถ้ามีการเปลี่ยนแปลง)
    if (data.organizationCategoryId) {
      const organizationCategory = await prisma.organizationCategory.findUnique({
        where: { id: data.organizationCategoryId }
      });
      
      if (!organizationCategory) {
        throw new Error('ไม่พบหมวดหมู่องค์กรที่เลือก');
      }
      
      if (!organizationCategory.isActive) {
        throw new Error('หมวดหมู่องค์กรที่เลือกไม่ได้เปิดใช้งาน');
      }
    }

    // เตรียมข้อมูลสำหรับอัปเดต
    const updateData: any = {
      updatedAt: new Date() // เพิ่ม timestamp สำหรับการอัปเดต
    };

    // ประมวลผลข้อมูลที่จะอัปเดต
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined) {
        if (key === 'phoneNumber') {
          // ทำความสะอาดเบอร์โทรศัพท์ - เก็บเฉพาะตัวเลข
          updateData[key] = value.replace(/[-\s]/g, '');
        } else if (typeof value === 'string' && value.trim() !== '') {
          // ตัดช่องว่างสำหรับข้อมูลข้อความ
          updateData[key] = value.trim();
        } else if (value === null || value === '') {
          // จัดการค่าว่างและ null
          updateData[key] = key.includes('image') && value === '' ? null : value;
        } else {
          // ข้อมูลประเภทอื่นๆ
          updateData[key] = value;
        }
      }
    });

    console.log('Updating organization with data:', {
      id,
      updateFields: Object.keys(updateData),
      phoneNumber: updateData.phoneNumber
    });

    // อัปเดตข้อมูล
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: updateData,
      include: {
        organizationCategory: true // รวมข้อมูลหมวดหมู่องค์กร
      }
    });

    console.log('Organization updated successfully:', {
      id: updatedOrganization.id,
      name: `${updatedOrganization.firstName} ${updatedOrganization.lastName}`,
      phone: updatedOrganization.phoneNumber
    });

    // Revalidate cache
    revalidatePath('/organization');
    revalidatePath('/dashboard/organization');
    revalidatePath(`/organization/edit/${id}`);
    revalidatePath(`/organization/view/${id}`);

    return {
      success: true,
      message: 'แก้ไขข้อมูลองค์กรเรียบร้อยแล้ว'
    };

  } catch (error) {
    console.error('Error updating organization:', error);
    
    // จัดการข้อผิดพลาดเฉพาะของ Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return {
          success: false,
          message: 'เบอร์โทรศัพท์นี้ถูกใช้แล้ว กรุณาใช้เบอร์อื่น'
        };
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถแก้ไขข้อมูลได้';

    return {
      success: false,
      message: errorMessage
    };
  }
}