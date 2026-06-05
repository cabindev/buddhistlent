'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

function useLentCountdown() {
  const [info, setInfo] = React.useState({ days: '—', label: '', isActive: false });
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f0e0c', fontFamily: 'system-ui, sans-serif' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-8 pb-0">
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: '#6b6457' }}>
          พ.ศ. ๒๕๖๙
        </span>
        <span className="text-xs tracking-[0.15em] uppercase" style={{ color: '#6b6457' }}>
          Buddhist Lent
        </span>
      </div>

      {/* Big number */}
      <div className="px-6 pt-6 pb-0 select-none">
        <div
          className="font-black leading-none tabular-nums"
          style={{
            fontSize: 'clamp(7rem, 28vw, 16rem)',
            color: '#c8893a',
            letterSpacing: '-0.04em',
            lineHeight: 0.85,
          }}
        >
          {lent.days}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: '#2a2620' }} />
          <span className="text-sm" style={{ color: '#6b6457' }}>{lent.label}</span>
        </div>
      </div>

      {/* Title block */}
      <div className="px-6 pt-10">
        <h1
          className="font-bold leading-tight"
          style={{ color: '#f0ead8', fontSize: 'clamp(1.4rem, 5vw, 2.2rem)' }}
        >
          ระบบรายงานผล<br />งดเหล้าเข้าพรรษา
        </h1>
        <p className="mt-2 text-sm leading-relaxed max-w-xs" style={{ color: '#6b6457' }}>
          รายงานจำนวนสมาชิกที่งดเหล้าและอัปโหลดภาพกิจกรรม<br className="hidden sm:block" />จากหน่วยงานของท่าน
        </p>
      </div>

      {/* Nav links */}
      <div className="px-6 pt-10 flex-1">
        <div className="border-t" style={{ borderColor: '#2a2620' }}>
          {[
            { label: 'ลงทะเบียนหน่วยงาน', sub: 'Register', href: '/organization/create' },
            { label: 'ดูข้อมูลที่ส่งแล้ว', sub: 'View submissions', href: '/organization' },
            { label: 'สถิติและรายงาน', sub: 'Statistics', href: '/dashboard' },
          ].map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className="w-full group border-b py-5 flex items-center justify-between text-left transition-opacity duration-150 hover:opacity-70"
              style={{ borderColor: '#2a2620' }}
            >
              <div>
                <span className="block font-medium" style={{ color: '#f0ead8', fontSize: '1.05rem' }}>
                  {item.label}
                </span>
                <span className="text-xs mt-0.5 block" style={{ color: '#6b6457' }}>{item.sub}</span>
              </div>
              <span
                className="text-xl transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: '#c8893a' }}
              >
                →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* How to use */}
      <div className="px-6 pb-10 pt-4">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between py-3 text-left hover:opacity-70 transition-opacity"
        >
          <span className="text-xs tracking-widest uppercase" style={{ color: '#6b6457' }}>
            วิธีการใช้งาน · How to Use
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            style={{ color: '#6b6457' }}
          />
        </button>

        {open && (
          <div className="mt-3 grid grid-cols-4 gap-4 border-t pt-5" style={{ borderColor: '#2a2620' }}>
            {[
              { n: '01', th: 'ลงทะเบียน' },
              { n: '02', th: 'รายงาน' },
              { n: '03', th: 'อัปโหลด' },
              { n: '04', th: 'ส่งข้อมูล' },
            ].map((s) => (
              <div key={s.n}>
                <div className="text-xs font-mono mb-1" style={{ color: '#c8893a' }}>{s.n}</div>
                <div className="text-xs" style={{ color: '#6b6457' }}>{s.th}</div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-xs" style={{ color: '#3a3530' }}>
          © 2569 · Healthy Sobriety
        </p>
      </div>

    </div>
  );
}
