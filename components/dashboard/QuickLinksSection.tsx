import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const quickLinks: QuickLink[] = [
  {
    title: 'Post Archive',
    description: 'Browse all past posts',
    href: '/posts/archive',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    title: 'Daily Archive',
    description: 'Browse daily research',
    href: '/daily/archive',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Account',
    description: 'Manage your settings',
    href: '/account',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: 'Pricing',
    description: 'View upgrade options',
    href: '/#pricing',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function QuickLinksSection() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {quickLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          <Card className="h-full transition-all hover:shadow-warm hover:scale-[1.02]">
            <CardContent className="py-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-breezy-100 text-breezy-600 flex items-center justify-center">
                {link.icon}
              </div>
              <h3 className="font-semibold text-sand-900 text-sm">
                {link.title}
              </h3>
              <p className="text-sand-500 text-xs mt-1">
                {link.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
