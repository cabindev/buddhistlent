// app/organization/components/OrganizationForm.tsx 
'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Save, X, AlertTriangle, Building2, Upload, Image as ImageIcon, Trash2, Check } from 'lucide-react';
import { OrganizationCategory } from '@/types/organization';
import { RegionData } from '@/types/form-return';
import { createOrganization } from '../actions/Post';
import { updateOrganization } from '../actions/Update';
import { uploadImage, validateImageFile } from '@/app/lib/imageUpload';
import OrganizationSelector from './OrganizationSelector';
import TambonSearch from '@/components/form-return/TambonSearch';
// นำเข้า Toast functions
import { 
  showSuccessToast, 
  showErrorToast, 
  showPhoneDuplicateToast,
  showSubmitSuccessToast,
  showUpdateSuccessToast 
} from './ui/Toast';

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

interface OrganizationFormProps {
  organizationCategories: OrganizationCategory[];
  initialData?: OrganizationFormData;
  isEdit?: boolean;
}

// ฟังก์ชันสำหรับตรวจสอบและทำความสะอาด URL ของรูปภาพ
const validateImageUrl = (url: string | undefined | null): string | null => {
  // ตรวจสอบว่าเป็น string และไม่ว่าง
  if (!url || typeof url !== 'string' || url.trim() === '') return null;
  
  try {
    // ถ้าเป็น URL แบบ relative path ให้เพิ่ม leading slash
    if (url.startsWith('/')) {
      return url;
    }
    
    // ถ้าเป็น URL แบบ absolute
    if (url.startsWith('http://') || url.startsWith('https://')) {
      new URL(url); // ตรวจสอบว่าเป็น URL ที่ถูกต้อง
      return url;
    }
    
    // ถ้าไม่มี protocol ให้เพิ่ม leading slash
    return `/${url}`;
  } catch (error) {
    console.warn('Invalid image URL:', url, error);
    return null;
  }
};

export default function OrganizationForm({ organizationCategories, initialData, isEdit = false }: OrganizationFormProps) {
  const router = useRouter();
  // Fixed ref array initialization for Next.js 15
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
    numberOfSigners: initialData?.numberOfSigners || 0,
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

  // Memoized callback for input changes - ปรับปรุงให้รองรับ type ที่ถูกต้อง
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
      showErrorToast(validationError);
      return;
    }

    try {
      setUploadingImages(prev => ({ ...prev, [index]: true }));
      setErrors(prev => ({ ...prev, [imageField]: '' }));

      // อัปโหลดรูปภาพ
      const imageUrl = await uploadImage(file, formData.id);
      setFormData(prev => ({ ...prev, [imageField]: imageUrl }));
      
      // แสดง toast สำเร็จ
      showSuccessToast(`อัปโหลดรูปภาพที่ ${index} เรียบร้อยแล้ว`);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปโหลด';
      setErrors(prev => ({
        ...prev,
        [imageField]: errorMessage
      }));
      showErrorToast(`ไม่สามารถอัปโหลดรูปภาพที่ ${index}: ${errorMessage}`);
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
    showSuccessToast(`ลบรูปภาพที่ ${index} เรียบร้อยแล้ว`);
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

    if (formData.numberOfSigners < 1 || isNaN(formData.numberOfSigners)) {
      newErrors.numberOfSigners = 'จำนวนผู้ลงนามต้องมากกว่า 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showErrorToast('กรุณาตรวจสอบข้อมูลให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // ล้าง error ก่อนส่ง

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
          // ใช้ Toast แทน alert
          showUpdateSuccessToast(formData.organizationCategory?.name);
          router.push('/organization');
          router.refresh();
        } else {
          // แสดง error ในฟอร์มและ Toast
          setErrors({ submit: result.message });
          showErrorToast(result.message);
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
          // ใช้ Toast พิเศษสำหรับการส่งข้อมูลสำเร็จ
          showSubmitSuccessToast(formData.organizationCategory?.name);
          router.push('/organization');
          router.refresh();
        } else {
          // แสดง error ในฟอร์ม
          setErrors({ submit: result.message });
          
          // ถ้าเป็น error เรื่องเบอร์โทรศัพท์ซ้ำ ให้ใช้ Toast พิเศษ
          if (result.message.includes('เบอร์โทรศัพท์') && result.message.includes('ใช้แล้ว')) {
            showPhoneDuplicateToast(formData.phoneNumber);
            setErrors(prev => ({ 
              ...prev, 
              submit: result.message,
              phoneNumber: result.message 
            }));
          } else {
            showErrorToast(result.message);
          }
        }
      }
    } catch (error) {
      console.error('Error saving organization:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด';
      setErrors({ submit: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, isEdit, initialData?.id, formData, router]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const inputCls = (value: string | number, hasError?: boolean) => {
    const base = 'w-full px-2 py-1.5 text-sm text-gray-900 rounded focus:outline-none focus:ring-1 transition-colors';
    if (hasError) return `${base} bg-red-50 border border-red-300 focus:ring-red-400`;
    if (value !== '' && value !== 0) return `${base} bg-green-50 border border-green-400 focus:ring-green-400`;
    return `${base} bg-white border border-gray-300 focus:ring-orange-500 focus:border-orange-500`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2 text-sm font-medium"
            type="button"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {isEdit ? 'Edit Organization Data' : 'Submit Organization Data'}
              </h1>
              <p className="text-xs text-gray-600">
                {isEdit ? 'แก้ไขข้อมูลที่ส่งคืน | Edit submitted data' : 'ส่งคืนข้อมูลองค์กร | Submit organization information'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Error Alert - ยังคงใช้สำหรับแสดง error ในหน้า */}
        {errors.submit && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
                <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="bg-white border border-gray-200 rounded">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-medium text-gray-900">Personal Information | ข้อมูลผู้ส่ง</h2>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    First Name | ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={inputCls(formData.firstName, !!errors.firstName)}
                    placeholder="ชื่อ"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Last Name | นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={inputCls(formData.lastName, !!errors.lastName)}
                    placeholder="นามสกุล"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Organization Selection */}
          <div className="bg-white border border-gray-200 rounded">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-medium text-gray-900">Organization | องค์กร</h2>
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
          <div className="bg-white border border-gray-200 rounded">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-medium text-gray-900">Address | ที่อยู่องค์กร</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ชื่อองค์กร <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className={inputCls(formData.addressLine1, !!errors.addressLine1)}
                  placeholder="ชื่อองค์กร"
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-xs text-red-600">{errors.addressLine1}</p>
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
          <div className="bg-white border border-gray-200 rounded">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-medium text-gray-900">Contact Information | ข้อมูลติดต่อ</h2>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number | เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    className={inputCls(formData.phoneNumber, !!errors.phoneNumber)}
                    placeholder="0812345678"
                    maxLength={10}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Number of Signers | จำนวนผู้ลงนาม <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfSigners === 0 ? '' : formData.numberOfSigners}
                    onChange={(e) => handleInputChange('numberOfSigners', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                    className={inputCls(formData.numberOfSigners, !!errors.numberOfSigners)}
                    placeholder="1"
                  />
                  {errors.numberOfSigners && (
                    <p className="mt-1 text-xs text-red-600">{errors.numberOfSigners}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Images - แก้ไขการแสดงรูปภาพ */}
          <div className="bg-white border border-gray-200 rounded">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-medium text-gray-900">Images | รูปภาพประกอบ</h2>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((index) => {
                  const imageField = `image${index}` as keyof OrganizationFormData;
                  const imageValue = formData[imageField];
                  const isUploading = uploadingImages[index];
                  const isRequired = index <= 2;

                  // ✅ ตรวจสอบและทำความสะอาด URL ก่อนส่งให้ Next.js Image
                  // แปลงเป็น string หรือ undefined เท่านั้น
                  const imageUrl = typeof imageValue === 'string' ? imageValue : undefined;
                  const validImageUrl = validateImageUrl(imageUrl);

                  return (
                    <div key={index} className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">
                        Image {index} | รูปที่ {index} {isRequired && <span className="text-red-500">*</span>}
                      </label>
                      
                      <div className="relative">
                        {validImageUrl ? (
                          <div className="relative w-full h-24 bg-gray-100 border border-gray-300 rounded overflow-hidden">
                            <Image
                              src={validImageUrl}
                              alt={`Image ${index}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                              onError={(e) => {
                                console.warn(`Failed to load image ${index}:`, validImageUrl);
                                // ซ่อนรูปภาพที่โหลดไม่ได้
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
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
                                ${isUploading ? 'bg-orange-50 border-orange-300' : ''}
                              `}
                            >
                              <div className="flex flex-col items-center justify-center p-2">
                                {isUploading ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full mb-1"></div>
                                ) : (
                                  <Upload className="w-4 h-4 mb-1 text-gray-400" />
                                )}
                                <p className="text-xs text-gray-500 text-center">
                                  {isUploading 
                                    ? 'Uploading...' 
                                    : 'Upload Image'
                                  }
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

              <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                <p className="text-xs text-orange-700">
                  <strong>หมายเหตุ:</strong> รูปภาพจะถูกบีบอัดอัตโนมัติเป็น ≤200KB รองรับไฟล์ JPG, PNG, WebP
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="bg-white border border-gray-200 rounded">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" />
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || Object.values(uploadingImages).some(Boolean)}
                  className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      กำลังส่ง...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      {isEdit ? 'บันทึกการแก้ไข' : 'ส่งข้อมูล'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}