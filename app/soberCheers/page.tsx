'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Search, Plus, Trash2, Pencil, ChevronLeft, ChevronRight, Phone, X } from 'lucide-react';
import { getAllSoberCheers, getSoberCheersCount, getTypeRegions, getSoberCheersYearCounts, findSoberCheersByPhone } from './actions/Get';
import { deleteSoberCheers } from './actions/Delete';
import Loading from '@/components/ui/Loading';
import EditSoberCheersModal from './components/editSoberCheersModal';

interface SoberCheer {
  id: number;
  firstName: string;
  lastName: string;
  birthday: string | Date;
  province: string;
  amphoe: string;
  type: string;
  job: string;
  alcoholConsumption: string;
  intentPeriod: string;
  phone: string;
  createdAt: string | Date;
}

const PAGE_SIZE = 20;

function calcAge(b: string | Date) {
  try { return Math.abs(new Date(Date.now() - new Date(b).getTime()).getUTCFullYear() - 1970); }
  catch { return 0; }
}

export default function SoberCheersPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [items, setItems] = useState<SoberCheer[]>([]);
  const [total, setTotal] = useState(0);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState<number | null>(new Date().getFullYear());
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editId, setEditId] = useState<number | null>(null);
  const [yearCounts, setYearCounts] = useState<{ year: number; count: number }[]>([]);
  const [showLookup, setShowLookup] = useState(false);
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getTypeRegions(),
      getSoberCheersYearCounts(),
    ]).then(([t, yc]) => {
      if (t.success && t.data) setTypes(t.data);
      setYearCounts(yc);
      // ถ้าปีปัจจุบันยังไม่มีข้อมูล ให้เลือกปีล่าสุดที่มีข้อมูลแทน
      if (yc.length > 0 && !yc.some(y => y.year === yearFilter)) {
        setYearFilter(yc[0].year); // yc เรียง year มาก→น้อย ปีแรกคือล่าสุด
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllSoberCheers({ limit: 10000, year: yearFilter ?? undefined }),
      getSoberCheersCount(),
    ]).then(([list, count]) => {
      if (list.success && list.data) setItems(list.data.items);
      if (count.success && count.data !== undefined) setTotal(count.data);
    }).finally(() => setLoading(false));
  }, [yearFilter]);

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    return (!typeFilter || item.type === typeFilter)
      && (!q || `${item.firstName} ${item.lastName} ${item.province} ${item.amphoe}`.toLowerCase().includes(q));
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = (id: number) => setSelected(p => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const handleDelete = async () => {
    if (!confirm(`ลบ ${selected.size} รายการใช่ไหม?`)) return;
    await Promise.all([...selected].map(deleteSoberCheers));
    setItems(p => p.filter(i => !selected.has(i.id)));
    setTotal(p => p - selected.size);
    setSelected(new Set());
  };

  const handleLookup = async () => {
    if (!lookupPhone.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);
    const r = await findSoberCheersByPhone(lookupPhone.trim());
    if (r.success) setLookupResult(r.data);
    else setLookupError(r.error || 'ไม่พบข้อมูล');
    setLookupLoading(false);
  };

  const refresh = useCallback(() => {
    getAllSoberCheers({ limit: 10000 }).then(r => {
      if (r.success && r.data) setItems(r.data.items);
    });
  }, []);

  if (loading) return <Loading size="lg" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Sober Cheers</h1>
            <p className="text-sm text-gray-500 mt-1">
              {yearFilter ? `ปี ${yearFilter} · ` : ''}{filtered.length.toLocaleString()} รายการ
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowLookup(true); setLookupPhone(''); setLookupResult(null); setLookupError(''); }}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              ค้นหาข้อมูลของฉัน
            </button>
            <Link
              href="/soberCheers/create"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              ลงทะเบียน
            </Link>
          </div>
        </div>

        {/* Year Tabs */}
        {yearCounts.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {yearCounts.map(({ year, count }) => (
              <button
                key={year}
                onClick={() => { setYearFilter(year); setPage(1); }}
                className={`flex-shrink-0 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  yearFilter === year ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {year}
                <span className="ml-1.5 text-xs opacity-70">{count.toLocaleString()}</span>
              </button>
            ))}
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, จังหวัด..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">ทุกภาค</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {isAdmin && selected.size > 0 && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-sm text-red-600 border border-red-200 bg-white hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              ลบ ({selected.size})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 font-medium">
                {isAdmin && (
                  <th className="w-10 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(d => d.id)))}
                      className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3 text-left">อายุ</th>
                <th className="px-4 py-3 text-left">จังหวัด</th>
                <th className="px-4 py-3 text-left">ภาค</th>
                <th className="px-4 py-3 text-left">อาชีพ</th>
                {isAdmin && <th className="w-16 px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 6} className="px-4 py-12 text-center text-sm text-gray-400">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : rows.map((item, i) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggle(item.id)}
                        className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-400 tabular-nums">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{item.firstName} {item.lastName}</span>
                    {item.phone && <span className="text-gray-400 text-xs ml-2">{item.phone}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{calcAge(item.birthday)} ปี</td>
                  <td className="px-4 py-3 text-gray-600">{item.province}</td>
                  <td className="px-4 py-3 text-gray-500">{item.type || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{item.job}</td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditId(item.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length.toLocaleString()} รายการ
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30 text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                if (n < 1 || n > totalPages) return null;
                return (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded border text-xs transition-colors ${page === n ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                  >{n}</button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30 text-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Phone Lookup Modal */}
      {showLookup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">ค้นหาข้อมูลของฉัน</h2>
              <button onClick={() => setShowLookup(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">กรอกเบอร์โทรศัพท์ที่ใช้ลงทะเบียนเพื่อดูและแก้ไขข้อมูลของคุณ</p>

            <div className="flex gap-2 mb-4">
              <input
                type="tel"
                value={lookupPhone}
                onChange={e => setLookupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="0812345678"
                className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                maxLength={10}
              />
              <button
                onClick={handleLookup}
                disabled={lookupLoading || lookupPhone.length < 9}
                className="px-4 py-2.5 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-40 transition-colors"
              >
                {lookupLoading ? '...' : 'ค้นหา'}
              </button>
            </div>

            {lookupError && (
              <p className="text-sm text-red-500 mb-3">{lookupError}</p>
            )}

            {lookupResult && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-900">{lookupResult.firstName} {lookupResult.lastName}</p>
                <p className="text-xs text-gray-500">จังหวัด{lookupResult.province} · {lookupResult.type}</p>
                <p className="text-xs text-gray-500">อาชีพ: {lookupResult.job}</p>
                <p className="text-xs text-gray-400">ลงทะเบียนเมื่อ {new Date(lookupResult.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <Link
                  href={`/soberCheers/edit/${lookupResult.id}`}
                  onClick={() => setShowLookup(false)}
                  className="mt-2 flex items-center justify-center gap-2 w-full py-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  แก้ไขข้อมูล
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {editId && (
        <EditSoberCheersModal
          soberCheerId={editId}
          isOpen={true}
          onClose={() => setEditId(null)}
          onUpdate={refresh}
        />
      )}
    </div>
  );
}
