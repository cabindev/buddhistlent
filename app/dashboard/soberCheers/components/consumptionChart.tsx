// AlcoholConsumptionChart.tsx
import React, { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { getAlcoholConsumptionChartData } from '../actions/GetChartData';

interface SoberCheersData {
  alcoholConsumption: string;
}

const AlcoholConsumptionChart: React.FC<{ year?: number }> = ({ year }) => {
  const [chartData, setChartData] = useState<{ data: { name: string; value: number }[]; totalResponded: number }>({ data: [], totalResponded: 0 });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getAlcoholConsumptionChartData(year);
        if (result.success && result.data) {
          const totalResponded = result.data.reduce((s, r) => s + r.value, 0);
          setChartData({ data: result.data, totalResponded });
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
        fontSize: 12,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const percentage = ((params.value / chartData.totalResponded) * 100).toFixed(1);
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
        name: 'การบริโภคแอลกอฮอล์',
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['50%', '45%'],
        data: chartData.data,
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
    color: ['#166534', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#111111']
  };


  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">กำลังโหลด...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative h-80">
      
      <ReactECharts
        option={option}
        style={{ height: '320px', width: '100%' }}
      />
      
      <p className="text-xs text-center text-gray-600 mt-2">
        จำนวนผู้ตอบแบบสอบถามทั้งหมด: {chartData.totalResponded.toLocaleString()} คน
      </p>
    </div>
  );
};

export default AlcoholConsumptionChart;