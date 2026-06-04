// app/form_return/create/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FormReturnData } from '@/types/form-return';
import { createFormReturn } from '@/app/form_return/actions/post';
import PersonalInfoStep from '@/components/form-return/PersonalInfoStep';
import AddressStep from '@/components/form-return/AddressStep';
import ContactStep from '@/components/form-return/ContactStep';
import ImageUploadStep from '@/components/form-return/ImageUploadStep';
import ConfirmationStep from '@/components/form-return/ConfirmationStep';
import StepIndicator from '@/components/ui/stepIndicator';
import { toast } from 'react-hot-toast';

const steps = [
  { number: 1, title: 'ข้อมูลส่วนตัว', description: 'ชื่อ-นามสกุล และองค์กร' },
  { number: 2, title: 'ที่อยู่', description: 'ข้อมูลที่อยู่ติดต่อ' },
  { number: 3, title: 'ข้อมูลติดต่อ', description: 'เบอร์โทรและจำนวนผู้ลงนาม' },
  { number: 4, title: 'รูปภาพ', description: 'แนบรูปภาพประกอบ' },
  { number: 5, title: 'ยืนยัน', description: 'ตรวจสอบข้อมูลก่อนส่ง' }
];

export default function CreateFormReturn() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormReturnData>>({});
  const [image1File, setImage1File] = useState<File | undefined>();
  const [image2File, setImage2File] = useState<File | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const updateFormData = (newData: Partial<FormReturnData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleImageUpdate = (image1?: File, image2?: File) => {
    if (image1) setImage1File(image1);
    if (image2) setImage2File(image2);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.organizationName);
      case 2:
        return !!(formData.addressLine1 && formData.district && formData.amphoe &&
                 formData.province && formData.zipcode);
      case 3:
        return !!(formData.phoneNumber && formData.numberOfSigners &&
                 formData.phoneNumber.length === 10 &&
                 formData.numberOfSigners > 1);
      case 4:
        return true; // รูปภาพไม่บังคับ
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    startTransition(async () => {
      try {
        const submitFormData = new FormData();
        
        // Add form data
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            submitFormData.append(key, value.toString());
          }
        });
        
        // Add images
        if (image1File) submitFormData.append('image1', image1File);
        if (image2File) submitFormData.append('image2', image2File);

        // ✅ เพิ่ม loading toast
        const loadingToast = toast.loading('กำลังบันทึกข้อมูล...');

        const result = await createFormReturn(submitFormData);
        
        // ✅ ปิด loading toast
        toast.dismiss(loadingToast);
        
        if (result.success) {
          toast.success('ส่งข้อมูลสำเร็จ!');
          
          // ✅ ส่ง ID ไปด้วยเพื่อแสดงข้อมูลที่เพิ่งสร้าง
          const newId = result.data?.id;
          router.push(`/form_return?success=true&newId=${newId}`);
          router.refresh();
          
          // ✅ รอสักครู่แล้ว refresh อีกครั้งเพื่อให้แน่ใจ
          setTimeout(() => {
            router.refresh();
          }, 1000);
          
        } else {
          toast.error(result.error || 'เกิดข้อผิดพลาด');
        }
      } catch (error) {
        console.error('Submit error:', error);
        toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
      }
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep data={formData} onUpdate={updateFormData} />;
      case 2:
        return <AddressStep data={formData} onUpdate={updateFormData} />;
      case 3:
        return <ContactStep data={formData} onUpdate={updateFormData} />;
      case 4:
        return <ImageUploadStep 
          data={formData} 
          onUpdate={updateFormData} 
          onImageUpdate={handleImageUpdate}
        />;
      case 5:
        return <ConfirmationStep 
          data={formData} 
          image1File={image1File}
          image2File={image2File}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              ฟอร์มส่งคืนข้อมูล "งดเหล้าเข้าพรรษา ปี {new Date().getFullYear() + 543}"
            </h1>
            <p className="text-slate-600">
              กรุณากรอกข้อมูลให้ครบถ้วนเพื่อส่งคืนข้อมูลการดำเนินงาน
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <StepIndicator 
              steps={steps} 
              currentStep={currentStep} 
            />
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-slate-600">
                {steps[currentStep - 1].description}
              </p>
            </div>

            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-slate-200 mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1 || isPending}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 1 || isPending
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                ย้อนกลับ
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isPending}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ต่อไป
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังส่งข้อมูล...
                    </>
                  ) : (
                    'ยืนยันและส่งข้อมูล'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}