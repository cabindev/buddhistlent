// app/dashboard/organization-category/components/OrganizationCategoryList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrganizationCategory } from '@/types/organization';
import { getAllOrganizationCategories } from '../actions/Get';
import { deleteOrganizationCategory, softDeleteOrganizationCategory } from '../actions/Delete';
import { 
  Edit, Trash2, Plus, Search, AlertCircle, Building2, 
  X, Eye, Filter, BarChart3, Calendar, CheckCircle, 
  Power, PowerOff, Tag, ArrowUpDown, Hash
} from 'lucide-react';
import { getCategoryTypesFromData } from '@/types/organization';

export default function OrganizationCategoryList() {
  const router = useRouter();
  const [categories, setCategories] = useState<OrganizationCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<OrganizationCategory[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoryType, setFilterCategoryType] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'categoryType' | 'createdAt' | 'sortOrder'>('sortOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, filterCategoryType, filterStatus, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getAllOrganizationCategories({
        sortBy,
        sortOrder
      });
      setCategories(data);
      // สร้างรายการประเภทจากข้อมูลจริง
      setCategoryTypes(getCategoryTypesFromData(data));
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    // กรองตามการค้นหา
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        category =>
          category.name.toLowerCase().includes(searchLower) ||
          (category.shortName && category.shortName.toLowerCase().includes(searchLower)) ||
          (category.description && category.description.toLowerCase().includes(searchLower)) ||
          category.categoryType.toLowerCase().includes(searchLower)
      );
    }

    // กรองตามประเภท
    if (filterCategoryType) {
      filtered = filtered.filter(category => category.categoryType === filterCategoryType);
    }

    // กรองตามสถานะ
    if (filterStatus !== 'all') {
      filtered = filtered.filter(category => 
        filterStatus === 'active' ? category.isActive : !category.isActive
      );
    }

    // เรียงลำดับ
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCategories(filtered);
  };

  const handleDelete = async (id: number, name: string) => {
    const category = categories.find(c => c.id === id);
    const organizationCount = category?._count?.organizations || 0;
    
    if (organizationCount > 0) {
      alert(`ไม่สามารถลบองค์กร "${name}" ได้ เนื่องจากมีข้อมูลส่งคืนอยู่ ${organizationCount} รายการ`);
      return;
    }

    if (!confirm(`คุณต้องการลบองค์กร "${name}" หรือไม่?\n\nการลบนี้ไม่สามารถย้อนกลับได้`)) return;

    try {
      setIsDeleting(id);
      const result = await deleteOrganizationCategory(id);
      
      if (result.success) {
        await loadCategories();
        alert('ลบองค์กรเรียบร้อยแล้ว');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (id: number, name: string, currentStatus: boolean) => {
    const action = currentStatus ? 'ปิดใช้งาน' : 'เปิดใช้งาน';
    
    if (!confirm(`คุณต้องการ${action}องค์กร "${name}" หรือไม่?`)) return;

    try {
      setIsDeleting(id);
      const result = await softDeleteOrganizationCategory(id);
      
      if (result.success) {
        await loadCategories();
        alert(`${action}องค์กรเรียบร้อยแล้ว`);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="flex flex-col justify-center items-center min-h-96 space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-orange-200 rounded-full animate-spin border-t-orange-600"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-orange-300"></div>
          </div>
          <div className="text-center">
            <h3 className="text-base font-medium text-gray-900">กำลังโหลดข้อมูล</h3>
            <p className="text-sm text-gray-500">โปรดรอสักครู่...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Enhanced Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/30 p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-sm shadow-orange-200/50">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">จัดการข้อมูลองค์กร</h1>
                <p className="text-sm text-gray-500 mt-1 font-light">จัดการองค์กรสำหรับระบบส่งคืนข้อมูล</p>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  ทั้งหมด {categories.length} องค์กร
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard/organization-category/create"
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-150 flex items-center shadow-sm shadow-orange-200/50 hover:shadow-md hover:scale-105 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มองค์กรใหม่
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Search & Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/30 p-5">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อองค์กร, ชื่อย่อ, หรือคำอธิบาย..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 w-full py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-all duration-150 bg-white/80 backdrop-blur-sm text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filterCategoryType}
                onChange={(e) => setFilterCategoryType(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-sm text-sm min-w-[140px]"
              >
                <option value="">ทุกประเภท</option>
                {categoryTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-sm text-sm min-w-[120px]"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ปิดใช้งาน</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy as typeof sortBy);
                  setSortOrder(newSortOrder as typeof sortOrder);
                }}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-sm text-sm min-w-[140px]"
              >
                <option value="sortOrder-asc">ลำดับ (น้อย-มาก)</option>
                <option value="name-asc">ชื่อ (ก-ฮ)</option>
                <option value="name-desc">ชื่อ (ฮ-ก)</option>
                <option value="categoryType-asc">ประเภท (ก-ฮ)</option>
                <option value="createdAt-desc">วันที่สร้าง (ใหม่-เก่า)</option>
                <option value="createdAt-asc">วันที่สร้าง (เก่า-ใหม่)</option>
              </select>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500 flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            แสดง {filteredCategories.length} จาก {categories.length} รายการ
          </div>
        </div>

        {/* Content */}
        {filteredCategories.length > 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      องค์กร
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ประเภท
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      คำอธิบาย
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวนข้อมูล
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ลำดับ
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/40 divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-orange-50/30 transition-colors duration-150">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-9 h-9 bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                            <Building2 className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            {category.shortName && (
                              <div className="text-xs text-gray-500">
                                {category.shortName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                            <Tag className="h-3 w-3 mr-1" />
                            {category.categoryType}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs text-gray-500 max-w-xs">
                          <div className="truncate" title={category.description || ''}>
                            {category.description || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                            (category._count?.organizations || 0) > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <BarChart3 className="h-3 w-3 mr-1" />
                            {category._count?.organizations || 0} รายการ
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                            category.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {category.isActive ? (
                              <>
                                <Power className="h-3 w-3 mr-1" />
                                ใช้งาน
                              </>
                            ) : (
                              <>
                                <PowerOff className="h-3 w-3 mr-1" />
                                ปิดใช้งาน
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs text-gray-500">
                          <Hash className="h-3 w-3 mr-1" />
                          {category.sortOrder || 0}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <Link
                            href={`/organization-category/edit/${category.id}`}
                            className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-2 rounded-lg transition-colors duration-150"
                            title="แก้ไข"
                          >
                            <Edit className="h-3 w-3" />
                          </Link>
                          
                          <button
                            onClick={() => handleToggleStatus(category.id, category.name, category.isActive)}
                            disabled={isDeleting === category.id}
                            className={`p-2 rounded-lg transition-colors duration-150 ${
                              category.isActive 
                                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                                : 'bg-green-100 hover:bg-green-200 text-green-700'
                            }`}
                            title={category.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          >
                            {isDeleting === category.id ? (
                              <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div>
                            ) : category.isActive ? (
                              <PowerOff className="h-3 w-3" />
                            ) : (
                              <Power className="h-3 w-3" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            disabled={isDeleting === category.id || (category._count?.organizations || 0) > 0}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              (category._count?.organizations || 0) > 0 
                                ? `ไม่สามารถลบได้ เนื่องจากมีข้อมูลส่งคืน ${category._count?.organizations} รายการ`
                                : 'ลบ'
                            }
                          >
                            {isDeleting === category.id ? (
                              <div className="animate-spin h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full"></div>
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
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/30 p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-light text-gray-900 mb-2">ไม่พบข้อมูลองค์กร</h3>
            <p className="text-sm text-gray-500 mb-5">
              {searchTerm || filterCategoryType || filterStatus !== 'all'
                ? 'ลองปรับเปลี่ยนเงื่อนไขการค้นหา' 
                : 'เริ่มต้นด้วยการเพิ่มองค์กรใหม่'
              }
            </p>
            {!searchTerm && !filterCategoryType && filterStatus === 'all' && (
              <Link
                href="/dashboard/organization-category/create"
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all duration-150 shadow-sm shadow-orange-200/50 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มองค์กรใหม่
              </Link>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-emerald-200/30 p-6">
          <div className="flex items-center mb-5">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-200/50 mr-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-light text-gray-900 mb-1">
                ข้อมูลการใช้งาน
              </h4>
              <p className="text-sm text-gray-500 font-light">
                สถิติและข้อมูลการใช้งานองค์กร
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200/30">
              <div className="text-xl font-light text-orange-600 mb-1">
                {categories.length}
              </div>
              <div className="text-xs text-orange-700">องค์กรทั้งหมด</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200/30">
              <div className="text-xl font-light text-green-600 mb-1">
                {categories.filter(c => c.isActive).length}
              </div>
              <div className="text-xs text-green-700">องค์กรที่ใช้งาน</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200/30">
              <div className="text-xl font-light text-amber-600 mb-1">
                {categories.filter(c => (c._count?.organizations || 0) > 0).length}
              </div>
              <div className="text-xs text-amber-700">องค์กรที่มีข้อมูล</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200/30">
              <div className="text-xl font-light text-purple-600 mb-1">
                {categories.reduce((sum, c) => sum + (c._count?.organizations || 0), 0)}
              </div>
              <div className="text-xs text-purple-700">ข้อมูลส่งคืนทั้งหมด</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <h5 className="text-base font-medium text-gray-900">📋 การจัดการองค์กร</h5>
              {[
                "แก้ไขข้อมูลองค์กรได้ตลอดเวลา",
                "เปิด/ปิดใช้งานองค์กรแทนการลบ",
                "ลบได้เฉพาะองค์กรที่ไม่มีข้อมูลส่งคืน",
                "จัดลำดับการแสดงผลได้"
              ].map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 rounded-lg bg-emerald-50/50"
                >
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">{tip}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h5 className="text-base font-medium text-gray-900">💡 คำแนะนำ</h5>
              {[
                "ตั้งชื่อองค์กรให้ชัดเจนและเป็นทางการ",
                "เพิ่มชื่อย่อเพื่อความสะดวกในการอ้างอิง",
                "เลือกประเภทองค์กรให้ตรงกับลักษณะจริง",
                "ใช้คำอธิบายอธิบายบทบาทขององค์กร"
              ].map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 rounded-lg bg-orange-50/50"
                >
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category Type Statistics */}
          <div className="mt-5 p-4 bg-gray-50/50 border border-gray-200/30 rounded-lg">
            <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              สถิติตามประเภทองค์กร
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categoryTypes.map((type) => {
                const count = categories.filter(c => c.categoryType === type.value).length;
                return (
                  <div key={type.value} className="text-center p-2 bg-white/60 rounded-md border border-gray-200/30">
                    <div className="text-sm font-medium text-gray-900">{count}</div>
                    <div className="text-xs text-gray-500">{type.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}