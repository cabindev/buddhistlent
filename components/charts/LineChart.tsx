// components/charts/LineChart.tsx
import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface LineChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  loading?: boolean;
  className?: string;
}

export function LineChart({ data, title, loading, className }: LineChartProps) {
  const option: EChartsOption = {
    title: title ? {
      text: title,
      left: 'center'
    } : undefined,
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Value',
        type: 'line',
        data: data.map(item => item.value),
        smooth: true,
        lineStyle: {
          color: '#10B981'
        },
        itemStyle: {
          color: '#10B981'
        }
      }
    ]
  };

  return <BaseChart option={option} loading={loading} className={className} />;
}