// app/dashboard/Buddhist2024/components/charts/regionChart.tsx
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getRegionChartData2024 } from '../../actions/GetChartData';

interface RegionData {
  name: string;
  value: number;
}

const RegionChart: React.FC = () => {
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getRegionChartData2024();
        if (result.success && result.data) {
          const sortedData = result.data.sort((a, b) => b.value - a.value);
          setRegionData(sortedData);
          setTotalCount(sortedData.reduce((sum, item) => sum + item.value, 0));

          const labels = sortedData.map(item => item.name);
          const data = sortedData.map(item => item.value);
          setChartData({ labels, data });
        }
      } catch (error) {
        console.error('Error fetching region data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculatePercentage = (count: number, total: number) => {
    if (total === 0) return '0.0';
    return ((count / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border border-emerald-200 border-t-emerald-500"></div>
        <span className="ml-2 text-xs text-emerald-600">กำลังโหลด...</span>
      </div>
    );
  }

  if (!regionData.length) {
    return <div className="text-center text-xs text-emerald-600 py-8">ไม่พบข้อมูลภูมิภาค</div>;
  }

  const option = {
    title: {
      text: 'ภูมิภาคที่เข้าร่วม',
      left: 'center',
      textStyle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#065F46'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'white',
      borderColor: '#A7F3D0',
      borderWidth: 1,
      textStyle: {
        fontSize: 11,
        color: '#374151'
      },
      formatter: (params: any) => {
        const param = params[0];
        const percentage = calculatePercentage(param.value, totalCount);
        return `${param.name}: ${param.value.toLocaleString()} คน (${percentage}%)`;
      }
    },
    grid: {
      left: '20%',
      right: '10%',
      bottom: '10%',
      top: '15%',
      containLabel: false
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 9,
        color: '#6B7280'
      },
      axisLine: {
        lineStyle: {
          color: '#E5E7EB'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#F3F4F6',
          type: 'solid'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: chartData?.labels || [],
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        fontSize: 10,
        color: '#374151'
      }
    },
    series: [
      {
        type: 'bar',
        data: chartData?.data || [],
        itemStyle: {
          color: (params: any) => {
            const colors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];
            return colors[params.dataIndex % colors.length];
          },
          borderRadius: [0, 3, 3, 0]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 6,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => {
            const percentage = calculatePercentage(params.value, totalCount);
            return `${params.value.toLocaleString()} (${percentage}%)`;
          },
          fontSize: 9,
          color: '#374151'
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
      
      <div className="mt-3 space-y-1.5">
        {regionData.slice(0, 5).map((item, index) => {
          const colors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];
          const bgColors = ['bg-emerald-50', 'bg-emerald-50', 'bg-emerald-50', 'bg-emerald-50', 'bg-emerald-50'];
          const textColors = ['text-emerald-700', 'text-emerald-700', 'text-emerald-700', 'text-emerald-700', 'text-emerald-700'];
          
          const color = colors[index % colors.length];
          const bgColor = bgColors[index % bgColors.length];
          const textColor = textColors[index % textColors.length];
          const percentage = calculatePercentage(item.value, totalCount);
          
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

export default RegionChart;