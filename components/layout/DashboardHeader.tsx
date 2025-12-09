'use client';

import Link from 'next/link';
import { NavigationTabs } from './NavigationTabs';
import { UserDropdown } from './UserDropdown';
import { UpgradeCTA } from './UpgradeCTA';
import { MobileMenu } from './MobileMenu';
import type { SubscriptionTier } from '@/types/database.types';

interface DashboardHeaderProps {
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

export function DashboardHeader({ user, subscription }: DashboardHeaderProps) {
  return (
    <header className="border-b border-sand-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container-wide py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-cta flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-sand-900">
            Breezy<span className="text-breezy-500">Build</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationTabs />

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Upgrade CTA (free users only) */}
          {!subscription.hasPaidAccess && <UpgradeCTA />}

          {/* User Dropdown (desktop) */}
          <div className="hidden md:block">
            <UserDropdown user={user} subscription={subscription} />
          </div>

          {/* Mobile Menu */}
          <MobileMenu user={user} subscription={subscription} />
        </div>
      </div>
    </header>
  );
}
