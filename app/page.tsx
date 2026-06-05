'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, BarChart3, ChevronRight, ChevronDown } from 'lucide-react';

function useLentCountdown() {
  const [info, setInfo] = React.useState({ days: '', label: '', isActive: false });
  React.useEffect(() => {
    const calc = () => {
      const now = new Date();
      const start = new Date('2026-07-31T00:00:00');
      const end = new Date('2026-10-27T23:59:59');
      if (now < start) {
        const d = Math.ceil((start.getTime() - now.getTime()) / 86400000);
        setInfo({ days: String(d), label: 'วันก่อนเข้าพรรษา', isActive: false });
      } else if (now <= end) {
        const d = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
        setInfo({ days: String(d), label: 'วันแห่งการงดเหล้า', isActive: true });
      } else {
        setInfo({ days: '—', label: 'สิ้นสุดเข้าพรรษาแล้ว', isActive: false });
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

  const actions = [
    {
      icon: <Building2 className="w-5 h-5" />,
      label: 'ลงทะเบียนหน่วยงาน',
      sub: 'Register your organization',
      href: '/organization/create',
      accent: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'ดูข้อมูลที่ส่งแล้ว',
      sub: 'View all submissions',
      href: '/organization',
      accent: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'สถิติและรายงาน',
      sub: 'Statistics & reports',
      href: '/dashboard',
      accent: 'text-stone-500',
      bg: 'bg-stone-50',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-10 text-center">

        {/* badge */}
        <div className="inline-flex items-center gap-2 border border-yellow-500/30 text-yellow-400 text-xs px-3 py-1 rounded-full mb-8 tracking-wide">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
          Buddhist Lent 2026 · พ.ศ. ๒๕๖๙
        </div>

        {/* countdown */}
        <div className="mb-6">
          <div className="text-8xl font-black text-yellow-400 tabular-nums leading-none tracking-tighter">
            {lent.days}
          </div>
          <div className="text-zinc-400 text-sm mt-2 tracking-wide">{lent.label}</div>
        </div>

        {/* title */}
        <h1 className="text-2xl font-bold text-white leading-snug mb-2">
          ระบบรายงานผลงดเหล้าเข้าพรรษา
        </h1>
        <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
          รายงานจำนวนสมาชิกที่งดเหล้าและอัปโหลดภาพกิจกรรมจากหน่วยงานของท่าน
        </p>
      </div>

      {/* Bottom sheet */}
      <div className="bg-white rounded-t-3xl px-5 pt-6 pb-8 space-y-3 shadow-2xl">

        {/* handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        {actions.map((a) => (
          <button
            key={a.href}
            type="button"
            onClick={() => router.push(a.href)}
            className="w-full flex items-center gap-4 rounded-2xl px-4 py-4 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] transition-all duration-150 text-left"
          >
            <div className={`${a.bg} ${a.accent} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </button>
        ))}

        {/* How to use */}
        <div className="rounded-2xl overflow-hidden border border-gray-100">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-600">วิธีการใช้งาน <span className="text-gray-400 font-normal">| How to Use</span></span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="grid grid-cols-4 gap-3 px-4 py-4 bg-white border-t border-gray-100">
              {[
                { n: '1', th: 'ลงทะเบียน', en: 'Register' },
                { n: '2', th: 'รายงานจำนวน', en: 'Report' },
                { n: '3', th: 'อัปโหลดภาพ', en: 'Upload' },
                { n: '4', th: 'ส่งข้อมูล', en: 'Submit' },
              ].map((s) => (
                <div key={s.n} className="text-center">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-1">
                    {s.n}
                  </div>
                  <p className="text-[11px] font-medium text-gray-700">{s.th}</p>
                  <p className="text-[10px] text-gray-400">{s.en}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-300 pt-1">ระบบรายงานผลงดเหล้าเข้าพรรษา © 2569</p>
      </div>

    </div>
  );
}
