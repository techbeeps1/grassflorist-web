'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { type Locale } from '@/config/site';

interface RestrictedCartBannerProps {
  message: string;
  locale: Locale;
  className?: string;
  showBrowseLink?: boolean;
}

export function RestrictedCartBanner({
  message,
  locale,
  className = '',
  showBrowseLink = true,
}: RestrictedCartBannerProps) {
  if (!message) return null;

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const browseUrl = isRtl ? '/category/flowers' : '/en/category/flowers';

  return (
    <div
      role="alert"
      className={`w-full bg-[#493D25] text-[#fcfbfa] rounded-xl px-4 py-3.5 sm:px-5 sm:py-4 shadow-md border border-[#635332] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 text-white">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm font-medium leading-relaxed tracking-wide text-white/95">
          {message}
        </p>
      </div>

      {showBrowseLink && (
        <Link
          href={browseUrl}
          className="self-end sm:self-auto shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-white bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-1.5 rounded-lg transition-all duration-200"
        >
          <span>{isRtl ? 'تصفح باقات الزهور' : 'Browse Flowers'}</span>
          <ArrowIcon className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
