'use client';

import React from 'react';
import { Skeleton, CartPageItemSkeleton } from '@/components/ui/Skeleton';
import { type Locale } from '@/config/site';

interface CartPageSkeletonProps {
  locale?: Locale;
}

export function CartPageSkeleton({ locale = 'en' }: CartPageSkeletonProps) {
  const isRtl = locale === 'ar';

  return (
    <div className="py-6 bg-surface min-h-[80vh]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-14 rounded-md bg-[#E8DFD3]" />
          <span className="text-[#C5BAAF] text-xs">/</span>
          <Skeleton className="h-4 w-28 rounded-md bg-[#E8DFD3]" />
        </div>

        {/* Page Title & Subtitle Skeleton */}
        <div className="mb-8 text-start space-y-2">
          <Skeleton className="h-8 sm:h-9 w-48 rounded-xl bg-[#E8DFD3]" />
          <Skeleton className="h-4 w-full max-w-lg rounded-md bg-[#ECE4D8]" />
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface rounded-2xl border border-border divide-y divide-border overflow-hidden shadow-xs">
              <CartPageItemSkeleton />
              <CartPageItemSkeleton />
            </div>
          </div>

          {/* Order Summary Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6 animate-pulse">
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-6">
              {/* Summary Header */}
              <Skeleton className="h-6 w-36 rounded-lg bg-[#E8DFD3]" />

              {/* Progress bar */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[#FAF7F2] border border-border">
                <Skeleton className="h-3.5 w-full rounded bg-[#ECE4D8]" />
                <Skeleton className="h-2 w-full rounded-full bg-[#E8DFD3]" />
              </div>

              {/* Promo code input skeleton */}
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-xl bg-[#FAF7F2] border border-border" />
                <Skeleton className="h-10 w-20 rounded-xl bg-[#E8DFD3]" />
              </div>

              {/* Price rows */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3.5 w-20 rounded bg-[#ECE4D8]" />
                  <Skeleton className="h-3.5 w-16 rounded bg-[#ECE4D8]" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3.5 w-28 rounded bg-[#ECE4D8]" />
                  <Skeleton className="h-3.5 w-16 rounded bg-[#ECE4D8]" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3.5 w-24 rounded bg-[#ECE4D8]" />
                  <Skeleton className="h-3.5 w-16 rounded bg-[#ECE4D8]" />
                </div>
                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <Skeleton className="h-5 w-20 rounded bg-[#E8DFD3]" />
                  <Skeleton className="h-6 w-24 rounded bg-[#435849]/30" />
                </div>
              </div>

              {/* Checkout Button */}
              <Skeleton className="h-12 w-full rounded-xl bg-[#435849]/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
