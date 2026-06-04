'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, MapPin, Phone, Users, Images, Pencil, Eye, RefreshCw } from 'lucide-react';
import { getAllOrganizations, getAvailableOrganizationYears } from '@/app/organization/actions/Get';
import { getActiveOrganizationCategories } from '@/app/dashboard/organization-category/actions/Get';
import { Organization, OrganizationCategory } from '@/types/organization';
import Loading from '@/components/ui/Loading';

const PAGE_SIZE = 24;

function getImages(org: Organization) {
  return [org.image1, org.image2, org.image3, org.image4, org.image5]
    .filter((p): p is string => !!p?.trim());
}

// ── Card ───────────────────────────────────────────────────────────────────
function OrgCard({ org }: { org: Organization }) {
  const images = getImages(org);
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={err ? '/images/no-image.png' : images[idx]}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setErr(true)}
              loading="lazy"
            />
            {images.length > 1 && (
              <>
                <button onClick={() => setIdx(i => i === 0 ? images.length - 1 : i - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/30 hover:bg-black/50 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIdx(i => i === images.length - 1 ? 0 : i + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/30 hover:bg-black/50 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setIdx(i)}
                      className={`h-1 rounded-full transition-all ${i === idx ? 'w-4 bg-white' : 'w-1 bg-white/60'}`} />
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-2 right-2 flex gap-1">
              <Link href={`/dashboard/organization/edit/${org.id}`}>
                <button className="w-7 h-7 bg-white/90 border border-gray-200 rounded flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                  <Pencil className="w-3 h-3 text-gray-600" />
                </button>
              </Link>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-300">
              <Images className="w-8 h-8 mx-auto mb-1" />
              <p className="text-xs">ไม่มีรูปภาพ</p>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="font-medium text-gray-900 text-sm line-clamp-1">{org.firstName} {org.lastName}</p>
        {org.organizationCategory && (
          <p className="text-xs text-gray-500 line-clamp-1">{org.organizationCategory.name}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {org.province && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{org.province}</span>}
          {org.phoneNumber && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{org.phoneNumber}</span>}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="w-3 h-3" />{org.numberOfSigners.toLocaleString()} คน
          </span>
          {images.length > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Images className="w-3 h-3" />{images.length}
            </span>
          )}
        </div>
        <Link href={`/dashboard/organization/view/${org.id}`}
          className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
          <Eye className="w-3 h-3" /> ดูรายละเอียด
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function OrganizationGalleryPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [years, setYears] = useState<number[]>([]);

  const [data, setData] = useState<Organization[]>([]);
  const [categories, setCategories] = useState<OrganizationCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imgFilter, setImgFilter] = useState<'all' | 'with' | 'without'>('all');
  const [page, setPage] = useState(1);

  const load = async (y: number) => {
    setLoading(true);
    const [orgs, cats, yrs] = await Promise.all([
      getAllOrganizations({ year: y, limit: 10000 }),
      getActiveOrganizationCategories(),
      getAvailableOrganizationYears(),
    ]);
    if (orgs) setData(orgs.data);
    if (cats) setCategories(cats);
    setYears(yrs);
    setPage(1);
    setLoading(false);
  };

  useEffect(() => { load(currentYear); }, []);

  const handleYearChange = (y: number) => { setYear(y); load(y); };

  const provinces = [...new Set(data.map(d => d.province).filter(Boolean))].sort();

  const filtered = data.filter(org => {
    const q = search.toLowerCase();
    const imgs = getImages(org);
    return (!q || `${org.firstName} ${org.lastName} ${org.phoneNumber}`.toLowerCase().includes(q))
      && (!province || org.province === province)
      && (!categoryId || org.organizationCategoryId?.toString() === categoryId)
      && (imgFilter === 'all' || (imgFilter === 'with' ? imgs.length > 0 : imgs.length === 0));
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const withImages = data.filter(o => getImages(o).length > 0).length;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">แกลเลอรี่องค์กร</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length.toLocaleString()} องค์กร</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {years.map(y => (
              <button key={y} onClick={() => handleYearChange(y)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${year === y ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >{y}</button>
            ))}
          </div>
          <button onClick={() => load(year)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'ทั้งหมด', value: data.length },
            { label: 'มีรูปภาพ', value: withImages },
            { label: 'ไม่มีรูปภาพ', value: data.length - withImages },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center">
              <p className="text-xl font-semibold text-gray-900">{s.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="ค้นหา..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-3 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select value={province} onChange={e => { setProvince(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="">ทุกจังหวัด</option>
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="">ทุกหมวดหมู่</option>
          {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
        </select>
        <select value={imgFilter} onChange={e => { setImgFilter(e.target.value as any); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="all">ทั้งหมด</option>
          <option value="with">มีรูปภาพ</option>
          <option value="without">ไม่มีรูปภาพ</option>
        </select>
      </div>

      {/* Gallery */}
      {loading ? <Loading size="lg" /> : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Images className="w-10 h-10 mb-2" />
          <p className="text-sm">ไม่พบข้อมูล{year ? ` ปี ${year}` : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {rows.map(org => <OrgCard key={org.id} org={org} />)}
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
