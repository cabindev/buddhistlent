import React, { useEffect, useState } from 'react';
import { getMonthlyExpenseSummary } from '../actions/GetChartData';

interface ExpenseSummary {
  total: number;
  average: number;
  participantCount: number;
}

const MonthlyExpenseSummary: React.FC<{ year?: number; zone?: string }> = ({ year, zone }) => {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getMonthlyExpenseSummary(year, zone);
        if (result.success && result.data) setSummary(result.data);
      } catch (error) {
        console.error('Error fetching monthly expense data:', error);
      }
    };

    fetchData();
  }, [year, zone]);

  if (!summary) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[oklch(68%_0.196_126.665)] border-t-transparent"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="h-full flex flex-col justify-center gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[oklch(95%_0.196_126.665)] text-center">
          <div className="text-lg font-medium text-black">{formatCurrency(summary.total)}</div>
          <div className="text-xs text-gray-500 mt-1">ยอดรวมทั้งหมด</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[oklch(95%_0.196_126.665)] text-center">
          <div className="text-lg font-medium text-[oklch(68%_0.196_126.665)]">{formatCurrency(summary.average)}</div>
          <div className="text-xs text-gray-500 mt-1">ค่าเฉลี่ยต่อคน</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[oklch(95%_0.196_126.665)] text-center">
          <div className="text-lg font-medium text-black">{summary.participantCount.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">จำนวนผู้ให้ข้อมูล</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[oklch(97%_0.196_126.665)] p-4 rounded-lg border border-[oklch(95%_0.196_126.665)] text-center">
          <div className="text-lg font-medium text-[oklch(56%_0.196_126.665)]">{formatCurrency(summary.total * 3)}</div>
          <div className="text-xs text-gray-500 mt-1">ประหยัดได้ ถ้างดตลอด 3 เดือน (เข้าพรรษา)</div>
        </div>
        <div className="bg-[oklch(97%_0.196_126.665)] p-4 rounded-lg border border-[oklch(95%_0.196_126.665)] text-center">
          <div className="text-lg font-medium text-[oklch(56%_0.196_126.665)]">{formatCurrency(summary.total * 12)}</div>
          <div className="text-xs text-gray-500 mt-1">ประหยัดได้ ถ้างดตลอดปี</div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpenseSummary;
