import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { PostForm } from '@/components/admin/PostForm';

export const dynamic = 'force-dynamic';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-sand-900 mb-8">Edit Post</h1>
      <PostForm post={post} mode="edit" />
    </div>
  );
}
