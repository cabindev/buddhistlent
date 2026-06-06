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
  basePath?: string;
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

export default function OrganizationForm({ organizationCategories, initialData, isEdit = false, basePath = '/organization' }: OrganizationFormProps) {
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
          router.push(basePath);
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
          router.push(basePath);
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
    const base = 'w-full px-3 py-2 text-sm text-gray-900 bg-white rounded-lg border transition-colors focus:outline-none focus:ring-2';
    if (hasError) return `${base} border-red-300 focus:ring-red-200 focus:border-red-400`;
    if (value !== '' && value !== 0) return `${base} border-yellow-400 bg-yellow-50 focus:ring-yellow-200 focus:border-yellow-500`;
    return `${base} border-gray-200 focus:ring-yellow-200 focus:border-yellow-400`;
  };

  const sectionCls = 'bg-white rounded-2xl border border-gray-100';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={handleGoBack} type="button"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              {isEdit ? 'แก้ไขข้อมูลองค์กร' : 'ลงทะเบียนหน่วยงาน'}
            </h1>
            <p className="text-[10px] text-gray-400">{isEdit ? 'Edit Organization' : 'Submit Organization Data'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">

        {errors.submit && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* 1 — ข้อมูลผู้ส่ง */}
          <div className={sectionCls}>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-yellow-400 text-gray-900 text-[10px] font-bold flex items-center justify-center">1</span>
              <h2 className="text-sm font-semibold text-gray-800">ข้อมูลผู้ส่ง</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">ชื่อ <span className="text-red-400">*</span></label>
                <input type="text" value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={inputCls(formData.firstName, !!errors.firstName)} placeholder="ชื่อ" />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">นามสกุล <span className="text-red-400">*</span></label>
                <input type="text" value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={inputCls(formData.lastName, !!errors.lastName)} placeholder="นามสกุล" />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>
          </div>

          {/* 2 — องค์กร */}
          <div className={sectionCls}>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-yellow-400 text-gray-900 text-[10px] font-bold flex items-center justify-center">2</span>
              <h2 className="text-sm font-semibold text-gray-800">องค์กร / หน่วยงาน</h2>
            </div>
            <div className="p-5">
              <OrganizationSelector value={formData.organizationCategoryId}
                onChange={handleOrganizationSelect} error={errors.organizationCategoryId} disabled={isSubmitting} />
            </div>
          </div>

          {/* 3 — ที่อยู่ */}
          <div className={sectionCls}>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-yellow-400 text-gray-900 text-[10px] font-bold flex items-center justify-center">3</span>
              <h2 className="text-sm font-semibold text-gray-800">ที่อยู่องค์กร</h2>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">ที่อยู่ / ชื่อองค์กร <span className="text-red-400">*</span></label>
                <input type="text" value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className={inputCls(formData.addressLine1, !!errors.addressLine1)} placeholder="เลขที่ / หมู่ / ถนน / ชื่อองค์กร" />
                {errors.addressLine1 && <p className="mt-1 text-xs text-red-500">{errors.addressLine1}</p>}
              </div>
              <TambonSearch onSelectLocation={handleLocationSelect}
                initialLocation={{ district: formData.district, amphoe: formData.amphoe,
                  province: formData.province, zipcode: formData.zipcode || 0,
                  type: formData.type, district_code: 0, amphoe_code: 0, province_code: 0 }} />
            </div>
          </div>

          {/* 4 — ข้อมูลติดต่อ */}
          <div className={sectionCls}>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-yellow-400 text-gray-900 text-[10px] font-bold flex items-center justify-center">4</span>
              <h2 className="text-sm font-semibold text-gray-800">ข้อมูลติดต่อ</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">เบอร์โทรศัพท์ <span className="text-red-400">*</span></label>
                <input type="tel" value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  className={inputCls(formData.phoneNumber, !!errors.phoneNumber)} placeholder="0812345678" maxLength={10} />
                {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">จำนวนผู้ลงนาม <span className="text-red-400">*</span></label>
                <input type="number" min="1"
                  value={formData.numberOfSigners === 0 ? '' : formData.numberOfSigners}
                  onChange={(e) => handleInputChange('numberOfSigners', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                  className={inputCls(formData.numberOfSigners, !!errors.numberOfSigners)} placeholder="0" />
                {errors.numberOfSigners && <p className="mt-1 text-xs text-red-500">{errors.numberOfSigners}</p>}
              </div>
            </div>
          </div>

          {/* 5 — รูปภาพ */}
          <div className={sectionCls}>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-yellow-400 text-gray-900 text-[10px] font-bold flex items-center justify-center">5</span>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">รูปภาพประกอบ</h2>
                <p className="text-[10px] text-gray-400">รูปที่ 1–2 บังคับ · JPG, PNG, WebP · ≤200KB</p>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((index) => {
                const imageField = `image${index}` as keyof OrganizationFormData;
                const imageValue = formData[imageField];
                const imageUrl = typeof imageValue === 'string' ? imageValue : undefined;
                const validImageUrl = validateImageUrl(imageUrl);
                const isUploading = uploadingImages[index];
                const isRequired = index <= 2;

                return (
                  <div key={index}>
                    <p className="text-[10px] font-medium text-gray-500 mb-1.5">
                      รูปที่ {index} {isRequired && <span className="text-red-400">*</span>}
                    </p>
                    {validImageUrl ? (
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <Image src={validImageUrl} alt={`Image ${index}`} fill className="object-cover"
                          sizes="(max-width: 768px) 50vw, 20vw"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <button type="button" onClick={() => handleImageRemove(index)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 hover:border-gray-400 transition-colors z-10">
                          <X className="h-3 w-3 text-gray-500" />
                        </button>
                        <div className="absolute bottom-1.5 left-1.5 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                          <Check className="h-3 w-3 text-gray-900" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <input ref={(el) => setFileInputRef(el, index)} type="file" accept="image/*"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(index, f); }}
                          className="hidden" id={`image-${index}`} />
                        <label htmlFor={`image-${index}`}
                          className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-colors
                            ${isUploading ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white hover:border-yellow-400 hover:bg-yellow-50'}`}>
                          {isUploading
                            ? <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full" />
                            : <><Upload className="w-5 h-5 text-gray-300 mb-1" /><span className="text-[10px] text-gray-400">อัปโหลด</span></>}
                        </label>
                      </>
                    )}
                    {errors[imageField] && <p className="mt-1 text-[10px] text-red-500">{errors[imageField]}</p>}
                  </div>
                );
              })}
            </div>
          </div>

        </form>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <button type="button" onClick={handleGoBack} disabled={isSubmitting}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button type="submit" onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={isSubmitting || Object.values(uploadingImages).some(Boolean)}
            className="flex-[2] flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isSubmitting
              ? <><div className="animate-spin h-4 w-4 border-2 border-gray-900 border-t-transparent rounded-full" />กำลังส่ง...</>
              : <><Save className="h-4 w-4" />{isEdit ? 'บันทึกการแก้ไข' : 'ส่งข้อมูล'}</>}
          </button>
        </div>
      </div>

    </div>
  );
}