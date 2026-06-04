// components/form-return/ImageUploadStep.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FormReturnData } from '@/types/form-return';
import imageCompression from 'browser-image-compression';

interface ImageUploadStepProps {
  data: Partial<FormReturnData>;
  onUpdate: (data: Partial<FormReturnData>) => void;
  onImageUpdate: (image1File?: File, image2File?: File) => void;
  isEditing?: boolean;
  existingImages?: {
    image1?: string | null;
    image2?: string | null;
  };
}

export default function ImageUploadStep({ 
  data, 
  onUpdate, 
  onImageUpdate, 
  isEditing = false,
  existingImages 
}: ImageUploadStepProps) {
  const [image1Preview, setImage1Preview] = useState<string | null>(null);
  const [image2Preview, setImage2Preview] = useState<string | null>(null);
  const [uploading, setUploading] = useState({ image1: false, image2: false });

  // ✅ แสดงรูปภาพเดิมเมื่อเป็นการแก้ไข
  useEffect(() => {
    if (isEditing && existingImages) {
      if (existingImages.image1) {
        setImage1Preview(existingImages.image1);
      }
      if (existingImages.image2) {
        setImage2Preview(existingImages.image2);
      }
    }
  }, [isEditing, existingImages]);

  const allowedExtensions = ['.jpg', '.jpeg', '.webp', '.svg', '.png'];

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: 'image1' | 'image2'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(`.${fileExtension}`)) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (.jpg, .jpeg, .png, .webp, .svg)');
      return;
    }

    setUploading(prev => ({ ...prev, [imageType]: true }));

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (imageType === 'image1') {
          setImage1Preview(reader.result as string);
          onImageUpdate(compressedFile, undefined);
        } else {
          setImage2Preview(reader.result as string);
          onImageUpdate(undefined, compressedFile);
        }
      };
      
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('เกิดข้อผิดพลาดในการบีบอัดรูปภาพ');
    } finally {
      setUploading(prev => ({ ...prev, [imageType]: false }));
    }
  };

  // ✅ ฟังก์ชันลบรูปภาพ
  const handleRemoveImage = (imageType: 'image1' | 'image2') => {
    if (imageType === 'image1') {
      setImage1Preview(null);
      onImageUpdate(undefined, undefined);
    } else {
      setImage2Preview(null);
      onImageUpdate(undefined, undefined);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          แนบรูปภาพประกอบ
        </h3>
        <p className="text-sm text-slate-600">
          {isEditing
            ? 'คุณสามารถแก้ไขรูปภาพที่มีอยู่ หรือเพิ่มรูปภาพใหม่'
            : 'คุณสามารถแนบรูปภาพที่แสดงถึงการดำเนินงานของท่าน (ไม่บังคับ)'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image 1 */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            รูปภาพที่ 1
            <span className="text-slate-500 text-xs ml-2">(ไม่บังคับ)</span>
          </label>
          
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            {image1Preview ? (
              <div className="space-y-4">
                <div className="relative">
                  <Image
                    src={image1Preview}
                    alt="Image Preview 1"
                    width={200}
                    height={200}
                    className="mx-auto rounded-lg object-cover"
                  />
                  {/* ✅ แสดง badge ว่าเป็นรูปเดิมหรือใหม่ */}
                  {isEditing && existingImages?.image1 === image1Preview && (
                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      รูปเดิม
                    </span>
                  )}
                  {isEditing && existingImages?.image1 !== image1Preview && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      รูปใหม่
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2 justify-center">
                  <label
                    htmlFor="image1"
                    className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    เปลี่ยนรูป
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('image1')}
                    className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    ลบรูป
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-slate-400">
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-sm text-slate-600">
                  <label htmlFor="image1" className="cursor-pointer text-blue-600 hover:text-blue-800">
                    เลือกรูปภาพ
                  </label>
                  <p className="mt-1">หรือลากและวางไฟล์ที่นี่</p>
                </div>
                <p className="text-xs text-slate-500">
                  PNG, JPG, WEBP ขนาดไม่เกิน 2MB
                </p>
              </div>
            )}
            
            <input
              type="file"
              id="image1"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'image1')}
              className="hidden"
              disabled={uploading.image1}
            />
          </div>
          
          {uploading.image1 && (
            <div className="text-center text-sm text-blue-600 flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังประมวลผลรูปภาพ...
            </div>
          )}
        </div>

        {/* Image 2 */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            รูปภาพที่ 2
            <span className="text-slate-500 text-xs ml-2">(ไม่บังคับ)</span>
          </label>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            {image2Preview ? (
              <div className="space-y-4">
                <div className="relative">
                  <Image
                    src={image2Preview}
                    alt="Image Preview 2"
                    width={200}
                    height={200}
                    className="mx-auto rounded-lg object-cover"
                  />
                  {/* ✅ แสดง badge ว่าเป็นรูปเดิมหรือใหม่ */}
                  {isEditing && existingImages?.image2 === image2Preview && (
                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      รูปเดิม
                    </span>
                  )}
                  {isEditing && existingImages?.image2 !== image2Preview && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      รูปใหม่
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2 justify-center">
                  <label
                    htmlFor="image2"
                    className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    เปลี่ยนรูป
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('image2')}
                    className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    ลบรูป
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-slate-400">
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-sm text-slate-600">
                  <label htmlFor="image2" className="cursor-pointer text-blue-600 hover:text-blue-800">
                    เลือกรูปภาพ
                  </label>
                  <p className="mt-1">หรือลากและวางไฟล์ที่นี่</p>
                </div>
                <p className="text-xs text-slate-500">
                  PNG, JPG, WEBP ขนาดไม่เกิน 2MB
                </p>
              </div>
            )}
            
            <input
              type="file"
              id="image2"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'image2')}
              className="hidden"
              disabled={uploading.image2}
            />
          </div>
          
          {uploading.image2 && (
            <div className="text-center text-sm text-blue-600 flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังประมวลผลรูปภาพ...
            </div>
          )}
        </div>
      </div>

      {/* ✅ แสดงข้อมูลเพิ่มเติมสำหรับการแก้ไข */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">การแก้ไขรูปภาพ:</p>
              <ul className="space-y-1 text-xs">
                <li>• รูปภาพเดิมจะแสดงอัตโนมัติ</li>
                <li>• คุณสามารถเปลี่ยนรูปใหม่ได้โดยคลิก "เปลี่ยนรูป"</li>
                <li>• หากไม่เปลี่ยนรูป ระบบจะใช้รูปเดิม</li>
                <li>• รูปใหม่จะมี badge สีเขียว "รูปใหม่"</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}