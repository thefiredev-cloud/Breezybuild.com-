'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'Content',
    items: [
      { name: 'Dashboard', href: '/admin', icon: HomeIcon },
      { name: 'Skills', href: '/admin/skills', icon: SparklesIcon },
      { name: 'Posts', href: '/admin/posts', icon: DocumentTextIcon },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
      { name: 'Logs', href: '/admin/logs', icon: ClockIcon },
      { name: 'System', href: '/admin/system', icon: CogIcon },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-4 py-6 border-b border-sand-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-cta rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-white">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 text-xs font-semibold text-sand-500 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${active
                        ? 'bg-breezy-500/20 text-breezy-400'
                        : 'text-sand-400 hover:text-white hover:bg-sand-800'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sand-800">
        <Link
          href="/"
          className="text-sm text-sand-500 hover:text-white transition-colors"
        >
          &larr; Back to Site
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-sand-900 rounded-lg text-white min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-breezy-500 focus:ring-offset-2"
        aria-label="Open navigation menu"
        aria-expanded={isMobileOpen}
        aria-controls="mobile-sidebar"
      >
        <Bars3Icon className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-sidebar-title"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-sidebar"
            className="absolute left-0 top-0 bottom-0 w-64 bg-sand-900 flex flex-col animate-slide-in-left"
          >
            <span id="mobile-sidebar-title" className="sr-only">
              Admin Navigation
            </span>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-sand-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-breezy-500 rounded-lg"
              aria-label="Close navigation menu"
            >
              <XMarkIcon className="w-6 h-6" aria-hidden="true" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sand-900"
        aria-label="Admin navigation"
      >
        <NavContent />
      </aside>
    </>
  );
}
