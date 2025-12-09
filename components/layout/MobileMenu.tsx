'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { SubscriptionTier } from '@/types/database.types';

interface MobileMenuProps {
  user: {
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  subscription: {
    tier: SubscriptionTier;
    hasPaidAccess: boolean;
  };
}

const TIER_CONFIG: Record<SubscriptionTier, { label: string; variant: 'default' | 'highlight' | 'outline' }> = {
  free: { label: 'Free', variant: 'outline' },
  pro: { label: 'Pro', variant: 'highlight' },
  enterprise: { label: 'Enterprise', variant: 'highlight' },
};

const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Posts', href: '/posts' },
  { label: 'Daily', href: '/daily' },
  { label: 'Post Archive', href: '/posts/archive' },
  { label: 'Daily Archive', href: '/daily/archive' },
  { label: 'Account', href: '/account' },
];

export function MobileMenu({ user, subscription }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const tierConfig = TIER_CONFIG[subscription.tier];

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-sand-600 hover:text-sand-900 hover:bg-sand-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Full-screen Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sand-200">
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-cta flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-sand-900">
                Breezy<span className="text-breezy-500">Build</span>
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-sand-600 hover:text-sand-900 hover:bg-sand-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-sand-200">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatarUrl}
                name={user.fullName}
                email={user.email}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-sand-900 truncate">
                  {user.fullName || 'User'}
                </p>
                <p className="text-sm text-sand-500 truncate">
                  {user.email}
                </p>
                <Badge variant={tierConfig.variant} className="mt-1">
                  {tierConfig.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-breezy-100 text-breezy-700'
                    : 'text-sand-700 hover:bg-sand-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Upgrade CTA (for free users) */}
          {!subscription.hasPaidAccess && (
            <div className="p-4 border-t border-sand-200">
              <Link href="/#pricing" onClick={() => setIsOpen(false)}>
                <Button variant="primary" className="w-full">
                  Upgrade to Unlock Archive
                </Button>
              </Link>
            </div>
          )}

          {/* Sign Out */}
          <div className="p-4 border-t border-sand-200">
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sand-600 hover:text-sand-900 hover:bg-sand-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
