import React, { useEffect, useState } from 'react';
import { getHealthImpactChartData } from '../actions/GetChartData';

interface HealthImpactData {
  [key: string]: number;
}

const HealthImpactChart: React.FC<{ year?: number }> = ({ year }) => {
  const [data, setData] = useState<HealthImpactData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getHealthImpactChartData(year);
        if (result.success && result.data) {
          const map: HealthImpactData = {};
          result.data.forEach(r => { map[r.name] = r.value; });
          setData(map);
        }
      } catch (error) {
        console.error('Error fetching health impact data:', error);
      }
    };

    fetchData();
  }, []);

  if (!data) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const levels = [
    { key: 'ไม่มีผลกระทบ', color: 'bg-green-500' },
    { key: 'มีผลกระทบแต่ไม่ต้องการช่วยเหลือ', color: 'bg-yellow-500' },
    { key: 'มีผลกระทบและควรได้รับการช่วยเหลือจากแพทย์หรือผู้เชี่ยวชาญด้านการบำบัดฯ', color: 'bg-red-500' }
  ];

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">ผลกระทบต่อสุขภาพ</h2>
      <div className="space-y-6">
        {levels.map((level) => {
          const count = data[level.key] || 0;
          const percentage = (count / total) * 100;
          return (
            <div key={level.key} className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:w-1/2 text-sm md:text-base">{level.key}</div>
              <div className="w-full md:w-1/2 flex items-center gap-4">
                <div className="flex-grow h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${level.color} transition-all duration-500 ease-out`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="min-w-[100px] text-right text-sm">
                  {count.toLocaleString()} คน ({percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center mt-8 text-gray-600">
        จำนวนผู้ตอบแบบสอบถามทั้งหมด: <span className="font-semibold">{total.toLocaleString()}</span> คน
      </p>
    </div>
  );
};

export default HealthImpactChart;