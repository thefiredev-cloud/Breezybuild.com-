interface AvatarStackProps {
  avatars: string[];
  size?: number;
  maxVisible?: number;
  className?: string;
}

export function AvatarStack({ avatars, size = 40, maxVisible = 5, className = '' }: AvatarStackProps) {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remaining = avatars.length - maxVisible;

  // Generate avatar colors based on initials
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

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-3">
        {visibleAvatars.map((initials, index) => (
          <div
            key={index}
            className={`relative inline-flex items-center justify-center rounded-full border-2 border-white text-white font-semibold ${getColor(initials)}`}
            style={{
              width: size,
              height: size,
              fontSize: size * 0.4,
              zIndex: visibleAvatars.length - index,
            }}
          >
            {initials}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className="relative inline-flex items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-zinc-600 font-semibold"
            style={{
              width: size,
              height: size,
              fontSize: size * 0.35,
              zIndex: 0,
            }}
          >
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
}
