// app/dashboard/organization/create/page.tsx
// หน้าเพิ่มข้อมูลองค์กรใหม่ใน Dashboard พร้อม redirect หลังสำเร็จ
import React from 'react';
import Link from 'next/link';
import { getActiveOrganizationCategories } from '@/app/dashboard/organization-category/actions/Get';
import DashboardOrganizationForm from '../components/DashboardOrganizationForm';
import type { OrganizationCategory } from '@/types/organization';

export default async function DashboardCreateOrganizationPage() {
  try {
    const organizationCategories = await getActiveOrganizationCategories();
    
    // ตรวจสอบว่ามีข้อมูลหมวดหมู่องค์กรหรือไม่
    if (!organizationCategories || organizationCategories.length === 0) {
      return (
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  ไม่พบข้อมูลหมวดหมู่องค์กร
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>กรุณาเพิ่มหมวดหมู่องค์กรก่อนสร้างข้อมูลองค์กรใหม่</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <Link
                      href="/dashboard/organization-category"
                      className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100"
                    >
                      จัดการหมวดหมู่องค์กร
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="max-w-7xl mx-auto p-6">

        
        <DashboardOrganizationForm 
          organizationCategories={organizationCategories}
          isEdit={false} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading organization categories:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-light text-gray-900 mb-2">
            เกิดข้อผิดพลาด | Error Occurred
          </h1>
          <p className="text-sm text-gray-500">
            ไม่สามารถโหลดข้อมูลองค์กรได้ | Unable to load organization data
          </p>
        </div>
      </div>
    );
  }
}

export const metadata = {
  title: 'เพิ่มข้อมูลองค์กร - Dashboard | Add Organization - Dashboard',
  description: 'เพิ่มข้อมูลองค์กรใหม่เข้าสู่ระบบ | Add new organization to the system',
};