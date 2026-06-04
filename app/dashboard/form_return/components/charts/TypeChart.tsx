//dashboard/form_return/components/charts/TypeChart.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

const yellow = '#f59e0b'
const yellowDark = '#d97706'
const yellowAlpha = 'rgba(245,158,11,0.2)'

interface TypeData {
  type: string
  count: number
  percentage: number
}

interface TypeChartProps {
  data: TypeData[]
}

export default function TypeChart({ data }: TypeChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current)

    const option: echarts.EChartsOption = {
      title: {
        text: 'ภูมิภาคที่ส่งคืนฟอร์ม',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal',
          color: yellow
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const param = params[0]
          return `<div class="bg-white p-2 rounded shadow border text-sm">
            <div class="font-medium text-amber-800">${param.name}</div>
            <div class="text-gray-600 text-xs">จำนวน: ${param.value.toLocaleString('th-TH')} ฟอร์ม</div>
          </div>`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.type),
        axisLine: {
          lineStyle: {
            color: '#f3f4f6'
          }
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 10,
          interval: 0,
          rotate: data.length > 5 ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 10
        },
        splitLine: {
          lineStyle: {
            color: '#f9fafb',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'จำนวนฟอร์ม',
          type: 'bar',
          data: data.map((item, index) => ({
            value: item.count,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: yellow },
                { offset: 1, color: yellowDark }
              ]),
              borderRadius: [2, 2, 0, 0]
            }
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 6,
              shadowColor: yellowAlpha
            }
          },
          label: {
            show: true,
            position: 'top',
            color: yellow,
            fontSize: 10,
            fontWeight: 'normal',
            formatter: '{c}'
          }
        }
      ]
    }

    chartInstance.current.setOption(option as any)

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [data])

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
      <div 
        ref={chartRef} 
        className="w-full h-72"
      />
      
      {/* Summary stats */}
      <div className="mt-3 pt-3 border-t border-amber-50">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 font-light">ประเภทที่มีมากที่สุด</p>
            <p className="text-sm font-light" style={{ color: yellow }}>
              {data[0]?.type || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-light">จำนวนประเภททั้งหมด</p>
            <p className="text-sm font-light" style={{ color: yellow }}>
              {data.length} ประเภท
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}