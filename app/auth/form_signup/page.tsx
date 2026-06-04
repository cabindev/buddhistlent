'use client'
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { FaUser, FaEnvelope, FaLock, FaImage } from 'react-icons/fa';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image: File | null;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = event.target;
    if (name === 'image' && files) {
      const file = files[0];
      const allowedExtensions = ['.jpg', '.jpeg', '.webp', '.svg', '.png'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (file && allowedExtensions.includes(`.${fileExtension}`)) {
        const options = {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        imageCompression(file, options)
          .then(compressedFile => {
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(compressedFile);
            setFormData({ ...formData, image: compressedFile });
          })
          .catch(error => {
            console.error('Error compressing image', error);
            toast.error('Error compressing image');
          });
      } else {
        toast.error('Invalid file type');
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) formDataToSend.append(key, value);
    });

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();

      if (response.status === 200) {
        toast.success('ลงทะเบียนสำเร็จ...', {
          duration: 4000,
          style: { background: '#4ade80', color: '#ffffff' },
        });
        setTimeout(() => router.push('/auth/signin'), 1000);
      } else {
        toast.error(data.error || 'มีบางอย่างผิดปกติ', {
          style: { background: '#f87171', color: '#ffffff' },
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('มีบางอย่างผิดปกติ', {
        style: { background: '#f87171', color: '#ffffff' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            สร้างบัญชีใหม่
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Toaster />
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="flex gap-2">
              <div>
                <label htmlFor="firstName" className="sr-only">ชื่อจริง</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                    placeholder="ชื่อจริง"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">นามสกุล</label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="นามสกุล"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="sr-only">อีเมล</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="อีเมล"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">รหัสผ่าน</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="รหัสผ่าน"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">รูปถ่าย</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500">
                    <span>อัพโหลดรูปภาพ</span>
                    <input
                      type="file"
                      name="image"
                      id="image"
                      accept=".jpg,.jpeg,.webp,.svg,.png"
                      onChange={handleChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP, SVG up to 200KB</p>
              </div>
            </div>
            {imagePreview && (
              <div className="mt-2 flex justify-center">
                <img src={imagePreview} alt="Image Preview" className="w-24 h-24 object-cover rounded-full" />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-amber-300' : 'bg-amber-600 hover:bg-amber-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
            >
              {isLoading ? 'กำลังดำเนินการ...' : 'ลงทะเบียน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}