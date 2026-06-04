// app/organization/components/OrganizationList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Organization, OrganizationCategory } from '@/types/organization';
import { getAllOrganizations, OrganizationFilters } from '../actions/Get';
import { deleteOrganization } from '../actions/Delete';
import { getActiveOrganizationCategories } from '@/app/dashboard/organization-category/actions/Get';
import { 
  Edit, Trash2, Plus, Search, Building2, 
  X, Eye, Phone, MapPin, Users, Image as ImageIcon, 
  ChevronLeft, ChevronRight, Calendar, Check, AlertTriangle
} from 'lucide-react';

export default function OrganizationList() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationCategories, setOrganizationCategories] = useState<OrganizationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | ''>('');
  const [filterProvince, setFilterProvince] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrganizations, setTotalOrganizations] = useState(0);
  const [sortBy, setSortBy] = useState<'firstName' | 'createdAt' | 'numberOfSigners'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [provinces, setProvinces] = useState<string[]>([]);

  useEffect(() => {
    loadOrganizationCategories();
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [searchTerm, filterCategory, filterProvince, currentPage, sortBy, sortOrder]);

  const loadOrganizationCategories = async () => {
    try {
      const categories = await getActiveOrganizationCategories();
      setOrganizationCategories(categories);
    } catch (error) {
      console.error('Error loading organization categories:', error);
    }
  };

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const filters: OrganizationFilters = {
        search: searchTerm || undefined,
        organizationCategoryId: filterCategory || undefined,
        province: filterProvince || undefined,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 20
      };

      const result = await getAllOrganizations(filters);
      setOrganizations(result.data);
      setTotalPages(result.totalPages);
      setTotalOrganizations(result.total);

      // Extract unique provinces
      const uniqueProvinces = Array.from(
        new Set(result.data.map(org => org.province))
      ).filter(Boolean).sort();
      setProvinces(uniqueProvinces);

    } catch (error) {
      console.error('Error loading organizations:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`คุณต้องการลบข้อมูลของ "${name}" หรือไม่?\n\nการลบนี้ไม่สามารถย้อนกลับได้`)) return;

    try {
      setIsDeleting(id);
      const result = await deleteOrganization(id);
      
      if (result.success) {
        await loadOrganizations();
        alert('ลบข้อมูลเรียบร้อยแล้ว');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-gray-900">Organization Data | ข้อมูลส่งคืนองค์กร</h1>
                  <p className="text-xs text-gray-600">Manage submitted organization data | จัดการข้อมูลที่ส่งคืนจากองค์กรต่างๆ</p>
                </div>
              </div>
              
              <Link
                href="/organization/create"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 py-2 bg-white">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Total records: {totalOrganizations}</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white border border-gray-200 rounded">
          <div className="p-3">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, phone, address..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-3 w-full py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value ? parseInt(e.target.value) : '');
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 min-w-[120px]"
                >
                  <option value="">All Organizations</option>
                  {organizationCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filterProvince}
                  onChange={(e) => {
                    setFilterProvince(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 min-w-[100px]"
                >
                  <option value="">All Provinces</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as typeof sortBy);
                    setSortOrder(newSortOrder as typeof sortOrder);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 min-w-[120px]"
                >
                  <option value="createdAt-desc">Latest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="firstName-asc">Name A-Z</option>
                  <option value="firstName-desc">Name Z-A</option>
                  <option value="numberOfSigners-desc">Most Signers</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {organizations.length > 0 ? (
          <>
            {/* Table Layout for Desktop */}
            <div className="hidden lg:block bg-white border border-gray-200 rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact | ผู้ติดต่อ
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization | องค์กร
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category | หมวดหมู่
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region | ภูมิภาค
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location | สถานที่
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signers | ผู้ลงนาม
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Images | รูปภาพ
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date | วันที่
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions | การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center mr-2">
                            <Users className="h-3 w-3 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {org.firstName} {org.lastName}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {org.phoneNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900">{org.organizationCategory?.name || '-'}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900">{org.organizationCategory?.categoryType || '-'}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900">{org.type}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {org.province}
                        </div>
                        <div className="text-xs text-gray-500">
                          {org.district}, {org.amphoe}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          {org.numberOfSigners} คน
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          {[org.image1, org.image2, org.image3, org.image4, org.image5].map((image, index) => (
                            <div 
                              key={index} 
                              className={`w-3 h-3 rounded border ${
                                image ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-300'
                              }`}
                              title={image ? 'Has image' : 'No image'}
                            >
                              {image && <Check className="h-2 w-2 text-white m-0.5" />}
                            </div>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">
                            {[org.image1, org.image2, org.image3, org.image4, org.image5].filter(Boolean).length}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(org.createdAt).toLocaleDateString('th-TH', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Link
                            href={`/organization/view/${org.id}`}
                            className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors duration-200"
                            title="View"
                          >
                            <Eye className="h-3 w-3" />
                          </Link>
                          
                          <Link
                            href={`/organization/edit/${org.id}`}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </Link>
                          
                          <button
                            onClick={() => handleDelete(org.id, `${org.firstName} ${org.lastName}`)}
                            disabled={isDeleting === org.id}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200 disabled:opacity-50"
                            title="Delete"
                          >
                            {isDeleting === org.id ? (
                              <div className="animate-spin h-3 w-3 border border-red-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card Layout for Mobile */}
            <div className="lg:hidden space-y-3">
              {organizations.map((org) => (
                <div key={org.id} className="bg-white border border-gray-200 rounded p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center mr-2">
                        <Users className="h-3 w-3 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {org.firstName} {org.lastName}
                        </h3>
                        <p className="text-xs text-gray-500">ID: {org.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Link
                        href={`/organization/view/${org.id}`}
                        className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                      >
                        <Eye className="h-3 w-3" />
                      </Link>
                      <Link
                        href={`/organization/edit/${org.id}`}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit className="h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => handleDelete(org.id, `${org.firstName} ${org.lastName}`)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Organization:</span>
                      <span className="text-gray-900">{org.organizationCategory?.name || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="text-gray-900">{org.organizationCategory?.categoryType || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-900">{org.phoneNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Region:</span>
                      <span className="text-gray-900">{org.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-900">{org.province}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Signers:</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-800">
                        {org.numberOfSigners} คน
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Images:</span>
                      <div className="flex items-center space-x-0.5">
                        {[org.image1, org.image2, org.image3, org.image4, org.image5].map((image, index) => (
                          <div 
                            key={index} 
                            className={`w-2.5 h-2.5 rounded border ${
                              image ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          {[org.image1, org.image2, org.image3, org.image4, org.image5].filter(Boolean).length}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white border border-gray-200 rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalOrganizations)} of {totalOrganizations} entries
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-3 w-3 mr-0.5" />
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-0.5">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                              currentPage === pageNum
                                ? 'bg-orange-500 text-white'
                                : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-3 w-3 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No Data Found</h3>
            <p className="text-xs text-gray-500 mb-4">
              {searchTerm || filterCategory || filterProvince
                ? 'Try adjusting your search criteria' 
                : 'No organization data has been submitted yet'
              }
            </p>
            {!searchTerm && !filterCategory && !filterProvince && (
              <Link
                href="/organization/create"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Entry
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}