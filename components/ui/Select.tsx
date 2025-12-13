'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  error?: string;
  label?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, error, label, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-sand-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-sand-200 focus:border-breezy-400 focus:ring-breezy-200'
            }
            focus:outline-none focus:ring-2
            ${!props.value && placeholder ? 'text-sand-400' : 'text-sand-900'}
            ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
