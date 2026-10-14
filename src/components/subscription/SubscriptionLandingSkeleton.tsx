'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Locale } from '@/config/site';

interface SubscriptionLandingSkeletonProps {
  locale?: Locale;
}

export function SubscriptionLandingSkeleton({ locale = 'en' }: SubscriptionLandingSkeletonProps) {
  const isRtl = locale === 'ar';

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1E1915]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Breadcrumbs Skeleton */}
      <div className="site-container pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-14 rounded-md bg-[#E8DFD3]" />
          <span className="text-[#C5BAAF] text-xs">/</span>
          <Skeleton className="h-4 w-32 rounded-md bg-[#E8DFD3]" />
        </div>
      </div>

      {/* 2. Hero Banner Skeleton */}
      <div className="site-container mt-3">
        <div className="rounded-3xl overflow-hidden border border-[#E8DFD3] min-h-[360px] sm:min-h-[440px] bg-[#EAE2D5] p-6 sm:p-12 md:p-16 flex flex-col justify-center space-y-4 animate-pulse">
          <Skeleton className="h-7 w-56 rounded-full bg-[#DDD3C4]" />
          <Skeleton className="h-10 sm:h-14 w-3/4 max-w-lg rounded-2xl bg-[#D5CABE]" />
          <Skeleton className="h-5 sm:h-6 w-full max-w-md rounded-xl bg-[#DDD3C4]" />
          <Skeleton className="h-5 sm:h-6 w-4/5 max-w-sm rounded-xl bg-[#DDD3C4]" />
          <div className="pt-2">
            <Skeleton className="h-12 w-44 rounded-xl bg-[#D5CABE]" />
          </div>
        </div>
      </div>

      {/* 3. Perks Bar Skeleton */}
      <div className="site-container mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-[#E8DFD3]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl bg-[#ECE4D8] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-24 rounded-md bg-[#ECE4D8]" />
                <Skeleton className="h-2.5 w-16 rounded-md bg-[#F2ECE1]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Plans Grid Skeleton */}
      <div className="site-container mt-12 pb-16">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl bg-[#E8DFD3] mx-auto" />
          <Skeleton className="h-4 w-80 rounded-md bg-[#ECE4D8] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white border border-[#E8DFD3] overflow-hidden shadow-xs flex flex-col animate-pulse"
            >
              {/* Image Skeleton */}
              <div className="aspect-[4/3] w-full bg-[#EAE2D5] relative">
                <Skeleton className="w-full h-full bg-[#EAE2D5]" />
                <div className="absolute top-4 start-4">
                  <Skeleton className="h-6 w-24 rounded-full bg-[#D5CABE]" />
                </div>
              </div>

              {/* Content Skeleton */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <Skeleton className="h-6 w-3/4 rounded-xl bg-[#E8DFD3]" />
                  <Skeleton className="h-3.5 w-full rounded-md bg-[#F2ECE1]" />
                  <Skeleton className="h-3.5 w-5/6 rounded-md bg-[#F2ECE1]" />
                </div>

                {/* Price Pill */}
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#F2ECE1] flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-2.5 w-16 rounded bg-[#E8DFD3]" />
                    <Skeleton className="h-6 w-24 rounded-lg bg-[#DDD3C4]" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full bg-[#E8DFD3]" />
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-[#F2ECE1]">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded-full bg-[#ECE4D8] shrink-0" />
                      <Skeleton className="h-3 w-40 rounded bg-[#F2ECE1]" />
                    </div>
                  ))}
                </div>

                {/* Button Skeleton */}
                <div className="pt-2">
                  <Skeleton className="h-12 w-full rounded-xl bg-[#435849]/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
