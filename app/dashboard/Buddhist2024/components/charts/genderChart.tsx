// app/dashboard/Buddhist2024/components/charts/genderChart.tsx
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getGenderChartData2024 } from '../../actions/GetChartData';

interface GenderData {
  name: string;
  value: number;
}

const GenderChart: React.FC = () => {
  const [genderData, setGenderData] = useState<GenderData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getGenderChartData2024();
        if (result.success && result.data) {
          setGenderData(result.data);
          setTotalCount(result.data.reduce((sum, item) => sum + item.value, 0));
        }
      } catch (error) {
        console.error('Error fetching gender data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border border-emerald-200 border-t-emerald-500"></div>
        <span className="ml-2 text-xs text-emerald-600">กำลังโหลด...</span>
      </div>
    );
  }

  if (!genderData.length) {
    return <div className="text-center text-xs text-emerald-600 py-8">ไม่พบข้อมูลเพศ</div>;
  }

  const option = {
    title: {
      text: 'การแบ่งตามเพศ',
      left: 'center',
      textStyle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#065F46'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'white',
      borderColor: '#A7F3D0',
      borderWidth: 1,
      textStyle: {
        fontSize: 11,
        color: '#374151'
      },
      formatter: (params: any) => {
        const percentage = ((params.value / totalCount) * 100).toFixed(1);
        return `${params.name}: ${params.value.toLocaleString()} คน (${percentage}%)`;
      }
    },
    series: [
      {
        name: 'เพศ',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '55%'],
        data: genderData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: ['#10B981', '#34D399', '#6EE7B7'][index % 3] // Emerald/Green tones
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          }
        },
        label: {
          show: true,
          formatter: (params: any) => {
            const percentage = ((params.value / totalCount) * 100).toFixed(1);
            return `${params.name}\n${percentage}%`;
          },
          fontSize: 10,
          fontWeight: '400',
          color: '#065F46'
        }
      }
    ]
  };

  return (
    <div className="bg-white h-full flex flex-col">
      <div className="flex-1">
        <ReactECharts
          option={option}
          style={{ height: '240px', width: '100%' }}
        />
      </div>
      
      {/* Summary - Compact Design */}
      <div className="mt-3 space-y-1.5">
        {genderData.map((item, index) => {
          const colors = ['#10B981', '#34D399', '#6EE7B7']; // Emerald/Green tones
          const bgColors = ['bg-emerald-50', 'bg-emerald-50', 'bg-emerald-50'];
          const textColors = ['text-emerald-700', 'text-emerald-700', 'text-emerald-700'];
          
          const color = colors[index % colors.length];
          const bgColor = bgColors[index % bgColors.length];
          const textColor = textColors[index % textColors.length];
          const percentage = ((item.value / totalCount) * 100).toFixed(1);
          
          return (
            <div key={item.name} className={`flex items-center justify-between py-1.5 px-2 rounded ${bgColor} hover:opacity-80 transition-opacity`}>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className={`text-xs font-normal ${textColor}`}>{item.name}</span>
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${textColor}`}>{item.value.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GenderChart;