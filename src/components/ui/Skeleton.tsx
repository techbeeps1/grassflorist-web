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

export function CartDrawerItemSkeleton({ title }: { title?: string }) {
  return (
    <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E0D2] flex gap-3.5 items-center animate-pulse">
      <Skeleton className="w-20 h-20 rounded-xl shrink-0 bg-[#E8E2D8]" />
      <div className="flex-1 min-w-0 space-y-2 py-0.5">
        <div className="flex items-start justify-between gap-2">
          {title ? (
            <span className="text-[13px] font-bold text-[#435849] truncate block">{title}</span>
          ) : (
            <Skeleton className="h-4 w-3/4 rounded-md bg-[#E8E2D8]" />
          )}
          <Skeleton className="w-4 h-4 rounded-full shrink-0 bg-[#E8E2D8]" />
        </div>
        <Skeleton className="h-3 w-1/2 rounded-md bg-[#EAE4DA]" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-7 w-20 rounded-lg bg-[#EAE4DA]" />
          <Skeleton className="h-4 w-16 rounded-md bg-[#E8E2D8]" />
        </div>
      </div>
    </div>
  );
}

export function CartPageItemSkeleton({ title }: { title?: string }) {
  return (
    <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between animate-pulse">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 bg-[#E8E2D8]" />
        <div className="space-y-2 flex-1 sm:w-60">
          <Skeleton className="h-3 w-20 rounded-md bg-[#EAE4DA]" />
          {title ? (
            <span className="text-sm sm:text-base font-bold text-[#435849] truncate block">{title}</span>
          ) : (
            <Skeleton className="h-5 w-48 rounded-md bg-[#E8E2D8]" />
          )}
          <Skeleton className="h-3 w-32 rounded-md bg-[#EAE4DA]" />
        </div>
      </div>
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0">
        <Skeleton className="h-9 w-28 rounded-lg bg-[#EAE4DA]" />
        <Skeleton className="h-6 w-20 rounded-md bg-[#E8E2D8]" />
        <Skeleton className="w-8 h-8 rounded-full shrink-0 bg-[#EAE4DA]" />
      </div>
    </div>
  );
}

