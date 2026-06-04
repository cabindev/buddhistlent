// app/organization/components/ui/Input.tsx
'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full px-3 py-2.5 text-sm
          border rounded-lg
          bg-white
          transition-colors duration-200
          focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
            : 'border-gray-300'
          }
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';