interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-breezy-100 text-breezy-700',
    highlight: 'bg-gradient-cta text-white',
    outline: 'bg-transparent border border-breezy-300 text-breezy-600',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
