// app/dashboard/organization-category/page.tsx
import React from 'react';
import OrganizationCategoryList from './components/OrganizationCategoryList';

export default function OrganizationCategoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <OrganizationCategoryList />
    </div>
  );
}