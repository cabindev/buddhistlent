import React, { useEffect, useState } from 'react';
import { getMonthlyExpenseSummary } from '../actions/GetChartData';

interface ExpenseSummary {
  total: number;
  average: number;
  participantCount: number;
}

const MonthlyExpenseSummary: React.FC<{ year?: number }> = ({ year }) => {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getMonthlyExpenseSummary(year);
        if (result.success && result.data) setSummary(result.data);
      } catch (error) {
        console.error('Error fetching monthly expense data:', error);
      }
    };

    fetchData();
  }, []);

  if (!summary) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
  };

  const campaignSavings = summary.total * 3; // 3 เดือนของแคมเปญ
  const annualSavings = summary.total * 12; // 1 ปีเต็ม

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        สรุปค่าใช้จ่ายรายเดือนในการดื่มแอลกอฮอล์
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-white mb-1">
            ยอดรวมทั้งหมด
          </h3>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(summary.total)}
          </p>
        </div>
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-white mb-1">
            ค่าเฉลี่ยต่อคน
          </h3>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(summary.average)}
          </p>
        </div>
      </div>
      <p className="text-center text-base text-gray-600 mb-6">
        จำนวนผู้ให้ข้อมูล:{" "}
        <span className="font-semibold">
          {new Intl.NumberFormat("th-TH").format(summary.participantCount)}
        </span>{" "}
        คน
      </p>
      <div className="bg-slate-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          ข้อมูลน่าสนใจ :
        </h3>
        <p className="text-base text-gray-700 mb-2">
          หากทุกคนเลิกดื่ม 3 เดือนช่วงเข้าพรรษานี้ จะประหยัดเงินได้{" "}
          
          <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
            {formatCurrency(campaignSavings)}
          </span>

        </p>
        <p className="text-base text-gray-700">
          และหากทุกคนเลิกดื่มต่อเนื่อง จะประหยัดได้{" "}
          <span className="font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">
            {formatCurrency(annualSavings)}
          </span>{" "}
          ต่อปี
        </p>
      </div>
    </div>
  );
};

export default MonthlyExpenseSummary;