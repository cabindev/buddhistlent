'use client'

import React, { useState, useEffect } from 'react'
import { getFormReturn2025TableData, FormReturn2025TableData } from '../actions/GetTableData2025'
import { ChevronLeft, ChevronRight, FileText, Users, Calendar, MapPin, Phone, Building } from 'lucide-react'

interface DataTable2025Props {
  className?: string;
}

export default function DataTable2025({ className = '' }: DataTable2025Props) {
  const [data, setData] = useState<FormReturn2025TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [selectedRecord, setSelectedRecord] = useState<FormReturn2025TableData | null>(null)
  
  const itemsPerPage = 10

  const fetchData = async (page: number) => {
    try {
      setLoading(true)
      const result = await getFormReturn2025TableData(page, itemsPerPage)
      setData(result.data)
      setTotalPages(result.totalPages)
      setTotal(result.total)
      setCurrentPage(result.currentPage)
      setError(null)
    } catch (err) {
      console.error('Error fetching table data:', err)
      setError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(currentPage)
  }, [currentPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-orange-100/50 ${className}`}>
        <div className="p-4 border-b border-orange-100/50">
          <h3 className="text-lg font-semibold text-orange-800">ข้อมูลการคืนฟอร์ม 2025</h3>
          <p className="text-sm text-orange-600/70 mt-1">รายการข้อมูลทั้งหมด</p>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-orange-100 rounded w-1/4"></div>
                <div className="h-4 bg-orange-100 rounded w-1/2"></div>
                <div className="h-4 bg-orange-100 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-red-200 ${className}`}>
        <div className="p-6 text-center">
          <p className="text-red-600 text-sm font-light">{error}</p>
          <button 
            type="button"
            onClick={() => fetchData(currentPage)}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm font-light rounded hover:bg-red-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-orange-100/50 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-orange-100/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-orange-800 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              ข้อมูลการคืนฟอร์ม 2025
            </h3>
            <p className="text-sm text-orange-600/70 mt-1">
              ทั้งหมด {total} รายการ
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-orange-50/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                ชื่อ-นามสกุล
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                องค์กร
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                จังหวัด
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                ประเภท
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                จำนวนผู้ลงชื่อ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                วันที่บันทึก
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-orange-100/30">
            {data.map((record) => (
              <tr 
                key={record.id} 
                className="hover:bg-orange-50/30 cursor-pointer transition-colors"
                onClick={() => setSelectedRecord(record)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {record.firstName} {record.lastName}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {record.phoneNumber}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {record.organizationName}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {record.province}
                  </div>
                  <div className="text-xs text-gray-500">
                    {record.amphoe}, {record.district}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                    {record.type}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {record.numberOfSigners}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(record.createdAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">ไม่พบข้อมูล</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-orange-100/50 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            แสดง {((currentPage - 1) * itemsPerPage) + 1} ถึง {Math.min(currentPage * itemsPerPage, total)} จาก {total} รายการ
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">รายละเอียดข้อมูล</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                    <p className="text-sm text-gray-900">{selectedRecord.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
                    <p className="text-sm text-gray-900">{selectedRecord.lastName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">องค์กร</label>
                  <p className="text-sm text-gray-900">{selectedRecord.organizationName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">ที่อยู่</label>
                  <p className="text-sm text-gray-900">{selectedRecord.addressLine1}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ตำบล</label>
                    <p className="text-sm text-gray-900">{selectedRecord.district}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">อำเภอ</label>
                    <p className="text-sm text-gray-900">{selectedRecord.amphoe}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
                    <p className="text-sm text-gray-900">{selectedRecord.province}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
                    <p className="text-sm text-gray-900">{selectedRecord.zipcode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                    <p className="text-sm text-gray-900">{selectedRecord.phoneNumber}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ประเภท</label>
                    <p className="text-sm text-gray-900">{selectedRecord.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">จำนวนผู้ลงชื่อ</label>
                    <p className="text-sm text-gray-900">{selectedRecord.numberOfSigners} คน</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">วันที่บันทึก</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedRecord.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}