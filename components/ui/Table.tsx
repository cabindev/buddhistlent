// app/components/ui/Table.tsx
'use client';

import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export default function Table({
  columns,
  data,
  loading = false,
  pagination = true,
  pageSize = 10,
  onSort,
  sortColumn,
  sortDirection
}: TableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [internalSortColumn, setInternalSortColumn] = React.useState<string | null>(null);
  const [internalSortDirection, setInternalSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // ใช้ internal sorting หาก onSort ไม่ได้ถูกส่งมา
  const activeSortColumn = sortColumn || internalSortColumn;
  const activeSortDirection = sortDirection || internalSortDirection;

  // Sort data locally if no external sort handler
  const sortedData = React.useMemo(() => {
    if (!activeSortColumn || onSort) return data;

    return [...data].sort((a, b) => {
      const aValue = a[activeSortColumn];
      const bValue = b[activeSortColumn];
      
      if (aValue < bValue) return activeSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return activeSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, activeSortColumn, activeSortDirection, onSort]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = pagination ? sortedData.slice(startIndex, endIndex) : sortedData;

  const handleSort = (column: string) => {
    const newDirection = activeSortColumn === column && activeSortDirection === 'asc' ? 'desc' : 'asc';
    
    if (onSort) {
      onSort(column, newDirection);
    } else {
      setInternalSortColumn(column);
      setInternalSortDirection(newDirection);
    }
  };

  const getSortIcon = (column: string) => {
    if (activeSortColumn !== column) {
      return <FaSort className="w-3 h-3 text-gray-400" />;
    }
    return activeSortDirection === 'asc' 
      ? <FaSortUp className="w-3 h-3 text-amber-600" />
      : <FaSortDown className="w-3 h-3 text-amber-600" />;
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          {[...Array(pageSize)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.width || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            แสดง {startIndex + 1} ถึง {Math.min(endIndex, sortedData.length)} จาก {sortedData.length} รายการ
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNumber = currentPage <= 3 
                ? i + 1 
                : currentPage >= totalPages - 2 
                ? totalPages - 4 + i 
                : currentPage - 2 + i;

              if (pageNumber < 1 || pageNumber > totalPages) return null;

              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1 border rounded-md text-sm font-medium ${
                    currentPage === pageNumber
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </div>
  );
}