'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ChevronDown, ChevronRight, LayoutDashboard, ClipboardList, PlusCircle } from 'lucide-react';
import { getAllOrganizationCategoryNames } from '@/app/organization/actions/Get';

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
        setInfo({ days: String(d), label: 'งดเหล้า เข้าพรรษา', pct: Math.round((d / total) * 100) });
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

const steps = ['ลงทะเบียน', 'รายงาน', 'อัปโหลด', 'ส่งข้อมูล'];
function TypewriterOrg({ items }: { items: { name: string }[] }) {
  const [display, setDisplay] = React.useState('');
  const [orgIdx, setOrgIdx] = React.useState(0);
  const [phase, setPhase] = React.useState<'typing' | 'pause'>('typing');
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (!items.length) return;
    const name = items[orgIdx].name;

    if (phase === 'typing') {
      if (display.length < name.length) {
        const t = setTimeout(() => setDisplay(name.slice(0, display.length + 1)), 65);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase('pause'), 2000);
        return () => clearTimeout(t);
      }
    }
    if (phase === 'pause') {
      setVisible(false);
      const t = setTimeout(() => {
        setDisplay('');
        setOrgIdx(i => (i + 1) % items.length);
        setVisible(true);
        setPhase('typing');
      }, 400);
      return () => clearTimeout(t);
    }
  }, [display, phase, orgIdx, items]);

  return (
    <span
      className="text-sm font-medium text-amber-500 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {display}
      <span className="inline-block w-0.5 h-4 bg-amber-500 ml-0.5 align-middle animate-pulse" />
    </span>
  );
}

export default function Home() {
  const router = useRouter();
  const lent = useLentCountdown();
  const [open, setOpen] = React.useState(true);
  const [orgNames, setOrgNames] = React.useState<{ name: string }[]>([]);

  React.useEffect(() => {
    getAllOrganizationCategoryNames().then(names => setOrgNames(names.map(n => ({ name: n }))));
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 selection:bg-amber-200/50 overflow-x-hidden">
      
      {/* Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-300/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-300/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 flex flex-col items-center">
        
        {/* Top Logo */}
        <div className="mb-8 animate-fade-in-down">
          <img 
            src="/Buddhist-lent.png" 
            alt="Buddhist Lent Logo" 
            className="h-24 md:h-32 w-auto object-contain transition-all duration-500 hover:scale-105"
          />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white border border-stone-200 text-[10px] tracking-[0.2em] text-stone-500 uppercase shadow-sm animate-pulse">
            Buddhist Lent · พ.ศ. 2569
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
            <span className="text-stone-800">ระบบรายงานผล</span>
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent ml-3">
              งดเหล้าเข้าพรรษา
            </span>
          </h1>
          
          <p className="text-stone-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            รายงานงดเหล้าเข้าพรรษา
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12">
          
          {/* Main CTA: Register */}
          <button 
            onClick={() => router.push('/organization/create')}
            className="md:col-span-2 group relative overflow-hidden rounded-3xl p-[1px] transition-transform active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 animate-[gradient_3s_linear_infinite] bg-[length:200%_auto]" />
            <div className="relative h-full bg-white rounded-[23px] p-6 flex flex-col justify-between items-start text-left min-h-[200px]">
              <div className="flex items-center justify-between w-full">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
                  <PlusCircle className="w-5 h-5 text-amber-600" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-stone-300 group-hover:text-amber-600 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>

              {/* Typewriter */}
              {orgNames.length > 0 && (
                <div className="w-full">
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">หน่วยงานร่วม</p>
                  <TypewriterOrg items={orgNames} />
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold mb-1 text-stone-800 group-hover:text-amber-600 transition-colors">ลงทะเบียนหน่วยงาน</h3>
                <p className="text-stone-500 text-sm">เริ่มต้นการรายงานข้อมูลของหน่วยงานท่าน</p>
              </div>
            </div>
          </button>

          {/* Countdown Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-8 flex flex-col justify-between min-h-[200px] shadow-sm">
            <div className="text-[10px] text-stone-400 tracking-widest uppercase w-full text-left">Countdown</div>
            <div className="my-auto text-center flex flex-col items-center justify-center">
              <div className="text-7xl md:text-8xl font-bold tabular-nums tracking-tighter mb-2 bg-gradient-to-b from-amber-400 to-amber-600 bg-clip-text text-transparent">
                {lent.days}
              </div>
              <p className="text-sm md:text-base text-stone-500 font-medium">{lent.label}</p>
            </div>
            {lent.pct > 0 ? (
              <div className="mt-4 h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000" 
                  style={{ width: `${lent.pct}%` }} 
                />
              </div>
            ) : (
              <div className="mt-4 h-1 w-full" />
            )}
          </div>

          {/* Submissions */}
          <button 
            onClick={() => router.push('/organization')}
            className="group bg-white border border-stone-200 rounded-3xl p-6 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between items-start text-left min-h-[160px] shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
              <ClipboardList className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h4 className="font-medium text-stone-800 group-hover:text-amber-600 transition-colors">ดูข้อมูลที่ส่งแล้ว</h4>
              <p className="text-[10px] text-stone-500 mt-1">View Submissions</p>
            </div>
          </button>

          {/* Statistics */}
          <button 
            onClick={() => router.push('/dashboard')}
            className="group bg-white border border-stone-200 rounded-3xl p-6 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between items-start text-left min-h-[160px] shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100">
              <LayoutDashboard className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h4 className="font-medium text-stone-800 group-hover:text-amber-600 transition-colors">สถิติและรายงาน</h4>
              <p className="text-[10px] text-stone-500 mt-1">Statistics & Reports</p>
            </div>
          </button>

          {/* How to use */}
          <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
            <button 
              type="button" 
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors"
            >
              <span className="text-[10px] tracking-widest text-stone-500 uppercase">วิธีการใช้งาน</span>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="px-6 pb-6 pt-2 grid grid-cols-2 gap-4 border-t border-stone-100 animate-fade-in-up">
                {steps.map((th, i) => (
                  <div key={th} className="flex gap-3 items-center">
                    <span className="text-[10px] font-mono text-stone-400">0{i + 1}</span>
                    <span className="text-xs text-stone-600">{th}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-12 text-center space-y-4">
          <p className="text-[10px] text-stone-400 tracking-[0.3em] uppercase">
            © 2569 Buddhist Lent · สำนักงานเครือข่ายองค์กรงดเหล้า
          </p>
          <div className="flex gap-4 justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
             <div className="w-1.5 h-1.5 rounded-full bg-orange-400/50" />
          </div>
        </footer>

      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
