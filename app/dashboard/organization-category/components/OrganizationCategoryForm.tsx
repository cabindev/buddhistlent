// app/dashboard/organization-category/components/OrganizationCategoryForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrganizationCategory } from '../actions/Post';
import { updateOrganizationCategory } from '../actions/Update';
import { ArrowLeft, Save, X, AlertCircle, Building2, CheckCircle, Sparkles } from 'lucide-react';

interface OrganizationCategoryFormData {
  id?: number;
  name: string;
  shortName?: string;
  description?: string;
  categoryType: string;
  isActive?: boolean;
  sortOrder?: number;
}

interface OrganizationCategoryFormProps {
  initialData?: OrganizationCategoryFormData;
  isEdit?: boolean;
}

export default function OrganizationCategoryForm({ initialData, isEdit = false }: OrganizationCategoryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    shortName: initialData?.shortName || '',
    description: initialData?.description || '',
    categoryType: initialData?.categoryType || '',
    isActive: initialData?.isActive ?? true,
    sortOrder: initialData?.sortOrder || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'ชื่อองค์กรเป็นข้อมูลที่จำเป็น';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'ชื่อองค์กรต้องไม่เกิน 200 ตัวอักษร';
    }

    if (!formData.categoryType.trim()) {
      newErrors.categoryType = 'ประเภทองค์กรเป็นข้อมูลที่จำเป็น';
    }

    if (formData.shortName && formData.shortName.trim().length > 50) {
      newErrors.shortName = 'ชื่อย่อต้องไม่เกิน 50 ตัวอักษร';
    }

    if (formData.description && formData.description.trim().length > 1000) {
      newErrors.description = 'คำอธิบายต้องไม่เกิน 1000 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (isEdit && initialData?.id) {
        await updateOrganizationCategory(initialData.id, {
          name: formData.name.trim(),
          shortName: formData.shortName?.trim() || undefined,
          description: formData.description?.trim() || undefined,
          categoryType: formData.categoryType.trim(),
          isActive: formData.isActive,
          sortOrder: formData.sortOrder
        });
      } else {
        await createOrganizationCategory({
          name: formData.name.trim(),
          shortName: formData.shortName?.trim() || undefined,
          description: formData.description?.trim() || undefined,
          categoryType: formData.categoryType.trim(),
          isActive: formData.isActive,
          sortOrder: formData.sortOrder
        });
      }
      
      router.push('/dashboard/organization-category');
      router.refresh();
    } catch (error) {
      console.error('Error saving organization category:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-3 transition-colors duration-200 text-sm font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ย้อนกลับ
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isEdit ? 'แก้ไขข้อมูลองค์กร' : 'เพิ่มองค์กรใหม่'}
              </h1>
              <p className="text-sm text-gray-500 font-light">
                {isEdit ? 'แก้ไขข้อมูลองค์กรในระบบ' : 'เพิ่มองค์กรใหม่เข้าสู่ระบบ'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Error Alert */}
        {errors.submit && (
          <div className="mb-6">
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
                  <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-light text-gray-900">ข้อมูลองค์กร</h2>
                <p className="text-sm text-gray-500 font-light">กรอกข้อมูลรายละเอียดองค์กร</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* ชื่อองค์กร */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อองค์กร <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                maxLength={200}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-colors duration-200 text-sm"
                placeholder="เช่น โรงพยาบาลสมเด็จพระเทพรัตน์, เทศบาลตำบลบางไผ่"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.name.length}/200 ตัวอักษร
              </p>
            </div>

            {/* ชื่อย่อ */}
            <div>
              <label htmlFor="shortName" className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อย่อ
              </label>
              <input
                id="shortName"
                type="text"
                value={formData.shortName || ''}
                onChange={(e) => handleInputChange('shortName', e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-colors duration-200 text-sm"
                placeholder="เช่น รพ.สมเด็จ, ทต.บางไผ่"
              />
              {errors.shortName && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.shortName}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {(formData.shortName || '').length}/50 ตัวอักษร
              </p>
            </div>

            {/* ประเภทองค์กร */}
            <div>
              <label htmlFor="categoryType" className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทองค์กร <span className="text-red-500">*</span>
              </label>
              <input
                id="categoryType"
                type="text"
                value={formData.categoryType}
                onChange={(e) => handleInputChange('categoryType', e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-colors duration-200 text-sm"
                placeholder="เช่น โรงพยาบาล, เทศบาล, โรงเรียน, วัด, ชุมชน,บริษัท ,NGO"
              />
              {errors.categoryType && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.categoryType}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                กรอกประเภทองค์กรตามลักษณะจริง เช่น หน่วยงานราชการ, องค์กรเอกชน,บริษัท,NGO, อื่นๆ
              </p>
            </div>

            {/* คำอธิบาย */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                คำอธิบาย
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-colors duration-200 text-sm resize-none"
                placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับองค์กรนี้ เช่น ลักษณะเฉพาะ หน้าที่รับผิดชอบ"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {(formData.description || '').length}/1000 ตัวอักษร
              </p>
            </div>

            {/* ลำดับการแสดง */}
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                ลำดับการแสดง
              </label>
              <input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                min={0}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-colors duration-200 text-sm"
                placeholder="เช่น 1, 2, 3"
              />
              <p className="mt-1 text-xs text-gray-500">
                หมายเลขที่เล็กกว่าจะแสดงก่อน (ค่าเริ่มต้น: 0)
              </p>
            </div>

            {/* สถานะการใช้งาน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                สถานะการใช้งาน
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === true}
                    onChange={() => handleInputChange('isActive', true)}
                    className="sr-only"
                  />
                  <div className={`flex items-center px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    formData.isActive === true
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-green-300'
                  }`}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-light">ใช้งาน</span>
                  </div>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === false}
                    onChange={() => handleInputChange('isActive', false)}
                    className="sr-only"
                  />
                  <div className={`flex items-center px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    formData.isActive === false
                      ? 'border-gray-400 bg-gray-50 text-gray-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}>
                    <X className="h-4 w-4 mr-2" />
                    <span className="text-sm font-light">ปิดใช้งาน</span>
                  </div>
                </label>
              </div>
            </div>
          </form>

          {/* Submit Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-light text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-light text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 transition-all duration-200 min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    กำลังบันทึก...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="h-4 w-4 mr-2" />
                    {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มองค์กร'}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-light text-gray-900">คำแนะนำการสร้างองค์กร</h4>
              <p className="text-sm text-gray-500 font-light">เทิปสำหรับการสร้างองค์กรที่มีประสิทธิภาพ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {[
                "ตั้งชื่อองค์กรให้ชัดเจนและเป็นทางการ",
                "เพิ่มชื่อย่อเพื่อความสะดวกในการใช้งาน",
                "เลือกประเภทองค์กรให้ตรงกับลักษณะจริง",
                "เพิ่มคำอธิบายเพื่อให้ผู้ใช้เข้าใจบทบาท"
              ].map((tip, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 font-light">{tip}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-amber-800 mb-2">ตัวอย่างองค์กร</h5>
              <div className="space-y-1 text-sm text-amber-700 font-light">
                <p>• โรงพยาบาลสมเด็จพระเทพรัตน์ (รพ.สมเด็จ)</p>
                <p>• เทศบาลตำบลบางไผ่ (ทต.บางไผ่)</p>
                <p>• โรงเรียนวัดป่าแดง (รร.วัดป่าแดง)</p>
                <p>• วัดสว่างอารมณ์ (วัดสว่างฯ)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}