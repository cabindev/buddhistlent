// app/dashboard/organization/components/DashboardOrganizationView.tsx
// Component สำหรับแสดงข้อมูลองค์กรใน Dashboard
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteOrganization } from '@/app/organization/actions/Delete';
import type { Organization } from '@/types/organization';
import { 
  ArrowLeft, Edit, Building2, User, MapPin, Phone, 
  Users, Calendar, Tag, Image as ImageIcon, Download,
  CheckCircle, Clock, FileText, Trash2
} from 'lucide-react';

interface DashboardOrganizationViewProps {
  organization: Organization;
}

export default function DashboardOrganizationView({ organization }: DashboardOrganizationViewProps) {
  const router = useRouter();

  const images = [
    organization.image1,
    organization.image2,
    organization.image3,
    organization.image4,
    organization.image5
  ].filter(Boolean);

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 10) {
      return `${phone.slice(0, 2)}-${phone.slice(2, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PUBLIC': 'ภาครัฐ',
      'PRIVATE': 'เอกชน',
      'NGO': 'NGO',
      'ACADEMIC': 'การศึกษา'
    };
    return labels[type] || type;
  };

  const handleDelete = async () => {
    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบข้อมูลองค์กร "${organization.firstName} ${organization.lastName}"?\n\nการลบนี้ไม่สามารถย้อนกลับได้`)) {
      try {
        const result = await deleteOrganization(organization.id);
        if (result.success) {
          alert('ลบข้อมูลสำเร็จ');
          router.push('/dashboard/organization');
          router.refresh();
        } else {
          alert(result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const handleImageDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `${organization.firstName}_${organization.lastName}_image_${index + 1}.jpg`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลดรูปภาพ');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Building2 className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {organization.firstName} {organization.lastName}
            </h1>
            <p className="text-gray-600">
              ข้อมูลองค์กร: {organization.organizationCategory?.name || '-'}
            </p>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              ส่งเมื่อ {new Date(organization.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            href="/dashboard/organization"
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับ</span>
          </Link>
          
          <Link
            href={`/dashboard/organization/edit/${organization.id}`}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>แก้ไข</span>
          </Link>
          
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>ลบ</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">ผู้ติดต่อ</p>
              <p className="text-lg font-semibold text-gray-900">
                {organization.firstName} {organization.lastName}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">องค์กร</p>
              <p className="text-base font-semibold text-gray-900 truncate">
                {organization.organizationCategory?.name || '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">ผู้ลงนาม</p>
              <p className="text-lg font-semibold text-gray-900">
                {organization.numberOfSigners} คน
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ImageIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">รูปภาพ</p>
              <p className="text-lg font-semibold text-gray-900">
                {images.length}/5 รูป
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Information */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">ข้อมูลองค์กร</h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-start">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Building2 className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">ชื่อองค์กร</p>
                <p className="text-base text-gray-900">{organization.organizationCategory?.name || '-'}</p>
                {organization.organizationCategory?.shortName && (
                  <p className="text-sm text-gray-500">({organization.organizationCategory.shortName})</p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Tag className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">ประเภทองค์กร</p>
                <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-amber-100 text-amber-800">
                  {getTypeLabel(organization.type)}
                </span>
              </div>
            </div>

            {organization.organizationCategory?.description && (
              <div className="flex items-start">
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  <FileText className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">คำอธิบาย</p>
                  <p className="text-base text-gray-900">{organization.organizationCategory.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">ข้อมูลติดต่อ</h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-start">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">ผู้ส่งข้อมูล</p>
                <p className="text-base text-gray-900">{organization.firstName} {organization.lastName}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Phone className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">เบอร์โทรศัพท์</p>
                <a 
                  href={`tel:${organization.phoneNumber}`}
                  className="text-base text-amber-600 hover:text-amber-700"
                >
                  {formatPhoneNumber(organization.phoneNumber)}
                </a>
              </div>
            </div>

            <div className="flex items-start">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Users className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">จำนวนผู้ลงนาม</p>
                <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                  {organization.numberOfSigners} คน
                </span>
              </div>
            </div>

            <div className="flex items-start">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Calendar className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">วันที่ส่งข้อมูล</p>
                <p className="text-base text-gray-900">
                  {new Date(organization.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">ที่อยู่องค์กร</h2>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">ที่อยู่</p>
              <p className="text-base text-gray-900">{organization.addressLine1}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">ตำบล/แขวง</p>
              <p className="text-base text-gray-900">{organization.type}{organization.district}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">อำเภอ/เขต</p>
              <p className="text-base text-gray-900">อำเภอ{organization.amphoe}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">จังหวัด</p>
              <p className="text-base text-gray-900">จังหวัด{organization.province}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <MapPin className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">รหัสไปรษณีย์</p>
                <p className="text-base text-gray-900">{organization.zipcode}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-base text-gray-700">
              <strong>ที่อยู่เต็ม:</strong> {organization.addressLine1} {organization.type}{organization.district} 
              อำเภอ{organization.amphoe} จังหวัด{organization.province} {organization.zipcode}
            </p>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            รูปภาพประกอบ ({images.length}/5 รูป)
          </h2>
        </div>

        <div className="p-4">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((index) => {
                const image = (organization as any)[`image${index}`];
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">รูปที่ {index}</p>
                      {image && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          มีรูป
                        </span>
                      )}
                    </div>
                    
                    <div className={`relative w-full h-32 border rounded ${
                      image ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                    }`}>
                      {image ? (
                        <div className="relative w-full h-full">
                          <img
                            src={image}
                            alt={`รูปที่ ${index}`}
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => handleImageDownload(image, index)}
                              className="inline-flex items-center px-2 py-1 text-xs text-white bg-black bg-opacity-70 rounded hover:bg-opacity-90 transition-opacity"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              ดาวน์โหลด
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">ไม่มีรูป</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-base text-gray-500">ไม่มีรูปภาพ</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/dashboard/organization/edit/${organization.id}`}
            className="inline-flex items-center justify-center space-x-2 px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>แก้ไขข้อมูล</span>
          </Link>
          
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center space-x-2 px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>พิมพ์</span>
          </button>
          
          <Link
            href="/dashboard/organization"
            className="inline-flex items-center justify-center space-x-2 px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับรายการ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}