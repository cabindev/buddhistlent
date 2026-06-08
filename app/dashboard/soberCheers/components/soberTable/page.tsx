'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, X, Download, FileSpreadsheet, ChevronLeft, ChevronRight, RefreshCw, SquarePen, Trash2, LoaderCircle, AlertTriangle } from 'lucide-react';
import { getAllSoberCheersForTable } from '@/app/soberCheers/actions/Get';
import { getAvailableSoberCheersYears } from '@/app/dashboard/soberCheers/actions/GetChartData';
import { deleteSoberCheers } from '@/app/soberCheers/actions/Delete';
import Loading from '@/components/ui/Loading';
import * as XLSX from 'xlsx';

interface SoberCheersItem {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  birthday: string | Date;
  province: string;
  type: string;
  job: string;
  phone: string;
  alcoholConsumption: string;
  monthlyExpense: number | null;
  motivations: any;
  drinkingFrequency: string;
  intentPeriod: string;
  healthImpact: string;
}

interface Filters { name: string; province: string; type: string; job: string; }

const PAGE_SIZE = 20;

function calcAge(b: string | Date) {
  try { return Math.abs(new Date(Date.now() - new Date(b).getTime()).getUTCFullYear() - 1970); }
  catch { return 0; }
}

function parseMotivations(m: any): string {
  if (!m) return '-';
  if (Array.isArray(m)) return m.join(', ');
  if (typeof m === 'string') { try { const p = JSON.parse(m); return Array.isArray(p) ? p.join(', ') : m; } catch { return m; } }
  return String(m);
}

function getUnique(data: SoberCheersItem[], key: keyof SoberCheersItem): string[] {
  return Array.from(new Set(data.map(d => String(d[key] ?? '')).filter(Boolean))).sort();
}

function clean(items: any[]): SoberCheersItem[] {
  return items.map(item => ({
    ...item,
    monthlyExpense: item.monthlyExpense != null ? Number(item.monthlyExpense) || 0 : 0,
    firstName: item.firstName || '', lastName: item.lastName || '',
    gender: item.gender || '', province: item.province || '',
    type: item.type || '', job: item.job || '', phone: item.phone || '',
    drinkingFrequency: item.drinkingFrequency || '', intentPeriod: item.intentPeriod || '',
    healthImpact: item.healthImpact || '', birthday: item.birthday || new Date().toISOString(),
  }));
}

export default function SoberCheersTable() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [years, setYears] = useState<number[]>([currentYear]);

  const [data, setData] = useState<SoberCheersItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({ name: '', province: '', type: '', job: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  // delete: single row target, or 'bulk' for selected rows
  const [deleteTarget, setDeleteTarget] = useState<SoberCheersItem | 'bulk' | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async (y: number) => {
    setLoading(true);
    setError(null);
    setSelected(new Set());
    setFilters({ name: '', province: '', type: '', job: '' });
    setPage(1);

    const [res, availYears] = await Promise.all([
      getAllSoberCheersForTable(y),
      getAvailableSoberCheersYears(),
    ]);

    if (res.success && res.data) setData(clean(res.data));
    else setError('ไม่สามารถโหลดข้อมูลได้');
    setYears([...new Set([...availYears, currentYear])].sort());
    setLoading(false);
  }, [currentYear]);

  useEffect(() => { loadData(currentYear); }, []);

  const handleYearChange = (y: number) => { setYear(y); loadData(y); };

  const filtered = data.filter(item =>
    (!filters.name || `${item.firstName} ${item.lastName}`.toLowerCase().includes(filters.name.toLowerCase())) &&
    (!filters.province || item.province === filters.province) &&
    (!filters.type || item.type === filters.type) &&
    (!filters.job || item.job === filters.job)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const toggleSelect = (id: number) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(d => d.id)));

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const ids = deleteTarget === 'bulk' ? Array.from(selected) : [deleteTarget.id];
    setDeleting(true);
    const results = await Promise.all(ids.map(id => deleteSoberCheers(id)));
    setDeleting(false);
    const okIds = ids.filter((_, i) => results[i]?.success);
    if (okIds.length > 0) {
      setData(prev => prev.filter(d => !okIds.includes(d.id)));
      setSelected(prev => { const n = new Set(prev); okIds.forEach(id => n.delete(id)); return n; });
    }
    const failed = results.filter(r => !r?.success);
    if (failed.length > 0) alert(failed[0]?.message || `ลบไม่สำเร็จ ${failed.length} รายการ`);
    setDeleteTarget(null);
  };

  const exportData = filtered.filter(d => selected.size === 0 || selected.has(d.id));

  const handleCSV = () => {
    const headers = ['ชื่อ-นามสกุล', 'เพศ', 'อายุ', 'จังหวัด', 'ภาค', 'อาชีพ', 'การดื่ม', 'ค่าใช้จ่าย/เดือน', 'แรงจูงใจ'];
    const rows = exportData.map(d => [
      `"${d.firstName} ${d.lastName}"`, `"${d.gender}"`, calcAge(d.birthday),
      `"${d.province}"`, `"${d.type}"`, `"${d.job}"`, `"${d.alcoholConsumption}"`,
      d.monthlyExpense || 0, `"${parseMotivations(d.motivations)}"`,
    ].join(','));
    const blob = new Blob(['﻿' + [headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `sober_${year}_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const handleExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportData.map(d => ({
      'ชื่อ-นามสกุล': `${d.firstName} ${d.lastName}`, 'เพศ': d.gender,
      'อายุ': `${calcAge(d.birthday)} ปี`, 'จังหวัด': d.province, 'ภาค': d.type,
      'อาชีพ': d.job, 'การดื่มแอลกอฮอล์': d.alcoholConsumption,
      'ค่าใช้จ่าย/เดือน (฿)': d.monthlyExpense || 0, 'แรงจูงใจ': parseMotivations(d.motivations),
    })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'SoberCheers');
    XLSX.writeFile(wb, `sober_${year}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-6 space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">ข้อมูล Sober Cheers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? '...' : `${filtered.length.toLocaleString()} รายการ${activeFilterCount > 0 ? ` (กรองจาก ${data.length.toLocaleString()})` : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Year tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {years.map(y => (
              <button key={y} onClick={() => handleYearChange(y)}
                className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  year === y ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >{y}</button>
            ))}
          </div>
          <button onClick={() => loadData(year)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
              showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            ตัวกรอง
            {activeFilterCount > 0 && <span className="ml-0.5 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          <button onClick={handleCSV} disabled={loading || filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={handleExcel} disabled={loading || filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-40">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" placeholder="ค้นหาชื่อ..." value={filters.name}
                onChange={e => { setFilters(f => ({ ...f, name: e.target.value })); setPage(1); }}
                className="pl-9 pr-3 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
            </div>
            <select value={filters.province} onChange={e => { setFilters(f => ({ ...f, province: e.target.value })); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option value="">จังหวัด ({getUnique(data, 'province').length})</option>
              {getUnique(data, 'province').map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={filters.type} onChange={e => { setFilters(f => ({ ...f, type: e.target.value })); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option value="">ภาค ({getUnique(data, 'type').length})</option>
              {getUnique(data, 'type').map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={filters.job} onChange={e => { setFilters(f => ({ ...f, job: e.target.value })); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option value="">อาชีพ ({getUnique(data, 'job').length})</option>
              {getUnique(data, 'job').map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={() => { setFilters({ name: '', province: '', type: '', job: '' }); setPage(1); }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
              <X className="w-3 h-3" /> ล้างตัวกรอง
            </button>
          )}
        </div>
      )}

      {/* Selection bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          <span className="text-sm text-green-700">เลือกแล้ว {selected.size.toLocaleString()} รายการ</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setDeleteTarget('bulk')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> ลบที่เลือก
            </button>
            <button onClick={() => setSelected(new Set())} className="text-xs text-green-600 hover:text-green-800">ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? <Loading size="lg" /> : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={() => loadData(year)} className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600">ลองใหม่</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Search className="w-8 h-8 mb-2" />
          <p className="text-sm">{activeFilterCount > 0 ? 'ไม่พบข้อมูลที่ตรงกับตัวกรอง' : `ไม่มีข้อมูลปี ${year}`}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="w-10 px-4 py-3 text-left">
                    <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll} className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">เพศ / อายุ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">จังหวัด / ภาค</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">อาชีพ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">สถานะการดื่ม</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">ค่าใช้จ่าย/เดือน</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map(item => (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${selected.has(item.id) ? 'bg-green-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)}
                        className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.firstName} {item.lastName}</div>
                      {item.phone && <div className="text-xs text-gray-400 mt-0.5">{item.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div>{item.gender}</div>
                      <div className="text-xs text-gray-400">{calcAge(item.birthday)} ปี</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div>{item.province}</div>
                      <div className="text-xs text-gray-400">{item.type}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.job}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        item.alcoholConsumption.includes('ดื่ม (ย้อนหลัง') ? 'bg-red-100 text-red-700'
                        : item.alcoholConsumption.includes('ไม่เคยดื่ม') ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.alcoholConsumption.length > 20 ? item.alcoholConsumption.slice(0, 20) + '…' : item.alcoholConsumption}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {item.monthlyExpense ? `฿${(item.monthlyExpense as number).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/soberCheers/edit/${item.id}`}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="แก้ไข">
                          <SquarePen className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteTarget(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                          <Trash2 className="w-4 h-4" />
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
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-gray-500">
            {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              if (n < 1 || n > totalPages) return null;
              return (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-8 h-8 text-xs rounded border transition-colors ${page === n ? 'bg-green-500 border-green-500 text-white font-medium' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                  {n}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">ยืนยันการลบ</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {deleteTarget === 'bulk'
                    ? `ลบข้อมูลที่เลือก ${selected.size.toLocaleString()} รายการ?`
                    : `ลบข้อมูลของ "${deleteTarget.firstName} ${deleteTarget.lastName}"?`}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">การลบไม่สามารถย้อนกลับได้</p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50">
                ยกเลิก
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50">
                {deleting ? <><LoaderCircle className="w-4 h-4 animate-spin" /> กำลังลบ...</> : 'ลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
