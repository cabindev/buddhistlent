// app/organization/page.tsx
import React from 'react';
import OrganizationList from './components/OrganizationList';

export default function OrganizationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <OrganizationList />
    </div>
  );
}