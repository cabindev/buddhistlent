'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

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

  const nav = [
    { label: 'ลงทะเบียนหน่วยงาน', sub: 'Register', href: '/organization/create' },
    { label: 'ดูข้อมูลที่ส่งแล้ว',   sub: 'Submissions', href: '/organization' },
    { label: 'สถิติและรายงาน',       sub: 'Statistics',  href: '/dashboard' },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0f0e0c' }}
    >
      {/* Main — fills viewport, centers content */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full" style={{ maxWidth: 'min(420px, 100%)' }}>

          {/* Eyebrow */}
          <div className="flex items-center justify-between mb-[5vh]">
            <span className="text-[11px] tracking-[0.25em] uppercase" style={{ color: '#4a4540' }}>
              พ.ศ. ๒๕๖๙
            </span>
            <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: '#4a4540' }}>
              Buddhist Lent
            </span>
          </div>

          {/* Countdown */}
          <div className="mb-[3vh]">
            <div
              className="font-black tabular-nums leading-none select-none"
              style={{
                fontSize: 'clamp(5.5rem, 20vw, 9rem)',
                color: '#c8893a',
                letterSpacing: '-0.04em',
              }}
            >
              {lent.days}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-px flex-1" style={{ background: '#222018' }} />
              <span className="text-xs" style={{ color: '#4a4540' }}>{lent.label}</span>
            </div>
          </div>

          {/* Title + description */}
          <div className="mb-[5vh]">
            <h1
              className="font-bold leading-snug mb-2"
              style={{ color: '#f0ead8', fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}
            >
              ระบบรายงานผลงดเหล้าเข้าพรรษา
            </h1>
            <p
              className="leading-relaxed"
              style={{ color: '#4a4540', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
            >
              รายงานจำนวนสมาชิกที่งดเหล้าและอัปโหลดภาพกิจกรรมจากหน่วยงานของท่าน
            </p>
          </div>

          {/* Nav */}
          <div style={{ borderTop: '1px solid #222018' }}>
            {nav.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className="group w-full flex items-center justify-between py-4 text-left transition-opacity hover:opacity-50"
                style={{ borderBottom: '1px solid #222018' }}
              >
                <div>
                  <span
                    className="block font-medium"
                    style={{ color: '#e8e0cc', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}
                  >
                    {item.label}
                  </span>
                  <span className="text-[11px]" style={{ color: '#4a4540' }}>{item.sub}</span>
                </div>
                <span
                  className="transition-transform duration-200 group-hover:translate-x-1 ml-4 flex-shrink-0"
                  style={{ color: '#c8893a', fontSize: '1.1rem' }}
                >
                  →
                </span>
              </button>
            ))}
          </div>

          {/* How to use */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="w-full flex items-center justify-between py-3 transition-opacity hover:opacity-50"
            >
              <span className="text-[11px] tracking-widest uppercase" style={{ color: '#4a4540' }}>
                วิธีการใช้งาน · How to Use
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                style={{ color: '#4a4540' }}
              />
            </button>

            {open && (
              <div
                className="grid grid-cols-4 gap-4 pt-4 mt-1"
                style={{ borderTop: '1px solid #222018' }}
              >
                {['ลงทะเบียน', 'รายงาน', 'อัปโหลด', 'ส่งข้อมูล'].map((th, i) => (
                  <div key={th}>
                    <div className="text-[10px] font-mono mb-1" style={{ color: '#c8893a' }}>
                      0{i + 1}
                    </div>
                    <div className="text-[11px]" style={{ color: '#4a4540' }}>{th}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="mt-[6vh] text-[10px]" style={{ color: '#2a2520' }}>
            © 2569 · Healthy Sobriety
          </p>

        </div>
      </div>
    </div>
  );
}
