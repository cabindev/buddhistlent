// components/form-return/ContactStep.tsx
'use client';

import { FormReturnData } from '@/types/form-return';

interface ContactStepProps {
  data: Partial<FormReturnData>;
  onUpdate: (data: Partial<FormReturnData>) => void;
  isEditing?: boolean;
}

export default function ContactStep({ data, onUpdate, isEditing = false }: ContactStepProps) {
  const handlePhoneNumberChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 10) {
      onUpdate({ phoneNumber: cleanValue });
    }
  };

  const handleNumberOfSignersChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (cleanValue === '') {
      onUpdate({ numberOfSigners: 0 });
    } else {
      const numValue = parseInt(cleanValue, 10);
      onUpdate({ numberOfSigners: numValue });
    }
  };

  return (
    <div className="space-y-6">
      {/* แสดง Note สำหรับการแก้ไข */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800 text-sm font-medium">
              กำลังแก้ไขข้อมูลติดต่อ
            </span>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-2">
          หมายเลขโทรศัพท์ <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={data.phoneNumber || ''}
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="0812345678"
          maxLength={10}
        />
        <div className="mt-1 text-xs text-slate-500">
          ตัวอย่าง: 0812345678
        </div>
      </div>

      <div>
        <label htmlFor="numberOfSigners" className="block text-sm font-medium text-slate-700 mb-2">
          จำนวนผู้ลงนาม <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="numberOfSigners"
            value={data.numberOfSigners ? data.numberOfSigners.toLocaleString() : ''}
            onChange={(e) => handleNumberOfSignersChange(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="จำนวนผู้ลงนาม"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
            คน
          </span>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          กรอกเฉพาะตัวเลข (ต้องมากกว่า 1 คน)
        </div>
        {data.numberOfSigners !== undefined && data.numberOfSigners <= 1 && (
          <div className="mt-1 text-xs text-red-600 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5 1.732 2.5z" />
            </svg>
            จำนวนผู้ลงนามต้องมากกว่า 1 คน
          </div>
        )}
      </div>
    </div>
  );
}