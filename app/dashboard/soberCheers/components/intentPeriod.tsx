// IntentPeriodChart.tsx
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getIntentPeriodChartData } from '../actions/GetChartData';
import { FaEllipsisV, FaDownload } from 'react-icons/fa';

interface IntentPeriodData {
  [key: string]: number;
}

const IntentPeriodChart: React.FC<{ year?: number }> = ({ year }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [totalResponded, setTotalResponded] = useState(0);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getIntentPeriodChartData(year);
        if (result.success && result.data) {
          setChartData(result.data.data);
          setTotalResponded(result.data.total);
        }
      } catch (error) {
        console.error('Error fetching intent period data:', error);
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
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const percentage = ((params.value / totalResponded) * 100).toFixed(1);
        return `${params.name}: ${params.value} คน (${percentage}%)`;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      type: 'scroll',
      textStyle: {
        fontSize: 10
      }
    },
    series: [
      {
        name: 'ระยะเวลาที่ตั้งใจจะเลิกดื่ม',
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['50%', '45%'],
        data: chartData || [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    ],
    color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
  };

  const downloadChart = () => {
    console.log('Download chart feature');
    setShowDownloadMenu(false);
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
        <span className="ml-2 text-gray-600">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="relative h-80">
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
        style={{ height: '320px', width: '100%' }}
      />
      
      <p className="text-xs text-center text-gray-600 mt-2">
        จำนวนผู้ตอบแบบสอบถามทั้งหมด: {totalResponded.toLocaleString()} คน
      </p>
    </div>
  );
};

export default IntentPeriodChart;