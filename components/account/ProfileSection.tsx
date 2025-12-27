'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { updateProfile } from '@/app/(dashboard)/account/actions';

interface ProfileSectionProps {
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    company_name: string | null;
    website: string | null;
    email_verified: boolean;
  } | null;
  userEmail: string;
}

export function ProfileSection({ profile, userEmail }: ProfileSectionProps) {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    await updateProfile(formData);
    setIsPending(false);
  };

  return (
    <Card hover={false}>
      <CardHeader>
        <h2 className="font-display text-xl font-semibold text-zinc-900 dark:text-zinc-100">Profile Information</h2>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <Avatar
              src={profile?.avatar_url}
              name={profile?.full_name}
              email={userEmail}
              size="lg"
              className="w-20 h-20"
            />
          </div>

          {/* Profile Form */}
          <div className="flex-1 w-full">
            {/* Email - read only */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Email
              </label>
              <div className="flex items-center gap-2">
                <span className="text-zinc-900 dark:text-zinc-100">{userEmail}</span>
                {profile?.email_verified && (
                  <Badge variant="default" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Editable fields */}
            <form action={handleSubmit}>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Full Name
                  </label>
                  <Input
                    name="full_name"
                    defaultValue={profile?.full_name || ''}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Company
                  </label>
                  <Input
                    name="company_name"
                    defaultValue={profile?.company_name || ''}
                    placeholder="Your company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Website
                  </label>
                  <Input
                    name="website"
                    type="url"
                    defaultValue={profile?.website || ''}
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button type="submit" variant="primary" size="sm" isLoading={isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
