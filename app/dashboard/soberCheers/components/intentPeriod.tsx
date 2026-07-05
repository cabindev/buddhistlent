// IntentPeriodChart.tsx
'use client';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getIntentPeriodChartData } from '../actions/GetChartData';

const ORDER = [
  '1 เดือน',
  '2 เดือน',
  '3 เดือน',
  'ลดปริมาณการดื่ม',
  'ตลอดชีวิต',
  'เลิกดื่มมาแล้วมากกว่า 3 ปี หรือ ไม่เคยดื่มเลยตลอดชีวิต',
];

const IntentPeriodChart: React.FC<{ year?: number; zone?: string }> = ({ year, zone }) => {
  const [chartData, setChartData] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [totalResponded, setTotalResponded] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getIntentPeriodChartData(year, zone);
        if (result.success && result.data) {
          const sorted = [...result.data.data].sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));
          setChartData({ labels: sorted.map(r => r.name), data: sorted.map(r => r.value) });
          setTotalResponded(result.data.total);
        }
      } catch (error) {
        console.error('Error fetching intent period data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, zone]);

  const option = {
    title: {
      text: 'ระยะเวลาที่ตั้งใจงด',
      left: 'center',
      textStyle: { fontSize: 13, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p = params[0];
        const pct = totalResponded ? ((p.value / totalResponded) * 100).toFixed(1) : '0.0';
        return `${p.name}: ${p.value.toLocaleString()} คน (${pct}%)`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      name: 'จำนวนคน',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { fontSize: 11, fontWeight: 'normal' }
    },
    yAxis: {
      type: 'category',
      data: chartData?.labels || [],
      inverse: true,
      axisLabel: { fontSize: 11 }
    },
    series: [
      {
        name: 'จำนวนคน',
        type: 'bar',
        data: chartData?.data || [],
        itemStyle: {
          color: (params: any) => {
            const colors = ['#166534', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#111111'];
            return colors[params.dataIndex % colors.length];
          },
          borderRadius: [0, 4, 4, 0]
        },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.3)' }
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="relative h-80">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default IntentPeriodChart;
