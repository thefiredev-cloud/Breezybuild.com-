'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface MultiSelectOption {
  value: string;
  label: string;
  group?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  label,
  error,
  className = '',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectAll = () => {
    onChange(options.map((o) => o.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  // Group options by their group property
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, MultiSelectOption[]>);

  const groups = Object.keys(groupedOptions);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          {label}
        </label>
      )}

      {/* Selected values display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[48px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-white
          ${error
            ? 'border-red-300 focus:border-red-500'
            : isOpen
              ? 'border-primary-400 ring-2 ring-primary-200'
              : 'border-zinc-200 hover:border-zinc-300'
          }
        `}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 flex-1">
            {value.length === 0 ? (
              <span className="text-zinc-400">{placeholder}</span>
            ) : (
              value.map((v) => {
                const option = options.find((o) => o.value === v);
                return (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-lg text-sm"
                  >
                    {option?.label || v}
                    <button
                      onClick={(e) => removeOption(v, e)}
                      className="hover:text-primary-900"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
          <ChevronDownIcon
            className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-zinc-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {/* Quick actions */}
          <div className="flex gap-2 p-2 border-b border-zinc-100">
            <button
              onClick={selectAll}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Select All
            </button>
            <span className="text-zinc-300">|</span>
            <button
              onClick={clearAll}
              className="text-xs text-zinc-500 hover:text-zinc-700"
            >
              Clear All
            </button>
          </div>

          {/* Options by group */}
          {groups.map((group) => (
            <div key={group}>
              {groups.length > 1 && (
                <div className="px-3 py-1 text-xs font-semibold text-zinc-500 bg-zinc-50">
                  {group}
                </div>
              )}
              {groupedOptions[group].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                    className="w-4 h-4 rounded border-zinc-300 text-primary-500 focus:ring-primary-400"
                  />
                  <span className="text-sm text-zinc-700">{option.label}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
