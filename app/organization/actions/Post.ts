// app/organization/actions/Post.ts - การสร้างข้อมูลองค์กรใหม่ (ตรวจสอบเบอร์โทรซ้ำทั้งหมด)
'use server';
import prisma from '@/app/lib/db';
import { revalidatePath } from 'next/cache';

export interface CreateOrganizationData {
  firstName: string;
  lastName: string;
  organizationCategoryId: number;
  addressLine1: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  type: string;
  phoneNumber: string;
  numberOfSigners: number;
  image1: string;
  image2: string;
  image3?: string;
  image4?: string;
  image5?: string;
}

export async function createOrganization(data: CreateOrganizationData): Promise<{ success: boolean; message: string }> {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.firstName?.trim()) {
      throw new Error('ชื่อเป็นข้อมูลที่จำเป็น');
    }

    if (!data.lastName?.trim()) {
      throw new Error('นามสกุลเป็นข้อมูลที่จำเป็น');
    }

    if (!data.phoneNumber?.trim()) {
      throw new Error('เบอร์โทรศัพท์เป็นข้อมูลที่จำเป็น');
    }

    if (!/^[0-9]{10}$/.test(data.phoneNumber.replace(/[-\s]/g, ''))) {
      throw new Error('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
    }

    if (!/^[0-9]{5}$/.test(data.zipcode)) {
      throw new Error('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก');
    }

    if (data.numberOfSigners < 1) {
      throw new Error('จำนวนผู้ลงนามต้องมากกว่า 0');
    }

    if (!data.image1 || !data.image2) {
      throw new Error('รูปภาพที่ 1 และ 2 เป็นข้อมูลที่จำเป็น');
    }

    // ทำความสะอาดเบอร์โทรศัพท์
    const cleanPhoneNumber = data.phoneNumber.replace(/[-\s]/g, '');

    // ตรวจสอบเบอร์โทรศัพท์ซ้ำ (สำหรับการสร้างใหม่ ต้องเช็คทั้งหมด)
    console.log('Checking phone duplicate for new organization:', cleanPhoneNumber);
    
    const phoneExists = await prisma.organization.findFirst({
      where: { 
        phoneNumber: cleanPhoneNumber
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true
      }
    });

    if (phoneExists) {
      console.log('Phone already exists:', phoneExists);
      return {
        success: false,
        message: `เบอร์โทรศัพท์ ${cleanPhoneNumber} ถูกใช้แล้วโดย ${phoneExists.firstName} ${phoneExists.lastName}`
      };
    }

    // ตรวจสอบหมวดหมู่องค์กร
    const organizationCategory = await prisma.organizationCategory.findUnique({
      where: { id: data.organizationCategoryId }
    });

    if (!organizationCategory) {
      throw new Error('ไม่พบหมวดหมู่องค์กรที่เลือก');
    }

    if (!organizationCategory.isActive) {
      throw new Error('หมวดหมู่องค์กรที่เลือกไม่ได้เปิดใช้งาน');
    }

    // เตรียมข้อมูลสำหรับสร้าง
    const createData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      organizationCategoryId: data.organizationCategoryId,
      addressLine1: data.addressLine1.trim(),
      district: data.district.trim(),
      amphoe: data.amphoe.trim(),
      province: data.province.trim(),
      zipcode: data.zipcode.trim(),
      type: data.type.trim(),
      phoneNumber: cleanPhoneNumber,
      numberOfSigners: data.numberOfSigners,
      image1: data.image1,
      image2: data.image2,
      image3: data.image3 || null,
      image4: data.image4 || null,
      image5: data.image5 || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating new organization with data:', {
      name: `${createData.firstName} ${createData.lastName}`,
      phone: createData.phoneNumber,
      organizationCategoryId: createData.organizationCategoryId
    });

    // สร้างข้อมูลใหม่
    const newOrganization = await prisma.organization.create({
      data: createData,
      include: {
        organizationCategory: true
      }
    });

    console.log('Organization created successfully:', {
      id: newOrganization.id,
      name: `${newOrganization.firstName} ${newOrganization.lastName}`,
      phone: newOrganization.phoneNumber
    });

    // Revalidate cache
    revalidatePath('/organization');
    revalidatePath('/dashboard/organization');

    return {
      success: true,
      message: 'สร้างข้อมูลองค์กรเรียบร้อยแล้ว'
    };

  } catch (error) {
    console.error('Error creating organization:', error);
    
    // จัดการข้อผิดพลาดเฉพาะของ Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return {
          success: false,
          message: 'เบอร์โทรศัพท์นี้ถูกใช้แล้ว กรุณาใช้เบอร์อื่น'
        };
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถสร้างข้อมูลได้';

    return {
      success: false,
      message: errorMessage
    };
  }
}