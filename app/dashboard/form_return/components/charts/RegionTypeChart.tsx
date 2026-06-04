'use client'

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface RegionTypeData {
  region: string
  province: string
  type: string
  count: number
  percentage: number
}

interface RegionTypeChartProps {
  data: RegionTypeData[]
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
    
    // ภาคตะวันออกเฉียงเหนือ
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

export default function RegionTypeChart({ data }: RegionTypeChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current)

    // Group data by region and type
    const regionTypeMap = new Map<string, Map<string, number>>()
    const regionTotals = new Map<string, number>()

    data.forEach(item => {
      const region = getRegionFromProvince(item.province)
      
      if (!regionTypeMap.has(region)) {
        regionTypeMap.set(region, new Map())
        regionTotals.set(region, 0)
      }

      const typeMap = regionTypeMap.get(region)!
      const currentCount = typeMap.get(item.type) || 0
      typeMap.set(item.type, currentCount + item.count)
      
      regionTotals.set(region, regionTotals.get(region)! + item.count)
    })

    // Prepare data for nested pie chart
    const seriesData: any[] = []
    const colors = ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7']
    let colorIndex = 0

    // Create nested data structure
    Array.from(regionTypeMap.entries()).forEach(([region, typeMap]) => {
      const regionTotal = regionTotals.get(region) || 0
      const regionColor = colors[colorIndex % colors.length]
      
      // Add region data
      seriesData.push({
        name: region,
        value: regionTotal,
        itemStyle: { color: regionColor },
        children: Array.from(typeMap.entries()).map(([type, count]) => ({
          name: `${region} - ${type}`,
          value: count,
          itemStyle: { 
            color: `${regionColor}${Math.floor(100 - (count / regionTotal) * 50).toString().padStart(2, '0')}` 
          }
        }))
      })
      
      colorIndex++
    })

    const option: echarts.EChartsOption = {
      title: {
        text: 'การกระจายตามภูมิภาคและประเภท',
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
        textStyle: {
          color: '#92400e'
        },
        formatter: (params: any) => {
          if (params.data.children) {
            // Region tooltip
            return `<div class="bg-white p-2 rounded shadow border text-sm">
              <div class="font-medium text-amber-800">${params.name}</div>
              <div class="text-amber-600 text-xs">จำนวน: ${params.value.toLocaleString('th-TH')} ฟอร์ม</div>
              <div class="text-amber-600 text-xs">สัดส่วน: ${params.percent}%</div>
            </div>`
          } else {
            // Type tooltip
            const [region, type] = params.name.split(' - ')
            return `<div class="bg-white p-2 rounded shadow border text-sm">
              <div class="font-medium text-amber-800">${region}</div>
              <div class="font-medium text-amber-700">${type}</div>
              <div class="text-amber-600 text-xs">จำนวน: ${params.value.toLocaleString('th-TH')} ฟอร์ม</div>
              <div class="text-amber-600 text-xs">สัดส่วน: ${params.percent}%</div>
            </div>`
          }
        }
      },
      series: [
        {
          name: 'ภูมิภาค',
          type: 'pie',
          radius: [0, '30%'],
          center: ['50%', '50%'],
          data: Array.from(regionTotals.entries()).map(([region, total], index) => ({
            name: region,
            value: total,
            itemStyle: { color: colors[index % colors.length] }
          })),
          label: {
            show: true,
            fontSize: 10,
            color: '#92400e',
            formatter: '{b}'
          }
        },
        {
          name: 'ประเภท',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          data: (() => {
            const typeData: any[] = []
            let colorIndex = 0
            
            Array.from(regionTypeMap.entries()).forEach(([region, typeMap]) => {
              const regionColor = colors[colorIndex % colors.length]
              
              Array.from(typeMap.entries()).forEach(([type, count], typeIndex) => {
                typeData.push({
                  name: `${region} - ${type}`,
                  value: count,
                  itemStyle: { 
                    color: regionColor,
                    opacity: 0.7 + (typeIndex * 0.1)
                  }
                })
              })
              
              colorIndex++
            })
            
            return typeData
          })(),
          label: {
            show: true,
            fontSize: 9,
            color: '#92400e',
            formatter: (params: any) => {
              const [, type] = params.name.split(' - ')
              return type
            }
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
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
        className="w-full h-80"
      />
      
      {/* Summary by region */}
      <div className="mt-3 pt-3 border-t border-amber-50">
        <h4 className="text-xs font-medium text-amber-800 mb-2">
          สรุปตามภูมิภาค
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {(() => {
            const regionSummary = new Map<string, { total: number, types: Set<string> }>()
            
            data.forEach(item => {
              const region = getRegionFromProvince(item.province)
              
              if (!regionSummary.has(region)) {
                regionSummary.set(region, { total: 0, types: new Set() })
              }
              
              const summary = regionSummary.get(region)!
              summary.total += item.count
              summary.types.add(item.type)
            })
            
            return Array.from(regionSummary.entries()).map(([region, summary], index) => (
              <div key={region} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'][index % 6] }}
                  />
                  <span className="text-amber-700 font-light">{region}</span>
                </div>
                <div className="text-amber-600 font-light">
                  {summary.total.toLocaleString('th-TH')} ({summary.types.size} ประเภท)
                </div>
              </div>
            ))
          })()}
        </div>
      </div>
    </div>
  )
}