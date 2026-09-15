import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className, rounded = 'md', ...props }: SkeletonProps) {
  const roundeds = {
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-[#EFECE6]',
        roundeds[rounded],
        className
      )}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-3xl overflow-hidden border border-[#EFE8DE] p-3 sm:p-3.5 shadow-2xs">
      <Skeleton className="w-full aspect-[4/3] rounded-2xl mb-3" />
      <Skeleton className="w-1/4 h-2.5 mb-2" />
      <Skeleton className="w-4/5 h-4 mb-2" />
      <Skeleton className="w-full h-3 mb-3" />
      <Skeleton className="w-1/3 h-3 mb-3" />
      <div className="flex items-center gap-2 mt-auto pt-2">
        <Skeleton className="flex-1 h-9 rounded-full" />
        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
      </div>
    </div>
  );
}
