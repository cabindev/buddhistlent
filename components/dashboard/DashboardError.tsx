// components/dashboard/DashboardError.tsx
'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface DashboardErrorProps {
  error?: any;
  retry?: string;
  home?: string;
}

export default function DashboardError({ 
  error,
  retry = '/dashboard/formReturn',
  home = '/'
}: DashboardErrorProps) {
  // Log error details
  if (error) {
    console.error('Dashboard error details:', {
      message: error.message,
      stack: error.stack
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <ErrorIcon />
        
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          เกิดข้อผิดพลาด
        </h2>
        
        <p className="text-slate-600 mb-8">
          ระบบกำลังอยู่ในระหว่างการบำรุงรักษา<br/>
          กรุณาลองใหม่อีกครั้งในภายหลัง
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <ErrorDetails error={error} />
        )}
        
        <ErrorActions retry={retry} home={home} />
      </div>
    </div>
  );
}

function ErrorIcon() {
  return (
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <AlertCircle className="w-8 h-8 text-red-600" />
    </div>
  );
}

function ErrorDetails({ error }: { error: any }) {
  return (
    <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
      <p className="text-sm text-red-800 font-mono">
        {error.message || 'Unknown error'}
      </p>
    </div>
  );
}

function ErrorActions({ retry, home }: { retry: string; home: string }) {
  return (
    <div className="space-y-3">
      <Link 
        href={retry}
        className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
      >
        ลองใหม่อีกครั้ง
      </Link>
      <Link 
        href={home}
        className="inline-block w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
      >
        กลับหน้าแรก
      </Link>
    </div>
  );
}