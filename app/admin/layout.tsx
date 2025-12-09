import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Admin Header */}
      <header className="bg-sand-900 text-white">
        <div className="container-wide py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-breezy-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold">Admin</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/admin" className="text-sand-300 hover:text-white">
                Posts
              </Link>
              <Link href="/admin/posts/new" className="text-sand-300 hover:text-white">
                New Post
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/posts" className="text-sand-300 hover:text-white text-sm">
              View Site
            </Link>
            <span className="text-sand-400 text-sm">{user.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-8">
        {children}
      </main>
    </div>
  );
}
