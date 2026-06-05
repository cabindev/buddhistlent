'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, FileText, BarChart3,
  ChevronDown, ChevronRight, Calendar, Flame
} from 'lucide-react';

function useLentCountdown() {
  const [info, setInfo] = React.useState({ message: '', sub: '', isActive: false });
  React.useEffect(() => {
    const calc = () => {
      const now = new Date();
      const start = new Date('2026-07-31T00:00:00');
      const end = new Date('2026-10-27T23:59:59');
      if (now < start) {
        const days = Math.ceil((start.getTime() - now.getTime()) / 86400000);
        setInfo({ message: `${days}`, sub: 'วันก่อนเข้าพรรษา', isActive: false });
      } else if (now <= end) {
        const days = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
        setInfo({ message: `${days}`, sub: 'วันแห่งการงดเหล้า', isActive: true });
      } else {
        setInfo({ message: '—', sub: 'ออกพรรษาแล้ว', isActive: false });
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
  const [howToOpen, setHowToOpen] = React.useState(false);

  const actions = [
    {
      icon: <Building2 className="w-6 h-6" />,
      label: 'ลงทะเบียนหน่วยงาน',
      sub: 'Register Organization',
      color: 'bg-orange-500',
      href: '/organization/create',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      label: 'ดูข้อมูลที่ส่งแล้ว',
      sub: 'View Submissions',
      color: 'bg-amber-500',
      href: '/organization',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      label: 'สถิติและรายงาน',
      sub: 'Statistics & Reports',
      color: 'bg-stone-600',
      href: '/dashboard',
    },
  ];

  const steps = [
    { n: '1', th: 'ลงทะเบียน', en: 'Register', icon: <Building2 className="w-5 h-5" /> },
    { n: '2', th: 'รายงานจำนวน', en: 'Report', icon: <FileText className="w-5 h-5" /> },
    { n: '3', th: 'อัปโหลดภาพ', en: 'Upload', icon: <Calendar className="w-5 h-5" /> },
    { n: '4', th: 'ส่งข้อมูล', en: 'Submit', icon: <Flame className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-b from-orange-600 to-orange-500 px-5 pt-10 pb-16">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
            <Flame className="w-3.5 h-3.5" />
            Buddhist Lent Report System 2026
          </div>

          <h1 className="text-3xl font-bold text-white leading-snug">
            ระบบรายงานผล<br />งดเหล้าเข้าพรรษา
            <span className="block text-orange-200 text-xl font-medium mt-1">พุทธศักราช ๒๕๖๙</span>
          </h1>

          <p className="text-orange-100 text-sm leading-relaxed max-w-xs mx-auto">
            รายงานจำนวนสมาชิกที่งดเหล้า พร้อมอัปโหลดภาพกิจกรรมจากหน่วยงานของท่าน
          </p>

          {/* Countdown pill */}
          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl ${lent.isActive ? 'bg-green-500/90' : 'bg-white/20'} backdrop-blur-sm`}>
            <span className="text-3xl font-bold text-white tabular-nums">{lent.message}</span>
            <span className="text-white/90 text-sm text-left leading-tight">{lent.sub}</span>
          </div>
        </div>
      </div>

      {/* Action Cards — overlap hero */}
      <div className="max-w-lg mx-auto px-5 -mt-6 space-y-3">
        {actions.map((a) => (
          <button
            key={a.href}
            type="button"
            onClick={() => router.push(a.href)}
            className="w-full flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 text-left"
          >
            <div className={`${a.color} w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* How to Use — collapsible */}
      <div className="max-w-lg mx-auto px-5 mt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setHowToOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <div>
              <span className="text-sm font-semibold text-gray-700">วิธีการใช้งาน</span>
              <span className="text-sm text-gray-400 ml-1.5">| How to Use</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${howToOpen ? 'rotate-180' : ''}`} />
          </button>

          {howToOpen && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4 grid grid-cols-4 gap-3">
              {steps.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="relative mx-auto w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-2">
                    {s.icon}
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {s.n}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">{s.th}</p>
                  <p className="text-[10px] text-gray-400">{s.en}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-lg mx-auto px-5 py-10 text-center">
        <p className="text-xs text-gray-400">ระบบรายงานผลงดเหล้าเข้าพรรษา © 2569</p>
      </div>

    </div>
  );
}
