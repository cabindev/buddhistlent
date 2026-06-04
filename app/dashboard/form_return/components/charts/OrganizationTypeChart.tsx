'use client'

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface OrganizationTypeData {
  type: string
  count: number
  percentage: number
}

interface OrganizationTypeChartProps {
  data: OrganizationTypeData[]
}

export default function OrganizationTypeChart({ data }: OrganizationTypeChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const yellow = '#f59e0b' // ใช้โทนเหลืองเดียวกันทั้งหมด

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current)

    const option: echarts.EChartsOption = {
      title: {
        text: 'ประเภทอาชีพ/องค์กร',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal',
          color: yellow
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `<div style="background:#fff;padding:8px;border-radius:6px;border:1px solid #e5e7eb;font-size:12px;color:${yellow}">
            <div style="font-weight:500;color:${yellow}">${params.name}</div>
            <div style="color:#6b7280;font-size:11px">จำนวน: ${params.value.toLocaleString('th-TH')} คน</div>
            <div style="color:#6b7280;font-size:11px">สัดส่วน: ${params.percent}%</div>
          </div>`
        }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 0,
        textStyle: {
          fontSize: 9,
          color: yellow
        }
      },
      series: [
        {
          name: 'ประเภทอาชีพ',
          type: 'pie',
          radius: ['40%', '75%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'normal',
              color: yellow,
              formatter: '{b}\n{c} คน'
            },
            itemStyle: {
              shadowBlur: 6,
              shadowOffsetX: 0,
              shadowColor: 'rgba(245,158,11,0.2)'
            }
          },
          labelLine: {
            show: false
          },
          data: data.map((item) => ({
            value: item.count,
            name: item.type,
            itemStyle: {
              color: yellow
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

  const totalCount = data.reduce((sum, item) => sum + item.count, 0)
  const topTypes = data.slice(0, 3)

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
      <div 
        ref={chartRef} 
        className="w-full h-72"
      />
      
      {/* Top types list */}
      <div className="mt-3 pt-3 border-t border-amber-50">
        <h4 className="text-xs font-medium mb-2" style={{ color: yellow }}>
          อาชีพ/องค์กรที่พบมากที่สุด
        </h4>
        <div className="grid grid-cols-1 gap-1">
          {topTypes.map((item) => (
            <div key={item.type} className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: yellow }}
                />
                <span className="font-light" style={{ color: '#374151' }}>{item.type}</span>
              </div>
              <div className="font-light" style={{ color: yellow }}>
                {item.count.toLocaleString('th-TH')} ({item.percentage}%)
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-2 pt-2 border-t border-amber-50">
          <div className="text-center">
            <p className="text-xs font-light" style={{ color: '#6b7280' }}>รวมทั้งหมด</p>
            <p className="text-sm font-light" style={{ color: yellow }}>
              {totalCount.toLocaleString('th-TH')} คน
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}