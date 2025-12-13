'use client';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'draft' | 'global' | 'local' | 'synced' | 'error';
  className?: string;
}

const statusStyles: Record<StatusBadgeProps['status'], { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  inactive: { bg: 'bg-sand-100', text: 'text-sand-600', label: 'Inactive' },
  draft: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Draft' },
  global: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Global' },
  local: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Local' },
  synced: { bg: 'bg-green-100', text: 'text-green-700', label: 'Synced' },
  error: { bg: 'bg-red-100', text: 'text-red-700', label: 'Error' },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${className}`}
    >
      {style.label}
    </span>
  );
}

// Location badge specifically for skills
interface LocationBadgeProps {
  location: 'global' | 'local';
  className?: string;
}

export function LocationBadge({ location, className = '' }: LocationBadgeProps) {
  return <StatusBadge status={location} className={className} />;
}
