// components/charts/BaseChart.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';

interface BaseChartProps {
  option: echarts.EChartsOption;
  style?: React.CSSProperties;
  className?: string;
  loading?: boolean;
}

export function BaseChart({ option, style, className, loading = false }: BaseChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Memoize serialized option สำหรับการเปรียบเทียบ
  const serializedOption = useMemo(() => JSON.stringify(option), [option]);

  // Initialize chart
  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      
      return () => {
        if (chartInstance.current) {
          chartInstance.current.dispose();
          chartInstance.current = null;
        }
      };
    }
  }, []);

useEffect(() => {
  if (chartInstance.current) {
    if (loading) {
      chartInstance.current.showLoading();
    } else {
      chartInstance.current.hideLoading();
      try {
        chartInstance.current.setOption(JSON.parse(serializedOption), true);
      } catch (error) {
        console.error('Invalid chart option:', error);
      }
    }
  }
}, [serializedOption, loading]);


  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '400px', ...style }}
      className={className}
    />
  );
}