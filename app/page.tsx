'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ChevronDown } from 'lucide-react';

function useLentCountdown() {
  const [info, setInfo] = React.useState({ days: '—', label: '', pct: 0 });
  React.useEffect(() => {
    const calc = () => {
      const now = new Date();
      const start = new Date('2026-07-31T00:00:00');
      const end = new Date('2026-10-27T23:59:59');
      const total = (end.getTime() - start.getTime()) / 86400000;
      if (now < start) {
        const d = Math.ceil((start.getTime() - now.getTime()) / 86400000);
        setInfo({ days: String(d), label: 'วันก่อนเข้าพรรษา', pct: 0 });
      } else if (now <= end) {
        const d = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
        setInfo({ days: String(d), label: 'วันแห่งการงดเหล้า', pct: Math.round((d / total) * 100) });
      } else {
        setInfo({ days: '—', label: 'สิ้นสุดเข้าพรรษาแล้ว', pct: 100 });
      }
    };
    calc();
    const t = setInterval(calc, 3600000);
    return () => clearInterval(t);
  }, []);
  return info;
}

export default function Home() {
  const router = useRouter();
  const lent = useLentCountdown();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-auto">

          {/* Hero card — spans 2 cols */}
          <div className="col-span-2 bg-white rounded-3xl p-7 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[200px]">
            <div>
              <p className="text-xs text-gray-400 tracking-widest uppercase mb-4">Buddhist Lent · พ.ศ. 2569</p>
              <h1 className="text-xl font-semibold text-gray-900 leading-snug mb-1">
                ระบบรายงานผลงดเหล้าเข้าพรรษา
              </h1>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                รายงานจำนวนสมาชิกที่งดเหล้าและอัปโหลดภาพกิจกรรมจากหน่วยงานของท่าน
              </p>
            </div>

            {/* Progress bar */}
            {lent.pct > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
                  <span>ความคืบหน้า</span>
                  <span>{lent.pct}%</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${lent.pct}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Countdown card */}
          <div className="bg-gray-900 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[200px]">
            <p className="text-[10px] text-gray-500 tracking-widest uppercase">countdown</p>
            <div>
              <div className="text-5xl font-bold text-white tabular-nums leading-none mb-2">
                {lent.days}
              </div>
              <p className="text-xs text-gray-400 leading-snug">{lent.label}</p>
            </div>
          </div>

          {/* Register — primary CTA */}
          <button
            type="button"
            onClick={() => router.push('/organization/create')}
            className="col-span-2 md:col-span-1 group bg-orange-500 hover:bg-orange-600 transition-colors rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between min-h-[160px]"
          >
            <ArrowUpRight className="w-5 h-5 text-orange-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div>
              <p className="text-base font-semibold text-white leading-snug">ลงทะเบียน<br />หน่วยงาน</p>
              <p className="text-xs text-orange-200 mt-1">Register</p>
            </div>
          </button>

          {/* View data */}
          <button
            type="button"
            onClick={() => router.push('/organization')}
            className="group bg-white hover:bg-gray-50 transition-colors rounded-3xl p-6 shadow-sm border border-gray-100 text-left flex flex-col justify-between min-h-[160px]"
          >
            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div>
              <p className="text-sm font-semibold text-gray-800">ดูข้อมูล<br />ที่ส่งแล้ว</p>
              <p className="text-[10px] text-gray-400 mt-1">Submissions</p>
            </div>
          </button>

          {/* Stats */}
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="group bg-white hover:bg-gray-50 transition-colors rounded-3xl p-6 shadow-sm border border-gray-100 text-left flex flex-col justify-between min-h-[160px]"
          >
            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div>
              <p className="text-sm font-semibold text-gray-800">สถิติและ<br />รายงาน</p>
              <p className="text-[10px] text-gray-400 mt-1">Statistics</p>
            </div>
          </button>

          {/* How to use — full width */}
          <div className="col-span-2 md:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xs tracking-widest text-gray-400 uppercase">วิธีการใช้งาน · How to Use</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="grid grid-cols-4 gap-6 px-6 pb-6 pt-1 border-t border-gray-100">
                {[
                  { n: '01', th: 'ลงทะเบียน', en: 'Register' },
                  { n: '02', th: 'รายงานจำนวน', en: 'Report' },
                  { n: '03', th: 'อัปโหลดภาพ', en: 'Upload' },
                  { n: '04', th: 'ส่งข้อมูล', en: 'Submit' },
                ].map((s) => (
                  <div key={s.n}>
                    <p className="text-[10px] font-mono text-gray-300 mb-1">{s.n}</p>
                    <p className="text-xs font-medium text-gray-600">{s.th}</p>
                    <p className="text-[10px] text-gray-400">{s.en}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <p className="text-center text-[10px] text-gray-300 tracking-widest uppercase mt-8">
          © 2569 Healthy Sobriety
        </p>

      </div>
    </div>
  );
}
