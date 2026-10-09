'use client';

import React, { useEffect, useRef, useState } from 'react';
import { type Locale } from '@/config/site';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadMorePaginationProps {
  total: number;
  currentCount: number;
  onLoadMore: () => void;
  isLoading?: boolean;
  locale: Locale;
  className?: string;
}

export function LoadMorePagination({
  total,
  currentCount,
  onLoadMore,
  isLoading: externalLoading = false,
  locale,
  className,
}: LoadMorePaginationProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [internalLoading, setInternalLoading] = useState(false);

  const clampedCount = Math.min(currentCount, total);
  const percentage = total > 0 ? Math.min(100, Math.round((clampedCount / total) * 100)) : 100;
  const hasMore = clampedCount < total;
  const isLoading = externalLoading || internalLoading;

  // Stable ref for onLoadMore to prevent unwanted effect re-triggers
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // Infinite Scroll Trigger via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          setInternalLoading(true);
          onLoadMoreRef.current();

          // Reset internal loading after short delay so items can mount smoothly
          setTimeout(() => {
            setInternalLoading(false);
          }, 350);
        }
      },
      {
        root: null,
        rootMargin: '300px', // Preload slightly before hitting bottom for seamless scroll
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  if (total <= 0) return null;

  return (
    <div
      className={cn(
        'mt-10 mb-8 flex flex-col items-center justify-center text-center space-y-4 select-none',
        className
      )}
    >
      {/* Progress Counter & Progress Bar */}
      <div className="w-full max-w-xs sm:max-w-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
          <span>
            {locale === 'ar'
              ? `عرض ${clampedCount} من أصل ${total} منتج`
              : `Showing ${clampedCount} of ${total} products`}
          </span>
          <span className="font-bold text-text-main">{percentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#EFE7DC] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Automatic Loader Sentinel or Completion Badge */}
      {hasMore ? (
        <div
          ref={sentinelRef}
          className="w-full py-4 flex flex-col items-center justify-center"
        >
          {/* Animated Loading Animation (No button!) */}
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-surface-subtle border border-border/80 shadow-2xs text-text-secondary text-xs font-semibold">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span>
              {locale === 'ar'
                ? 'جاري تحميل المزيد من المنتجات...'
                : 'Loading more products...'}
            </span>
          </div>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-surface-subtle text-text-muted text-xs font-medium border border-border/60">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            {locale === 'ar'
              ? `لقد شاهدت جميع المنتجات الـ ${total}`
              : `You've viewed all ${total} products`}
          </span>
        </div>
      )}
    </div>
  );
}
