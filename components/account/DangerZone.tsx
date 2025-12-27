'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function DangerZone() {
  return (
    <Card hover={false} className="border-zinc-300 dark:border-zinc-700">
      <CardHeader>
        <h2 className="font-display text-xl font-semibold text-zinc-900 dark:text-zinc-100">Account Actions</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sign Out */}
        <div className="flex items-center justify-between py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">Sign out</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Sign out of your account on this device</p>
          </div>
          <form action="/auth/signout" method="POST">
            <Button type="submit" variant="secondary" size="sm">
              Sign Out
            </Button>
          </form>
        </div>

        {/* Delete Account Info */}
        <div className="py-3">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">Delete account</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            To delete your account and all associated data, please contact support at support@breezybuild.com
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
