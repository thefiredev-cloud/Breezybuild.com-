'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { SkillPreview } from './SkillPreview';
import type { Skill, SkillFormData, SkillSection } from '@/types/skill.types';
import { ALLOWED_TOOLS, TOOL_CATEGORIES, DEFAULT_SECTIONS } from '@/types/skill.types';

interface SkillFormProps {
  skill?: Skill;
  mode: 'create' | 'edit';
}

// Convert tool categories to MultiSelect options
const toolOptions = Object.entries(TOOL_CATEGORIES).flatMap(([group, tools]) =>
  tools.map((tool) => ({
    value: tool,
    label: tool.replace('mcp__', '').replace('__*', ''),
    group,
  }))
);

const storageOptions = [
  { value: 'global', label: 'Global (~/.claude/skills/)' },
  { value: 'local', label: 'Local (./skills/)' },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function SkillForm({ skill, mode }: SkillFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<SkillFormData>({
    name: skill?.name || '',
    description: skill?.description || '',
    allowed_tools: skill?.allowed_tools || [],
    sections: skill ? parseMarkdownToSections(skill.markdown_content) : DEFAULT_SECTIONS.map((s) => ({ ...s, id: generateId() })),
    tags: skill?.tags || [],
    storage_location: skill?.storage_location || 'global',
  });

  const [tagInput, setTagInput] = useState('');

  // Parse markdown content into sections
  function parseMarkdownToSections(markdown: string): SkillSection[] {
    const sections: SkillSection[] = [];
    const lines = markdown.split('\n');
    let currentSection: Partial<SkillSection> | null = null;
    let currentContent: string[] = [];
    let order = 0;

    for (const line of lines) {
      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        if (currentSection) {
          sections.push({
            id: generateId(),
            title: currentSection.title || '',
            content: currentContent.join('\n').trim(),
            type: inferSectionType(currentSection.title || ''),
            order: order++,
          });
        }
        currentSection = { title: h2Match[1].trim() };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      sections.push({
        id: generateId(),
        title: currentSection.title || '',
        content: currentContent.join('\n').trim(),
        type: inferSectionType(currentSection.title || ''),
        order: order,
      });
    }

    return sections.length > 0 ? sections : DEFAULT_SECTIONS.map((s) => ({ ...s, id: generateId() }));
  }

  function inferSectionType(title: string): SkillSection['type'] {
    const lower = title.toLowerCase();
    if (lower.includes('when')) return 'when-to-use';
    if (lower.includes('process') || lower.includes('step')) return 'process';
    if (lower.includes('best') || lower.includes('practice')) return 'best-practices';
    return 'custom';
  }

  // Generate markdown from sections
  function sectionsToMarkdown(): string {
    return formData.sections
      .sort((a, b) => a.order - b.order)
      .map((s) => `## ${s.title}\n\n${s.content}`)
      .join('\n\n');
  }

  // Update a section
  const updateSection = (id: string, updates: Partial<SkillSection>) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  // Add a new section
  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: generateId(),
          title: 'New Section',
          content: '',
          type: 'custom' as const,
          order: prev.sections.length,
        },
      ],
    }));
  };

  // Remove a section
  const removeSection = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  };

  // Add a tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  // Remove a tag
  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const markdown_content = sectionsToMarkdown();
      const payload = {
        name: formData.name,
        description: formData.description,
        allowed_tools: formData.allowed_tools,
        markdown_content,
        tags: formData.tags,
        storage_location: formData.storage_location,
      };

      const url = mode === 'create' ? '/api/skills' : `/api/skills/${skill?.slug}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save skill');
      }

      router.push('/admin/skills');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'edit', label: 'Edit' },
    { id: 'preview', label: 'Preview' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'edit' | 'preview')}
      />

      <TabPanel tabId="edit" activeTab={activeTab} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-sand-200 p-6 space-y-4">
          <h3 className="font-semibold text-sand-900">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Skill Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <Select
              options={storageOptions}
              value={formData.storage_location}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  storage_location: e.target.value as 'global' | 'local',
                }))
              }
              disabled={mode === 'edit'}
            />
          </div>

          <Textarea
            placeholder="Description - what does this skill do?"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={2}
            required
          />
        </div>

        {/* Allowed Tools */}
        <div className="bg-white rounded-xl border border-sand-200 p-6 space-y-4">
          <h3 className="font-semibold text-sand-900">Allowed Tools</h3>
          <MultiSelect
            options={toolOptions}
            value={formData.allowed_tools}
            onChange={(values) => setFormData((prev) => ({ ...prev, allowed_tools: values }))}
            placeholder="Select tools this skill can use..."
          />
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl border border-sand-200 p-6 space-y-4">
          <h3 className="font-semibold text-sand-900">Tags</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addTag}>
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-sand-100 text-sand-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-xl border border-sand-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sand-900">Content Sections</h3>
            <Button type="button" variant="secondary" size="sm" onClick={addSection}>
              + Add Section
            </Button>
          </div>

          <div className="space-y-4">
            {formData.sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <div
                  key={section.id}
                  className="border border-sand-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-sand-500 w-6">{index + 1}.</span>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      placeholder="Section Title"
                      className="flex-1"
                    />
                    {formData.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    placeholder="Section content (markdown supported)..."
                    rows={4}
                  />
                </div>
              ))}
          </div>
        </div>
      </TabPanel>

      <TabPanel tabId="preview" activeTab={activeTab}>
        <SkillPreview
          name={formData.name}
          description={formData.description}
          allowed_tools={formData.allowed_tools}
          markdown_content={sectionsToMarkdown()}
          tags={formData.tags}
        />
      </TabPanel>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-sand-200">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {mode === 'create' ? 'Create Skill' : 'Update Skill'}
        </Button>
      </div>
    </form>
  );
}
