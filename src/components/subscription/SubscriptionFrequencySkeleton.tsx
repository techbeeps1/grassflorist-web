'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Locale } from '@/config/site';

interface SubscriptionFrequencySkeletonProps {
  locale?: Locale;
}

export function SubscriptionFrequencySkeleton({ locale = 'en' }: SubscriptionFrequencySkeletonProps) {
  const isRtl = locale === 'ar';

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1E1915]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Breadcrumbs Skeleton */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-14 rounded-md bg-[#E8DFD3]" />
          <span className="text-[#C5BAAF] text-xs">/</span>
          <Skeleton className="h-4 w-24 rounded-md bg-[#E8DFD3]" />
          <span className="text-[#C5BAAF] text-xs">/</span>
          <Skeleton className="h-4 w-32 rounded-md bg-[#E8DFD3]" />
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Configuration Options (7 cols) */}
          <div className="lg:col-span-7 space-y-8 animate-pulse">
            {/* Header */}
            <div className="space-y-2">
              <Skeleton className="h-8 sm:h-10 w-3/4 rounded-xl bg-[#E8DFD3]" />
              <Skeleton className="h-4 w-full max-w-md rounded-md bg-[#ECE4D8]" />
            </div>

            {/* Step 1: Frequency */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8DFD3] space-y-4">
              <div className="space-y-1">
                <Skeleton className="h-5 w-44 rounded-lg bg-[#E8DFD3]" />
                <Skeleton className="h-3.5 w-60 rounded bg-[#F2ECE1]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-[#E8DFD3] space-y-2 bg-[#FAF7F2]">
                    <Skeleton className="h-4 w-24 rounded bg-[#E8DFD3]" />
                    <Skeleton className="h-3 w-16 rounded bg-[#F2ECE1]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Duration */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8DFD3] space-y-4">
              <div className="space-y-1">
                <Skeleton className="h-5 w-48 rounded-lg bg-[#E8DFD3]" />
                <Skeleton className="h-3.5 w-72 rounded bg-[#F2ECE1]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-[#E8DFD3] space-y-2 bg-[#FAF7F2]">
                    <Skeleton className="h-4 w-20 rounded bg-[#E8DFD3]" />
                    <Skeleton className="h-5 w-16 rounded-full bg-[#E8DFD3]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Delivery Date & Time */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8DFD3] space-y-4">
              <Skeleton className="h-5 w-48 rounded-lg bg-[#E8DFD3]" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-2xl bg-[#ECE4D8]" />
                ))}
              </div>
              <Skeleton className="h-12 w-full rounded-xl bg-[#ECE4D8]" />
            </div>

            {/* Step 4: Gift Card & Dedication */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded-full bg-[#E8DFD3]" />
                  <Skeleton className="h-5 w-44 rounded bg-[#E8DFD3]" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full bg-[#E8DFD3]" />
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-52 rounded bg-[#E8DFD3]" />
                  <Skeleton className="h-11 w-full rounded-lg bg-[#FAF7F2] border border-gray-200" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded bg-[#E8DFD3]" />
                  <Skeleton className="h-20 w-full rounded-xl bg-[#FAF7F2] border border-gray-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-36 animate-pulse">
            <div className="rounded-3xl bg-white border border-[#E8DFD3] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
              {/* Product Image Skeleton */}
              <div className="relative aspect-4/3 w-full bg-[#EAE2D5]">
                <Skeleton className="w-full h-full bg-[#EAE2D5]" />
              </div>

              {/* Product Details Skeleton */}
              <div className="p-6 space-y-4">
                <Skeleton className="h-7 w-1/2 rounded-xl bg-[#E8DFD3] mb-3" />

                {/* Summary Lines */}
                <div className="border-t border-[#F2ECE1] pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24 rounded bg-[#E8DFD3]" />
                    <Skeleton className="h-4 w-16 rounded-full bg-[#E8DFD3]" />
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-3.5 w-28 rounded bg-[#ECE4D8]" />
                        <Skeleton className="h-3.5 w-20 rounded bg-[#ECE4D8]" />
                      </div>
                    ))}

                    {/* Total Highlight Box Skeleton */}
                    <div className="mt-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-28 rounded bg-[#E8DFD3]" />
                        <Skeleton className="h-6 w-32 rounded bg-[#E8DFD3]" />
                      </div>
                      <div className="pt-2 border-t border-[#E8DFD3]/70 flex justify-between items-center">
                        <Skeleton className="h-3 w-36 rounded bg-[#E8DFD3]" />
                        <Skeleton className="h-4 w-20 rounded bg-[#E8DFD3]" />
                      </div>
                    </div>
                  </div>

                  {/* Proceed Button */}
                  <div className="pt-2">
                    <Skeleton className="h-13 w-full rounded-xl bg-[#2D3F33]/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
