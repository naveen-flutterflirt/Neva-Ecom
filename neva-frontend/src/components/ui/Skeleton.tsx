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