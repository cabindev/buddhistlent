// components/form-return/InstagramCard.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FormReturnData } from '@/types/form-return';

interface InstagramCardProps {
  form: FormReturnData;
}

const InstagramCard: React.FC<InstagramCardProps> = ({ form }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // ✅ Cache busting function สำหรับ production
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/images/no-image.png';
    
    // ใช้ updatedAt หรือ createdAt เป็น cache buster
    const timestamp = form.updatedAt 
      ? new Date(form.updatedAt).getTime() 
      : new Date(form.createdAt).getTime();
    
    return `${imagePath}?v=${timestamp}`;
  };

  // กรองและตรวจสอบรูปภาพที่มีอยู่
  const images = [form.image1, form.image2]
    .filter((img): img is string => 
      img !== undefined && 
      img !== null && 
      typeof img === 'string' && 
      img.trim() !== ''
    );

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleImageError = (imagePath: string) => {
    setImageErrors(prev => ({ ...prev, [imagePath]: true }));
  };

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
      {/* Edit Icon - Top Right */}
      <Link 
        href={`/form_return/edit/${form.id}`}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all"
      >
        <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </Link>

      {/* Image Section */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {hasImages ? (
          <>
            {/* Main Image - ✅ ใช้ img tag แทน Next.js Image */}
            <div className="relative w-full h-full">
              <img
                src={imageErrors[images[currentImageIndex]] 
                  ? '/images/no-image.png' 
                  : getImageUrl(images[currentImageIndex])
                }
                alt={`${form.organizationName || 'องค์กร'} - รูปที่ ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => handleImageError(images[currentImageIndex])}
                loading="lazy"
              />
            </div>

            {/* Navigation Controls - Show only if more than 1 image */}
            {hasMultipleImages && (
              <>
                {/* Previous Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  aria-label="รูปก่อนหน้า"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  aria-label="รูปถัดไป"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/60 hover:bg-white/80 w-2'
                      }`}
                      aria-label={`ไปยังรูปที่ ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </>
        ) : (
          /* No Image Placeholder */
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
              </svg>
              <p className="text-slate-500 text-sm">ไม่มีรูปภาพ</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section - เหมือนเดิม */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-3 text-center line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
          {form.organizationName || 'ไม่ระบุชื่อองค์กร'}
        </h3>
        
        <div className="space-y-3 text-sm text-slate-600 mb-4">
          {(form.firstName || form.lastName) && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-slate-800 truncate">
                {[form.firstName, form.lastName].filter(Boolean).join(' ') || 'ไม่ระบุชื่อ'}
              </span>
            </div>
          )}
          
          {(form.district || form.amphoe || form.province) && (
            <div className="flex items-start">
              <svg className="w-4 h-4 mr-3 mt-0.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-2 leading-relaxed">
                {[form.district, form.amphoe, form.province]
                  .filter(Boolean)
                  .join(', ') || 'ไม่ระบุที่อยู่'}
                {form.zipcode && ` ${form.zipcode}`}
              </span>
            </div>
          )}
          
          {form.phoneNumber && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="truncate">{form.phoneNumber}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full border border-green-200">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold">
                {typeof form.numberOfSigners === 'number' 
                  ? form.numberOfSigners.toLocaleString('th-TH') 
                  : '0'
                } คน
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          <div className="flex items-center justify-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {form.createdAt 
                ? new Date(form.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'ไม่ระบุวันที่'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramCard;