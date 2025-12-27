'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { SubscriptionTier } from '@/types/database.types';

interface UserDropdownProps {
  user: {
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  subscription: {
    tier: SubscriptionTier;
  };
}

const TIER_CONFIG: Record<SubscriptionTier, { label: string; variant: 'default' | 'highlight' | 'outline' }> = {
  free: { label: 'Free', variant: 'outline' },
  starter: { label: 'Starter', variant: 'default' },
  pro: { label: 'Pro', variant: 'highlight' },
  enterprise: { label: 'Enterprise', variant: 'highlight' },
};

export function UserDropdown({ user, subscription }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const tierConfig = TIER_CONFIG[subscription.tier];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-100 transition-colors"
      >
        <Avatar
          src={user.avatarUrl}
          name={user.fullName}
          email={user.email}
          size="sm"
        />
        <span className="hidden lg:block text-sm font-medium text-zinc-700 max-w-[120px] truncate">
          {user.fullName || user.email.split('@')[0]}
        </span>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-zinc-200 py-2 z-50 animate-fade-in">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatarUrl}
                name={user.fullName}
                email={user.email}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">
                  {user.fullName || 'User'}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {user.email}
                </p>
                <Badge variant={tierConfig.variant} className="mt-1 text-xs px-2 py-0.5">
                  {tierConfig.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Account Settings
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-zinc-100 pt-1">
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
