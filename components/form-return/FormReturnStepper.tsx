// components/form-return/FormReturnStepper.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FormReturnData } from '@/types/form-return';
import PersonalInfoStep from './PersonalInfoStep';
import AddressStep from './AddressStep';
import ContactStep from './ContactStep';
import ImageUploadStep from './ImageUploadStep';
import ConfirmationStep from './ConfirmationStep';
import StepIndicator from '@/components/ui/stepIndicator';

const steps = [
  { number: 1, title: 'ข้อมูลส่วนตัว', description: 'ชื่อ-นามสกุล และองค์กร' },
  { number: 2, title: 'ที่อยู่', description: 'ข้อมูลที่อยู่ติดต่อ' },
  { number: 3, title: 'ข้อมูลติดต่อ', description: 'เบอร์โทรและจำนวนผู้ลงนาม' },
  { number: 4, title: 'รูปภาพ', description: 'แนบรูปภาพประกอบ' },
  { number: 5, title: 'ยืนยัน', description: 'ตรวจสอบข้อมูลก่อนส่ง' }
];

interface FormReturnStepperProps {
  formData: Partial<FormReturnData>;
  onUpdateFormData: (data: Partial<FormReturnData>) => void;
  onImageUpdate: (image1?: File, image2?: File) => void;
  finalAction: (data: Partial<FormReturnData>) => Promise<void>;
  submitButtonText?: string;
  isSubmitting?: boolean;
  isEditing?: boolean;
  initialImages?: {
    image1?: string;
    image2?: string;
  };
}

export default function FormReturnStepper({
  formData,
  onUpdateFormData,
  onImageUpdate,
  finalAction,
  submitButtonText = 'บันทึกข้อมูล',
  isSubmitting = false,
  isEditing = false
}: FormReturnStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);

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
                 formData.numberOfSigners > 0);
      case 4:
        return true; // รูปภาพไม่บังคับในการแก้ไข
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
    // ตรวจสอบข้อมูลทั้งหมดก่อนส่ง
    const allStepsValid = [1, 2, 3, 4].every(step => validateStep(step));
    
    if (!allStepsValid) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      await finalAction(formData);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep 
          data={formData} 
          onUpdate={onUpdateFormData}
          isEditing={isEditing}  
        />;
      case 2:
        return <AddressStep 
          data={formData} 
          onUpdate={onUpdateFormData}
          isEditing={isEditing}  
        />;
      case 3:
        return <ContactStep 
          data={formData} 
          onUpdate={onUpdateFormData}
          isEditing={isEditing}  
        />;
      case 4:
        return <ImageUploadStep 
          data={formData} 
          onUpdate={onUpdateFormData} 
          onImageUpdate={onImageUpdate}
          isEditing={isEditing}
          existingImages={{ 
            image1: formData.image1,
            image2: formData.image2
          }}
        />;
      case 5:
        return <ConfirmationStep 
          data={formData}
          isEditing={isEditing}  
        />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator 
          steps={steps} 
          currentStep={currentStep} 
        />
      </div>

      {/* Step Content */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-slate-600 mb-6">
          {steps[currentStep - 1].description}
        </p>

        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8 border-t border-slate-200">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            currentStep === 1
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            ต่อไป
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังอัพเดท...
              </>
            ) : (
              submitButtonText
            )}
          </button>
        )}
      </div>
    </div>
  );
}