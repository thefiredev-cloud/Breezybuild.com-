'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface EmailCaptureFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  buttonText?: string;
  placeholder?: string;
  className?: string;
}

export function EmailCaptureForm({
  onSubmit,
  isLoading = false,
  error,
  buttonText = 'Get Started Free',
  placeholder = 'Enter your email',
  className = '',
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email) {
      setLocalError('Please enter your email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email');
      return;
    }

    await onSubmit(email);
  };

  const displayError = error || localError;

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            error={displayError}
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          className="whitespace-nowrap"
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
}
