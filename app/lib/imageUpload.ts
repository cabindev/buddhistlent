// app/lib/imageUpload.ts
import imageCompression from 'browser-image-compression';

export interface ImageUploadOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
}

export const defaultImageOptions: ImageUploadOptions = {
  maxSizeMB: 0.2, // 200 KB
  maxWidthOrHeight: 1200,
  useWebWorker: true,
};

export async function compressImage(file: File, options = defaultImageOptions): Promise<File> {
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('ไม่สามารถบีบอัดรูปภาพได้');
  }
}

export async function uploadImage(file: File, organizationId?: number): Promise<string> {
  try {
    // บีบอัดรูปภาพก่อน
    const compressedFile = await compressImage(file);
    
    // สร้าง FormData
    const formData = new FormData();
    formData.append('file', compressedFile);
    if (organizationId) {
      formData.append('organizationId', organizationId.toString());
    }
    
    // Import server action dynamically
    const { uploadOrganizationImage } = await import('@/app/organization/actions/Upload');
    
    // อัปโหลดรูปภาพผ่าน Server Action
    const result = await uploadOrganizationImage(formData);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    if (!result.url) {
      throw new Error('ไม่ได้รับ URL ของรูปภาพ');
    }
    
    return result.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export function validateImageFile(file: File): string | null {
  // ตรวจสอบประเภทไฟล์
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WebP เท่านั้น)';
  }
  
  // ตรวจสอบขนาดไฟล์ (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'ขนาดไฟล์ต้องไม่เกิน 5MB';
  }
  
  return null;
}

export function generateImageFileName(originalName: string, organizationId?: number): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  if (organizationId) {
    return `org_${organizationId}_${timestamp}_${random}.${extension}`;
  }
  
  return `temp_${timestamp}_${random}.${extension}`;
}