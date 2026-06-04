// components/form-return/PersonalInfoStep.tsx
'use client';

import { useState } from 'react';
import { FormReturnData } from "@/types/form-return";

interface PersonalInfoStepProps {
  data: Partial<FormReturnData>;
  onUpdate: (data: Partial<FormReturnData>) => void;
  isEditing?: boolean;
}

// ข้อมูลองค์กรที่ให้เลือก (ตามภาพที่ให้มา)
const organizationOptions = [
  'ข้าราชการ',
  'ข้าราชการเกษียณ',
  'ค้าขาย/งานบริการ',
  'ธ.ก.ส',
  'นักเรียน/นักศึกษา',
  'บริษัท',
  'ประกอบธุรกิจส่วนตัว',
  'พนักงานบริษัท',
  'รัฐวิสาหกิจ',
  'รับจ้างทั่วไป',
  'ลูกจ้างหน่วยราชการ',
  'ว่างงาน',
  'อ.ส.ม.',
  'อาชีพอิสระ',
  'อาชีพอื่นๆ',
  'เกษตรกร',
  'โรงงานอุตสาหกรรม',
  'วัด',
  'NGO'
];

export default function PersonalInfoStep({ data, onUpdate, isEditing = false }: PersonalInfoStepProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(
    data.organizationName && !organizationOptions.includes(data.organizationName) 
      ? 'อื่นๆ' 
      : data.organizationName || ''
  );

  const handleOrganizationSelect = (value: string) => {
    if (value === 'อื่นๆ') {
      setShowCustomInput(true);
      setSelectedOrganization('อื่นๆ');
      onUpdate({ organizationName: '' });
    } else {
      setShowCustomInput(false);
      setSelectedOrganization(value);
      onUpdate({ organizationName: value });
    }
  };

  const handleCustomOrganizationChange = (value: string) => {
    onUpdate({ organizationName: value });
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
              กำลังแก้ไขข้อมูลส่วนตัว
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            ชื่อ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            value={data.firstName || ""}
            onChange={(e) => onUpdate({ firstName: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="กรอกชื่อ"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={data.lastName || ""}
            onChange={(e) => onUpdate({ lastName: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="กรอกนามสกุล"
          />
        </div>
      </div>

      {/* ส่วนเลือกองค์กร */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          <span className="flex items-center">
            <svg className="w-4 h-4 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H7a1 1 0 00-1 1v6a1 1 0 01-1 1H2a1 1 0 110-2V4z" clipRule="evenodd" />
            </svg>
            สังกัดองค์กร
          </span>
          <span className="text-red-500 ml-1">*</span>
        </label>
        
        <div className="space-y-3">
          <p className="text-sm text-slate-600">ช่ององค์กร <span className="text-red-500">*</span></p>
          {/* Grid ของตัวเลือกองค์กร */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 max-h-none overflow-visible">
            {organizationOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleOrganizationSelect(option)}
                className={`px-2 py-1.5 text-xs rounded-md border text-center transition-all ${
                  selectedOrganization === option
                    ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                }`}
              >
                {option}
              </button>
            ))}
            
            {/* ปุ่มอื่นๆ */}
            <button
              type="button"
              onClick={() => handleOrganizationSelect('อื่นๆ')}
              className={`px-2 py-1.5 text-xs rounded-md border text-center transition-all ${
                selectedOrganization === 'อื่นๆ' || showCustomInput
                  ? 'bg-orange-100 border-orange-500 text-orange-700 font-medium'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              อื่นๆ
            </button>
          </div>

          {/* Input สำหรับองค์กรอื่นๆ */}
          {showCustomInput && (
            <div className="mt-4">
              <label
                htmlFor="customOrganization"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                ระบุองค์กรอื่นๆ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customOrganization"
                value={data.organizationName || ""}
                onChange={(e) => handleCustomOrganizationChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="เช่น บริษัท ABC จำกัด / วัดพระธาตุ / โรงเรียนมัธยม..."
              />
            </div>
          )}

          {/* แสดงองค์กรที่เลือก */}
          {selectedOrganization && !showCustomInput && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-sm text-green-800">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                องค์กรที่เลือก: <span className="font-medium ml-1">{selectedOrganization}</span>
              </div>
            </div>
          )}

          {/* แสดงองค์กรที่กรอกเอง */}
          {showCustomInput && data.organizationName && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center text-sm text-orange-800">
                <svg className="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                องค์กรที่ระบุ: <span className="font-medium ml-1">{data.organizationName}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}