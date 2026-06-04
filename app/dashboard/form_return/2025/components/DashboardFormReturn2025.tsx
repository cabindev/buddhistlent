'use client'

import React, { useEffect, useState } from 'react'
import { getFormReturn2025ChartData, FormReturn2025ChartData } from '../actions/GetChartData2025'
import StatsCard from '../../components/charts/StatsCard'
import ProvinceChart from '../../components/charts/ProvinceChart'
import TypeChart from '../../components/charts/TypeChart'
import OrganizationTypeChart from '../../components/charts/OrganizationTypeChart'
import MonthlyChart from '../../components/charts/MonthlyChart'

export default function DashboardFormReturn2025() {
  const [data, setData] = useState<FormReturn2025ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await getFormReturn2025ChartData()
        setData(result)
        setError(null)
      } catch (err) {
        console.error('Error fetching chart data:', err)
        setError('ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-8 min-h-screen">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-black tracking-tight">
              Dashboard Form Return 2025
            </h1>
            <p className="text-sm text-black/70 mt-1">
              ภาพรวมข้อมูลการคืนฟอร์มปี 2025
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse ring-1 ring-amber-100/50">
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 h-1.5 mb-4"></div>
              <div className="h-4 bg-amber-100 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-amber-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse ring-1 ring-amber-100/50">
              <div className="h-5 bg-amber-100 rounded w-1/3 mb-4"></div>
              <div className="h-48 bg-amber-50 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm font-light">{error}</p>
          <button 
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm font-light rounded hover:bg-red-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Dashboard Form Return 2025
          </h1>
          <p className="text-sm text-black/70 mt-1">
            ภาพรวมข้อมูลการคืนฟอร์มปี 2025
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-black font-medium px-3 py-1.5 rounded-full">
            อัพเดทล่าสุด: {new Date().toLocaleDateString('th-TH')}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="ข้อมูลทั้งหมด"
          value={data.stats.totalForms}
          icon="📋"
         
          trend={data.stats.monthlyGrowth}
        />
        <StatsCard
          title="จำนวนองค์กร"
          value={data.stats.totalOrganizations}
          icon="🏢"
         
        />
        <StatsCard
          title="แนวโน้มรายเดือน"
          value={data.stats.monthlyGrowth}
          icon="📊"
         
          trend={data.stats.monthlyGrowth}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ProvinceChart data={data.provinceData} />
        <TypeChart data={data.typeData} />
        <OrganizationTypeChart data={data.organizationTypeData} />
        <MonthlyChart data={data.monthlyData} />
      </div>
    </div>
  )
}