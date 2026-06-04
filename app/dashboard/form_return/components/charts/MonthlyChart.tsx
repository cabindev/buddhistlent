'use client'

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

const yellow = '#f59e0b' // ใช้โทนเหลืองเดียวกันทั้งหมด

interface MonthlyData {
  month: string
  count: number
}

interface MonthlyChartProps {
  data: MonthlyData[]
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current)

    const option = {
      title: {
        text: 'แนวโน้มรายเดือน',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 400,
          color: yellow
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: (params: any) => {
          let result = `<div class="bg-white p-2 rounded shadow border text-sm">
            <div class="font-medium text-amber-800">${params[0].name}</div>`
          
          params.forEach((param: any) => {
            const color = param.color
            result += `<div class="flex items-center mt-1">
              <div class="w-2 h-2 rounded-full mr-2" style="background-color: ${color}"></div>
              <span class="text-gray-600 text-xs">${param.seriesName}: ${param.value.toLocaleString('th-TH')}</span>
            </div>`
          })
          
          result += '</div>'
          return result
        }
      },
      legend: {
        data: ['จำนวนฟอร์ม'],
        bottom: 0,
        textStyle: {
          color: '#6b7280',
          fontSize: 10
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.month),
        axisLine: {
          lineStyle: {
            color: '#f3f4f6'
          }
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 9,
          interval: 0,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'จำนวนฟอร์ม',
        position: 'left',
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
          data: data.map(item => item.count),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: yellow },
              { offset: 1, color: yellow }
            ]),
            borderRadius: [2, 2, 0, 0]
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 6,
              shadowColor: 'rgba(245,158,11,0.2)'
            }
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

  const totalForms = data.reduce((sum, item) => sum + item.count, 0)
  const maxCount = Math.max(...data.map(item => item.count))
  const peakMonth = data.find(item => item.count === maxCount)

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
      <div 
        ref={chartRef} 
        className="w-full h-72"
      />
      
      {/* Summary stats */}
      <div className="mt-3 pt-3 border-t border-amber-50">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-light">รวมฟอร์ม (2025)</p>
            <p className="text-sm font-light" style={{ color: yellow }}>
              {totalForms.toLocaleString('th-TH')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 font-light">เดือนที่มีมากสุด</p>
            <p className="text-sm font-light" style={{ color: yellow }}>
              {peakMonth?.month || '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}