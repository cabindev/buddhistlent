//app/components/auth/SignInForm.tsx
'use client'

import { useState, FormEvent } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react"

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      } else {
        router.replace("/")
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาด โปรดลองอีกครั้ง")
    } finally {
      setIsLoading(false)
    }
  }

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
              alt="Buddhist lent Logo" 
              width={120} 
              height={120} 
              className="object-contain"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">เข้าสู่ระบบ</h1>
          <p className="text-gray-600 text-center mb-6 text-sm">
            ยินดีต้อนรับสู่ Buddhist lent - งดเหล้าเข้าพรรษา
          </p>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium">
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
                  className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pl-10 pr-10 w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="รหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  จดจำฉัน
                </label>
              </div>
              <Link href="/auth/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start p-4 rounded-lg bg-red-50 border border-red-200"
              >
                <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
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
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>
          
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">หรือ</span>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              ยังไม่มีบัญชี?{' '}
              <Link href="/auth/signup" className="font-medium text-orange-600 hover:text-orange-700">
                สมัครสมาชิก
              </Link>
            </p>
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
  )
}