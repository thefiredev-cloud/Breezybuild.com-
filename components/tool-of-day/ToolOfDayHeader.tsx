'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/solid';

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sand-200">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-breezy-500 rounded-lg flex items-center justify-center">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-breezy-600">Breezy</span>
              <span className="text-sand-800">Build</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/daily/archive" className="text-sand-600 hover:text-sand-900 text-sm font-medium transition-colors">
              Browse Tools
            </Link>
            <Link href="/pricing" className="text-sand-600 hover:text-sand-900 text-sm font-medium transition-colors">
              Pricing
            </Link>

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-1 text-sand-600 hover:text-sand-900 text-sm font-medium transition-colors"
              >
                More
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-sand-200 rounded-xl shadow-lg">
                  <div className="py-2">
                    <Link href="/about" className="block px-4 py-2 text-sm text-sand-700 hover:bg-sand-50">
                      About
                    </Link>
                    <Link href="/contact" className="block px-4 py-2 text-sm text-sand-700 hover:bg-sand-50">
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
                    className="px-4 py-2 text-sm font-medium text-breezy-600 hover:text-breezy-700"
                  >
                    Upgrade
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-sand-600 hover:text-sand-900"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-sand-600 hover:text-sand-900"
                >
                  Login
                </Link>
                <Link
                  href="/login?signup=true"
                  className="px-4 py-2 bg-breezy-500 text-white text-sm font-semibold rounded-lg hover:bg-breezy-600 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-sand-600 hover:text-sand-900"
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
          <div className="md:hidden border-t border-sand-200 py-4">
            <nav className="space-y-2">
              <Link
                href="/daily/archive"
                className="block px-4 py-2 text-sand-700 hover:bg-sand-50 rounded-lg"
              >
                Browse Tools
              </Link>
              <Link
                href="/pricing"
                className="block px-4 py-2 text-sand-700 hover:bg-sand-50 rounded-lg"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block px-4 py-2 text-sand-700 hover:bg-sand-50 rounded-lg"
              >
                About
              </Link>

              <div className="pt-4 border-t border-sand-200 mt-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-breezy-600 font-medium hover:bg-sand-50 rounded-lg"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sand-700 hover:bg-sand-50 rounded-lg"
                    >
                      Login
                    </Link>
                    <Link
                      href="/login?signup=true"
                      className="block mx-4 py-2 text-center bg-breezy-500 text-white font-semibold rounded-lg"
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
