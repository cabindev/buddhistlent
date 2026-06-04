// components/form-return/ConfirmationStep.tsx
'use client';

import Image from 'next/image';
import { FormReturnData } from '@/types/form-return';

interface ConfirmationStepProps {
  data: Partial<FormReturnData>;
  image1File?: File;
  image2File?: File;
  isEditing?: boolean;
}

export default function ConfirmationStep({ data, image1File, image2File }: ConfirmationStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          ตรวจสอบข้อมูลก่อนส่ง
        </h3>
        <p className="text-sm text-slate-600">
          กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนยืนยันการส่ง
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Personal Information */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="font-medium text-slate-900 mb-4">ข้อมูลส่วนตัว</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">ชื่อ:</span>
              <span className="font-medium">{data.firstName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">นามสกุล:</span>
              <span className="font-medium">{data.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">องค์กร:</span>
              <span className="font-medium">{data.organizationName}</span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="font-medium text-slate-900 mb-4">ที่อยู่</h4>
          <div className="space-y-3">
            <div>
              <span className="text-slate-600">ที่อยู่:</span>
              <p className="font-medium mt-1">
                {data.addressLine1}<br />
                ตำบล{data.district} อำเภอ{data.amphoe}<br />
                จังหวัด{data.province} {data.zipcode}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="font-medium text-slate-900 mb-4">ข้อมูลติดต่อ</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">เบอร์โทรศัพท์:</span>
              <span className="font-medium">{data.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">จำนวนผู้ลงนาม:</span>
              <span className="font-medium">{data.numberOfSigners?.toLocaleString()} คน</span>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="font-medium text-slate-900 mb-4">รูปภาพประกอบ</h4>
          {!image1File && !image2File ? (
            <p className="text-sm text-slate-500 italic">ไม่มีรูปภาพแนบ</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {image1File && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">รูปภาพที่ 1</p>
                  <Image
                    src={URL.createObjectURL(image1File)}
                    alt="Preview 1"
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              {image2File && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">รูปภาพที่ 2</p>
                  <Image
                    src={URL.createObjectURL(image2File)}
                    alt="Preview 2"
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              ข้อมูลสำคัญ
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                หลังจากส่งข้อมูลแล้ว ท่านจะไม่สามารถแก้ไขข้อมูลได้ กรุณาตรวจสอบความถูกต้องก่อนยืนยัน
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}