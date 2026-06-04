// components/form-return/EditFormReturn.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FormReturnData } from '@/types/form-return';
import { updateFormReturn } from '@/app/form_return/actions/update';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';

interface EditFormReturnProps {
  initialData: FormReturnData;
}

export default function EditFormReturn({ initialData }: EditFormReturnProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    organizationName: initialData.organizationName || '',
    addressLine1: initialData.addressLine1 || '',
    district: initialData.district || '',
    amphoe: initialData.amphoe || '',
    province: initialData.province || '',
    zipcode: initialData.zipcode || '',
    type: initialData.type || 'ตำบล',
    phoneNumber: initialData.phoneNumber || '',
    numberOfSigners: initialData.numberOfSigners || 2,
  });

  // Image states
  const [image1Preview, setImage1Preview] = useState<string>(initialData.image1 || '');
  const [image2Preview, setImage2Preview] = useState<string>(initialData.image2 || '');
  const [image1File, setImage1File] = useState<File | null>(null);
  const [image2File, setImage2File] = useState<File | null>(null);

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfSigners' ? parseInt(value) || 0 : value
    }));
  };

  // Handle image selection
  const handleImageChange = (imageNumber: 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (imageNumber === 1) {
        setImage1Preview(reader.result as string);
        setImage1File(file);
      } else {
        setImage2Preview(reader.result as string);
        setImage2File(file);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const removeImage = (imageNumber: 1 | 2) => {
    if (imageNumber === 1) {
      setImage1Preview(initialData.image1 || '');
      setImage1File(null);
    } else {
      setImage2Preview(initialData.image2 || '');
      setImage2File(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      toast.error('หมายเลขโทรศัพท์ต้องมี 10 หลัก');
      return;
    }

    if (formData.numberOfSigners <= 1) {
      toast.error('จำนวนผู้ลงนามต้องมากกว่า 1 คน');
      return;
    }

    startTransition(async () => {
      try {
        const submitData = new FormData();
        
        // Add ID
        submitData.append('id', initialData.id!.toString());
        
        // Add form data
        Object.entries(formData).forEach(([key, value]) => {
          submitData.append(key, value.toString());
        });
        
        // Add images only if changed
        if (image1File) {
          submitData.append('image1', image1File);
        }
        if (image2File) {
          submitData.append('image2', image2File);
        }

        const result = await updateFormReturn(submitData);
        
        if (result.success) {
          setIsSuccess(true);
          toast.success('อัพเดทข้อมูลสำเร็จ!');
          
          setTimeout(() => {
            router.push('/dashboard/formReturn');
            router.refresh();
          }, 1500);
        } else {
          toast.error(result.error || 'เกิดข้อผิดพลาด');
        }
      } catch (error) {
        console.error('Update error:', error);
        toast.error('เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
      }
    });
  };

  // Success screen
  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          อัพเดทข้อมูลสำเร็จ!
        </h2>
        
        <p className="text-slate-600 mb-8">
          ข้อมูลของ <span className="font-medium">{formData.firstName} {formData.lastName}</span> จาก{' '}
          <span className="font-medium">{formData.organizationName}</span> ได้รับการอัพเดทเรียบร้อยแล้ว
        </p>
        
        <div className="flex items-center justify-center text-slate-500">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          กำลังนำคุณกลับไปหน้ารายการ...
        </div>
      </div>
    );
  }

  // Image upload component
  const ImageUpload = ({ 
    imageNumber, 
    preview, 
    hasFile 
  }: { 
    imageNumber: 1 | 2; 
    preview: string; 
    hasFile: boolean;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        รูปภาพที่ {imageNumber} {imageNumber === 1 ? '(หน้าเอกสาร)' : '(ลายเซ็น)'}
      </label>
      
      <div className="relative">
        {preview ? (
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt={`Image ${imageNumber}`}
              className="w-full h-full object-contain"
            />
            {hasFile && (
              <button
                type="button"
                onClick={() => removeImage(imageNumber)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {hasFile && (
              <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                รูปใหม่
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <Camera className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange(imageNumber)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      <p className="text-xs text-gray-500">
        คลิกเพื่อเลือกรูปใหม่ (ไฟล์รูปภาพ ขนาดไม่เกิน 5MB)
      </p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">แก้ไขข้อมูลการคืนเอกสาร</h2>
      
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อหน่วยงาน <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ที่อยู่ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ตำบล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อำเภอ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="amphoe"
              value={formData.amphoe}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              จังหวัด <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสไปรษณีย์ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Type and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ประเภท <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="ตำบล">ตำบล</option>
              <option value="อำเภอ">อำเภอ</option>
              <option value="จังหวัด">จังหวัด</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทรศัพท์ <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              maxLength={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Number of Signers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            จำนวนผู้ลงนาม <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="numberOfSigners"
            value={formData.numberOfSigners}
            onChange={handleInputChange}
            min="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload 
            imageNumber={1} 
            preview={image1Preview} 
            hasFile={!!image1File}
          />
          <ImageUpload 
            imageNumber={2} 
            preview={image2Preview} 
            hasFile={!!image2File}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isPending && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isPending ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
          </button>
        </div>
      </div>
    </form>
  );
}