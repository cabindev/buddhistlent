// app/form_return/edit/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getFormReturnById } from '@/app/form_return/actions/get';
import EditFormReturn from '@/components/form-return/EditFormReturn';

interface EditFormReturnPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditFormReturnPage({ params }: EditFormReturnPageProps) {
  const { id } = await params; // เพิ่ม await ตรงนี้
  const formId = parseInt(id);
  
  if (isNaN(formId)) {
    notFound();
  }

  // ดึงข้อมูลใน Server Component
  const result = await getFormReturnById(formId);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              แก้ไขข้อมูลส่งคืน "งดเหล้าเข้าพรรษา ปี 2568"
            </h1>
            <p className="text-slate-600">
              แก้ไขข้อมูลการส่งคืนของ {result.data.firstName} {result.data.lastName}
            </p>
          </div>

          {/* Form */}
          <EditFormReturn initialData={result.data} />
        </div>
      </div>
    </div>
  );
}

// เพิ่ม metadata สำหรับ SEO
export async function generateMetadata({ params }: EditFormReturnPageProps) {
  const { id } = await params; // เพิ่ม await ตรงนี้ด้วย
  const formId = parseInt(id);
  
  if (isNaN(formId)) {
    return {
      title: 'ไม่พบข้อมูล',
    };
  }

  const result = await getFormReturnById(formId);
  
  if (!result.success || !result.data) {
    return {
      title: 'ไม่พบข้อมูล',
    };
  }

  return {
    title: `แก้ไขข้อมูล - ${result.data.firstName} ${result.data.lastName}`,
    description: `แก้ไขข้อมูลส่งคืนแคมเปญงดเหล้าเข้าพรรษาของ ${result.data.organizationName}`,
  };
}