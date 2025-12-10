'use client';

import { useState } from 'react';
import {
  SparklesIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  BookmarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface ToolActionsProps {
  toolUrl?: string | null;
  toolName: string;
}

export function ToolActions({ toolUrl, toolName }: ToolActionsProps) {
  const [actionsOpen, setActionsOpen] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tool of the Day: ${toolName}`,
          text: `Check out ${toolName} on BreezyBuild`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex items-center justify-between py-4 px-2">
      {/* Actions Dropdown */}
      <div className="relative">
        <button
          onClick={() => setActionsOpen(!actionsOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sand-700 bg-white border border-sand-200 rounded-lg hover:bg-sand-50 transition-colors"
        >
          <SparklesIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Tool Actions</span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${actionsOpen ? 'rotate-180' : ''}`} />
        </button>

        {actionsOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-sand-200 rounded-xl shadow-lg z-10">
            <div className="py-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sand-700 hover:bg-sand-50"
              >
                <ShareIcon className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">Share</p>
                  <p className="text-xs text-sand-500">Share this tool</p>
                </div>
              </button>

              <button className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sand-700 hover:bg-sand-50">
                <BookmarkIcon className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">Save</p>
                  <p className="text-xs text-sand-500">Save for later</p>
                </div>
              </button>

              <button className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sand-700 hover:bg-sand-50">
                <ArrowDownTrayIcon className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">Download</p>
                  <p className="text-xs text-sand-500">Export as PDF</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Primary CTA */}
      {toolUrl ? (
        <a
          href={toolUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-breezy-500 to-warm-500 text-white font-semibold rounded-lg hover:from-breezy-600 hover:to-warm-600 transition-all shadow-warm"
        >
          <span>Try This Tool</span>
          <span>→</span>
        </a>
      ) : (
        <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-breezy-500 to-warm-500 text-white font-semibold rounded-lg hover:from-breezy-600 hover:to-warm-600 transition-all shadow-warm">
          <span>Learn More</span>
          <span>→</span>
        </button>
      )}
    </div>
  );
}
