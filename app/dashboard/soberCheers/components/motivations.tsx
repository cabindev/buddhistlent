'use client';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getMotivationsChartData } from '../actions/GetChartData';

const SHORT_LABELS: Record<string, string> = {
  'เพื่อลูกและครอบครัว': 'ลูกและครอบครัว',
  'เพื่อสุขภาพของตนเอง': 'สุขภาพตนเอง',
  'ได้บุญ/รักษาศีล': 'ได้บุญ/รักษาศีล',
  'ผู้นำชุมชนชักชวน': 'ผู้นำชุมชนชวน',
  'คนรักและเพื่อนชวน': 'คนรัก/เพื่อนชวน',
  'ประหยัดเงิน': 'ประหยัดเงิน',
  'เพื่อเป็นแบบอย่างที่ดีให้กับคนอื่น': 'เป็นแบบอย่างที่ดี',
  'เคยประสบอุบัติเหตุหรือมีการสูญเสียที่มีเหล้าเป็นสาเหตุ': 'เคยประสบอุบัติเหตุ/สูญเสีย',
};
const shortLabel = (label: string) => SHORT_LABELS[label] || (label.startsWith('อื่นๆ:') ? 'อื่นๆ' : label);

const MotivationChart: React.FC<{ year?: number; zone?: string }> = ({ year, zone }) => {
  const [chartData, setChartData] = useState<{ labels: string[]; fullLabels: string[]; data: number[] } | null>(null);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getMotivationsChartData(year, zone);
        if (result.success && result.data) {
          const { motivationCounts, totalResponses } = result.data;
          const sorted = Object.entries(motivationCounts).sort((a, b) => b[1] - a[1]);
          setChartData({
            labels: sorted.map(([label]) => shortLabel(label)),
            fullLabels: sorted.map(([label]) => label),
            data: sorted.map(([, count]) => count),
          });
          setTotalResponses(totalResponses);
        }
      } catch (error) {
        console.error('Error fetching motivation data:', error);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, zone]);

  const option = {
    title: {
      text: 'แรงจูงใจในการงดเหล้า',
      left: 'center',
      textStyle: { fontSize: 13, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p = params[0];
        const pct = totalResponses ? ((p.value / totalResponses) * 100).toFixed(1) : '0.0';
        const full = chartData?.fullLabels[p.dataIndex] || p.name;
        return `${full}: ${p.value.toLocaleString()} คน (${pct}%)`;
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
            const colors = ['#166534', '#15803D', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#111111', '#14532D', '#052e16'];
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
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600 mx-auto mb-2"></div>
          <span className="text-gray-600">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="h-96">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
      <p className="text-xs text-gray-400 text-center mt-2">
        เลือกแรงจูงใจได้มากกว่าหนึ่งข้อ · {totalResponses.toLocaleString()} ครั้งที่เลือกทั้งหมด
      </p>
    </div>
  );
};

export default MotivationChart;
