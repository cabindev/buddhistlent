// components/charts/BarChart.tsx
import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  loading?: boolean;
  className?: string;
}

export function BarChart({ data, title, loading, className }: BarChartProps) {
  const option: EChartsOption = {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Value',
        type: 'bar',
        data: data.map(item => item.value),
        itemStyle: {
          color: '#3B82F6'
        }
      }
    ]
  };

  return <BaseChart option={option} loading={loading} className={className} />;
}