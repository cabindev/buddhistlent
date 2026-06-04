'use client';
import { LoaderCircle } from 'lucide-react';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  color?: 'amber' | 'green' | 'blue' | 'gray';
}

export default function Loading({
  text,
  size = 'md',
  fullPage = false,
  color = 'amber',
}: LoadingProps) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  const colorMap = {
    amber: 'text-amber-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    gray: 'text-gray-400',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-2">
      <LoaderCircle className={`${sizeMap[size]} ${colorMap[color]} animate-spin`} />
      {text && <span className="text-sm text-gray-400">{text}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full py-16">
      {spinner}
    </div>
  );
}
