// components/form-return/DashboardFormReturn.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { getFormReturnsRealtime } from '@/app/form_return/actions/get';
import { FormReturnData } from '@/types/form-return';
import Pagination from '@/components/ui/Pagination';
import InstagramCard from './InstagramCard';

interface DashboardFormReturnProps {
  initialData: {
    forms: FormReturnData[];
    totalItems: number;
    currentYear: number;
    previousYear: number;
    twoYearsAgoYear: number;
    currentYearCount: number;
    previousYearCount: number;
    twoYearsAgoCount: number;
  };
}

const DashboardFormReturn: React.FC<DashboardFormReturnProps> = ({ initialData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const yearParam = searchParams.get('year');
  const limitParam = searchParams.get('limit');
  
  const [forms, setForms] = useState<FormReturnData[]>(initialData.forms || []);
  const [totalItems, setTotalItems] = useState(initialData.totalItems || 0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'current' | 'previous' | 'twoYearsAgo'>(() => {
    if (yearParam === initialData.previousYear.toString()) return 'previous';
    if (yearParam === initialData.twoYearsAgoYear.toString()) return 'twoYearsAgo';
    return 'current';
  });

  const [yearFilter, setYearFilter] = useState<number>(() => {
    return yearParam ? parseInt(yearParam) : initialData.currentYear;
  });
  
  const [limit] = useState(limitParam ? parseInt(limitParam) : 20);

  // ✅ เพิ่ม auto-refresh เมื่อมีข้อมูลใหม่
  useEffect(() => {
    // ตรวจสอบ success parameter
    const success = searchParams.get('success');
    const newId = searchParams.get('newId');
    
    if (success === 'true' && newId) {
      // Auto refresh หลังจาก 2 วินาที
      const timer = setTimeout(() => {
        fetchForms();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const newYear = yearParam ? parseInt(yearParam) : initialData.currentYear;
    let newActiveTab: 'current' | 'previous' | 'twoYearsAgo' = 'current';
    if (yearParam === initialData.previousYear.toString()) newActiveTab = 'previous';
    if (yearParam === initialData.twoYearsAgoYear.toString()) newActiveTab = 'twoYearsAgo';
    setYearFilter(newYear);
    setActiveTab(newActiveTab);
  }, [yearParam, initialData.currentYear, initialData.previousYear, initialData.twoYearsAgoYear]);

  const updateURL = (params: Record<string, string | number | undefined>) => {
    const newSearchParams = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        newSearchParams.set(key, value.toString());
      } else {
        newSearchParams.delete(key);
      }
    });
    
    router.push(`?${newSearchParams.toString()}`);
  };

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const result = await getFormReturnsRealtime({ 
        page: currentPage, 
        limit, 
        search,
        year: yearFilter 
      });
      setForms(result.forms || []);
      setTotalItems(result.totalItems || 0);
    } catch (error) {
      console.error('Failed to fetch forms', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setForms([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [currentPage, search, yearFilter, limit]);

  const handleSearch = (value: string) => {
    updateURL({ search: value, page: 1 });
  };

  const handleTabChange = (tab: 'current' | 'previous' | 'twoYearsAgo') => {
    const newYear = tab === 'current' ? initialData.currentYear
      : tab === 'previous' ? initialData.previousYear
      : initialData.twoYearsAgoYear;
    updateURL({ year: newYear, page: 1, search: '' });
  };

  const handleLimitChange = (newLimit: number) => {
    updateURL({ limit: newLimit, page: 1 });
  };

  const handleClearSearch = () => {
    updateURL({ search: '', page: 1 });
  };

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header - เหมือนเดิม */}
        <header className="relative mb-8 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-red-400 to-pink-500"></div>
          <div className="absolute inset-0 bg-black/10"></div>
          
          <div className="relative z-10 py-12 px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4 text-center">
              คืนข้อมูลงดเหล้าเข้าพรรษา
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 text-center">
              ร่วมสร้างสังคมที่ดีขึ้นด้วยการงดเหล้าในองค์กรของคุณ
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {(initialData.currentYearCount + initialData.previousYearCount + initialData.twoYearsAgoCount).toLocaleString()}
                </div>
                <div className="text-white/90 text-sm">องค์กรทั้งหมด</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">{initialData.currentYearCount.toLocaleString()}</div>
                <div className="text-white/90 text-sm">ปี {initialData.currentYear}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">{initialData.previousYearCount.toLocaleString()}</div>
                <div className="text-white/90 text-sm">ปี {initialData.previousYear}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">{initialData.twoYearsAgoCount.toLocaleString()}</div>
                <div className="text-white/90 text-sm">ปี {initialData.twoYearsAgoYear}</div>
              </div>
            </div>
            
            {/* Year Tabs */}
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 flex flex-wrap gap-1 justify-center">
                <button
                  type="button"
                  onClick={() => handleTabChange('current')}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all text-sm ${
                    activeTab === 'current' ? 'bg-white text-slate-900 shadow-lg' : 'text-white hover:bg-white/10'
                  }`}
                >
                  ปี {initialData.currentYear} ({initialData.currentYearCount.toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('previous')}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all text-sm ${
                    activeTab === 'previous' ? 'bg-white text-slate-900 shadow-lg' : 'text-white hover:bg-white/10'
                  }`}
                >
                  ปี {initialData.previousYear} ({initialData.previousYearCount.toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('twoYearsAgo')}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all text-sm ${
                    activeTab === 'twoYearsAgo' ? 'bg-white text-slate-900 shadow-lg' : 'text-white hover:bg-white/10'
                  }`}
                >
                  ปี {initialData.twoYearsAgoYear} ({initialData.twoYearsAgoCount.toLocaleString()})
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="max-w-xl mx-auto mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาองค์กร หรือชื่อ..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-500 border-t-transparent"></div>
                  ) : (
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/form_return/create" className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-all flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มข้อมูลใหม่
              </Link>
              
              {/* ✅ เพิ่มปุ่ม Refresh */}
              <button
                onClick={fetchForms}
                disabled={isLoading}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-all flex items-center disabled:opacity-50"
              >
                <svg className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                รีเฟรช
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main>
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-slate-600 text-lg">กำลังโหลดข้อมูล...</p>
            </div>
          ) : forms.length > 0 ? (
            <>
              {/* Results Info */}
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-slate-600">
                    พบ <span className="font-semibold text-slate-900">{totalItems.toLocaleString()}</span> องค์กร 
                    สำหรับปี <span className="font-semibold text-slate-900">{yearFilter}</span>
                  </p>
                  {search && (
                    <p className="text-sm text-slate-500 mt-1">
                      จากการค้นหา "<span className="font-medium text-blue-600">{search}</span>"
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {search && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="text-sm text-slate-600 hover:text-red-600 transition-colors"
                    >
                      ล้างการค้นหา
                    </button>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 text-sm">แสดง:</span>
                    <select
                      value={limit}
                      onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                      className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-slate-600 text-sm">รายการ</span>
                  </div>
                </div>
              </div>

              {/* ✅ Cards Grid - ใช้ InstagramCard ที่แก้ไขแล้ว */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {forms.map((form) => (
                  <InstagramCard key={`${form.id}-${form.updatedAt || form.createdAt}`} form={form} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={limit}
                />
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
             </div>
             
             <h3 className="text-xl font-medium text-slate-900 mb-2">ไม่พบข้อมูล</h3>
             <p className="text-slate-600 mb-8">
               {search ? (
                 <>ไม่พบผลลัพธ์สำหรับ "<span className="font-medium">{search}</span>" ในปี {yearFilter}</>
               ) : (
                 <>ยังไม่มีข้อมูลสำหรับปี {yearFilter}</>
               )}
             </p>
             
             <div className="flex flex-col sm:flex-row gap-3 justify-center">
               <Link
                 href="/form_return/create"
                 className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
               >
                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                 </svg>
                 เพิ่มข้อมูลใหม่
               </Link>
               
               {search && (
                 <button
                   type="button"
                   onClick={handleClearSearch}
                   className="inline-flex items-center px-6 py-3 bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300 transition-all"
                 >
                   ล้างการค้นหา
                 </button>
               )}
             </div>
           </div>
         )}
       </main>
     </div>
   </div>
 );
};

export default DashboardFormReturn;