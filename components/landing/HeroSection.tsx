'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HERO } from '@/lib/constants';

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-200 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative z-10 container-tight section-padding text-center">
        {/* Brand wordmark */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-zinc-900">Breezy<span className="text-primary">Build</span></span>
          </div>
        </div>

        {/* Eyebrow */}
        <div className="mb-6 animate-fade-in">
          <Badge variant="outline">{HERO.eyebrow}</Badge>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-zinc-900 mb-6 animate-slide-up">
          <span className="text-gradient">{HERO.headline}</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 animate-slide-up animate-delay-100">
          {HERO.subheadline}
        </p>

        {/* CTA Button */}
        <div className="max-w-md mx-auto mb-4 animate-slide-up animate-delay-200">
          <Link href="/login">
            <Button variant="primary" className="w-full text-lg py-4">
              {HERO.cta}
            </Button>
          </Link>
        </div>

        {/* Privacy note */}
        <p className="text-sm text-zinc-400 mb-12 animate-fade-in animate-delay-300">
          {HERO.privacy}
        </p>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 animate-fade-in animate-delay-400">
          {HERO.trustSignals.map((signal, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary-dark">{signal.label}</p>
              <p className="text-sm text-zinc-500">{signal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
