// app/dashboard/Buddhist2024/components/charts/provinceChart.tsx
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getTop10ProvincesChartData2024 } from '../../actions/GetChartData';

interface ProvinceData {
  name: string;
  value: number;
}

const ProvinceChart: React.FC = () => {
  const [provinceData, setProvinceData] = useState<ProvinceData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getTop10ProvincesChartData2024();
        if (result.success && result.data) {
          const sortedData = result.data.sort((a, b) => b.value - a.value);
          setProvinceData(sortedData);
          setTotalCount(sortedData.reduce((sum, item) => sum + item.value, 0));
        }
      } catch (error) {
        console.error('Error fetching province data:', error);
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

  if (!provinceData.length) {
    return <div className="text-center text-xs text-emerald-600 py-8">ไม่พบข้อมูลจังหวัด</div>;
  }

  const chartData = provinceData.slice().reverse();
  const yAxisLabels = chartData.map((item, index) => {
    const rank = provinceData.length - index;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
    return `${medal} ${item.name}`;
  });

  const option = {
    title: {
      text: 'TOP 10 จังหวัด',
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
        color: '#065F46'
      },
      formatter: (params: any) => {
        const data = params[0];
        const realIndex = provinceData.length - 1 - data.dataIndex;
        const province = provinceData[realIndex];
        const percentage = ((province.value / totalCount) * 100).toFixed(1);
        return `${province.name}: ${province.value.toLocaleString()} คน (${percentage}%)`;
      }
    },
    grid: {
      left: '25%',
      right: '10%',
      top: '15%',
      bottom: '10%'
    },
    xAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#D1FAE5'
        }
      },
      axisLabel: {
        fontSize: 10,
        color: '#065F46'
      },
      splitLine: {
        lineStyle: {
          color: '#F0FDF4',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: yAxisLabels,
      axisLine: {
        lineStyle: {
          color: '#D1FAE5'
        }
      },
      axisLabel: {
        fontSize: 10,
        color: '#065F46',
        formatter: (value: string) => {
          return value.length > 12 ? `${value.substring(0, 10)}...` : value;
        }
      },
      splitLine: {
        show: false
      }
    },
    series: [
      {
        type: 'bar',
        data: chartData.map((item, index) => {
          const rank = provinceData.length - index;
          let color;
          
          if (rank === 1) {
            color = '#10B981'; // Gold equivalent in emerald
          } else if (rank === 2) {
            color = '#34D399'; // Silver equivalent in emerald
          } else if (rank === 3) {
            color = '#6EE7B7'; // Bronze equivalent in emerald
          } else {
            color = '#A7F3D0'; // Regular emerald for others
          }

          return {
            value: item.value,
            itemStyle: {
              color: color,
              borderRadius: [0, 4, 4, 0]
            }
          };
        }),
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          fontSize: 9,
          color: '#065F46',
          formatter: '{c}'
        }
      }
    ]
  };

  return (
    <div className="bg-white h-full flex flex-col">
      <div className="flex-1">
        <ReactECharts
          option={option}
          style={{ height: '280px', width: '100%' }}
        />
      </div>
      
      <div className="mt-2 pt-3 border-t border-emerald-50">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {provinceData.slice(0, 6).map((item, index) => {
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            const percentage = ((item.value / totalCount) * 100).toFixed(1);
            
            return (
              <div key={`${item.name}-${index}`} className="flex items-center justify-between">
                <div className="flex items-center space-x-1 flex-1 min-w-0">
                  <span className="text-emerald-600">{medal}</span>
                  <span className="text-emerald-700 font-light truncate" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="text-emerald-600 font-light ml-2">
                  {item.value.toLocaleString()} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProvinceChart;