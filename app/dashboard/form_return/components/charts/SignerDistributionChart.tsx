'use client'

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface SignerDistributionData {
  range: string
  count: number
  percentage: number
}

interface SignerDistributionChartProps {
  data: SignerDistributionData[]
}

export default function SignerDistributionChart({ data }: SignerDistributionChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current)

    const option: echarts.EChartsOption = {
      title: {
        text: 'การกระจายจำนวนผู้ลงชื่อ',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal',
          color: '#92400e'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `<div class="bg-white p-2 rounded shadow border text-sm">
            <div class="font-medium text-amber-800">${params.name}</div>
            <div class="text-gray-600 text-xs">จำนวน: ${params.value.toLocaleString('th-TH')} ฟอร์ม</div>
            <div class="text-gray-600 text-xs">สัดส่วน: ${params.percent}%</div>
          </div>`
        }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 0,
        textStyle: {
          fontSize: 10,
          color: '#6b7280'
        }
      },
      series: [
        {
          name: 'จำนวนผู้ลงชื่อ',
          type: 'pie',
          radius: ['50%', '80%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{c} ฟอร์ม',
            fontSize: 10,
            color: '#374151'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'normal',
              color: '#92400e'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(146, 64, 14, 0.3)'
            }
          },
          labelLine: {
            show: true,
            length: 12,
            length2: 8,
            lineStyle: {
              color: '#d1d5db'
            }
          },
          data: data.map((item, index) => ({
            value: item.count,
            name: item.range,
            itemStyle: {
              color: `hsl(${45 + index * 15}, 70%, ${60 + index * 3}%)`
            }
          }))
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
  const mostCommonRange = data.reduce((prev, current) => 
    prev.count > current.count ? prev : current
  )

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
      <div 
        ref={chartRef} 
        className="w-full h-72"
      />
      
      {/* Summary stats */}
      <div className="mt-3 pt-3 border-t border-amber-50">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-xs text-amber-800 font-medium mb-2">สรุปการกระจาย</p>
            <div className="space-y-1">
              {data.map((item, index) => (
                <div key={item.range} className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: `hsl(${45 + index * 15}, 70%, ${60 + index * 3}%)` }}
                    />
                    <span className="text-gray-700 font-light">{item.range}</span>
                  </div>
                  <div className="text-amber-700 font-light">
                    {item.count.toLocaleString('th-TH')} ({item.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2 border-t border-amber-50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 font-light">ช่วงที่พบมากที่สุด</p>
                <p className="text-sm font-light text-amber-800">
                  {mostCommonRange.range}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-light">ฟอร์มทั้งหมด</p>
                <p className="text-sm font-light text-amber-800">
                  {totalForms.toLocaleString('th-TH')} ฟอร์ม
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}