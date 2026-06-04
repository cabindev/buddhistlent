// app/form_return/page.tsx
import { Suspense } from 'react';
import { getFormReturns } from './actions/get';
import SearchForm from '@/components/form-return/SearchForm';
import StreamedFormReturnList from '@/components/form-return/StreamedFormReturnList';
import RecentUploadCard from '@/components/form-return/RecentUploadCard';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    limit?: string;
    success?: string;
    year?: string;
    newId?: string; // เพิ่มเพื่อดึง record ใหม่
  }>;
}

async function getFormReturnData(searchParams: {
  search?: string;
  page?: string;
  limit?: string;
  success?: string;
  year?: string;
}) {
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const year = searchParams.year ? parseInt(searchParams.year) : undefined;

  return await getFormReturns({ search, page, limit, year });
}

// ✅ แก้ไขฟังก์ชันดึงข้อมูลล่าสุดที่เพิ่งสร้าง
async function getRecentUpload(newId?: string) {
  if (!newId) return null;
  
  try {
    // ✅ Convert string to integer
    const idNumber = parseInt(newId);
    if (isNaN(idNumber)) {
      console.error('Invalid ID format:', newId);
      return null;
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const recentForm = await prisma.form_return.findUnique({
      where: { id: idNumber } // ✅ ใช้ number แทน string
    });
    
    await prisma.$disconnect();
    return recentForm;
  } catch (error) {
    console.error('Error fetching recent upload:', error);
    return null;
  }
}

export default async function FormReturnPage({ searchParams }: PageProps) {
  // await searchParams ก่อนใช้งาน
  const params = await searchParams;
  const formReturnPromise = getFormReturnData(params);

  // Success message handling
  const showSuccess = params.success === 'true';
  const newId = params.newId;

  // ดึงข้อมูลที่เพิ่งอัพโหลด
  const recentUpload = showSuccess && newId ? await getRecentUpload(newId) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              ข้อมูลส่งคืนแคมเปญงดเหล้าเข้าพรรษา ปี 2568
            </h1>
            <p className="text-slate-600">
              รายการข้อมูลที่ได้รับการส่งคืนจากองค์กรต่างๆ
            </p>
          </div>

          {/* Success Message with Recent Upload */}
          {showSuccess && (
            <div className="mb-6 space-y-4">
              {/* Success Alert */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-green-800 font-medium">
                      ส่งข้อมูลสำเร็จ! ขอบคุณสำหรับการส่งคืนข้อมูล
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      ข้อมูลของท่านถูกบันทึกเรียบร้อยแล้ว และจะปรากฏในรายการด้านล่าง
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Upload Card */}
              {recentUpload && (
                <RecentUploadCard formReturn={recentUpload} />
              )}
              
              {/* ✅ แสดงข้อความถ้าไม่พบข้อมูล */}
              {!recentUpload && newId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-yellow-800 font-medium">
                        ไม่สามารถดึงข้อมูลที่เพิ่งอัพโหลดได้
                      </p>
                      <p className="text-yellow-700 text-sm mt-1">
                        ข้อมูลถูกบันทึกเรียบร้อยแล้ว แต่อาจใช้เวลาสักครู่ในการแสดงผล
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <SearchForm />

          <Suspense fallback={<FormReturnListSkeleton />}>
            <StreamedFormReturnList promise={formReturnPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function FormReturnListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'ข้อมูลส่งคืนแคมเปญงดเหล้าเข้าพรรษา',
  description: 'รายการข้อมูลที่ได้รับการส่งคืนจากองค์กรต่างๆ สำหรับแคมเปญงดเหล้าเข้าพรรษา ปี 2568',
};