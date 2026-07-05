'use client'
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getAffiliationChartData } from '../actions/GetChartData';

const AffiliationChart: React.FC<{ year?: number; zone?: string }> = ({ year, zone }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getAffiliationChartData(year, zone);
        if (result.success && result.data) {
          const sorted = [...result.data].sort((a, b) => b.value - a.value);
          setChartData({ labels: sorted.map(r => r.name), data: sorted.map(r => r.value) });
        }
      } catch (error) {
        console.error('Error fetching affiliation chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, zone]);

  const option = {
    title: {
      text: 'สังกัด (Top 15)',
      left: 'center',
      textStyle: {
        fontSize: 13,
        fontWeight: 'normal'
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
        fontSize: 11,
        fontWeight: 'normal'
      }
    },
    yAxis: {
      type: 'category',
      data: chartData?.labels || [],
      name: 'สังกัด',
      nameLocation: 'middle',
      nameGap: 110,
      nameTextStyle: {
        fontSize: 11,
        fontWeight: 'normal'
      },
      axisLabel: {
        fontSize: 11
      }
    },
    series: [
      {
        name: 'จำนวนคน',
        type: 'bar',
        data: chartData?.data || [],
        itemStyle: {
          color: (params: any) => {
            const colors = ['#166534', '#16A34A', '#22C55E', '#4ADE80'];
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


  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">กำลังโหลด...</span>
      </div>
    );
  }

  if (!chartData?.labels?.length) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400 text-sm">
        ไม่มีข้อมูล
      </div>
    );
  }

  return (
    <div className="relative h-96">

      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default AffiliationChart;
