import { SkillForm } from '@/components/admin/SkillForm';

export const dynamic = 'force-dynamic';

export default function NewSkillPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sand-900">Create New Skill</h1>
        <p className="text-sand-600 mt-1">
          Create a new Claude skill MD file
        </p>
      </div>

      <SkillForm mode="create" />
    </div>
  );
}
