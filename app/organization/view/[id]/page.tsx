// app/organization/view/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getOrganizationById } from '../../actions/Get';
import OrganizationView from '../../components/OrganizationView';

interface ViewOrganizationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewOrganizationPage({ params }: ViewOrganizationPageProps) {
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

    return <OrganizationView organization={organization} />;
  } catch (error) {
    console.error('Error loading organization:', error);
    notFound();
  }
}