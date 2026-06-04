// app/organization/create/page.tsx
import React from 'react';
import { getActiveOrganizationCategories } from '@/app/dashboard/organization-category/actions/Get';
import OrganizationForm from '../components/OrganizationForm';

export default async function CreateOrganizationPage() {
  try {
    const organizationCategories = await getActiveOrganizationCategories();
    
    return (
      <OrganizationForm 
        organizationCategories={organizationCategories}
      />
    );
  } catch (error) {
    console.error('Error loading organization categories:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-light text-gray-900 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-sm text-gray-500">ไม่สามารถโหลดข้อมูลองค์กรได้</p>
        </div>
      </div>
    );
  }
}