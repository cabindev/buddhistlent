// app/dashboard/organization-category/components/OrganizationCategoryList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrganizationCategory } from '@/types/organization';
import { getAllOrganizationCategories } from '../actions/Get';
import { deleteOrganizationCategory, softDeleteOrganizationCategory } from '../actions/Delete';
import {
  Edit, Trash2, Plus, Search, X, Power, PowerOff
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
      <div className="flex flex-col justify-center items-center min-h-96 space-y-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const activeCount = categories.filter(c => c.isActive).length;
  const totalReturns = categories.reduce((sum, c) => sum + (c._count?.organizations || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">จัดการข้อมูลองค์กร</h1>
          <p className="text-sm text-gray-400 mt-1">
            ทั้งหมด {categories.length} · ใช้งาน {activeCount} · ข้อมูลส่งคืน {totalReturns}
          </p>
        </div>
        <Link
          href="/dashboard/organization-category/create"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          เพิ่มองค์กร
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อองค์กร, ชื่อย่อ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <select
          value={filterCategoryType}
          onChange={(e) => setFilterCategoryType(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">ทุกประเภท</option>
          {categoryTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
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
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="sortOrder-asc">ลำดับ</option>
          <option value="name-asc">ชื่อ (ก-ฮ)</option>
          <option value="name-desc">ชื่อ (ฮ-ก)</option>
          <option value="createdAt-desc">ใหม่สุด</option>
        </select>
      </div>

      {/* Table */}
      {filteredCategories.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium">
                <th className="px-5 py-3 text-left">องค์กร</th>
                <th className="px-5 py-3 text-left">ประเภท</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">คำอธิบาย</th>
                <th className="px-5 py-3 text-center">ข้อมูล</th>
                <th className="px-5 py-3 text-center">สถานะ</th>
                <th className="px-5 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900">{category.name}</div>
                    {category.shortName && <div className="text-xs text-gray-400 mt-0.5">{category.shortName}</div>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-100">
                      {category.categoryType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="text-xs text-gray-400 max-w-xs truncate" title={category.description || ''}>
                      {category.description || '—'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-sm tabular-nums ${(category._count?.organizations || 0) > 0 ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>
                      {category._count?.organizations || 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {category.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />ใช้งาน
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />ปิด
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end items-center gap-1">
                      <Link
                        href={`/organization-category/edit/${category.id}`}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        title="แก้ไข"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(category.id, category.name, category.isActive)}
                        disabled={isDeleting === category.id}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title={category.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      >
                        {isDeleting === category.id ? (
                          <div className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                        ) : category.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={isDeleting === category.id || (category._count?.organizations || 0) > 0}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        title={(category._count?.organizations || 0) > 0 ? `มีข้อมูลส่งคืน ${category._count?.organizations} รายการ` : 'ลบ'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <h3 className="text-base font-medium text-gray-900 mb-1">ไม่พบข้อมูลองค์กร</h3>
          <p className="text-sm text-gray-400 mb-5">
            {searchTerm || filterCategoryType || filterStatus !== 'all'
              ? 'ลองปรับเปลี่ยนเงื่อนไขการค้นหา'
              : 'เริ่มต้นด้วยการเพิ่มองค์กรใหม่'}
          </p>
          {!searchTerm && !filterCategoryType && filterStatus === 'all' && (
            <Link
              href="/dashboard/organization-category/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              เพิ่มองค์กรใหม่
            </Link>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        แสดง {filteredCategories.length} จาก {categories.length} รายการ
      </p>
    </div>
  );
}