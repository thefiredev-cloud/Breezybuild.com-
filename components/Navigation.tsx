'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/50 dark:border-stone-800/50 glass">
      <nav className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-shadow">
              <Image
                src="/logo.jpg"
                alt="Breezy Build Logo"
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <span className="font-semibold text-xl text-stone-900 dark:text-white tracking-tight">
              breezy<span className="text-orange-500">build</span><span className="text-stone-500">.com</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/archive"
              className="text-stone-600 dark:text-stone-300 hover:text-orange-500 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Archive
            </Link>
            <Link
              href="/pricing"
              className="text-stone-600 dark:text-stone-300 hover:text-orange-500 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* CTA Section */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/archive"
              className="btn-primary text-sm"
            >
              Start Reading
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 dark:border-stone-800">
            <div className="flex flex-col gap-4">
              <Link
                href="/archive"
                className="text-stone-600 dark:text-stone-300 hover:text-orange-500 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Archive
              </Link>
              <Link
                href="/pricing"
                className="text-stone-600 dark:text-stone-300 hover:text-orange-500 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="pt-4">
                <Link
                  href="/archive"
                  className="btn-primary text-sm w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Reading
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
