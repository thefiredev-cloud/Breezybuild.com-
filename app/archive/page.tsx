import { getToolsFiltered } from '@/lib/supabase';
import ArchiveClient from './ArchiveClient';

// Force dynamic rendering - env vars not available at build time
export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
  const userTier = 'free'; // Default to free tier without auth

  // Fetch initial tools for SSR
  const { tools, total } = await getToolsFiltered({
    limit: 12,
    offset: 0,
  });

  return <ArchiveClient initialTools={tools} initialTotal={total} userTier={userTier} />;
}
