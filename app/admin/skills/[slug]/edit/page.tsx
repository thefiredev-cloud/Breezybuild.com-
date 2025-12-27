import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { SkillForm } from '@/components/admin/SkillForm';
import type { Skill } from '@/types/skill.types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getSkill(slug: string): Promise<Skill | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Skill;
}

export default async function EditSkillPage({ params }: PageProps) {
  const { slug } = await params;
  const skill = await getSkill(slug);

  if (!skill) {
    notFound();
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Edit Skill</h1>
        <p className="text-zinc-600 mt-1">
          Editing: {skill.name}
        </p>
      </div>

      <SkillForm skill={skill} mode="edit" />
    </div>
  );
}
