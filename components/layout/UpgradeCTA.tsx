'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function UpgradeCTA() {
  return (
    <Link href="/#pricing" className="hidden sm:flex items-center gap-2">
      <span className="hidden lg:inline text-sm text-primary-600 font-medium">
        Unlock full archive
      </span>
      <Button variant="primary" size="sm">
        Upgrade
      </Button>
    </Link>
  );
}
