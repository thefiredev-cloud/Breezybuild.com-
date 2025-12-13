import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/lib/auth';
import { Sidebar } from '@/components/admin/Sidebar';

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
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top bar with user info */}
        <header className="bg-white border-b border-sand-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-end">
            <span className="text-sm text-sand-600">{user.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
