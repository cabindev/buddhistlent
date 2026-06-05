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

  const actions = [
    { label: 'ลงทะเบียนหน่วยงาน', sub: 'Register', href: '/organization/create', primary: true },
    { label: 'ดูข้อมูลที่ส่งแล้ว',  sub: 'Submissions', href: '/organization', primary: false },
    { label: 'สถิติและรายงาน',      sub: 'Statistics', href: '/dashboard', primary: false },
  ];

  return (
    <div className="min-h-dvh" style={{ background: '#f8f5f0' }}>

      {/* ── MOBILE ── flex column fills screen */}
      <div className="flex flex-col min-h-dvh md:hidden px-4 pt-4 pb-6">

        {/* Top: label */}
        <p className="text-[10px] tracking-[0.25em] text-gray-400 uppercase mb-4">
          Buddhist Lent · พ.ศ. 2569
        </p>

        {/* Countdown card */}
        <div className="bg-gray-900 rounded-3xl px-6 py-5 mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">countdown</p>
            <div className="text-6xl font-bold text-white tabular-nums leading-none">{lent.days}</div>
            <p className="text-xs text-gray-400 mt-1">{lent.label}</p>
          </div>
          {lent.pct > 0 && (
            <div className="flex flex-col items-center gap-1">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="#374151" strokeWidth="4" />
                <circle cx="28" cy="28" r="22" fill="none" stroke="#facc15" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - lent.pct / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <p className="text-[10px] text-gray-500">{lent.pct}%</p>
            </div>
          )}
        </div>

        {/* Title card */}
        <div className="bg-white rounded-3xl px-5 py-4 mb-3 border border-gray-100">
          <h1 className="text-base font-semibold text-gray-900 leading-snug mb-1">
            ระบบรายงานผลงดเหล้าเข้าพรรษา
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            รายงานจำนวนสมาชิกที่งดเหล้าและอัปโหลดภาพกิจกรรมจากหน่วยงานของท่าน
          </p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-3">
          {actions.map((a, i) => (
            <button
              key={a.href}
              type="button"
              onClick={() => router.push(a.href)}
              className={`w-full flex items-center justify-between px-5 py-4 active:bg-gray-50 transition-colors text-left
                ${i < actions.length - 1 ? 'border-b border-gray-100' : ''}
                ${a.primary ? 'bg-yellow-400 active:bg-yellow-500' : 'bg-white'}`}
            >
              <div>
                <p className={`text-sm font-semibold ${a.primary ? 'text-gray-900' : 'text-gray-700'}`}>{a.label}</p>
                <p className={`text-[10px] mt-0.5 ${a.primary ? 'text-yellow-900/50' : 'text-gray-400'}`}>{a.sub}</p>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 ${a.primary ? 'text-yellow-900/40' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>

        {/* How to use */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mt-auto">
          <button type="button" onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-5 py-4">
            <span className="text-[10px] tracking-widest text-gray-400 uppercase">วิธีการใช้งาน · How to Use</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="grid grid-cols-4 gap-3 px-5 pb-5 pt-1 border-t border-gray-100">
              {['ลงทะเบียน','รายงาน','อัปโหลด','ส่งข้อมูล'].map((th, i) => (
                <div key={th} className="text-center">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">{i+1}</div>
                  <p className="text-[10px] font-medium text-gray-600">{th}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── DESKTOP ── bento grid */}
      <div className="hidden md:block max-w-3xl mx-auto px-4 py-12">
        <div className="grid grid-cols-3 gap-3">

          {/* Hero */}
          <div className="col-span-2 bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[210px]">
            <div>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-3">Buddhist Lent · พ.ศ. 2569</p>
              <h1 className="text-xl font-semibold text-gray-900 leading-snug mb-2">ระบบรายงานผลงดเหล้าเข้าพรรษา</h1>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                รายงานจำนวนสมาชิกที่งดเหล้าและอัปโหลดภาพกิจกรรมจากหน่วยงานของท่าน
              </p>
            </div>
            {lent.pct > 0 && (
              <div className="mt-5">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
                  <span>ความคืบหน้า</span><span>{lent.pct}%</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${lent.pct}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Countdown */}
          <div className="bg-gray-900 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[210px]">
            <p className="text-[10px] text-gray-500 tracking-widest uppercase">countdown</p>
            <div>
              <div className="text-6xl font-bold text-white tabular-nums leading-none mb-2">{lent.days}</div>
              <p className="text-xs text-gray-400 leading-snug">{lent.label}</p>
            </div>
          </div>

          {/* Register */}
          <button type="button" onClick={() => router.push('/organization/create')}
            className="group bg-yellow-400 hover:bg-yellow-500 transition-colors rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between min-h-[170px]">
            <ArrowUpRight className="w-5 h-5 text-yellow-900/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div>
              <p className="text-base font-semibold text-gray-900 leading-snug">ลงทะเบียน<br />หน่วยงาน</p>
              <p className="text-xs text-yellow-900/50 mt-1">Register</p>
            </div>
          </button>

          {/* View */}
          <button type="button" onClick={() => router.push('/organization')}
            className="group bg-white hover:bg-gray-50 transition-colors rounded-3xl p-6 shadow-sm border border-gray-100 text-left flex flex-col justify-between min-h-[170px]">
            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div>
              <p className="text-sm font-semibold text-gray-800">ดูข้อมูล<br />ที่ส่งแล้ว</p>
              <p className="text-[10px] text-gray-400 mt-1">Submissions</p>
            </div>
          </button>

          {/* Stats */}
          <button type="button" onClick={() => router.push('/dashboard')}
            className="group bg-white hover:bg-gray-50 transition-colors rounded-3xl p-6 shadow-sm border border-gray-100 text-left flex flex-col justify-between min-h-[170px]">
            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div>
              <p className="text-sm font-semibold text-gray-800">สถิติและ<br />รายงาน</p>
              <p className="text-[10px] text-gray-400 mt-1">Statistics</p>
            </div>
          </button>

          {/* How to use */}
          <div className="col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <button type="button" onClick={() => setOpen(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
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
        <p className="text-center text-[10px] text-gray-300 tracking-widest uppercase mt-8">© 2569 Healthy Sobriety</p>
      </div>

    </div>
  );
}
