'use client';

import { forwardRef, ReactNode } from 'react';
import { Input } from './Input';
import { Textarea } from './Textarea';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children?: ReactNode;
}

export function FormField({
  label,
  name,
  error,
  required,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-sand-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-sand-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// Input with built-in error styling
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, required, className, ...props }, ref) => {
    return (
      <FormField
        label={label}
        name={props.name || props.id || ''}
        error={error}
        required={required}
        hint={hint}
      >
        <Input
          ref={ref}
          className={`${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${className || ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.name}-error` : undefined}
          {...props}
        />
      </FormField>
    );
  }
);

FormInput.displayName = 'FormInput';

// Textarea with built-in error styling
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, required, className, ...props }, ref) => {
    return (
      <FormField
        label={label}
        name={props.name || props.id || ''}
        error={error}
        required={required}
        hint={hint}
      >
        <Textarea
          ref={ref}
          className={`${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${className || ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.name}-error` : undefined}
          {...props}
        />
      </FormField>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
