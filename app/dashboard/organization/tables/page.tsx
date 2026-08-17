'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, X, Download, FileSpreadsheet, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getAllOrganizations, getAvailableOrganizationYears } from '@/app/organization/actions/Get';
import { getActiveOrganizationCategories } from '@/app/dashboard/organization-category/actions/Get';
import { deleteOrganization } from '@/app/organization/actions/Delete';
import { Organization, OrganizationCategory } from '@/types/organization';
import Loading from '@/components/ui/Loading';

const PAGE_SIZE = 20;

function imgCount(org: Organization) {
  return [org.image1, org.image2, org.image3, org.image4, org.image5].filter(Boolean).length;
}

function fmtDate(d: Date) {
  try { return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }); }
  catch { return '-'; }
}

function fmtDateTime(d: Date) {
  try {
    return new Date(d).toLocaleString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return '-'; }
}

export default function OrganizationTablePage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [years, setYears] = useState<number[]>([]);

  const [data, setData] = useState<Organization[]>([]);
  const [categories, setCategories] = useState<OrganizationCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadData = useCallback(async (y: number) => {
    setLoading(true);
    const [orgs, cats, availYears] = await Promise.all([
      getAllOrganizations({ year: y, limit: 10000 }),
      getActiveOrganizationCategories(),
      getAvailableOrganizationYears(),
    ]);
    if (orgs) setData(orgs.data);
    if (cats) setCategories(cats);
    setYears(availYears);
    setPage(1);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(currentYear); }, []);

  const handleYearChange = (y: number) => { setYear(y); loadData(y); };

  const filtered = data.filter(org => {
    const q = search.toLowerCase();
    return (!q || `${org.firstName} ${org.lastName} ${org.phoneNumber} ${org.addressLine1}`.toLowerCase().includes(q))
      && (!region || org.type === region)
      && (!province || org.province === province)
      && (!categoryId || org.organizationCategoryId?.toString() === categoryId);
  });

  const regions = [...new Set(data.map(d => d.type).filter(Boolean))].sort();
  // จังหวัดที่เลือกได้ ขึ้นกับภาคที่เลือกอยู่
  const provinces = [...new Set(
    data.filter(d => !region || d.type === region).map(d => d.province).filter(Boolean)
  )].sort();
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // เปลี่ยนภาค → ล้างจังหวัดที่เลือกไว้ (อาจไม่อยู่ในภาคใหม่)
  const handleRegionChange = (value: string) => { setRegion(value); setProvince(''); setPage(1); };

  const toggle = (id: number) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const activeFilters = [search, region, province, categoryId].filter(Boolean).length;

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ลบ "${name}" ใช่ไหม?`)) return;
    setDeleting(id);
    const r = await deleteOrganization(id);
    if (r.success) { setData(p => p.filter(d => d.id !== id)); setSelected(p => { const n = new Set(p); n.delete(id); return n; }); }
    setDeleting(null);
  };

  const exportRows = filtered.filter(d => selected.size === 0 || selected.has(d.id));

  // addressLine1 = ช่อง "ที่อยู่ / ชื่อองค์กร / ชื่อสถานศึกษา" ในฟอร์มลงทะเบียน
  // organizationCategory.name = หมวดหมู่/โครงการที่สังกัด (ไม่ใช่ชื่อองค์กรของผู้ส่ง)
  const exportRow = (o: Organization) => ({
    'ID': o.id,
    'ชื่อ': o.firstName,
    'นามสกุล': o.lastName,
    'เบอร์โทร': o.phoneNumber,
    'ชื่อองค์กร/สถานศึกษา': o.addressLine1 || '-',
    'หมวดหมู่/โครงการ': o.organizationCategory?.name || '-',
    'ชื่อย่อหมวดหมู่': o.organizationCategory?.shortName || '-',
    'ประเภทองค์กร': o.organizationCategory?.categoryType || '-',
    'ตำบล': o.district,
    'อำเภอ': o.amphoe,
    'จังหวัด': o.province,
    'รหัสไปรษณีย์': o.zipcode,
    'ภูมิภาค': o.type,
    'จำนวนผู้ลงนาม': o.numberOfSigners,
    'จำนวนรูปภาพ': `${imgCount(o)}/5`,
    'รูปภาพ 1': o.image1 || '-',
    'รูปภาพ 2': o.image2 || '-',
    'รูปภาพ 3': o.image3 || '-',
    'รูปภาพ 4': o.image4 || '-',
    'รูปภาพ 5': o.image5 || '-',
    'วันที่บันทึก': fmtDateTime(o.createdAt),
    'แก้ไขล่าสุด': fmtDateTime(o.updatedAt),
  });

  const handleCSV = () => {
    const data = exportRows.map(exportRow);
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = data.map(row => headers.map(h => esc(row[h as keyof typeof row])).join(','));
    const blob = new Blob(['﻿' + [headers.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `org_${year}_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const handleExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportRows.map(exportRow));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Organizations');
    XLSX.writeFile(wb, `org_${year}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-6 space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">ข้อมูลองค์กร</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length.toLocaleString()} รายการ
            {filtered.length !== data.length && ` (จาก ${data.length.toLocaleString()})`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Year tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {years.map(y => (
              <button key={y} onClick={() => handleYearChange(y)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${year === y ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >{y}</button>
            ))}
          </div>
          <button onClick={() => loadData(year)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/organization/create" className="flex items-center gap-1.5 px-3 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
            + เพิ่ม
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="ค้นหาชื่อ, เบอร์โทร..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-3 py-2 w-full text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
        >
          <Filter className="w-3.5 h-3.5" />
          ตัวกรอง {activeFilters > 0 && <span className="bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilters}</span>}
        </button>
        <button onClick={handleCSV} disabled={filtered.length === 0} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-40">
          <Download className="w-3.5 h-3.5" />CSV
        </button>
        <button onClick={handleExcel} disabled={filtered.length === 0} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40">
          <FileSpreadsheet className="w-3.5 h-3.5" />Excel
        </button>
        {selected.size > 0 && (
          <span className="text-sm text-gray-500 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
            เลือก {selected.size} รายการ
          </span>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={region} onChange={e => handleRegionChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">ภาค ({regions.length})</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={province} onChange={e => { setProvince(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">จังหวัด ({provinces.length})</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">หมวดหมู่ ({categories.length})</option>
              {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
            </select>
          </div>
          {activeFilters > 0 && (
            <button onClick={() => { setSearch(''); setRegion(''); setProvince(''); setCategoryId(''); setPage(1); }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
              <X className="w-3 h-3" /> ล้างตัวกรอง
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {loading ? <Loading size="lg" /> : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Search className="w-8 h-8 mb-2" />
          <p className="text-sm">ไม่พบข้อมูล{year > 0 ? ` ปี ${year}` : ''}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 font-medium">
                  <th className="w-10 px-4 py-3 text-left">
                    <input type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(d => d.id)))}
                      className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">ผู้ติดต่อ</th>
                  <th className="px-4 py-3 text-left">ชื่อองค์กร/สถานศึกษา</th>
                  <th className="px-4 py-3 text-left">จังหวัด</th>
                  <th className="px-4 py-3 text-left">ภูมิภาค</th>
                  <th className="px-4 py-3 text-center">ผู้ลงนาม</th>
                  <th className="px-4 py-3 text-center">รูป</th>
                  <th className="px-4 py-3 text-left">วันที่</th>
                  <th className="w-24 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(org => (
                  <tr key={org.id} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${selected.has(org.id) ? 'bg-amber-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(org.id)} onChange={() => toggle(org.id)}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{org.firstName} {org.lastName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{org.phoneNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[220px]">
                      <div className="truncate" title={org.addressLine1}>{org.addressLine1 || '—'}</div>
                      <div className="text-xs text-gray-400 truncate">{org.organizationCategory?.name || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{org.province}</td>
                    <td className="px-4 py-3 text-gray-500">{org.type}</td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium">{org.numberOfSigners.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {[org.image1, org.image2, org.image3, org.image4, org.image5].map((img, i) => (
                          <div key={i} className={`w-2 h-2 rounded-sm ${img ? 'bg-green-500' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(org.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/organization/view/${org.id}`}>
                          <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <Link href={`/dashboard/organization/edit/${org.id}`}>
                          <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(org.id, `${org.firstName} ${org.lastName}`)}
                          disabled={deleting === org.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                        >
                          {deleting === org.id
                            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length.toLocaleString()}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              if (n < 1 || n > totalPages) return null;
              return (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded border text-xs transition-colors ${page === n ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-200 hover:bg-gray-50'}`}
                >{n}</button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
