// components/charts/PieChart.tsx
import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  loading?: boolean;
  className?: string;
}

export function PieChart({ data, title, loading, className }: PieChartProps) {
  const option: EChartsOption = {
    title: title ? {
      text: title,
      left: 'center'
    } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '0%',
      left: 'center'
    },
    series: [
      {
        name: 'Data',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  };

  return <BaseChart option={option} loading={loading} className={className} />;
}