'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const updates = {
    full_name: formData.get('full_name') as string || null,
    company_name: formData.get('company_name') as string || null,
    website: formData.get('website') as string || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('profiles')
    // @ts-expect-error - Supabase types not fully configured for profiles update
    .update(updates)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/account');
  return { success: true };
}
