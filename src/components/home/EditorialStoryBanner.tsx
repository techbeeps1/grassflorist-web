'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/config/site';

interface EditorialStoryBannerProps {
  locale: Locale;
}

export function EditorialStoryBanner({ locale }: EditorialStoryBannerProps) {
  const isRtl = locale === 'ar';
  const catalogUrl = locale === 'ar' ? '/category/flowers' : '/en/category/flowers';

  return (
    <section
      aria-label="Editorial Highlight"
      className="relative w-full overflow-hidden bg-[#FDF7F2]"
    >
      {/* Edge-to-Edge Split Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[420px] sm:min-h-[480px] lg:min-h-[540px]">
        {/* Editorial Text Block with Botanical Sketches (Left in LTR, Right in RTL) */}
        <div className="relative flex flex-col justify-center items-center text-center px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 overflow-hidden bg-[#FDF7F2]">
          {/* Subtle Botanical Line Art Background Texture */}
          <div className="absolute inset-0 pointer-events-none select-none">
            <Image
              src="/editorial-pattern-clean.webp"
              alt="Botanical illustrations"
              fill
              unoptimized
              priority
              className="object-cover object-center opacity-90"
            />
          </div>

          {/* Centered Editorial Messaging */}
          <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
            {/* Main Editorial Headline - matching all other section headings */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-[#201B18] leading-tight mb-6 sm:mb-8">
              {locale === 'ar' ? (
                <>
                  توصيل في نفس اليوم
                  <br />
                  زهور وهدايا فاخرة
                </>
              ) : (
                <>
                  Same Day Delivery
                  <br />
                  Flowers & Gifts
                </>
              )}
            </h2>

            {/* Pill CTA Button */}
            <Link
              href={catalogUrl}
              className="group inline-flex items-center justify-center gap-2 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-white hover:bg-[#FAF6F0] text-[#1E1915] text-xs sm:text-[13px] font-bold tracking-[0.12em] uppercase shadow-sm hover:shadow-md transition-all duration-300 border border-[#E8DFD5] hover:scale-105 active:scale-95"
            >
              <span>
                {locale === 'ar' ? 'تسوق زهور اليوم نفسه' : 'SHOP SAME DAY FLOWERS'}
              </span>
            </Link>
          </div>
        </div>

        {/* Editorial Visual Showcase (Right in LTR, Left in RTL) */}
        <div className="relative w-full h-full min-h-[340px] sm:min-h-[440px] lg:min-h-full overflow-hidden group">
          <Image
            src="/editorial-woman-bouquet.webp"
            alt="Artisanal Handcrafted Flowers"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:opacity-0" />
        </div>
      </div>
    </section>
  );
}
