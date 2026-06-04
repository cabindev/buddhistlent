// app/dashboard/organization/view/[id]/page.tsx
// หน้าดูข้อมูลองค์กรใน Dashboard
import { notFound } from 'next/navigation';
import { getOrganizationById } from '@/app/organization/actions/Get';
import DashboardOrganizationView from '../../components/DashboardOrganizationView';

interface ViewOrganizationPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardViewOrganizationPage({ params }: ViewOrganizationPageProps) {
  const { id } = await params;
  const organizationId = parseInt(id);

  if (isNaN(organizationId)) {
    notFound();
  }

  try {
    const organization = await getOrganizationById(organizationId);

    if (!organization) {
      notFound();
    }

    return <DashboardOrganizationView organization={organization} />;
  } catch (error) {
    console.error('Error loading organization:', error);
    notFound();
  }
}

export const metadata = {
  title: 'ดูข้อมูลองค์กร - Dashboard | View Organization - Dashboard',
  description: 'ดูข้อมูลองค์กรใน Dashboard | View organization data in Dashboard',
};