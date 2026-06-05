'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Building2, Users, FileText,
  CheckCircle, Calendar, Award, ChevronDown
} from 'lucide-react';

function BuddhistLentBadge({ className = '' }) {
  const [info, setInfo] = React.useState({ message: '', isLentStarted: false });

  React.useEffect(() => {
    const calc = () => {
      const now = new Date();
      const start = new Date('2026-07-31T00:00:00');
      const end = new Date('2026-10-27T23:59:59');
      if (now < start) {
        const days = Math.ceil((start.getTime() - now.getTime()) / 86400000);
        setInfo({ message: `อีก ${days} วัน เริ่มต้นวันเข้าพรรษา`, isLentStarted: false });
      } else if (now <= end) {
        const days = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
        setInfo({ message: `เข้าพรรษามาแล้ว ${days} วัน`, isLentStarted: true });
      } else {
        setInfo({ message: 'ออกพรรษาแล้ว', isLentStarted: true });
      }
    };
    calc();
    const t = setInterval(calc, 3600000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5 text-sm ${className}`}>
      <Calendar className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
      <span className={`font-medium whitespace-nowrap ${info.isLentStarted ? 'text-green-700' : 'text-orange-700'}`}>
        {info.message}
      </span>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [howToOpen, setHowToOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        <BuddhistLentBadge />

        {/* Hero */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
            <Award className="w-4 h-4 mr-2" />
            ระบบรายงานผลงดเหล้าเข้าพรรษา | Buddhist Lent Report System พ.ศ. 2569
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              ระบบรายงานผลงดเหล้าเข้าพรรษา
              <span className="text-orange-600"> พ.ศ. 2569</span>
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              ระบบสำหรับหน่วยงาน องค์กร และชุมชน ในการรายงานจำนวนสมาชิกที่เข้าร่วมงดเหล้าเข้าพรรษา
              พร้อมอัปโหลดภาพประกอบกิจกรรม
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => router.push('/organization/create')}
              className="inline-flex items-center bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Building2 className="w-5 h-5 mr-2" />
              ลงทะเบียนหน่วยงาน
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button
              type="button"
              onClick={() => router.push('/organization')}
              className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-lg border border-gray-300 transition-all duration-300"
            >
              <FileText className="w-5 h-5 mr-2" />
              ดูข้อมูลที่ส่งแล้ว
            </button>
          </div>
        </div>

        {/* How it Works — collapsible */}
        <div className="bg-amber-50 rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setHowToOpen(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-orange-50 transition-colors"
          >
            <span className="text-base font-semibold text-gray-700">
              วิธีการใช้งาน <span className="text-gray-400 font-normal">| How to Use</span>
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${howToOpen ? 'rotate-180' : ''}`} />
          </button>

          {howToOpen && (
            <div className="border-t border-orange-100 px-6 py-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { step: '1', title: 'ลงทะเบียน', desc: 'กรอกข้อมูลหน่วยงานและผู้ติดต่อ', icon: <Building2 className="w-5 h-5" /> },
                  { step: '2', title: 'รายงานจำนวน', desc: 'บันทึกจำนวนสมาชิกที่งดเหล้า', icon: <Users className="w-5 h-5" /> },
                  { step: '3', title: 'อัปโหลดภาพ', desc: 'แนบรูปภาพกิจกรรมประกอบ', icon: <FileText className="w-5 h-5" /> },
                  { step: '4', title: 'ส่งข้อมูล', desc: 'ยืนยันและส่งข้อมูลเข้าสู่ระบบ', icon: <CheckCircle className="w-5 h-5" /> },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="relative mx-auto w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-3">
                      {item.icon}
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.step}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">ระบบรายงานผลงดเหล้าเข้าพรรษา พุทธศักราช 2569</p>
        </div>

      </div>
    </div>
  );
}
