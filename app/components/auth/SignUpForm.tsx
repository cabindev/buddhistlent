// app/components/auth/SignUpForm.tsx
'use client'

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Mail, Lock, User, Upload, ArrowLeft, AlertCircle, Eye, EyeOff } from "lucide-react"

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  image: File | null
}

export default function SignUpForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    image: null
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const router = useRouter()

  const compressImage = async (file: File): Promise<File> => {
    // ... (keep the existing compress logic)
    return file; // Simplified for brevity
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('กรุณาอัพโหลดไฟล์รูปภาพ (JPG, PNG, WEBP)')
        return
      }

      try {
        const compressedFile = await compressImage(file)
        setFormData({ ...formData, image: compressedFile })
        
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(compressedFile)
        setError(null)
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) data.append(key, value)
      })

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: data
      })

      if (response.ok) {
        router.push('/auth/signin')
      } else {
        const error = await response.json()
        setError(error.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
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
          
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">สมัครสมาชิก</h1>
          <p className="text-gray-600 text-center mb-6 text-sm">
            ร่วมเป็นส่วนหนึ่งของ Buddhist lent
          </p>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-gray-700 text-sm font-medium mb-1">
                  ชื่อ
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-gray-700 text-sm font-medium mb-1">
                  นามสกุล
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

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
                  className="pl-10 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
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
                  className="pl-10 pr-10 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="อย่างน้อย 5 ตัวอักษร"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                รูปโปรไฟล์ <span className="text-gray-500">(ไม่บังคับ)</span>
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-gray-400" />
                  )}
                </div>
                <label className="flex-1 cursor-pointer">
                  <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 text-center">
                    <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                    <span className="text-sm text-gray-600">อัพโหลดรูปภาพ</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start p-3 rounded-lg bg-red-50 border border-red-200"
              >
                <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                <p className="ml-2 text-sm text-red-700">{error}</p>
              </motion.div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || compressing}
              className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                isLoading || compressing
                  ? "bg-orange-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
              }`}
            >
              {isLoading ? "กำลังดำเนินการ..." : "สมัครสมาชิก"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-medium">
                เข้าสู่ระบบ
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