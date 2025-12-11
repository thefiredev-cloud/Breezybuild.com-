import Image from 'next/image';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-orange-500/20">
                <Image
                  src="/logo.jpg"
                  alt="Breezy Build Logo"
                  fill
                  className="object-cover"
                  sizes="36px"
                />
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
