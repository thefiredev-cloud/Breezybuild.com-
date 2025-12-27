interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'outline' | 'success';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-primary/20 text-primary-700 dark:text-primary-400',
    highlight: 'bg-primary text-white',
    outline: 'bg-transparent border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400',
    success: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
