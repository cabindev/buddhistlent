'use client'
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getTypeRegionCounts } from '../actions/GetChartData';
import { FaEllipsisV, FaDownload } from 'react-icons/fa';

interface TypeCount {
  [key: string]: number;
}

const TypeChart: React.FC<{ year?: number }> = ({ year }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getTypeRegionCounts(year);
        if (result.success && result.data) {
          const sorted = [...result.data].sort((a, b) => b.value - a.value);
          setChartData({ labels: sorted.map(r => r.name), data: sorted.map(r => r.value) });
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const option = {
    title: {
      text: 'ภูมิภาคที่เข้าร่วม',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}: ${param.value.toLocaleString()} คน`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'จำนวนคน',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    yAxis: {
      type: 'category',
      data: chartData?.labels || [],
      name: 'ภูมิภาค',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      },
      axisLabel: {
        fontSize: 12
      }
    },
    series: [
      {
        name: 'จำนวนคน',
        type: 'bar',
        data: chartData?.data || [],
        itemStyle: {
          color: (params: any) => {
            const colors = [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
              '#9966FF', '#FF9F40', '#FF6384'
            ];
            return colors[params.dataIndex % colors.length];
          },
          borderRadius: [0, 4, 4, 0]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  };

  const downloadChart = () => {
    console.log('Download chart feature');
    setShowDownloadMenu(false);
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
        <span className="ml-2 text-gray-600">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="relative h-96">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setShowDownloadMenu(!showDownloadMenu)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-full hover:bg-gray-100"
        >
          <FaEllipsisV />
        </button>
        {showDownloadMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
            <button
              onClick={downloadChart}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FaDownload className="inline mr-2" /> ดาวน์โหลดกราฟ
            </button>
          </div>
        )}
      </div>
      
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default TypeChart;