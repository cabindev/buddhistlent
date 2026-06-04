// app/organization/components/OrganizationView.tsx
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Organization } from '@/types/organization';
import { 
  ArrowLeft, Edit, Building2, User, MapPin, Phone, 
  Users, Calendar, Tag, Image as ImageIcon, Download,
  CheckCircle, Clock, FileText
} from 'lucide-react';

interface OrganizationViewProps {
  organization: Organization;
}

export default function OrganizationView({ organization }: OrganizationViewProps) {
  const router = useRouter();

  const images = [
    organization.image1,
    organization.image2,
    organization.image3,
    organization.image4,
    organization.image5
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {organization.firstName} {organization.lastName}
                </h1>
                <p className="text-sm text-gray-600">
                  Organization Data | ข้อมูลส่งคืนจาก {organization.organizationCategory?.name || '-'}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  Submitted | ส่งเมื่อ {new Date(organization.createdAt).toLocaleDateString('th-TH', {
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
                href={`/organization/edit/${organization.id}`}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-200"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center mr-2">
                <User className="h-3 w-3 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Contact | ผู้ติดต่อ</p>
                <p className="text-sm font-medium text-gray-900">
                  {organization.firstName} {organization.lastName}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2">
                <Building2 className="h-3 w-3 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Organization | องค์กร</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {organization.organizationCategory?.name || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2">
                <Users className="h-3 w-3 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Signers | ผู้ลงนาม</p>
                <p className="text-sm font-medium text-gray-900">
                  {organization.numberOfSigners} people
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2">
                <ImageIcon className="h-3 w-3 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Images | รูปภาพ</p>
                <p className="text-sm font-medium text-gray-900">
                  {images.length}/5 images
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Organization Information */}
          <div className="bg-white border border-gray-200 rounded">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-medium text-gray-900">Organization Information | ข้อมูลองค์กร</h2>
            </div>

            <div className="p-3 space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2 flex-shrink-0">
                  <Building2 className="h-3 w-3 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Organization Name | ชื่อองค์กร</p>
                  <p className="text-sm text-gray-900">{organization.organizationCategory?.name || '-'}</p>
                  {organization.organizationCategory?.shortName && (
                    <p className="text-xs text-gray-500">({organization.organizationCategory.shortName})</p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2 flex-shrink-0">
                  <Tag className="h-3 w-3 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Type | ประเภทองค์กร</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">
                    {organization.organizationCategory?.categoryType || '-'}
                  </span>
                </div>
              </div>

              {organization.organizationCategory?.description && (
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2 flex-shrink-0">
                    <FileText className="h-3 w-3 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">Description | คำอธิบาย</p>
                    <p className="text-sm text-gray-900">{organization.organizationCategory.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-medium text-gray-900">Contact Information | ข้อมูลติดต่อ</h2>
            </div>

            <div className="p-3 space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2 flex-shrink-0">
                  <User className="h-3 w-3 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Contact Person | ผู้ส่งข้อมูล</p>
                  <p className="text-sm text-gray-900">{organization.firstName} {organization.lastName}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2 flex-shrink-0">
                  <Phone className="h-3 w-3 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Phone Number | เบอร์โทรศัพท์</p>
                  <a 
                    href={`tel:${organization.phoneNumber}`}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    {organization.phoneNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2 flex-shrink-0">
                  <Users className="h-3 w-3 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Number of Signers | จำนวนผู้ลงนาม</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    {organization.numberOfSigners} people
                  </span>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2 flex-shrink-0">
                  <Calendar className="h-3 w-3 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Submission Date | วันที่ส่งข้อมูล</p>
                  <p className="text-sm text-gray-900">
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
        <div className="bg-white border border-gray-200 rounded">
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-900">Address Information | ที่อยู่องค์กร</h2>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Address | ที่อยู่</p>
                <p className="text-sm text-gray-900">{organization.addressLine1}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-0.5">Sub-district | ตำบล/แขวง</p>
                <p className="text-sm text-gray-900">{organization.type}{organization.district}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-0.5">District | อำเภอ/เขต</p>
                <p className="text-sm text-gray-900">อำเภอ{organization.amphoe}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-0.5">Province | จังหวัด</p>
                <p className="text-sm text-gray-900">จังหวัด{organization.province}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center mr-2">
                  <MapPin className="h-3 w-3 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Postal Code | รหัสไปรษณีย์</p>
                  <p className="text-sm text-gray-900">{organization.zipcode}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">
                <strong>Full Address | ที่อยู่เต็ม:</strong> {organization.addressLine1} {organization.type}{organization.district} 
                อำเภอ{organization.amphoe} จังหวัด{organization.province} {organization.zipcode}
              </p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-gray-200 rounded">
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-900">
              Images | รูปภาพประกอบ ({images.length}/5 images)
            </h2>
          </div>

          <div className="p-3">
            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((index) => {
                  const image = (organization as any)[`image${index}`];
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-700">Image {index} | รูปที่ {index}</p>
                        {image && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                            <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                            Ready
                          </span>
                        )}
                      </div>
                      
                      <div className={`relative w-full h-24 border rounded ${
                        image ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                      }`}>
                        {image ? (
                          <div className="relative w-full h-full">
                            <img
                              src={image}
                              alt={`Image ${index}`}
                              className="w-full h-full object-cover rounded"
                            />
                            <div className="absolute top-1 right-1">
                              <a
                                href={image}
                                download
                                className="inline-flex items-center px-1.5 py-0.5 text-xs text-white bg-black bg-opacity-70 rounded hover:bg-opacity-90"
                              >
                                <Download className="h-2.5 w-2.5 mr-0.5" />
                                Download
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-500">No Image</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No images uploaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white border border-gray-200 rounded p-3">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href={`/organization/edit/${organization.id}`}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-200"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Data
            </Link>
            
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-1" />
              Print
            </button>
            
            <Link
              href="/organization"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}