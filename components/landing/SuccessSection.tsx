'use client';

import { CheckmarkAnimation } from '@/components/ui/CheckmarkAnimation';
import { SUCCESS } from '@/lib/constants';

interface SuccessSectionProps {
  email?: string;
}

export function SuccessSection({ email }: SuccessSectionProps) {
  return (
    <section id="success" className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="container-tight section-padding text-center">
        {/* Checkmark animation */}
        <div className="flex justify-center mb-8">
          <CheckmarkAnimation size={100} />
        </div>

        {/* Confirmation headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-sand-900 mb-4 animate-slide-up">
          {SUCCESS.headline}
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-sand-600 mb-2 animate-slide-up animate-delay-100">
          {SUCCESS.subheadline}
        </p>

        {email && (
          <p className="text-breezy-600 font-medium mb-10 animate-fade-in animate-delay-200">
            {email}
          </p>
        )}

        {/* Deliverables */}
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-breezy-100 p-6 shadow-warm animate-scale-in animate-delay-300">
          <h2 className="text-lg font-semibold text-sand-900 mb-4">What you&apos;ll receive:</h2>
          <ul className="space-y-3 text-left">
            {SUCCESS.deliverables.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sand-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
