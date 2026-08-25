import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-100 ${className}`}
      {...props}
    />
  );
}

// Table Rows Skeleton Loader Component
export function TableSkeletonRows({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-zinc-100">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="px-4 py-4">
              <Skeleton
                className={`h-4 ${cIdx === 0
                    ? 'w-16'
                    : cIdx === 1
                      ? 'w-32'
                      : cIdx === cols - 1
                        ? 'ml-auto w-20'
                        : 'w-24'
                  }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Dashboard Analytics Card Skeleton Component
export function CardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>

      <Skeleton className="h-8 w-36" />

      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Product Card Skeleton Loader Component
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#12131a] p-3.5 space-y-3 animate-pulse">
      <div className="aspect-[4/3] w-full bg-zinc-200 dark:bg-zinc-800/60 rounded-xl" />
      <div className="space-y-2 flex-1 pt-1">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800/60 rounded-md" />
          <div className="h-3 w-10 bg-zinc-200 dark:bg-zinc-800/60 rounded-md" />
        </div>
        <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800/60 rounded-md" />
        <div className="h-3 w-1/2 bg-zinc-150 dark:bg-zinc-800/40 rounded-md" />
      </div>
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800/60 rounded" />
          <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800/60 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-9 bg-zinc-200 dark:bg-zinc-800/60 rounded-xl" />
          <div className="h-9 bg-zinc-200 dark:bg-zinc-800/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
}