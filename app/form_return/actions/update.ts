// app/form_return/actions/update.ts
'use server';

import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';
import prisma from '@/app/lib/db';

// ฟังก์ชันสำหรับบันทึกรูปภาพ
async function saveImage(file: File, suffix: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = new Date().getTime();
  const fileExtension = path.extname(file.name) || '.jpg';
  const fileName = `${timestamp}-${suffix}${fileExtension}`;
  const filePath = path.join(process.cwd(), 'public', 'images', fileName);
  
  // สร้างโฟลเดอร์ถ้ายังไม่มี
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  
  await writeFile(filePath, buffer);
  return `/images/${fileName}`;
}

// ฟังก์ชันสำหรับลบรูปภาพเก่า
async function deleteOldImage(imagePath: string): Promise<void> {
  if (!imagePath || !imagePath.startsWith('/images/')) return;
  
  try {
    const filePath = path.join(process.cwd(), 'public', imagePath);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting old image:', error);
  }
}

export async function updateFormReturn(formData: FormData): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const id = formData.get('id') as string;
    
    if (!id) {
      return { success: false, error: 'ไม่พบ ID ของข้อมูล' };
    }

    const formId = parseInt(id);
    
    // ตรวจสอบว่าข้อมูลมีอยู่หรือไม่
    const existingForm = await prisma.form_return.findUnique({
      where: { id: formId }
    });

    if (!existingForm) {
      return { success: false, error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' };
    }

    // เตรียมข้อมูลสำหรับอัพเดท
    const updateData: any = {};
    
    // ข้อมูลพื้นฐาน
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const organizationName = formData.get('organizationName') as string;
    const addressLine1 = formData.get('addressLine1') as string;
    const district = formData.get('district') as string;
    const amphoe = formData.get('amphoe') as string;
    const province = formData.get('province') as string;
    const zipcode = formData.get('zipcode') as string;
    const type = formData.get('type') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const numberOfSigners = formData.get('numberOfSigners') as string;

    // Validation
    if (!firstName || !lastName || !organizationName || !addressLine1 || 
        !district || !amphoe || !province || !zipcode || !phoneNumber || !numberOfSigners) {
      return { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
    }

    if (phoneNumber.length !== 10) {
      return { success: false, error: 'หมายเลขโทรศัพท์ต้องมี 10 หลัก' };
    }

    if (parseInt(numberOfSigners) <= 1) {
      return { success: false, error: 'จำนวนผู้ลงนามต้องมากกว่า 1 คน' };
    }

    // ตรวจสอบเบอร์โทรซ้ำ (ยกเว้นของตัวเอง)
    if (phoneNumber !== existingForm.phoneNumber) {
      const existingPhone = await prisma.form_return.findFirst({
        where: {
          phoneNumber,
          NOT: { id: formId }
        }
      });

      if (existingPhone) {
        return { success: false, error: 'เบอร์โทรนี้ถูกใช้แล้ว' };
      }
    }

    // เตรียมข้อมูลสำหรับอัพเดท
    updateData.firstName = firstName;
    updateData.lastName = lastName;
    updateData.organizationName = organizationName;
    updateData.addressLine1 = addressLine1;
    updateData.district = district;
    updateData.amphoe = amphoe;
    updateData.province = province;
    updateData.zipcode = zipcode;
    updateData.type = type || 'ตำบล';
    updateData.phoneNumber = phoneNumber;
    updateData.numberOfSigners = parseInt(numberOfSigners);

    // จัดการรูปภาพ
    const image1File = formData.get('image1') as File | null;
    const image2File = formData.get('image2') as File | null;

    // อัพเดทรูปภาพที่ 1 ถ้ามีการอัพโหลดใหม่
    if (image1File && image1File.size > 0) {
      // ลบรูปเก่า
      if (existingForm.image1) {
        await deleteOldImage(existingForm.image1);
      }
      
      // บันทึกรูปใหม่
      const newImage1Path = await saveImage(image1File, '1');
      updateData.image1 = newImage1Path;
    }

    // อัพเดทรูปภาพที่ 2 ถ้ามีการอัพโหลดใหม่
    if (image2File && image2File.size > 0) {
      // ลบรูปเก่า
      if (existingForm.image2) {
        await deleteOldImage(existingForm.image2);
      }
      
      // บันทึกรูปใหม่
      const newImage2Path = await saveImage(image2File, '2');
      updateData.image2 = newImage2Path;
    }

    // อัพเดทข้อมูล
    const updatedForm = await prisma.form_return.update({
      where: { id: formId },
      data: updateData
    });

    // รีโหลด cache
    revalidatePath('/form_return');
    revalidatePath('/dashboard/formReturn');
    revalidatePath(`/dashboard/formReturn/${formId}`);

    return { 
      success: true, 
      data: updatedForm
    };

  } catch (error) {
    console.error('Update form return error:', error);
    return { 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' 
    };
  }
}