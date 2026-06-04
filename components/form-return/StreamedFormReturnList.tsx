// components/form-return/StreamedFormReturnList.tsx
'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormReturnData } from "@/types/form-return";
import FormReturnList from './FormReturnList';

interface StreamedFormReturnListProps {
  promise: Promise<{
    forms: FormReturnData[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    error?: string;
  }>;
}

export default function StreamedFormReturnList({ promise }: StreamedFormReturnListProps) {
  const router = useRouter();

  useEffect(() => {
    // ✅ Refresh เมื่อ user กลับมาที่ tab นี้
    const handleFocus = () => {
      router.refresh();
    };

    // ✅ Refresh เมื่อ user กลับมาที่หน้าต่าง
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        router.refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  // ✅ ใช้ use() hook ข้างนอก try/catch
  const data = use(promise);
  
  // ตรวจสอบ error
  if (data.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-800 font-medium">
            เกิดข้อผิดพลาด: {data.error}
          </p>
        </div>
      </div>
    );
  }

  // แสดงข้อความเมื่อไม่มีข้อมูล
  if (!data.forms || data.forms.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-slate-900 mb-2">ยังไม่มีข้อมูล</h3>
        <p className="text-slate-600">ยังไม่มีการส่งคืนข้อมูลแคมเปญ</p>
      </div>
    );
  }

  // คำนวณ limit จาก totalItems และ totalPages
  const limit = data.totalPages > 0 ? Math.ceil(data.totalItems / data.totalPages) : 10;

  return (
    <FormReturnList 
      forms={data.forms} 
      totalItems={data.totalItems}
      currentPage={data.currentPage}
      limit={limit}
    />
  );
}