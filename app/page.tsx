'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ChevronDown, ChevronRight } from 'lucide-react';

function useLentCountdown() {
  const [info, setInfo] = React.useState({ days: '—', label: '', pct: 0 });
  React.useEffect(() => {
    const calc = () => {
      const now = new Date();
      const start = new Date('2026-07-31T00:00:00');
      const end   = new Date('2026-10-27T23:59:59');
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

const BG = '#f8f5f0';
const GOLD = '#d4a843';

const actions = [
  { label: 'ลงทะเบียนหน่วยงาน', sub: 'Register your organization', href: '/organization/create', primary: true },
  { label: 'ดูข้อมูลที่ส่งแล้ว',  sub: 'View all submissions',      href: '/organization',        primary: false },
  { label: 'สถิติและรายงาน',      sub: 'Statistics & reports',       href: '/dashboard',           primary: false },
];

const steps = ['ลงทะเบียน', 'รายงาน', 'อัปโหลด', 'ส่งข้อมูล'];

export default function Home() {
  const router = useRouter();
  const lent = useLentCountdown();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-dvh" style={{ background: BG }}>

      {/* ── MOBILE ── */}
      <div className="md:hidden flex flex-col min-h-dvh px-5">

        {/* Hero — no card, sits on cream bg */}
        <div className="flex-1 flex flex-col justify-center pt-2 pb-8">
          <p className="text-[10px] tracking-[0.3em] text-stone-400 uppercase mb-8">
            Buddhist Lent · พ.ศ. 2569
          </p>

          <div className="mb-6">
            <span
              className="font-black tabular-nums leading-none"
              style={{ fontSize: 'clamp(5rem,22vw,7rem)', color: '#1c1917', letterSpacing: '-0.03em' }}
            >
              {lent.days}
            </span>
            <p className="text-sm text-stone-400 mt-1">{lent.label}</p>
          </div>

          <div className="h-px mb-6" style={{ background: '#e5ddd4' }} />

          <h1 className="text-lg font-semibold text-stone-800 leading-snug mb-2">
            ระบบรายงานผลงดเหล้าเข้าพรรษา
          </h1>
          <p className="text-sm text-stone-400 leading-relaxed">
            รายงานจำนวนสมาชิกที่งดเหล้าและอัปโหลดภาพกิจกรรมจากหน่วยงานของท่าน
          </p>
        </div>

        {/* Actions — one unified card */}
        <div className="rounded-2xl overflow-hidden shadow-sm mb-3" style={{ background: '#fff' }}>
          {actions.map((a, i) => (
            <button
              key={a.href}
              type="button"
              onClick={() => router.push(a.href)}
              className="w-full flex items-center justify-between px-5 py-4 active:opacity-70 transition-opacity text-left"
              style={{
                background: a.primary ? GOLD : '#fff',
                borderBottom: i < actions.length - 1 ? '1px solid #f0ebe4' : 'none',
              }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: a.primary ? '#1c1917' : '#44403c' }}>
                  {a.label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: a.primary ? '#78613a' : '#a8a29e' }}>
                  {a.sub}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 ml-3" style={{ color: a.primary ? '#78613a' : '#d6d3d1' }} />
            </button>
          ))}
        </div>

        {/* How to use */}
        <div className="rounded-2xl overflow-hidden shadow-sm mb-6" style={{ background: '#fff' }}>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5"
          >
            <span className="text-[10px] tracking-widest text-stone-400 uppercase">วิธีการใช้งาน · How to Use</span>
            <ChevronDown className={`w-3.5 h-3.5 text-stone-300 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="grid grid-cols-4 gap-2 px-5 pb-4 pt-1 border-t border-stone-100">
              {steps.map((th, i) => (
                <div key={th} className="text-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1"
                    style={{ background: '#fef3c7', color: GOLD }}>
                    {i + 1}
                  </div>
                  <p className="text-[10px] font-medium text-stone-500">{th}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── DESKTOP ── bento */}
      <div className="hidden md:block max-w-3xl mx-auto px-4 py-12">
        <div className="grid grid-cols-3 gap-3" style={{ gridAutoRows: '1fr' }}>

          {/* Hero card */}
          <div className="col-span-2 row-span-1 bg-white rounded-3xl p-7 border border-stone-200/50 shadow-sm flex flex-col justify-between" style={{ minHeight: 200 }}>
            <div>
              <p className="text-[10px] text-stone-400 tracking-widest uppercase mb-3">Buddhist Lent · พ.ศ. 2569</p>
              <h1 className="text-xl font-semibold text-stone-900 leading-snug mb-2">
                ระบบรายงานผลงดเหล้าเข้าพรรษา
              </h1>
              <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
                รายงานจำนวนสมาชิกที่งดเหล้าและอัปโหลดภาพกิจกรรมจากหน่วยงานของท่าน
              </p>
            </div>
            {lent.pct > 0 && (
              <div className="mt-5">
                <div className="flex justify-between text-[10px] text-stone-400 mb-1.5">
                  <span>ความคืบหน้า</span><span>{lent.pct}%</span>
                </div>
                <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${lent.pct}%`, background: GOLD }} />
                </div>
              </div>
            )}
          </div>

          {/* Countdown */}
          <div className="bg-stone-900 rounded-3xl p-6 shadow-sm flex flex-col justify-between" style={{ minHeight: 200 }}>
            <p className="text-[10px] text-stone-500 tracking-widest uppercase">countdown</p>
            <div>
              <div className="text-6xl font-bold text-white tabular-nums leading-none mb-2">{lent.days}</div>
              <p className="text-xs text-stone-400">{lent.label}</p>
            </div>
          </div>

          {/* Register */}
          <button type="button" onClick={() => router.push('/organization/create')}
            className="group rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between hover:brightness-95 transition-all"
            style={{ background: GOLD, minHeight: 170 }}>
            <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: '#78613a' }} />
            <div>
              <p className="text-base font-semibold text-stone-900 leading-snug">ลงทะเบียน<br />หน่วยงาน</p>
              <p className="text-xs mt-1" style={{ color: '#78613a' }}>Register</p>
            </div>
          </button>

          {/* View */}
          <button type="button" onClick={() => router.push('/organization')}
            className="group bg-white rounded-3xl p-6 shadow-sm border border-stone-200/50 text-left flex flex-col justify-between hover:bg-stone-50 transition-colors"
            style={{ minHeight: 170 }}>
            <ArrowUpRight className="w-4 h-4 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <div>
              <p className="text-sm font-semibold text-stone-800">ดูข้อมูล<br />ที่ส่งแล้ว</p>
              <p className="text-[10px] text-stone-400 mt-1">Submissions</p>
            </div>
          </button>

          {/* Stats */}
          <button type="button" onClick={() => router.push('/dashboard')}
            className="group bg-white rounded-3xl p-6 shadow-sm border border-stone-200/50 text-left flex flex-col justify-between hover:bg-stone-50 transition-colors"
            style={{ minHeight: 170 }}>
            <ArrowUpRight className="w-4 h-4 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <div>
              <p className="text-sm font-semibold text-stone-800">สถิติและ<br />รายงาน</p>
              <p className="text-[10px] text-stone-400 mt-1">Statistics</p>
            </div>
          </button>

          {/* How to use */}
          <div className="col-span-3 bg-white rounded-3xl border border-stone-200/50 shadow-sm overflow-hidden">
            <button type="button" onClick={() => setOpen(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors">
              <span className="text-[10px] tracking-widest text-stone-400 uppercase">วิธีการใช้งาน · How to Use</span>
              <ChevronDown className={`w-3.5 h-3.5 text-stone-300 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="grid grid-cols-4 gap-6 px-6 pb-6 pt-1 border-t border-stone-100">
                {steps.map((th, i) => (
                  <div key={th}>
                    <p className="text-[10px] font-mono text-stone-300 mb-1">0{i + 1}</p>
                    <p className="text-xs font-medium text-stone-600">{th}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        <p className="text-center text-[10px] text-stone-300 tracking-widest uppercase mt-8">© 2569 Healthy Sobriety</p>
      </div>

    </div>
  );
}
