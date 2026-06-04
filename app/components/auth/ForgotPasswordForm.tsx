//app/components/auth/ForgotPasswordForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณแล้ว');
      setIsSuccess(true);
      setEmail('');
    } catch (error: any) {
      console.error('Error occurred:', error);
      setMessage(error.response?.data?.error || 'เกิดข้อผิดพลาดในการส่งอีเมล');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <Image 
              src="/x-right.png" 
              alt="SOBER CHEERs Logo" 
              width={120} 
              height={120} 
              className="object-contain"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">ลืมรหัสผ่าน</h1>
          <p className="text-gray-600 text-center mb-6 text-sm">
            กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
          </p>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start p-4 rounded-lg ${
                  isSuccess 
                    ? "bg-green-50 border border-green-200" 
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                )}
                <p className={`ml-3 text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                  {message}
                </p>
              </motion.div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                isLoading 
                  ? "bg-orange-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  กำลังดำเนินการ...
                </div>
              ) : (
                "ส่งลิงก์รีเซ็ตรหัสผ่าน"
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm">
            <ArrowLeft size={16} className="mr-1" />
            กลับหน้าหลัก
          </Link>
        </div>
      </motion.div>
    </div>
  );
}