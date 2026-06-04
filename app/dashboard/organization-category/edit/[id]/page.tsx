// app/dashboard/organization-category/edit/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getOrganizationCategoryById } from '../../actions/Get';
import OrganizationCategoryForm from '../../components/OrganizationCategoryForm';

interface EditOrganizationCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOrganizationCategoryPage({ params }: EditOrganizationCategoryPageProps) {
  const { id } = await params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    notFound();
  }

  try {
    const category = await getOrganizationCategoryById(categoryId);

    if (!category) {
      notFound();
    }

    return (
      <OrganizationCategoryForm
        initialData={{
          id: category.id,
          name: category.name,
          shortName: category.shortName || '',
          description: category.description || '',
          categoryType: category.categoryType,
          isActive: category.isActive,
          sortOrder: category.sortOrder || 0,
        }}
        isEdit={true}
      />
    );
  } catch (error) {
    console.error('Error loading category:', error);
    notFound();
  }
}