// lib/actions/form-return/post.ts
'use server';

import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';
import { revalidatePath } from 'next/cache';
import { FormReturnData } from '@/types/form-return';
import prisma from '@/app/lib/db';

export async function createFormReturn(formData: FormData): Promise<{
  success: boolean;
  data?: FormReturnData;
  error?: string;
}> {
  try {
    // Extract form data
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
    const numberOfSigners = parseInt(formData.get('numberOfSigners') as string);
    const image1 = formData.get('image1') as File | null;
    const image2 = formData.get('image2') as File | null;

    // Enhanced Validation
    if (!firstName?.trim() || !lastName?.trim() || !organizationName?.trim() ||
        !addressLine1?.trim() || !district?.trim() || !amphoe?.trim() ||
        !province?.trim() || !zipcode?.trim() || !type?.trim() ||
        !phoneNumber?.trim() || !numberOfSigners) {
      return { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(phoneNumber.trim())) {
      return { success: false, error: 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก' };
    }

    if (!phoneNumber.trim().startsWith('0')) {
      return { success: false, error: 'หมายเลขโทรศัพท์ต้องขึ้นต้นด้วย 0' };
    }

    // Number of signers validation
    if (numberOfSigners <= 1) {
      return { success: false, error: 'จำนวนผู้ลงนามต้องมากกว่า 1 คน' };
    }

    if (numberOfSigners > 1000000) {
      return { success: false, error: 'จำนวนผู้ลงนามมากเกินไป' };
    }

    // File validation (optional)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (image1 && image1.size > 0) {
      if (image1.size > maxSize) {
        return { success: false, error: 'รูปภาพที่ 1 มีขนาดใหญ่เกินไป (สูงสุด 10MB)' };
      }
      if (!allowedTypes.includes(image1.type)) {
        return { success: false, error: 'รูปภาพที่ 1 ต้องเป็นไฟล์ JPEG, PNG หรือ WebP เท่านั้น' };
      }
    }

    if (image2 && image2.size > 0) {
      if (image2.size > maxSize) {
        return { success: false, error: 'รูปภาพที่ 2 มีขนาดใหญ่เกินไป (สูงสุด 10MB)' };
      }
      if (!allowedTypes.includes(image2.type)) {
        return { success: false, error: 'รูปภาพที่ 2 ต้องเป็นไฟล์ JPEG, PNG หรือ WebP เท่านั้น' };
      }
    }

    // Save images sequentially
    let image1Path: string | undefined;
    let image2Path: string | undefined;

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Saving images...');
      }

      if (image1 && image1.size > 0) {
        image1Path = await saveImage(image1, 'img1');
      }

      if (image2 && image2.size > 0) {
        image2Path = await saveImage(image2, 'img2');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Images saved successfully:', { image1Path, image2Path });
      }
    } catch (imageError) {
      console.error('Image saving error:', imageError);
      return {
        success: false,
        error: `ไม่สามารถบันทึกรูปภาพได้: ${imageError instanceof Error ? imageError.message : 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ'}`
      };
    }

    // Create form return record
    const createData: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      organizationName: organizationName.trim(),
      addressLine1: addressLine1.trim(),
      district: district.trim(),
      amphoe: amphoe.trim(),
      province: province.trim(),
      zipcode: zipcode.trim(),
      type: type.trim(),
      phoneNumber: phoneNumber.trim(),
      numberOfSigners,
    };

    if (image1Path) createData.image1 = image1Path;
    if (image2Path) createData.image2 = image2Path;

    const newFormReturn = await prisma.form_return.create({
      data: createData,
    });

    // ✅ เฉพาะ revalidatePath เมื่อมีข้อมูลใหม่
    revalidatePath('/form_return');
    revalidatePath('/dashboard/formReturn');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Form return created successfully:', newFormReturn.id);
    }
    
    return { success: true, data: newFormReturn };

  } catch (error) {
    console.error('Error creating form return:', error);
    
    // Enhanced error handling
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return { success: false, error: 'ข้อมูลซ้ำกับที่มีอยู่แล้ว' };
      }
      if (error.message.includes('ENOSPC')) {
        return { success: false, error: 'เนื้อที่จัดเก็บไม่เพียงพอ' };
      }
      if (error.message.includes('EACCES')) {
        return { success: false, error: 'ไม่มีสิทธิ์เขียนไฟล์' };
      }
      return { success: false, error: `เกิดข้อผิดพลาด: ${error.message}` };
    }
    
    return { success: false, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
  }
}

// ✅ Enhanced saveImage function with cache busting timestamp
async function saveImage(file: File, prefix: string): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('ไฟล์รูปภาพไม่ถูกต้อง');
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = path.extname(file.name).toLowerCase() || '.jpg';
    
    // Validate file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('รูปแบบไฟล์ไม่ถูกต้อง (รองรับเฉพาะ jpg, jpeg, png, webp)');
    }
    
    const fileName = `${prefix}-${timestamp}-${randomString}${fileExtension}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'images');
    const filePath = path.join(uploadsDir, fileName);
    
    // Create directory if it doesn't exist
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Check if file already exists and create unique name if needed
    let finalFilePath = filePath;
    let finalFileName = fileName;
    let counter = 1;
    
    while (await fileExists(finalFilePath)) {
      const nameWithoutExt = `${prefix}-${timestamp}-${randomString}-${counter}`;
      finalFileName = `${nameWithoutExt}${fileExtension}`;
      finalFilePath = path.join(uploadsDir, finalFileName);
      counter++;
    }
    
    await writeFile(finalFilePath, buffer);
    
    // Return path without cache busting - ให้ component จัดการเอง
    const imageUrl = `/images/${finalFileName}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Image saved:', imageUrl);
    }
    
    return imageUrl;
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error saving image:', error);
    }
    
    if (error instanceof Error) {
      if (error.message.includes('ENOSPC')) {
        throw new Error('เนื้อที่จัดเก็บไม่เพียงพอ');
      }
      if (error.message.includes('EACCES')) {
        throw new Error('ไม่มีสิทธิ์เขียนไฟล์');
      }
      if (error.message.includes('EMFILE') || error.message.includes('ENFILE')) {
        throw new Error('ระบบเปิดไฟล์เกินขีดจำกัด');
      }
      throw error;
    }
    
    throw new Error('ไม่สามารถบันทึกรูปภาพได้');
  }
}

// Helper function to check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Enhanced deleteFile function
async function deleteFile(filePath: string): Promise<void> {
  try {
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = path.join(process.cwd(), 'public', cleanPath);
    
    if (await fileExists(fullPath)) {
      await fs.unlink(fullPath);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ File deleted:', filePath);
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Failed to delete file:', filePath, error);
    }
  }
}

// ✅ Function to update form return
export async function updateFormReturn(
  id: number,
  formData: FormData
): Promise<{
  success: boolean;
  data?: FormReturnData;
  error?: string;
}> {
  try {
    const existingForm = await prisma.form_return.findUnique({
      where: { id }
    });

    if (!existingForm) {
      return { success: false, error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' };
    }

    // Extract and validate form data (same as create)
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
    const numberOfSigners = parseInt(formData.get('numberOfSigners') as string);
    const image1 = formData.get('image1') as File | null;
    const image2 = formData.get('image2') as File | null;

    // Validation
    if (!firstName?.trim() || !lastName?.trim() || !organizationName?.trim() ||
        !addressLine1?.trim() || !district?.trim() || !amphoe?.trim() ||
        !province?.trim() || !zipcode?.trim() || !type?.trim() ||
        !phoneNumber?.trim() || !numberOfSigners) {
      return { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
    }

    // Prepare update data
    const updateData: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      organizationName: organizationName.trim(),
      addressLine1: addressLine1.trim(),
      district: district.trim(),
      amphoe: amphoe.trim(),
      province: province.trim(),
      zipcode: zipcode.trim(),
      type: type.trim(),
      phoneNumber: phoneNumber.trim(),
      numberOfSigners,
      updatedAt: new Date(),
    };

    // Handle image updates
    if (image1 && image1.size > 0) {
      try {
        if (existingForm.image1) {
          await deleteFile(existingForm.image1);
        }
        updateData.image1 = await saveImage(image1, 'img1');
      } catch (imageError) {
        return { 
          success: false, 
          error: `ไม่สามารถบันทึกรูปภาพที่ 1 ได้: ${imageError instanceof Error ? imageError.message : 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ'}` 
        };
      }
    }

    if (image2 && image2.size > 0) {
      try {
        if (existingForm.image2) {
          await deleteFile(existingForm.image2);
        }
        updateData.image2 = await saveImage(image2, 'img2');
      } catch (imageError) {
        return { 
          success: false, 
          error: `ไม่สามารถบันทึกรูปภาพที่ 2 ได้: ${imageError instanceof Error ? imageError.message : 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ'}` 
        };
      }
    }

    // Update form return
    const updatedFormReturn = await prisma.form_return.update({
      where: { id },
      data: updateData,
    });

    // ✅ Revalidate เฉพาะเมื่อมีการแก้ไข
    revalidatePath('/form_return');
    revalidatePath('/dashboard/formReturn');

    return { success: true, data: updatedFormReturn };

  } catch (error) {
    console.error('Error updating form return:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' 
    };
  }
}

// ✅ Function to delete form return
export async function deleteFormReturn(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const existingForm = await prisma.form_return.findUnique({
      where: { id }
    });

    if (!existingForm) {
      return { success: false, error: 'ไม่พบข้อมูลที่ต้องการลบ' };
    }

    // Delete images
    if (existingForm.image1) {
      await deleteFile(existingForm.image1);
    }
    if (existingForm.image2) {
      await deleteFile(existingForm.image2);
    }

    // Delete from database
    await prisma.form_return.delete({
      where: { id }
    });

    // ✅ Revalidate เฉพาะเมื่อมีการลบ
    revalidatePath('/form_return');
    revalidatePath('/dashboard/formReturn');

    return { success: true };

  } catch (error) {
    console.error('Error deleting form return:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบข้อมูล' 
    };
  }
}

export { saveImage, deleteFile };