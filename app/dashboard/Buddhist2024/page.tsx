// app/dashboard/Buddhist2024/page.tsx
import React from 'react';
import DashboardBuddhist2024 from './components/charts/allChartBuddhist2024';

export const metadata = {
  title: 'Buddhist Lent 2024 Dashboard',
  description: 'แดชบอร์ดสำหรับติดตามและวิเคราะห์ข้อมูลผู้เข้าร่วมกิจกรรมเข้าพรรษา พ.ศ. 2567',
};

export default function Buddhist2024DashboardPage() {
  return (
    <div className="w-full">
      <DashboardBuddhist2024 />
    </div>
  );
}