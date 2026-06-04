// app/dashboard/organization/components/DashboardOrganizationForm.tsx
// ฟอร์มเพิ่มองค์กรสำหรับ Dashboard ใช้โครงสร้างจาก OrganizationForm.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Save, X, AlertTriangle, Building2, Upload, Image as ImageIcon, Trash2, Check } from 'lucide-react';
import type { OrganizationCategory } from '@/types/organization';
import { RegionData } from '@/types/form-return';
import { createOrganization } from '@/app/organization/actions/Post';
import { updateOrganization } from '@/app/organization/actions/Update';
import { uploadImage, validateImageFile } from '@/app/lib/imageUpload';
import OrganizationSelector from '@/app/organization/components/OrganizationSelector';
import TambonSearch from '@/components/form-return/TambonSearch';
import Link from 'next/link';

interface OrganizationFormData {
  id?: number;
  firstName: string;
  lastName: string;
  organizationCategoryId?: number;
  organizationCategory?: OrganizationCategory;
  addressLine1: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  type: string;
  phoneNumber: string;
  numberOfSigners: number;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
}

interface DashboardOrganizationFormProps {
  organizationCategories: OrganizationCategory[];
  initialData?: OrganizationFormData;
  isEdit?: boolean;
}

export default function DashboardOrganizationForm({ 
  organizationCategories, 
  initialData, 
  isEdit = false 
}: DashboardOrganizationFormProps) {
  const router = useRouter();
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  
  const [formData, setFormData] = useState<OrganizationFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    organizationCategoryId: initialData?.organizationCategoryId,
    organizationCategory: initialData?.organizationCategory,
    addressLine1: initialData?.addressLine1 || '',
    district: initialData?.district || '',
    amphoe: initialData?.amphoe || '',
    province: initialData?.province || '',
    zipcode: initialData?.zipcode || '',
    type: initialData?.type || '',
    phoneNumber: initialData?.phoneNumber || '',
    numberOfSigners: initialData?.numberOfSigners || 1,
    image1: initialData?.image1,
    image2: initialData?.image2,
    image3: initialData?.image3,
    image4: initialData?.image4,
    image5: initialData?.image5,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Record<number, boolean>>({});

  // Memoized callback for organization selection
  const handleOrganizationSelect = useCallback((organizationCategoryId: number, organizationCategory: OrganizationCategory) => {
    setFormData(prev => ({
      ...prev,
      organizationCategoryId,
      organizationCategory
    }));
    if (errors.organizationCategoryId) {
      setErrors(prev => ({ ...prev, organizationCategoryId: '' }));
    }
  }, [errors.organizationCategoryId]);

  // Memoized callback for location selection
  const handleLocationSelect = useCallback((location: RegionData) => {
    setFormData(prev => ({
      ...prev,
      district: location.district,
      amphoe: location.amphoe,
      province: location.province,
      zipcode: location.zipcode?.toString() || '',
      type: location.type
    }));
    // Clear location-related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      ['district', 'amphoe', 'province', 'zipcode'].forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  // Memoized callback for input changes
  const handleInputChange = useCallback((field: keyof OrganizationFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Fixed ref callback for dynamic refs
  const setFileInputRef = useCallback((el: HTMLInputElement | null, index: number) => {
    if (fileInputRefs.current) {
      fileInputRefs.current[index - 1] = el;
    }
  }, []);

  const handleImageUpload = useCallback(async (index: number, file: File) => {
    const imageField = `image${index}` as keyof OrganizationFormData;
    // ตรวจสอบไฟล์
    const validationError = validateImageFile(file);
    if (validationError) {
      setErrors(prev => ({ ...prev, [imageField]: validationError }));
      alert(validationError);
      return;
    }

    try {
      setUploadingImages(prev => ({ ...prev, [index]: true }));
      setErrors(prev => ({ ...prev, [imageField]: '' }));

      // อัปโหลดรูปภาพ
      const imageUrl = await uploadImage(file, formData.id);
      setFormData(prev => ({ ...prev, [imageField]: imageUrl }));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปโหลด';
      setErrors(prev => ({
        ...prev,
        [imageField]: errorMessage
      }));
      alert(`ไม่สามารถอัปโหลดรูปภาพที่ ${index}: ${errorMessage}`);
    } finally {
      setUploadingImages(prev => ({ ...prev, [index]: false }));
    }
  }, [formData.id]);

  const handleImageRemove = useCallback((index: number) => {
    const imageField = `image${index}` as keyof OrganizationFormData;
    setFormData(prev => ({ ...prev, [imageField]: undefined }));
    // รีเซ็ต input file
    const inputRef = fileInputRefs.current?.[index - 1];
    if (inputRef) {
      inputRef.value = '';
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'ชื่อเป็นข้อมูลที่จำเป็น';
    if (!formData.lastName.trim()) newErrors.lastName = 'นามสกุลเป็นข้อมูลที่จำเป็น';
    if (!formData.organizationCategoryId) newErrors.organizationCategoryId = 'องค์กรเป็นข้อมูลที่จำเป็น';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'ที่อยู่เป็นข้อมูลที่จำเป็น';
    if (!formData.district.trim()) newErrors.district = 'ตำบล/แขวงเป็นข้อมูลที่จำเป็น';
    if (!formData.amphoe.trim()) newErrors.amphoe = 'อำเภอ/เขตเป็นข้อมูลที่จำเป็น';
    if (!formData.province.trim()) newErrors.province = 'จังหวัดเป็นข้อมูลที่จำเป็น';
    if (!formData.zipcode.trim()) newErrors.zipcode = 'รหัสไปรษณีย์เป็นข้อมูลที่จำเป็น';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'เบอร์โทรศัพท์เป็นข้อมูลที่จำเป็น';

    if (!formData.image1) newErrors.image1 = 'รูปภาพที่ 1 เป็นข้อมูลที่จำเป็น';
    if (!formData.image2) newErrors.image2 = 'รูปภาพที่ 2 เป็นข้อมูลที่จำเป็น';

    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber.replace(/[-\s]/g, ''))) {
      newErrors.phoneNumber = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
    }

    if (formData.zipcode && !/^[0-9]{5}$/.test(formData.zipcode)) {
      newErrors.zipcode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
    }

    if (formData.numberOfSigners < 1) {
      newErrors.numberOfSigners = 'จำนวนผู้ลงนามต้องมากกว่า 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('กรุณาตรวจสอบข้อมูลให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (isEdit && initialData?.id) {
        const result = await updateOrganization(initialData.id, {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          organizationCategoryId: formData.organizationCategoryId!,
          addressLine1: formData.addressLine1.trim(),
          district: formData.district.trim(),
          amphoe: formData.amphoe.trim(),
          province: formData.province.trim(),
          zipcode: formData.zipcode.trim(),
          type: formData.type.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          numberOfSigners: formData.numberOfSigners,
          image1: formData.image1!,
          image2: formData.image2!,
          image3: formData.image3 || null,
          image4: formData.image4 || null,
          image5: formData.image5 || null,
        });
        
        if (result.success) {
          alert(result.message);
          router.push('/dashboard/organization');
          router.refresh();
        } else {
          setErrors({ submit: result.message });
          alert(result.message);
        }
      } else {
        const result = await createOrganization({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          organizationCategoryId: formData.organizationCategoryId!,
          addressLine1: formData.addressLine1.trim(),
          district: formData.district.trim(),
          amphoe: formData.amphoe.trim(),
          province: formData.province.trim(),
          zipcode: formData.zipcode.trim(),
          type: formData.type.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          numberOfSigners: formData.numberOfSigners,
          image1: formData.image1!,
          image2: formData.image2!,
          image3: formData.image3,
          image4: formData.image4,
          image5: formData.image5,
        });
        
        if (result.success) {
          alert(result.message);
          router.push('/dashboard/organization');
          router.refresh();
        } else {
          setErrors({ submit: result.message });
          alert(result.message);
        }
      }
    } catch (error) {
      console.error('Error saving organization:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด';
      setErrors({ submit: errorMessage });
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, isEdit, initialData?.id, formData, router]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Building2 className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEdit ? 'แก้ไขข้อมูลองค์กร' : 'เพิ่มข้อมูลองค์กรใหม่'}
              </h2>
              <p className="text-sm text-gray-500">
                กรอกข้อมูลองค์กรให้ครบถ้วน
              </p>
            </div>
          </div>
          
          <Link
            href="/dashboard/organization"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับ</span>
          </Link>
        </div>
      </div>

      <div className="p-6">
        {/* Error Alert */}
        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
                <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">ข้อมูลผู้ส่ง</h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="กรอกชื่อ"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="กรอกนามสกุล"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Organization Selection */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">องค์กร</h3>
            </div>
            <div className="p-4">
              <OrganizationSelector
                value={formData.organizationCategoryId}
                onChange={handleOrganizationSelect}
                error={errors.organizationCategoryId}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">ที่อยู่องค์กร</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ที่อยู่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="เลขที่ หมู่ที่ ซอย ถนน"
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>
                )}
              </div>

              <TambonSearch
                onSelectLocation={handleLocationSelect}
                initialLocation={{
                  district: formData.district,
                  amphoe: formData.amphoe,
                  province: formData.province,
                  zipcode: formData.zipcode || 0,
                  type: formData.type,
                  district_code: 0,
                  amphoe_code: 0,
                  province_code: 0,
                }}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">ข้อมูลติดต่อ</h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    placeholder="0812345678"
                    maxLength={10}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    จำนวนผู้ลงนาม <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfSigners}
                    onChange={(e) => handleInputChange('numberOfSigners', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="1"
                  />
                  {errors.numberOfSigners && (
                    <p className="mt-1 text-sm text-red-600">{errors.numberOfSigners}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">รูปภาพประกอบ</h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((index) => {
                  const imageField = `image${index}` as keyof OrganizationFormData;
                  const imageUrl = formData[imageField];
                  const isUploading = uploadingImages[index];
                  const isRequired = index <= 2;

                  return (
                    <div key={index} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        รูปที่ {index} {isRequired && <span className="text-red-500">*</span>}
                      </label>
                      
                      <div className="relative">
                        {imageUrl ? (
                          <div className="relative w-full h-24 bg-gray-100 border border-gray-300 rounded overflow-hidden">
                            <Image
                              src={typeof imageUrl === 'string' ? imageUrl : ''}
                              alt={`Image ${index}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                            />
                            <button
                              type="button"
                              onClick={() => handleImageRemove(index)}
                              className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                            <div className="absolute bottom-1 left-1 z-10">
                              <div className="p-0.5 bg-green-500 rounded-full">
                                <Check className="h-2.5 w-2.5 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              ref={(el) => setFileInputRef(el, index)}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(index, file);
                              }}
                              className="hidden"
                              id={`image-${index}`}
                            />
                            
                            <label
                              htmlFor={`image-${index}`}
                              className={`
                                flex flex-col items-center justify-center w-full h-24 
                                border border-dashed border-gray-300 rounded cursor-pointer
                                hover:bg-gray-50 transition-colors duration-200
                                ${isUploading ? 'bg-amber-50 border-amber-300' : ''}
                              `}
                            >
                              <div className="flex flex-col items-center justify-center p-2">
                                {isUploading ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full mb-1"></div>
                                ) : (
                                  <Upload className="w-4 h-4 mb-1 text-gray-400" />
                                )}
                                <p className="text-xs text-gray-500 text-center">
                                  {isUploading ? 'อัปโหลด...' : 'เลือกรูป'}
                                </p>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                      
                      {errors[imageField] && (
                        <p className="text-xs text-red-600">{errors[imageField]}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                <p className="text-sm text-amber-700">
                  <strong>หมายเหตุ:</strong> รูปภาพจะถูกบีบอัดอัตโนมัติ รองรับไฟล์ JPG, PNG, WebP
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/organization"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              ยกเลิก
            </Link>
            
            <button
              type="submit"
              disabled={isSubmitting || Object.values(uploadingImages).some(Boolean)}
              className="flex items-center space-x-2 px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEdit ? 'อัปเดต' : 'บันทึก'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}