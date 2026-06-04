// app/dashboard/page.tsx
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import authOptions from '../lib/configs/auth/authOptions';

import QuickActions from './components/QuickActions';
import { 
 Calendar,
 Clock
} from 'lucide-react';

export default async function DashboardPage() {
 const session = await getServerSession(authOptions);

 if (!session?.user) {
   redirect('/auth/signin?callbackUrl=/dashboard');
 }

 const isAdmin = session.user.role === 'admin';
 const user = session.user;

 return (
   <div className="min-h-screen bg-gray-50">
     <div className="max-w-7xl mx-auto p-4 space-y-6">
       {/* Header Section */}
       <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
         <div className="flex items-center justify-between">
           <div>
             <div className="flex items-center mb-2">
               <span className="text-gray-600 font-normal text-sm">Buddhist Lent Dashboard</span>
             </div>
             <h1 className="text-2xl font-semibold text-gray-900 mb-2">
               ยินดีต้อนรับ, {user.firstName} {user.lastName}
             </h1>
             <p className="text-gray-600 text-sm">
               {isAdmin ? 'แดชบอร์ดผู้ดูแลระบบ' : 'แดชบอร์ดผู้ใช้งาน'} - ระบบจัดการข้อมูลงดเหล้าเข้าพรรษา พ.ศ. 2568
             </p>
             
             {/* User Role Badge */}
             <div className="mt-3">
               <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                 isAdmin 
                   ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                   : 'bg-gray-50 text-gray-700 border border-gray-200'
               }`}>
                 {isAdmin ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
               </span>
             </div>
           </div>
           
           <div className="hidden lg:flex flex-col items-end space-y-2">
             <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
               <div className="flex items-center text-gray-600 mb-1">
                 <Calendar className="w-4 h-4 mr-2" />
                 <span className="text-xs font-medium">วันที่ปัจจุบัน</span>
               </div>
               <div className="text-sm font-semibold text-gray-900">
                 {new Date().toLocaleDateString('th-TH', { 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric',
                   weekday: 'long'
                 })}
               </div>
             </div>
             
             <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
               <div className="flex items-center text-gray-600 mb-1">
                 <Clock className="w-4 h-4 mr-2" />
                 <span className="text-xs font-medium">เวลา</span>
               </div>
               <div className="text-sm font-semibold text-gray-900">
                 {new Date().toLocaleTimeString('th-TH', {
                   hour: '2-digit',
                   minute: '2-digit'
                 })} น.
               </div>
             </div>
           </div>
         </div>
       </div>

       {/* Quick Actions */}
       <QuickActions isAdmin={isAdmin} />

       {/* System Information (Admin Only) */}
       {isAdmin && (
         <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
           <div className="mb-6">
             <div className="flex items-center">
               <div className="p-2 bg-orange-50 rounded mr-3 border border-orange-200">
                 <Calendar className="w-5 h-5 text-orange-600" />
               </div>
               <div>
                 <h2 className="text-lg font-semibold text-gray-900">ข้อมูลระบบ (เฉพาะผู้ดูแล)</h2>
                 <p className="text-gray-600 text-sm">สถานะและข้อมูลเทคนิคของระบบ</p>
               </div>
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
               <h3 className="font-medium text-sm mb-2 text-gray-900">เวอร์ชันระบบ</h3>
               <p className="text-gray-700 text-sm">v2.0.0 - Buddhist Lent 2025</p>
               <p className="text-gray-500 text-xs mt-1">อัพเดทล่าสุด: มิ.ย. 2025</p>
             </div>
             
             <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
               <h3 className="font-medium text-sm mb-2 text-gray-900">สถานะเซิร์ฟเวอร์</h3>
               <div className="flex items-center">
                 <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                 <p className="text-green-700 text-sm">ออนไลน์</p>
               </div>
               <p className="text-gray-500 text-xs mt-1">เวลาทำงาน: 99.9% uptime</p>
             </div>
             
             <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
               <h3 className="font-medium text-sm mb-2 text-gray-900">การสำรองข้อมูล</h3>
               <p className="text-gray-700 text-sm">ทำงานอัตโนมัติ</p>
               <p className="text-gray-500 text-xs mt-1">สำรองล่าสุด: วันนี้ 03:00 น.</p>
             </div>
           </div>
         </div>
       )}

       {/* Footer */}
       <div className="text-center py-4">
         <p className="text-gray-500 text-xs">
           © 2025 Buddhist Lent - ระบบจัดการข้อมูลงดเหล้าเข้าพรรษา | พัฒนาเพื่อสังคมไทย
         </p>
       </div>
     </div>
   </div>
 );
}