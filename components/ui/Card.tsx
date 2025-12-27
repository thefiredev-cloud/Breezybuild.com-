interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  featured?: boolean;
}

export function Card({ children, className = '', hover = true, featured = false }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-dark-surface rounded-2xl border p-6
        ${featured ? 'border-primary/50 bg-gradient-to-b from-primary/5 to-transparent' : 'border-zinc-200 dark:border-dark-border'}
        ${hover ? 'hover:shadow-card-hover hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-zinc-200 dark:border-dark-border ${className}`}>
      {children}
    </div>
  );
}
