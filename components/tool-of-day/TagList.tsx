'use client';

import { useState } from 'react';

interface TagListProps {
  tags: string[];
  maxVisible?: number;
}

export function TagList({ tags, maxVisible = 3 }: TagListProps) {
  const [expanded, setExpanded] = useState(false);

  if (!tags || tags.length === 0) return null;

  const visibleTags = expanded ? tags : tags.slice(0, maxVisible);
  const hiddenCount = tags.length - maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-3 py-1 bg-sand-50 text-sand-700 text-sm font-medium rounded-full border border-sand-200 hover:bg-sand-100 transition-colors cursor-default"
        >
          {tag}
        </span>
      ))}

      {hiddenCount > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="inline-flex items-center px-3 py-1 bg-breezy-50 text-breezy-700 text-sm font-medium rounded-full border border-breezy-200 hover:bg-breezy-100 transition-colors"
        >
          +{hiddenCount} More
        </button>
      )}

      {expanded && tags.length > maxVisible && (
        <button
          onClick={() => setExpanded(false)}
          className="inline-flex items-center px-3 py-1 bg-sand-50 text-sand-500 text-sm font-medium rounded-full border border-sand-200 hover:bg-sand-100 transition-colors"
        >
          Show Less
        </button>
      )}
    </div>
  );
}
