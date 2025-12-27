interface AvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, email, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-xs' },
    md: { container: 'w-10 h-10', text: 'text-sm' },
    lg: { container: 'w-14 h-14', text: 'text-lg' },
  };

  const getInitials = () => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  const getColor = (initials: string) => {
    const colors = [
      'bg-primary-500',
      'bg-warm-500',
      'bg-emerald-500',
      'bg-blue-500',
      'bg-purple-500',
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const initials = getInitials();
  const { container, text } = sizes[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${container} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${container} ${getColor(initials)} rounded-full flex items-center justify-center text-white font-semibold ${text} ${className}`}
    >
      {initials}
    </div>
  );
}
