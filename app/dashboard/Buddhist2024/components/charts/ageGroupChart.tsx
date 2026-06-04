// app/dashboard/Buddhist2024/components/charts/ageGroupChart.tsx
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getAgeGroupChartData2024 } from '../../actions/GetChartData';

interface AgeGroupData {
  name: string;
  value: number;
}

const AgeGroupChart: React.FC = () => {
  const [ageGroupData, setAgeGroupData] = useState<AgeGroupData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getAgeGroupChartData2024();
        if (result.success && result.data) {
          setAgeGroupData(result.data);
          setTotalCount(result.data.reduce((sum, item) => sum + item.value, 0));
        }
      } catch (error) {
        console.error('Error fetching age group data:', error);
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

  if (!ageGroupData.length) {
    return <div className="text-center text-xs text-emerald-600 py-8">ไม่พบข้อมูลกลุ่มอายุ</div>;
  }

  const option = {
    title: {
      text: 'การแบ่งตามกลุ่มอายุ',
      left: 'center',
      textStyle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#065F46'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'white',
      borderColor: '#A7F3D0',
      borderWidth: 1,
      textStyle: {
        fontSize: 11,
        color: '#374151'
      },
      formatter: (params: any) => {
        const data = params[0];
        const percentage = ((data.value / totalCount) * 100).toFixed(1);
        return `${data.name}<br/>${data.value.toLocaleString()} คน (${percentage}%)`;
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '20%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ageGroupData.map(item => item.name),
      axisLabel: {
        rotate: 30,
        fontSize: 10,
        color: '#6B7280',
        interval: 0
      },
      axisLine: {
        lineStyle: {
          color: '#E5E7EB'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: '#6B7280'
      },
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#F3F4F6'
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: ageGroupData.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5'][index % 6],
            borderRadius: [3, 3, 0, 0]
          }
        })),
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            shadowBlur: 6,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          }
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
      
      <div className="mt-3 grid grid-cols-3 gap-1">
        {ageGroupData.slice(0, 3).map((item, index) => {
          const bgColors = ['bg-emerald-50', 'bg-emerald-50', 'bg-emerald-50'];
          const textColors = ['text-emerald-700', 'text-emerald-700', 'text-emerald-700'];
          const percentage = ((item.value / totalCount) * 100).toFixed(1);
          
          return (
            <div key={item.name} className={`${bgColors[index]} rounded p-2 text-center`}>
              <div className={`text-xs ${textColors[index]} truncate mb-1`}>{item.name}</div>
              <div className={`text-xs font-medium ${textColors[index]}`}>{item.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{percentage}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgeGroupChart;