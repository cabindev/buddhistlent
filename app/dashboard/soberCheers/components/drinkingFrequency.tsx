'use client';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getDrinkingFrequencyChartData } from '../actions/GetChartData';

const ORDER = [
  'ทุกวัน (7 วัน/สัปดาห์)',
  'เกือบทุกวัน (3-5 วัน/สัปดาห์)',
  'ทุกสัปดาห์ (1-2 วัน/สัปดาห์)',
  'ทุกเดือน (1-3 วัน/เดือน)',
  'นาน ๆ ครั้ง (8-11 วัน/ปี)',
];

const DrinkingFrequencyChart: React.FC<{ year?: number; zone?: string }> = ({ year, zone }) => {
  const [chartData, setChartData] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getDrinkingFrequencyChartData(year, zone);
        if (result.success && result.data) {
          const sorted = [...result.data].sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));
          setChartData({ labels: sorted.map(r => r.name), data: sorted.map(r => r.value) });
          setTotalCount(sorted.reduce((s, r) => s + r.value, 0));
        }
      } catch (error) {
        console.error('Error fetching drinking frequency data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, zone]);

  const option = {
    title: {
      text: 'ความถี่การดื่มแอลกอฮอล์',
      left: 'center',
      textStyle: { fontSize: 13, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p = params[0];
        const pct = totalCount ? ((p.value / totalCount) * 100).toFixed(1) : '0.0';
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
            const colors = ['#386500', '#78AC00', '#9CD324', '#BBF451', '#C1FA58'];
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
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[oklch(68%_0.196_126.665)] border-t-transparent"></div>
        <span className="ml-3 text-gray-600">กำลังโหลด...</span>
      </div>
    );
  }

  if (!chartData?.labels?.length) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400 text-sm">
        ไม่พบข้อมูลความถี่การดื่ม
      </div>
    );
  }

  return (
    <div className="relative h-96">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default DrinkingFrequencyChart;
