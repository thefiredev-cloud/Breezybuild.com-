'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tab {
  label: string;
  href: string;
  matchPaths: string[];
}

const tabs: Tab[] = [
  { label: 'Dashboard', href: '/dashboard', matchPaths: ['/dashboard'] },
  { label: 'Posts', href: '/posts', matchPaths: ['/posts'] },
  { label: 'Daily', href: '/daily', matchPaths: ['/daily'] },
  { label: 'Archive', href: '/posts/archive', matchPaths: ['/posts/archive', '/daily/archive'] },
];

export function NavigationTabs() {
  const pathname = usePathname();

  const isActive = (tab: Tab) => {
    return tab.matchPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  };

  return (
    <nav className="hidden md:flex items-center gap-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive(tab)
              ? 'bg-breezy-100 text-breezy-700'
              : 'text-sand-600 hover:text-sand-900 hover:bg-sand-100'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
