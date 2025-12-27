'use client';

import Image from 'next/image';
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
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container-wide py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="inline-flex items-center gap-2">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-primary/20">
            <Image
              src="/logo.jpg"
              alt="Breezy Build Logo"
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
          <span className="text-xl font-bold font-display text-zinc-900">
            breezy<span className="text-primary">build</span><span className="text-zinc-500">.com</span>
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
