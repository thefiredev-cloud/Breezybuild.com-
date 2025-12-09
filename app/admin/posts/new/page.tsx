import { PostForm } from '@/components/admin/PostForm';

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-sand-900 mb-8">Create New Post</h1>
      <PostForm mode="create" />
    </div>
  );
}
