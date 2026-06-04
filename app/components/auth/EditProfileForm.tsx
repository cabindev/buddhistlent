//app/components/auth/EditProfileForm.tsx
'use client'

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { User, Upload, ArrowLeft } from "lucide-react"

interface FormData {
  firstName: string
  lastName: string
  email: string
  image: File | null
}

export default function EditProfileForm({ userId }: { userId: string }) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    image: null
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (response.ok) {
          const data = await response.json()
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            image: null
          })
          setImagePreview(data.image)
        }
      } catch (err) {
        setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้')
      }
    }

    fetchUserData()
  }, [userId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('กรุณาอัพโหลดไฟล์รูปภาพ (JPG, PNG, WEBP)')
        return
      }
      if (file.size > 5000000) {
        setError('ขนาดไฟล์ต้องไม่เกิน 5MB')
        return
      }

      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
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

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: data
      })

      if (response.ok) {
        router.push('/profile')
      } else {
        const error = await response.json()
        setError(error.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <Image 
              src="/x-right.png" 
              alt="SOBER CHEERs Logo" 
              width={100} 
              height={100} 
              className="object-contain"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            แก้ไขโปรไฟล์
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 cursor-pointer hover:bg-orange-600 transition">
                  <Upload size={16} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  นามสกุล
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล
              </label>
              <input
                type="email"
                id="email"
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                value={formData.email}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between space-x-4">
              <Link
                href="/profile"
                className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition ${
                  isLoading 
                    ? "bg-orange-400 cursor-not-allowed" 
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {isLoading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/profile" className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm">
            <ArrowLeft size={16} className="mr-1" />
            กลับหน้าโปรไฟล์
          </Link>
        </div>
      </div>
    </div>
  )
}