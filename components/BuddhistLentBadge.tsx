// app/components/BuddhistLentBadge.tsx - Badge แสดงสถานะเข้าพรรษาขนาดเล็ก
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface BuddhistLentBadgeProps {
  className?: string;
}

export default function BuddhistLentBadge({ className = '' }: BuddhistLentBadgeProps) {
  const [lentInfo, setLentInfo] = useState({
    days: 0,
    message: '',
    isLentStarted: false
  });

  useEffect(() => {
    const calculateDays = () => {
      const now = new Date();
      
      // วันเข้าพรรษา วันศุกร์ที่ 11 กรกฎาคม 2568 (2025)
      const lentStartDate = new Date('2025-07-11T00:00:00');
      
      // วันออกพรรษา วันอังคารที่ 7 ตุลาคม 2568 (2025)
      const lentEndDate = new Date('2025-10-07T23:59:59');
      
      if (now < lentStartDate) {
        // ยังไม่เข้าพรรษา - นับถอยหลัง
        const timeDiff = lentStartDate.getTime() - now.getTime();
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        setLentInfo({
          days,
          message: `อีก ${days} วัน เริ่มต้นวันเข้าพรรษา`,
          isLentStarted: false
        });
      } else if (now >= lentStartDate && now <= lentEndDate) {
        // อยู่ในช่วงเข้าพรรษา - นับวันที่ผ่านมา
        const timeDiff = now.getTime() - lentStartDate.getTime();
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 เพื่อรวมวันแรก
        
        setLentInfo({
          days,
          message: `เข้าพรรษามาแล้ว ${days} วัน`,
          isLentStarted: true
        });
      } else {
        // หลังออกพรรษาแล้ว
        setLentInfo({
          days: 0,
          message: 'ออกพรรษาแล้ว',
          isLentStarted: true
        });
      }
    };

    calculateDays();
    // อัพเดตทุกๆ 1 ชั่วโมง (3600000ms) เพื่อประหยัดทรัพยากร
    const interval = setInterval(calculateDays, 3600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5 text-sm ${className}`}>
      <Calendar className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
      <span className={`font-medium whitespace-nowrap ${
        lentInfo.isLentStarted ? 'text-green-700' : 'text-orange-700'
      }`}>
        {lentInfo.message}
      </span>
    </div>
  );
}