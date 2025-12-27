'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface ToolOfDayHeaderProps {
  user?: {
    email: string;
    fullName: string | null;
  } | null;
  subscription?: {
    tier: string;
    hasPaidAccess: boolean;
  } | null;
}

export function ToolOfDayHeader({ user, subscription }: ToolOfDayHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-orange-500/20">
              <Image
                src="/logo.jpg"
                alt="Breezy Build Logo"
                fill
                className="object-cover animate-spin-slow"
                sizes="36px"
              />
            </div>
            <span className="text-xl font-bold">
              <span className="text-primary-dark">Breezy</span>
              <span className="text-zinc-800 dark:text-zinc-200">Build</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium transition-colors">
              Browse Tools
            </Link>
            <Link href="/pricing" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium transition-colors">
              Pricing
            </Link>

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium transition-colors"
              >
                More
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-primary-lg">
                  <div className="py-2">
                    <Link href="/about" className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      About
                    </Link>
                    <Link href="/contact" className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      Contact
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {!subscription?.hasPaidAccess && (
                  <Link
                    href="/pricing"
                    className="px-4 py-2 text-sm font-medium text-primary-dark hover:text-primary"
                  >
                    Upgrade
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Login
                </Link>
                <Link
                  href="/login?signup=true"
                  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 py-4">
            <nav className="space-y-2">
              <Link
                href="/browse"
                className="block px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg"
              >
                Browse Tools
              </Link>
              <Link
                href="/pricing"
                className="block px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg"
              >
                About
              </Link>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-primary-dark font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg"
                    >
                      Login
                    </Link>
                    <Link
                      href="/login?signup=true"
                      className="block mx-4 py-2 text-center bg-primary text-white font-semibold rounded-lg"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
