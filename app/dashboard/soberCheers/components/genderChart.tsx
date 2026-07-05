// app/dashboard/soberCheers/components/genderChart.tsx
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { getGenderChartData } from '../actions/GetChartData';

interface SoberCheersData {
  gender: string;
}

const GenderChart: React.FC<{ year?: number }> = ({ year }) => {
  const [chartData, setChartData] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getGenderChartData(year);
        if (result.success && result.data) {
          const map: Record<string, number> = {};
          result.data.forEach(r => { map[r.name] = r.value; });
          setChartData(map);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const option = {
    title: {
      text: '',
      left: 'center',
      textStyle: {
        fontSize: 13,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const total = Object.values(chartData).reduce((s,v) => s+v, 0);
        const percentage = ((params.value / total) * 100).toFixed(1);
        return `${params.name}: ${params.value.toLocaleString()} คน (${percentage}%)`;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 20,
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: 'เพศ',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        data: Object.entries(chartData).map(([name, value]) => ({
          name,
          value
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 3
        },
        label: {
          show: true,
          formatter: '{b}: {c} คน\n({d}%)',
          fontSize: 12
        }
      }
    ],
    color: [
      '#16A34A', // ชาย
      '#4ADE80', // หญิง
      '#111111', // LGBTQ+
      '#86EFAC', // others
    ]
  };


  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-red-500 py-8">{error}</div>
      </div>
    );
  }

  if (Object.values(chartData).reduce((s,v) => s+v, 0) === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-gray-500 py-8">ไม่มีข้อมูล</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">

      {/* Chart */}
      <div className="mb-6">
        <ReactECharts
          option={option}
          style={{ height: '300px', width: '100%' }}
        />
      </div>

      {/* Gender Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(chartData).map(([gender, count]) => {
          const percentage = ((count / Object.values(chartData).reduce((s,v) => s+v, 0)) * 100).toFixed(1);
          
          return (
            <div
              key={gender}
              className="text-center p-4 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md"
            >
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-800">{gender}</span>
              </div>

              <div className="space-y-1">
                <div className="text-lg font-medium text-gray-900">
                  {count.toLocaleString()} คน
                </div>
                <div className="text-xs text-gray-600">
                  {percentage}% ของผู้เข้าร่วม
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 bg-white bg-opacity-50 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: gender === 'ชาย' ? '#16A34A' : 
                                   gender === 'หญิง' ? '#4ADE80' : '#111111'
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <h4 className="text-xs font-medium text-gray-700 mb-2">สรุปข้อมูล</h4>
          <div className="text-sm font-medium text-gray-900">
            ผู้เข้าร่วมทั้งหมด: {Object.values(chartData).reduce((s,v) => s+v, 0).toLocaleString()} คน
          </div>
          <div className="text-xs text-gray-600 mt-1">
            แบ่งตามเพศ {Object.keys(chartData).length} ประเภท
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderChart;