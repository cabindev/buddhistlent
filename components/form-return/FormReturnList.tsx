// components/form-return/FormReturnList.tsx
'use client';

import { FormReturnData } from "@/types/form-return";
import InstagramCard from './InstagramCard';
import Pagination from '@/components/ui/Pagination';

interface FormReturnListProps {
  forms: FormReturnData[];
  totalItems: number;
  currentPage: number;
  limit: number;
}

export default function FormReturnList({ 
  forms, 
  totalItems, 
  currentPage, 
  limit 
}: FormReturnListProps) {
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-6">
      {/* Results Info */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            ผลการค้นหา
          </h2>
          <span className="text-sm text-slate-600">
            พบ {totalItems.toLocaleString()} รายการ
          </span>
        </div>

        {forms.length > 0 ? (
          <>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {forms.map((form) => (
                <InstagramCard key={form.id} form={form} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">ไม่พบข้อมูล</h3>
            <p className="text-slate-600">ลองค้นหาด้วยคำอื่น หรือเพิ่มข้อมูลใหม่</p>
          </div>
        )}
      </div>
    </div>
  );
}