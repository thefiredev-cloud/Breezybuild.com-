'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-sand-200 focus:border-breezy-400 focus:ring-breezy-200'
            }
            focus:outline-none focus:ring-2
            placeholder:text-sand-400
            ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
