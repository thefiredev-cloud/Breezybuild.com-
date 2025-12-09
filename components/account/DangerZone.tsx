'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function DangerZone() {
  return (
    <Card hover={false} className="border-sand-300">
      <CardHeader>
        <h2 className="text-xl font-semibold text-sand-900">Account Actions</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sign Out */}
        <div className="flex items-center justify-between py-3 border-b border-sand-200">
          <div>
            <p className="font-medium text-sand-900">Sign out</p>
            <p className="text-sm text-sand-600">Sign out of your account on this device</p>
          </div>
          <form action="/auth/signout" method="POST">
            <Button type="submit" variant="secondary" size="sm">
              Sign Out
            </Button>
          </form>
        </div>

        {/* Delete Account Info */}
        <div className="py-3">
          <p className="font-medium text-sand-700">Delete account</p>
          <p className="text-sm text-sand-500 mt-1">
            To delete your account and all associated data, please contact support at support@breezybuild.com
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
