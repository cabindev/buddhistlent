// components/ui/ProductionImage.tsx
'use client';

import { useState, useEffect } from 'react';

interface ProductionImageProps {
 src?: string | null;
 alt: string;
 width?: number;
 height?: number;
 className?: string;
 style?: React.CSSProperties;
 onClick?: () => void;
 priority?: boolean;
 quality?: number;
 placeholder?: 'blur' | 'empty';
 onLoad?: () => void;
 onError?: () => void;
}

export default function ProductionImage({
 src,
 alt,
 width = 300,
 height = 200,
 className = '',
 style = {},
 onClick,
 priority = false,
 quality = 85,
 placeholder = 'empty',
 onLoad,
 onError
}: ProductionImageProps) {
 const [isLoaded, setIsLoaded] = useState(false);
 const [hasError, setHasError] = useState(false);
 const [imageSrc, setImageSrc] = useState('');
 const [isClient, setIsClient] = useState(false);

 // ✅ Check if we're on client side
 useEffect(() => {
   setIsClient(true);
 }, []);

 useEffect(() => {
   if (!isClient) return;

   // ✅ Handle null or undefined src
   if (!src || src.trim() === '') {
     setHasError(true);
     setImageSrc('/images/placeholder.jpg');
     return;
   }

   // ✅ Handle different src formats
   let fullSrc = src;

   // If it's a blob URL (from file upload preview)
   if (src.startsWith('blob:')) {
     fullSrc = src;
   }
   // If it's already a full URL
   else if (src.startsWith('http') || src.startsWith('/')) {
     fullSrc = src;
   }
   // If it's just a filename
   else {
     fullSrc = `/images/${src}`;
   }

   setImageSrc(fullSrc);
   
   // ✅ Preload image to check if it can be loaded
   const img = new Image();
   
   img.onload = () => {
     setIsLoaded(true);
     setHasError(false);
     onLoad?.();
   };
   
   img.onerror = () => {
     setHasError(true);
     setIsLoaded(false);
     onError?.();
     
     // ✅ Try fallback if original fails
     if (!fullSrc.includes('/images/placeholder')) {
       setImageSrc('/images/placeholder.jpg');
     }
   };
   
   img.src = fullSrc;

   // ✅ Cleanup function
   return () => {
     img.onload = null;
     img.onerror = null;
   };
 }, [src, isClient, onLoad, onError]);

 // ✅ Don't render anything on server side to avoid hydration mismatch
 if (!isClient) {
   return (
     <div 
       className={`bg-gray-100 animate-pulse flex items-center justify-center ${className}`}
       style={{ width, height, ...style }}
     >
       <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
         <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
       </svg>
     </div>
   );
 }

 // ✅ Loading state
 if (!isLoaded && !hasError) {
   return (
     <div 
       className={`bg-gray-100 animate-pulse flex items-center justify-center ${className}`}
       style={{ width, height, ...style }}
     >
       {placeholder === 'blur' ? (
         <div className="bg-gradient-to-r from-gray-200 to-gray-300 w-full h-full rounded" />
       ) : (
         <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
           <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
         </svg>
       )}
     </div>
   );
 }

 // ✅ Error state
 if (hasError) {
   return (
     <div 
       className={`bg-gray-200 flex items-center justify-center text-gray-500 text-sm ${className}`}
       style={{ width, height, ...style }}
       onClick={onClick}
     >
       <div className="text-center p-4">
         <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
         </svg>
         <span className="block text-xs">ไม่สามารถโหลดรูปได้</span>
       </div>
     </div>
   );
 }

 // ✅ Success state - render the actual image
 return (
   <img
     src={imageSrc}
     alt={alt}
     width={width}
     height={height}
     className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
     style={{
       objectFit: 'cover',
       maxWidth: '100%',
       height: 'auto',
       ...style
     }}
     onClick={onClick}
     loading={priority ? 'eager' : 'lazy'}
     decoding="async"
     // ✅ Additional attributes for better performance
     onLoad={() => {
       setIsLoaded(true);
       onLoad?.();
     }}
     onError={() => {
       setHasError(true);
       onError?.();
     }}
   />
 );
}

// ✅ Export additional utility component for Next.js Image fallback
export function AdaptiveImage(props: ProductionImageProps) {
 const isDev = process.env.NODE_ENV === 'development';
 const isServer = typeof window === 'undefined';

 // ✅ In development, try to use Next.js Image first
 if (isDev && !isServer) {
   try {
     const NextImage = require('next/image').default;
     return (
       <NextImage
         src={props.src}
         alt={props.alt}
         width={props.width || 300}
         height={props.height || 200}
         className={props.className}
         style={props.style}
         onClick={props.onClick}
         priority={props.priority}
         quality={props.quality}
         placeholder={props.placeholder}
         onLoad={props.onLoad}
         onError={props.onError}
       />
     );
   } catch (error) {
     // Fallback to ProductionImage if Next.js Image fails
     return <ProductionImage {...props} />;
   }
 }

 // ✅ In production or server, always use ProductionImage
 return <ProductionImage {...props} />;
}