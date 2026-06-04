'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Building2, Users, BarChart3, FileText,
  CheckCircle, Calendar, Award
} from 'lucide-react';

function BuddhistLentBadge({ className = '' }) {
  const [info, setInfo] = React.useState({ message: '', isLentStarted: false });

  React.useEffect(() => {
    const calc = () => {
      const now = new Date();
      // วันเข้าพรรษา 2569 (31 ก.ค. 2026)
      const start = new Date('2026-07-31T00:00:00');
      // วันออกพรรษา 2569 (27 ต.ค. 2026)
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

  const features = [
    {
      icon: <Building2 className="w-8 h-8 text-orange-600" />,
      title: 'ลงทะเบียนองค์กร',
      description: 'ลงข้อมูลหน่วยงาน/องค์กรที่เข้าร่วมงดเหล้าเข้าพรรษา',
      action: () => router.push('/organization/create'),
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: 'รายงานจำนวนผู้เข้าร่วม',
      description: 'บันทึกจำนวนสมาชิกที่งดเหล้าในหน่วยงาน',
      action: () => router.push('/organization'),
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: 'สถิติและรายงาน',
      description: 'ดูสถิติการเข้าร่วมจากทุกหน่วยงาน',
      action: () => router.push('/dashboard'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">

        <BuddhistLentBadge />

        {/* Hero */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
            <Award className="w-4 h-4 mr-2" />
            ระบบรายงานผลงดเหล้าเข้าพรรษา | Buddhist Lent Report System พ.ศ. 2569
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              ระบบรายงานผลงดเหล้าเข้าพรรษา
              <span className="text-orange-600"> พ.ศ. 2569</span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-medium text-orange-700">
              Buddhist Lent Report System 2026
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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

        {/* How it Works */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">วิธีการใช้งาน | How to Use</h3>
            <p className="text-gray-600">ขั้นตอนการรายงานข้อมูลการงดเหล้าเข้าพรรษา | Steps to report Buddhist Lent abstinence data</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'ลงทะเบียน | Register',       description: 'กรอกข้อมูลหน่วยงาน/องค์กรและผู้ติดต่อ | Fill in organization and contact information', icon: <Building2 className="w-6 h-6" /> },
              { step: '2', title: 'รายงานจำนวน | Report Numbers', description: 'บันทึกจำนวนสมาชิกที่งดเหล้าในหน่วยงาน | Record number of abstaining members',         icon: <Users className="w-6 h-6" /> },
              { step: '3', title: 'อัปโหลดภาพ | Upload Images',  description: 'แนบรูปภาพกิจกรรมหรือหลักฐานประกอบ | Attach activity photos or supporting evidence',   icon: <FileText className="w-6 h-6" /> },
              { step: '4', title: 'ส่งข้อมูล | Submit Data',     description: 'ยืนยันและส่งข้อมูลเข้าสู่ระบบ | Confirm and submit data to system',                    icon: <CheckCircle className="w-6 h-6" /> },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mx-auto">
                    {item.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {item.step}
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-orange-300 cursor-pointer group flex flex-col items-center text-center"
              onClick={feature.action}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 mb-3 group-hover:bg-orange-100 transition-colors duration-200">
                {React.cloneElement(feature.icon, { className: 'w-6 h-6' })}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{feature.description}</p>
              <span className="inline-flex items-center text-xs text-orange-600 font-medium px-3 py-1 rounded-full bg-orange-50 group-hover:bg-orange-100 transition">
                เริ่มต้นใช้งาน
                <ArrowRight className="w-3 h-3 ml-1" />
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">ระบบรายงานผลงดเหล้าเข้าพรรษา พุทธศักราช 2569</p>
            <p className="text-xs text-gray-500">Buddhist Lent Report System 2026 - เพื่อส่งเสริมการงดเหล้าในช่วงเข้าพรรษา</p>
          </div>
        </div>

      </div>
    </div>
  );
}
