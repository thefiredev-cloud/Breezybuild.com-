import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-skeleton rounded-md bg-zinc-200',
        className
      )}
      aria-hidden="true"
    />
  );
}

// Pre-built skeleton variants
export function SkeletonLine({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />;
}

export function SkeletonTitle({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-6 w-3/4', className)} />;
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-3 p-4 border border-zinc-200 rounded-xl', className)}>
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// Stats card skeleton for dashboard
export function SkeletonStatsCard({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-zinc-200 p-6', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 4, className }: SkeletonProps & { columns?: number }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Tool card skeleton for browse page
export function SkeletonToolCard({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-zinc-200 p-6', className)}>
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
