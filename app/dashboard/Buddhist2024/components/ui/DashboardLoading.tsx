// app/dashboard/Buddhist2024/components/ui/DashboardLoading.tsx
'use client'
import React from 'react';

const DashboardLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center items-center h-screen">
        {/* Simple Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-gray-400 rounded-full animate-spin opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>

        {/* Loading bars animation */}
        <div className="flex space-x-1 mt-6">
          <div className="w-1.5 h-6 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-6 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-6 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <div className="w-1.5 h-6 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
        </div>

        {/* Text */}
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Buddhist Lent 2024 Dashboard
          </h3>
          <p className="text-gray-600 text-sm mb-1">กำลังโหลดข้อมูล | Loading Data</p>
          <p className="text-gray-500 text-xs">กรุณารอสักครู่ | Please wait...</p>
        </div>

        {/* Progress dots */}
        <div className="flex space-x-2 mt-4">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoading;