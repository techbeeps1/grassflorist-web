'use client';

import React from 'react';
import { Skeleton, ProductCardSkeleton } from '@/components/ui/Skeleton';
import { type Locale } from '@/config/site';

interface ProductDetailPageSkeletonProps {
  locale?: Locale;
}

export function ProductDetailPageSkeleton({ locale = 'en' }: ProductDetailPageSkeletonProps) {
  const isRtl = locale === 'ar';

  return (
    <div className="py-6 bg-[#FAF7F2] min-h-screen animate-pulse" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-[1280px] mx-auto px-4">
        {/* 1. Breadcrumbs Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-14 rounded-md bg-[#E8E2D8]" />
          <span className="text-[#C5BAAF] text-xs">/</span>
          <Skeleton className="h-4 w-24 rounded-md bg-[#E8E2D8]" />
          <span className="text-[#C5BAAF] text-xs">/</span>
          <Skeleton className="h-4 w-36 rounded-md bg-[#E8E2D8]" />
        </div>

        {/* 2. Main PDP Grid: Gallery & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-4 items-start">
          {/* Gallery Column Skeleton */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Big Image Preview */}
            <div className="relative w-full aspect-[4/5] sm:aspect-[1/1] rounded-3xl bg-[#ECE4D8] border border-[#E4D9CA] shadow-2xs overflow-hidden flex items-center justify-center">
              <Skeleton className="w-full h-full bg-[#EAE2D5]" />
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-3 overflow-hidden pt-1">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#E8E0D2] shrink-0 border border-[#DDD3C4]"
                />
              ))}
            </div>
          </div>

          {/* Product Details & Ordering Column Skeleton */}
          <div className="lg:col-span-6 space-y-6 text-start">
            {/* Category Tag & Title */}
            <div className="space-y-2.5">
              <Skeleton className="h-3.5 w-24 rounded-full bg-[#E5DDD0]" />
              <Skeleton className="h-8 sm:h-10 w-4/5 rounded-xl bg-[#E2D7C8]" />
              <Skeleton className="h-5 w-2/5 rounded-lg bg-[#EAE3D7]" />
            </div>

            {/* Pricing Box Skeleton */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F5EFE6] border border-[#E6DDCF] flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-8 sm:h-9 w-32 rounded-xl bg-[#DFD4C4]" />
                <Skeleton className="h-3.5 w-20 rounded-md bg-[#E8E0D2]" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full bg-[#EAE3D6]" />
            </div>

            {/* Short Description Skeleton */}
            <div className="space-y-2 py-1">
              <Skeleton className="h-4 w-full rounded-md bg-[#E8E1D5]" />
              <Skeleton className="h-4 w-5/6 rounded-md bg-[#E8E1D5]" />
              <Skeleton className="h-4 w-3/4 rounded-md bg-[#E8E1D5]" />
            </div>

            {/* Quantity & CTA Buttons Skeleton */}
            <div className="space-y-4 pt-4 border-t border-[#E8E0D2]">
              {/* Quantity Selector Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-16 rounded-md bg-[#E5DDD0]" />
                  <Skeleton className="h-10 w-28 rounded-xl bg-[#E8E1D5]" />
                </div>
                <Skeleton className="h-6 w-24 rounded-lg bg-[#E5DDD0]" />
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3 pt-1">
                {/* Add to Bag Button Skeleton */}
                <Skeleton className="flex-1 min-h-[48px] sm:min-h-[52px] rounded-xl sm:rounded-2xl bg-[#EAE3D6] border border-[#DDD3C4]" />
                {/* Buy Now Button Skeleton */}
                <Skeleton className="flex-1 min-h-[48px] sm:min-h-[52px] rounded-xl sm:rounded-2xl bg-[#435849]/30" />
                {/* Wishlist Button Skeleton */}
                <Skeleton className="min-h-[48px] sm:min-h-[52px] min-w-[48px] sm:min-w-[52px] rounded-xl sm:rounded-2xl bg-[#EAE3D6] shrink-0 border border-[#DDD3C4]" />
              </div>
            </div>

            {/* Trust Perks / Delivery Info Strip */}
            <div className="p-4 rounded-2xl bg-[#F6F1E9] border border-[#E7DFD2] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full bg-[#E4D9CA] shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-32 rounded-md bg-[#E5DDD0]" />
                  <Skeleton className="h-3 w-44 rounded-md bg-[#EAE3D7]" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 rounded-md bg-[#E5DDD0]" />
            </div>
          </div>
        </div>

        {/* 3. Description Tab Section Skeleton */}
        <div className="mt-14 pt-8 border-t border-[#E8E0D2] space-y-4">
          <Skeleton className="h-6 w-36 rounded-lg bg-[#E2D7C8]" />
          <div className="space-y-2.5 max-w-3xl">
            <Skeleton className="h-4 w-full rounded-md bg-[#E8E1D5]" />
            <Skeleton className="h-4 w-11/12 rounded-md bg-[#E8E1D5]" />
            <Skeleton className="h-4 w-4/5 rounded-md bg-[#E8E1D5]" />
          </div>
        </div>

        {/* 4. Related Products Carousel Skeleton */}
        <div className="mt-16 pt-12 border-t border-[#E4D8CB] space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28 rounded-full bg-[#E5DDD0]" />
              <Skeleton className="h-7 w-48 rounded-xl bg-[#E2D7C8]" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-9 h-9 rounded-full bg-[#E8E1D5]" />
              <Skeleton className="w-9 h-9 rounded-full bg-[#E8E1D5]" />
            </div>
          </div>

          {/* Row of Product Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
