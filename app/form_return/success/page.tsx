// app/form_return/success/page.tsx
import Link from 'next/link';

export default function FormReturnSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            ส่งข้อมูลสำเร็จ!
          </h1>
          
          <p className="text-slate-600 mb-8">
            ขอบคุณสำหรับการส่งข้อมูลคืนแคมเปญ "งดเหล้าเข้าพรรษา ปี 2568" 
            ข้อมูลของท่านได้รับการบันทึกเรียบร้อยแล้ว
          </p>
          
          <div className="space-y-4">
            <Link
              href="/form_return"
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              ดูรายการข้อมูลทั้งหมด
            </Link>
            
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-all"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}