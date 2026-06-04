// app/organization/components/ui/Textarea.tsx
'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`
          w-full px-3 py-2.5 text-sm
          border rounded-lg
          bg-white
          transition-colors duration-200
          focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-none
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

Textarea.displayName = 'Textarea';