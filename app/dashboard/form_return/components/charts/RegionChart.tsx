'use client'

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface ProvinceData {
  province: string
  count: number
  percentage: number
}

interface RegionChartProps {
  data: ProvinceData[]
}

// ฟังก์ชันแปลงจังหวัดเป็นภูมิภาค
function getRegionFromProvince(province: string): string {
  const regions: { [key: string]: string } = {
    // ภาคเหนือ
    'เชียงใหม่': 'ภาคเหนือ',
    'เชียงราย': 'ภาคเหนือ',
    'แม่ฮ่องสอน': 'ภาคเหนือ',
    'ลำปาง': 'ภาคเหนือ',
    'ลำพูน': 'ภาคเหนือ',
    'น่าน': 'ภาคเหนือ',
    'พะเยา': 'ภาคเหนือ',
    'แพร่': 'ภาคเหนือ',
    'อุตรดิตถ์': 'ภาคเหนือ',
    
    // ภาคอีสาน
    'กาฬสินธุ์': 'ภาคอีสาน',
    'ขอนแก่น': 'ภาคอีสาน',
    'เลย': 'ภาคอีสาน',
    'หนองคาย': 'ภาคอีสาน',
    'หนองบัวลำภู': 'ภาคอีสาน',
    'อุดรธานี': 'ภาคอีสาน',
    'บุรีรัมย์': 'ภาคอีสาน',
    'จัสสิน': 'ภาคอีสาน',
    'มหาสารคาม': 'ภาคอีสาน',
    'มุกดาหาร': 'ภาคอีสาน',
    'นครพนม': 'ภาคอีสาน',
    'นครราชสีมา': 'ภาคอีสาน',
    'ร้อยเอ็ด': 'ภาคอีสาน',
    'สกลนคร': 'ภาคอีสาน',
    'สุรินทร์': 'ภาคอีสาน',
    'ศีสะเกษ': 'ภาคอีสาน',
    'อุบลราชธานี': 'ภาคอีสาน',
    'อำนาจเจริญ': 'ภาคอีสาน',
    
    // ภาคกลาง
    'กรุงเทพฯ': 'ภาคกลาง',
    'กรุงเทพมหานคร': 'ภาคกลาง',
    'นนทบุรี': 'ภาคกลาง',
    'ปทุมธานี': 'ภาคกลาง',
    'พระนครศรีอยุธยา': 'ภาคกลาง',
    'อ่างทอง': 'ภาคกลาง',
    'ลพบุรี': 'ภาคกลาง',
    'สิงห์บุรี': 'ภาคกลาง',
    'ชัยนาท': 'ภาคกลาง',
    'สระบุรี': 'ภาคกลาง',
    'นครนายก': 'ภาคกลาง',
    'ปราจีนบุรี': 'ภาคกลาง',
    'ฉะเชิงเทรา': 'ภาคกลาง',
    'สมุทรปราการ': 'ภาคกลาง',
    'สมุทรสาคร': 'ภาคกลาง',
    'สมุทรสงคราม': 'ภาคกลาง',
    
    // ภาคตะวันออก
    'ชลบุรี': 'ภาคตะวันออก',
    'ระยอง': 'ภาคตะวันออก',
    'จันทบุรี': 'ภาคตะวันออก',
    'ตราด': 'ภาคตะวันออก',
    'สระแก้ว': 'ภาคตะวันออก',
    
    // ภาคตะวันตก
    'กาญจนบุรี': 'ภาคตะวันตก',
    'ตาก': 'ภาคตะวันตก',
    'พิษณุโลก': 'ภาคตะวันตก',
    'พิจิตร': 'ภาคตะวันตก',
    'เพชรบูรณ์': 'ภาคตะวันตก',
    'ราชบุรี': 'ภาคตะวันตก',
    'สุโขทัย': 'ภาคตะวันตก',
    'เพชรบุรี': 'ภาคตะวันตก',
    'ประจวบคีรีขันธ์': 'ภาคตะวันตก',
    'กำแพงเพชร': 'ภาคตะวันตก',
    
    // ภาคใต้
    'ชุมพร': 'ภาคใต้',
    'กระบี่': 'ภาคใต้',
    'นครศรีธรรมราช': 'ภาคใต้',
    'นราธิวาส': 'ภาคใต้',
    'ปัตตานี': 'ภาคใต้',
    'พังงา': 'ภาคใต้',
    'พัทลุง': 'ภาคใต้',
    'ภูเก็ต': 'ภาคใต้',
    'ยะลา': 'ภาคใต้',
    'ระนอง': 'ภาคใต้',
    'สงขลา': 'ภาคใต้',
    'สตูล': 'ภาคใต้',
    'สุราษฎร์ธานี': 'ภาคใต้',
    'ตรัง': 'ภาคใต้'
  }
  
  return regions[province] || 'ไม่ระบุ'
}

export default function RegionChart({ data }: RegionChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current)

    // Group provinces by region
    const regionCounts = new Map<string, number>()
    
    data.forEach(item => {
      const region = getRegionFromProvince(item.province)
      regionCounts.set(region, (regionCounts.get(region) || 0) + item.count)
    })

    // Convert to array and sort
    const regionData = Array.from(regionCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const totalCount = regionData.reduce((sum, item) => sum + item.value, 0)

    const option: echarts.EChartsOption = {
      title: {
        text: 'การกระจายตามภูมิภาค',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal',
          color: '#92400e'
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'white',
        borderColor: '#FDE68A',
        borderWidth: 1,
        formatter: (params: any) => {
          const percentage = ((params.value / totalCount) * 100).toFixed(1)
          return `<div class="bg-white p-2 rounded shadow border text-sm">
            <div class="font-medium text-amber-800">${params.name}</div>
            <div class="text-amber-600 text-xs">จำนวน: ${params.value.toLocaleString('th-TH')} ฟอร์ม</div>
            <div class="text-amber-600 text-xs">สัดส่วน: ${percentage}%</div>
          </div>`
        }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 0,
        textStyle: {
          fontSize: 10,
          color: '#92400e'
        }
      },
      series: [
        {
          name: 'ภูมิภาค',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'normal',
              color: '#92400e'
            },
            itemStyle: {
              shadowBlur: 6,
              shadowOffsetX: 0,
              shadowColor: 'rgba(146, 64, 14, 0.2)'
            }
          },
          labelLine: {
            show: false
          },
          data: regionData.map((item, index) => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'][index % 6]
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
      <div 
        ref={chartRef} 
        className="w-full h-72"
      />
      
      {/* Region summary */}
      <div className="mt-3 pt-3 border-t border-amber-50">
        <h4 className="text-xs font-medium text-amber-800 mb-2">
          สรุปตามภูมิภาค
        </h4>
        <div className="grid grid-cols-1 gap-1">
          {(() => {
            const regionCounts = new Map<string, number>()
            
            data.forEach(item => {
              const region = getRegionFromProvince(item.province)
              regionCounts.set(region, (regionCounts.get(region) || 0) + item.count)
            })

            const regionData = Array.from(regionCounts.entries())
              .map(([name, value]) => ({ name, value }))
              .sort((a, b) => b.value - a.value)

            const totalCount = regionData.reduce((sum, item) => sum + item.value, 0)

            return regionData.slice(0, 6).map((item, index) => {
              const percentage = ((item.value / totalCount) * 100).toFixed(1)
              const colors = ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7']
              
              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-amber-700 font-light">{item.name}</span>
                  </div>
                  <div className="text-amber-600 font-light">
                    {item.value.toLocaleString('th-TH')} ({percentage}%)
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )
}