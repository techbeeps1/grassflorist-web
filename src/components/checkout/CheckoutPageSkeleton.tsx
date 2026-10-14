'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Locale } from '@/config/site';

interface CheckoutPageSkeletonProps {
  locale?: Locale;
}

export function CheckoutPageSkeleton({ locale = 'en' }: CheckoutPageSkeletonProps) {
  const isRtl = locale === 'ar';

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 text-[#1E1915]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-[1280px] mx-auto px-4">
        {/* 1. Checkout Steps Indicator Skeleton */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8">
          <Skeleton className="h-4 w-24 sm:w-28 rounded-md bg-[#E8DFD3]" />
          <span className="text-[#C5BAAF] text-xs">→</span>
          <Skeleton className="h-5 w-24 sm:w-28 rounded-md bg-[#435849]/30" />
          <span className="text-[#C5BAAF] text-xs">→</span>
          <Skeleton className="h-4 w-24 sm:w-28 rounded-md bg-[#E8DFD3]" />
        </div>

        {/* 2. Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Sections (7 cols) */}
          <div className="lg:col-span-7 space-y-6 animate-pulse">
            {/* Sender Information Card */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <Skeleton className="h-5 w-48 rounded bg-[#E8DFD3]" />
                <Skeleton className="h-4 w-20 rounded bg-[#F2ECE1]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20 rounded bg-[#ECE4D8]" />
                  <Skeleton className="h-11 w-full rounded-lg bg-[#FAF7F2] border border-gray-200" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20 rounded bg-[#ECE4D8]" />
                  <Skeleton className="h-11 w-full rounded-lg bg-[#FAF7F2] border border-gray-200" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24 rounded bg-[#ECE4D8]" />
                  <Skeleton className="h-11 w-full rounded-lg bg-[#FAF7F2] border border-gray-200" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24 rounded bg-[#ECE4D8]" />
                  <Skeleton className="h-11 w-full rounded-lg bg-[#FAF7F2] border border-gray-200" />
                </div>
              </div>
            </div>

            {/* Receiver / Shipping Information Card */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <Skeleton className="h-5 w-52 rounded bg-[#E8DFD3]" />
                <Skeleton className="h-4 w-28 rounded bg-[#F2ECE1]" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28 rounded bg-[#ECE4D8]" />
                <Skeleton className="h-11 w-full rounded-lg bg-[#FAF7F2] border border-gray-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-32 rounded bg-[#ECE4D8]" />
                  <Skeleton className="h-11 w-full rounded-lg bg-[#FAF7F2] border border-gray-200" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16 rounded bg-[#ECE4D8]" />
                  <Skeleton className="h-11 w-full rounded-lg bg-[#F5F2EB]" />
                </div>
              </div>
            </div>

            {/* Delivery Date & Time Slot Card */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <Skeleton className="h-5 w-44 rounded bg-[#E8DFD3]" />
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl bg-[#FAF7F2] border border-gray-200" />
                ))}
              </div>
              <Skeleton className="h-11 w-full rounded-lg bg-[#FAF7F2] border border-gray-200" />
            </div>

            {/* Gift Card Message & Optional Link Card */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <Skeleton className="h-5 w-40 rounded bg-[#E8DFD3]" />
              <Skeleton className="h-20 w-full rounded-xl bg-[#FAF7F2] border border-gray-200" />
              <Skeleton className="h-11 w-full rounded-lg bg-[#FAF7F2] border border-gray-200" />
            </div>
          </div>

          {/* Right Column: Sticky Order Summary & Payment (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 animate-pulse">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <Skeleton className="h-5 w-32 rounded bg-[#E8DFD3]" />
                <Skeleton className="h-4 w-16 rounded bg-[#F2ECE1]" />
              </div>

              {/* Items List Skeleton */}
              <div className="space-y-3.5 divide-y divide-gray-100">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="pt-3 first:pt-0 flex items-center gap-3">
                    <Skeleton className="w-14 h-14 rounded-lg bg-[#ECE4D8] shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4 rounded bg-[#E8DFD3]" />
                      <Skeleton className="h-3 w-1/3 rounded bg-[#F2ECE1]" />
                    </div>
                    <div className="text-end space-y-1">
                      <Skeleton className="h-3.5 w-16 rounded bg-[#E8DFD3]" />
                      <Skeleton className="h-2.5 w-12 rounded bg-[#F2ECE1]" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-gray-100">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-3.5 w-24 rounded bg-[#ECE4D8]" />
                    <Skeleton className="h-3.5 w-16 rounded bg-[#ECE4D8]" />
                  </div>
                ))}

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-28 rounded bg-[#E8DFD3]" />
                    <Skeleton className="h-6 w-24 rounded bg-[#435849]/30" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-lg bg-gray-50 border border-gray-100" />
                </div>
              </div>

              {/* Payment Methods Radio List */}
              <div className="pt-3 border-t border-gray-100 space-y-2.5">
                <Skeleton className="h-4 w-28 rounded bg-[#E8DFD3]" />
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl bg-white border border-gray-200" />
                ))}
              </div>

              {/* Checkout Button */}
              <div className="pt-2">
                <Skeleton className="h-12 w-full rounded-xl bg-[#435849]/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
