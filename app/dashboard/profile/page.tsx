// app/dashboard/profile/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Edit, 
  LayoutDashboard, 
  LogOut,
  ArrowLeft,
  Camera
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
  role: string;
}

interface Session {
  user: User;
}

export default function Profile() {
  const { data: session, status } = useSession() as { data: Session | null; status: string };
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600"></div>
      </div>
    );
  }

  const isAdmin = session.user.role === 'admin';

  const handleEditProfile = () => {
    router.push(`/auth/form_signup/edit/${session.user.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm">กลับ</span>
            </button>
            <h1 className="text-lg font-medium text-gray-800">โปรไฟล์</h1>
            <div className="w-12"></div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gray-100 h-20 relative">
            <div className="absolute -bottom-8 left-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-white bg-white overflow-hidden">
                  <img
                    src={
                      imageError
                        ? "/images/default-profile.png"
                        : session.user.image || "/images/default-profile.png"
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-12 pb-6 px-6">
            <div>
              <h2 className="text-xl font-medium text-gray-800 mb-1">
                {session.user.firstName} {session.user.lastName}
              </h2>
              <p className="text-gray-500 text-sm flex items-center mb-3">
                <Mail className="w-3 h-3 mr-2" />
                {session.user.email}
              </p>
              <div className="flex items-center">
                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  isAdmin 
                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {isAdmin ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <User className="w-4 h-4 text-gray-600 mr-2" />
              <h3 className="text-sm font-medium text-gray-800">ข้อมูลส่วนตัว</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-500 mb-1">ชื่อ</p>
                <p className="text-sm font-medium text-gray-800">{session.user.firstName}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-500 mb-1">นามสกุล</p>
                <p className="text-sm font-medium text-gray-800">{session.user.lastName}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <Shield className="w-4 h-4 text-gray-600 mr-2" />
              <h3 className="text-sm font-medium text-gray-800">ข้อมูลบัญชี</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-500 mb-1">อีเมล</p>
                <p className="text-sm font-medium text-gray-800">{session.user.email}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-500 mb-1">ประเภทสมาชิก</p>
                <p className="text-sm font-medium text-gray-800">
                  {isAdmin ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-4">การดำเนินการ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={handleEditProfile}
              className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 text-sm font-medium rounded border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              แก้ไขโปรไฟล์
            </button>

            {isAdmin && (
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center px-4 py-3 bg-amber-50 text-amber-700 text-sm font-medium rounded border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                แดชบอร์ด
              </button>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 text-sm font-medium rounded border border-red-200 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}