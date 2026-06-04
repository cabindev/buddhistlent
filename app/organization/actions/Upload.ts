// app/organization/actions/Upload.ts
'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function uploadOrganizationImage(formData: FormData): Promise<{ success: boolean; message: string; url?: string }> {
  try {
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;
    
    if (!file) {
      return {
        success: false,
        message: 'ไม่พบไฟล์ที่อัปโหลด'
      };
    }
    
    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: 'ประเภทไฟล์ไม่ถูกต้อง กรุณาอัปโหลดรูปภาพเท่านั้น'
      };
    }
    
    // ตรวจสอบขนาดไฟล์ (300KB หลังบีบอัด)
    if (file.size > 300 * 1024) {
      return {
        success: false,
        message: 'ขนาดไฟล์หลังบีบอัดยังใหญ่เกินไป (เกิน 300KB)'
      };
    }
    
    // สร้างชื่อไฟล์
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    const fileName = organizationId 
      ? `org_${organizationId}_${timestamp}_${random}.${extension}`
      : `temp_${timestamp}_${random}.${extension}`;
    
    // สร้างโฟลเดอร์ถ้าไม่มี
    const uploadDir = join(process.cwd(), 'public', 'organization');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // บันทึกไฟล์
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    // สร้าง URL สำหรับเข้าถึงไฟล์
    const fileUrl = `/organization/${fileName}`;
    
    return {
      success: true,
      message: 'อัปโหลดรูปภาพสำเร็จ',
      url: fileUrl
    };
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์'
    };
  }
}