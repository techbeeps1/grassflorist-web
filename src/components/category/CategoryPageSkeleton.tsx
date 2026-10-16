'use client';

import React from 'react';
import { Skeleton, ProductCardSkeleton } from '@/components/ui/Skeleton';
import { type Locale } from '@/config/site';

interface CategoryPageSkeletonProps {
  locale?: Locale;
}

export function CategoryPageSkeleton({ locale = 'en' }: CategoryPageSkeletonProps) {
  const isRtl = locale === 'ar';

  return (
    <div className="site-container py-6 sm:py-8 space-y-6 sm:space-y-8 animate-pulse" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-16 rounded-md bg-[#E8E2D8]" />
        <span className="text-[#C5BAAF] text-xs">/</span>
        <Skeleton className="h-4 w-24 rounded-md bg-[#E8E2D8]" />
      </div>

      {/* 2. Category Hero Banner Skeleton */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#F5EFE6] to-[#ECE3D5] py-3.5 px-5 sm:py-4 sm:px-8 border border-[#E8E0D2] shadow-2xs flex items-center justify-between gap-4 sm:gap-6 overflow-hidden">
        <div className="space-y-2 max-w-lg flex-1 min-w-0">
          <Skeleton className="h-6 sm:h-8 w-40 sm:w-60 rounded-xl bg-[#E2D8CA]" />
          <Skeleton className="h-3.5 sm:h-4 w-52 sm:w-72 rounded-md bg-[#E5DCCF]" />
        </div>
        <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl bg-[#E0D5C5] shrink-0 border-2 border-white shadow-sm" />
      </div>

      {/* 3. Circular Category Slider Skeleton */}
      <div className="py-2">
        <div className="flex items-center justify-between gap-4 sm:gap-6 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <Skeleton className="w-20 h-20 sm:w-26 sm:h-26 md:w-28 md:h-28 rounded-full bg-[#EAE2D5]" />
              <Skeleton className="h-3 w-14 sm:w-16 rounded-md bg-[#E4DBD0]" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Subcategory Pills Skeleton: commented out to match actual page layout */}
      {/*
      <div className="flex items-center gap-2 overflow-hidden py-1">
        <Skeleton className="h-8 w-28 rounded-full bg-[#E5DDD2] shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full bg-[#EAE3D9] shrink-0" />
        <Skeleton className="h-8 w-26 rounded-full bg-[#EAE3D9] shrink-0" />
        <Skeleton className="h-8 w-20 rounded-full bg-[#EAE3D9] shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full bg-[#EAE3D9] shrink-0" />
        <Skeleton className="h-8 w-28 rounded-full bg-[#EAE3D9] shrink-0" />
      </div>
      */}

      {/* 4. Controls Bar Skeleton */}
      <div className="bg-[#FAF8F5] border border-[#EAE3D8] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 sm:w-32 rounded-xl bg-[#EAE2D5]" />
          <Skeleton className="h-4 w-28 rounded-md bg-[#EAE2D5] hidden sm:block" />
        </div>
        <Skeleton className="h-9 w-32 sm:w-40 rounded-xl bg-[#EAE2D5]" />
      </div>

      {/* 5. Product Grid & Filter Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar Skeleton (Desktop only) */}
        <div className="hidden lg:block lg:col-span-3 p-5 bg-[#FAF8F5] rounded-2xl border border-[#EAE3D8] space-y-4">
          {/* Header */}
          <div className="pb-3 border-b border-[#EAE3D8] flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded-md bg-[#E2D8CA]" />
          </div>

          {/* Subcategories Section */}
          <div className="pb-3 border-b border-[#EAE3D8] space-y-2">
            <Skeleton className="h-3.5 w-24 rounded-md bg-[#E2D8CA] mb-2" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-7 w-full rounded-xl bg-[#EAE2D5]" />
            ))}
          </div>



          {/* Price Range Section */}
          <div className="pt-3 border-t border-[#EAE3D8] space-y-2">
            <Skeleton className="h-3.5 w-20 rounded-md bg-[#E2D8CA] mb-2" />
            <div className="grid grid-cols-2 gap-1.5">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-7 rounded-xl bg-[#EAE2D5]" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Product Grid Skeleton */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
