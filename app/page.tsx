'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronDown } from 'lucide-react';

function useLentCountdown() {
  const [info, setInfo] = React.useState({ days: '—', label: '' });
  React.useEffect(() => {
    const calc = () => {
      const now = new Date();
      const start = new Date('2026-07-31T00:00:00');
      const end = new Date('2026-10-27T23:59:59');
      if (now < start) {
        const d = Math.ceil((start.getTime() - now.getTime()) / 86400000);
        setInfo({ days: String(d), label: 'วันก่อนเข้าพรรษา' });
      } else if (now <= end) {
        const d = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
        setInfo({ days: String(d), label: 'วันแห่งการงดเหล้า' });
      } else {
        setInfo({ days: '—', label: 'สิ้นสุดเข้าพรรษาแล้ว' });
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
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-8 py-16 md:py-24">

        {/* Label */}
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-12">
          Buddhist Lent · พ.ศ. 2569
        </p>

        {/* Countdown */}
        <div className="mb-10">
          <div className="flex items-end gap-4">
            <span
              className="font-light tabular-nums leading-none"
              style={{ fontSize: 'clamp(4.5rem, 15vw, 8rem)', color: '#111', letterSpacing: '-0.03em' }}
            >
              {lent.days}
            </span>
            <span className="text-sm text-gray-400 pb-4 leading-snug">
              {lent.label}
            </span>
          </div>
          <div className="h-px bg-gray-100 mt-6" />
        </div>

        {/* Title */}
        <div className="mb-14">
          <h1 className="text-2xl font-medium text-gray-900 leading-snug mb-3">
            ระบบรายงานผลงดเหล้าเข้าพรรษา
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md">
            รายงานจำนวนสมาชิกที่งดเหล้าและอัปโหลดภาพกิจกรรม<br />จากหน่วยงานของท่าน
          </p>
        </div>

        {/* Nav */}
        <div className="space-y-0 mb-14">
          {[
            { label: 'ลงทะเบียนหน่วยงาน', sub: 'Register your organization', href: '/organization/create', primary: true },
            { label: 'ดูข้อมูลที่ส่งแล้ว', sub: 'View all submissions', href: '/organization', primary: false },
            { label: 'สถิติและรายงาน', sub: 'Statistics & reports', href: '/dashboard', primary: false },
          ].map((item, i, arr) => (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={`group w-full flex items-center justify-between py-5 text-left transition-colors hover:bg-gray-50 -mx-4 px-4 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div>
                <p className={`text-sm font-medium ${item.primary ? 'text-gray-900' : 'text-gray-600'}`}>
                  {item.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 ml-4" />
            </button>
          ))}
        </div>

        {/* How to use */}
        <div className="border-t border-gray-100">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="w-full flex items-center justify-between py-4 -mx-4 px-4 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs tracking-[0.2em] text-gray-400 uppercase">วิธีการใช้งาน · How to Use</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="pb-8 pt-2 grid grid-cols-4 gap-6">
              {[
                { n: '01', th: 'ลงทะเบียน', en: 'Register' },
                { n: '02', th: 'รายงานจำนวน', en: 'Report' },
                { n: '03', th: 'อัปโหลดภาพ', en: 'Upload' },
                { n: '04', th: 'ส่งข้อมูล', en: 'Submit' },
              ].map((s) => (
                <div key={s.n}>
                  <p className="text-xs font-mono text-gray-300 mb-1">{s.n}</p>
                  <p className="text-xs font-medium text-gray-600">{s.th}</p>
                  <p className="text-[10px] text-gray-400">{s.en}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-12 text-[10px] text-gray-300 tracking-widest uppercase">
          © 2569 Healthy Sobriety
        </p>

      </div>
    </div>
  );
}
