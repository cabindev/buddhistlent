'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Search, Plus, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllSoberCheers, getSoberCheersCount, getTypeRegions } from './actions/Get';
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
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      getAllSoberCheers({ limit: 10000 }),
      getSoberCheersCount(),
      getTypeRegions(),
    ]).then(([list, count, t]) => {
      if (list.success && list.data) setItems(list.data.items);
      if (count.success && count.data !== undefined) setTotal(count.data);
      if (t.success && t.data) setTypes(t.data);
    }).finally(() => setLoading(false));
  }, []);

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
              {filtered.length.toLocaleString()} รายการ{filtered.length !== total && ` / ${total.toLocaleString()} ทั้งหมด`}
            </p>
          </div>
          <Link
            href="/soberCheers/create"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            ลงทะเบียน
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, จังหวัด..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                      className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
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
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
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
                    className={`w-8 h-8 rounded border text-xs transition-colors ${page === n ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
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
