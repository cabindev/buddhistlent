// components/form-return/AddressStep.tsx
'use client';

import { useState } from 'react';
import TambonSearch from './TambonSearch';
import { FormReturnData, RegionData } from '@/types/form-return';

interface AddressStepProps {
  data: Partial<FormReturnData>;
  onUpdate: (data: Partial<FormReturnData>) => void;
  isEditing?: boolean;
}


export default function AddressStep({ data, onUpdate }: AddressStepProps) {
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);

  // สร้าง initial location จากข้อมูลที่มีอยู่
const initialLocation: RegionData | undefined = data.district && data.amphoe && data.province ? {
  district: data.district,
  amphoe: data.amphoe,
  province: data.province,
  zipcode: data.zipcode || '',
  district_code: false, // เพิ่ม
  amphoe_code: false,   // เพิ่ม  
  province_code: 0,     // เพิ่ม
  type: data.type || ''
} : undefined;

  const handleLocationSelect = (location: RegionData) => {
    onUpdate({
      district: location.district,
      amphoe: location.amphoe,
      province: location.province,
      zipcode: location.zipcode.toString(),
      type: location.type,
    });
    setAutoFilledFields(['amphoe', 'province', 'zipcode']);
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="addressLine1" className="block text-sm font-medium text-slate-700 mb-2">
          ที่อยู่ (เลขที่/หมู่บ้าน) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="addressLine1"
          value={data.addressLine1 || ''}
          onChange={(e) => onUpdate({ addressLine1: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="เลขที่ หมู่บ้าน ซอย ถนน"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          ค้นหาตำบล/อำเภอ/จังหวัด <span className="text-red-500">*</span>
        </label>
        <TambonSearch 
          onSelectLocation={handleLocationSelect}
          initialLocation={initialLocation}
        />
      </div>

      {/* แสดงฟิลด์ที่ถูกเติมอัตโนมัติ */}
      {(data.district || data.amphoe || data.province || data.zipcode) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-slate-700 mb-2">
              ตำบล/แขวง
            </label>
            <input
              type="text"
              id="district"
              value={data.district || ''}
              readOnly
              className="w-full px-4 py-3 rounded-lg border bg-green-50 border-green-300 text-slate-700"
            />
            {autoFilledFields.includes('district') && (
              <p className="mt-1 text-xs text-green-600">ข้อมูลถูกกรอกอัตโนมัติ</p>
            )}
          </div>

          <div>
            <label htmlFor="amphoe" className="block text-sm font-medium text-slate-700 mb-2">
              อำเภอ/เขต
            </label>
            <input
              type="text"
              id="amphoe"
              value={data.amphoe || ''}
              readOnly
              className={`w-full px-4 py-3 rounded-lg border text-slate-700 ${
                autoFilledFields.includes('amphoe')
                  ? 'bg-green-50 border-green-300'
                  : 'bg-slate-50 border-slate-300'
              }`}
            />
            {autoFilledFields.includes('amphoe') && (
              <p className="mt-1 text-xs text-green-600">ข้อมูลถูกกรอกอัตโนมัติ</p>
            )}
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium text-slate-700 mb-2">
              จังหวัด
            </label>
            <input
              type="text"
              id="province"
              value={data.province || ''}
              readOnly
              className={`w-full px-4 py-3 rounded-lg border text-slate-700 ${
                autoFilledFields.includes('province')
                  ? 'bg-green-50 border-green-300'
                  : 'bg-slate-50 border-slate-300'
              }`}
            />
            {autoFilledFields.includes('province') && (
              <p className="mt-1 text-xs text-green-600">ข้อมูลถูกกรอกอัตโนมัติ</p>
            )}
          </div>

          <div>
            <label htmlFor="zipcode" className="block text-sm font-medium text-slate-700 mb-2">
              รหัสไปรษณีย์
            </label>
            <input
              type="text"
              id="zipcode"
              value={data.zipcode || ''}
              readOnly
              className={`w-full px-4 py-3 rounded-lg border text-slate-700 ${
                autoFilledFields.includes('zipcode')
                  ? 'bg-green-50 border-green-300'
                  : 'bg-slate-50 border-slate-300'
              }`}
            />
            {autoFilledFields.includes('zipcode') && (
              <p className="mt-1 text-xs text-green-600">ข้อมูลถูกกรอกอัตโนมัติ</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}