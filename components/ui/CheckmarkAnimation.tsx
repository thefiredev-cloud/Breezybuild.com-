'use client';

import { useEffect, useState } from 'react';

interface CheckmarkAnimationProps {
  size?: number;
  className?: string;
}

export function CheckmarkAnimation({ size = 80, className = '' }: CheckmarkAnimationProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#d1fae5"
          strokeWidth="8"
          className={`transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#10b981"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="283"
          strokeDashoffset={animate ? 0 : 283}
          className="transition-all duration-700 ease-out"
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
      </svg>

      {/* Checkmark */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        <path
          d="M30 50 L45 65 L70 35"
          fill="none"
          stroke="#10b981"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="60"
          strokeDashoffset={animate ? 0 : 60}
          className="transition-all duration-500 ease-out"
          style={{ transitionDelay: '400ms' }}
        />
      </svg>
    </div>
  );
}
