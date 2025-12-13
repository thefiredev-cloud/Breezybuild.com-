'use client';

import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SkillPreviewProps {
  name: string;
  description: string;
  allowed_tools: string[];
  markdown_content: string;
  tags?: string[];
}

export function SkillPreview({
  name,
  description,
  allowed_tools,
  markdown_content,
  tags = [],
}: SkillPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  // Generate the full skill file content
  const generateFileContent = (): string => {
    const lines = ['---', `name: ${name}`, `description: ${description}`];

    if (allowed_tools.length > 0) {
      lines.push(`allowed-tools: ${allowed_tools.join(', ')}`);
    }

    if (tags.length > 0) {
      lines.push(`tags: [${tags.map((t) => `"${t}"`).join(', ')}]`);
    }

    lines.push('---', '', markdown_content);

    return lines.join('\n');
  };

  const fileContent = generateFileContent();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-sand-50 border-b border-sand-200">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-sand-700">SKILL.md Preview</span>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs text-sand-500 hover:text-sand-700 underline"
          >
            {showRaw ? 'Show Formatted' : 'Show Raw'}
          </button>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 text-sm text-sand-600 hover:text-sand-900"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {showRaw ? (
          <pre className="text-sm text-sand-700 font-mono whitespace-pre-wrap bg-sand-50 p-4 rounded-lg overflow-x-auto">
            {fileContent}
          </pre>
        ) : (
          <div className="space-y-6">
            {/* Frontmatter */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="text-xs font-semibold text-purple-600 uppercase mb-2">
                Frontmatter
              </h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-purple-500 font-medium">name</dt>
                  <dd className="text-purple-900">{name || '(empty)'}</dd>
                </div>
                <div>
                  <dt className="text-purple-500 font-medium">description</dt>
                  <dd className="text-purple-900">{description || '(empty)'}</dd>
                </div>
                {allowed_tools.length > 0 && (
                  <div>
                    <dt className="text-purple-500 font-medium">allowed-tools</dt>
                    <dd className="text-purple-900">{allowed_tools.join(', ')}</dd>
                  </div>
                )}
                {tags.length > 0 && (
                  <div>
                    <dt className="text-purple-500 font-medium">tags</dt>
                    <dd className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-purple-200 text-purple-800 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Markdown Content */}
            <div>
              <h4 className="text-xs font-semibold text-sand-500 uppercase mb-2">
                Content
              </h4>
              <div className="prose prose-sand max-w-none">
                {markdown_content ? (
                  <div className="bg-sand-50 rounded-lg p-4 text-sm">
                    {markdown_content.split('\n').map((line, i) => {
                      // Simple markdown rendering
                      if (line.startsWith('## ')) {
                        return (
                          <h2 key={i} className="text-lg font-bold text-sand-900 mt-4 mb-2">
                            {line.replace('## ', '')}
                          </h2>
                        );
                      }
                      if (line.startsWith('### ')) {
                        return (
                          <h3 key={i} className="text-md font-semibold text-sand-800 mt-3 mb-1">
                            {line.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <li key={i} className="ml-4 text-sand-700">
                            {line.replace('- ', '')}
                          </li>
                        );
                      }
                      if (line.trim() === '') {
                        return <br key={i} />;
                      }
                      return (
                        <p key={i} className="text-sand-700">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sand-400 italic">No content yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
