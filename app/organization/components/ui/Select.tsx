// app/organization/components/ui/Select.tsx
'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error = false, children, ...props }, ref) => {
    return (
      <select
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
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';