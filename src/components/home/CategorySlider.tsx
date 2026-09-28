'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { occasions } from '@/data/occasions';
import { type Locale } from '@/config/site';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '@/types/category';
import { getCategorySlugForLocale, decodeHtmlEntities } from '@/lib/wordpress/store-api';
import { cn } from '@/lib/utils';

interface CategorySliderProps {
  locale: Locale;
  categories?: Category[];
  activeSlug?: string;
  variant?: 'default' | 'compact';
  title?: string;
  subtitle?: string;
  className?: string;
  isContained?: boolean;
  hideHeader?: boolean;
}

function cleanTitle(str?: string): string {
  if (!str) return '';
  return decodeHtmlEntities(str);
}

export function CategorySlider({
  locale,
  categories,
  activeSlug,
  variant = 'default',
  title,
  subtitle,
  className,
  isContained = true,
  hideHeader = false,
}: CategorySliderProps) {
  const isRtl = locale === 'ar';
  const isCompact = variant === 'compact';

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    direction: isRtl ? 'rtl' : 'ltr',
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const decodedActiveSlug = activeSlug ? decodeURIComponent(activeSlug).trim().toLowerCase() : '';

  const sliderItems =
    categories && categories.length > 0
      ? categories.map((cat) => {
        const arSlug = getCategorySlugForLocale(cat.slug, 'ar');
        const enSlug = getCategorySlugForLocale(cat.slug, 'en');
        const isSelected = Boolean(
          decodedActiveSlug &&
          (cat.slug.toLowerCase() === decodedActiveSlug ||
            decodeURIComponent(cat.slug).toLowerCase() === decodedActiveSlug ||
            cat.id.toString().toLowerCase() === decodedActiveSlug ||
            arSlug.toLowerCase() === decodedActiveSlug ||
            enSlug.toLowerCase() === decodedActiveSlug ||
            (cat.name.en && cat.name.en.toLowerCase() === decodedActiveSlug) ||
            (cat.name.ar && cat.name.ar.toLowerCase() === decodedActiveSlug))
        );

        return {
          id: cat.id,
          name: cat.name,
          image: cat.image || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
          link:
            locale === 'ar'
              ? `/category/${arSlug}`
              : `/en/category/${enSlug}`,
          isSelected,
        };
      })
      : occasions.map((occ) => {
        const isSelected = Boolean(
          decodedActiveSlug &&
          (occ.slug.toLowerCase() === decodedActiveSlug || occ.id.toLowerCase() === decodedActiveSlug)
        );
        return {
          id: occ.id,
          name: occ.name,
          image: occ.image,
          link: locale === 'ar' ? `/products?occasion=${occ.slug}` : `/en/products?occasion=${occ.slug}`,
          isSelected,
        };
      });

  // Auto-scroll to active category on mount
  const hasScrolledToActive = useRef(false);
  useEffect(() => {
    if (!emblaApi || hasScrolledToActive.current || !decodedActiveSlug) return;
    const activeIndex = sliderItems.findIndex((item) => item.isSelected);
    if (activeIndex > -1) {
      emblaApi.scrollTo(activeIndex, false);
      hasScrolledToActive.current = true;
    }
  }, [emblaApi, sliderItems, decodedActiveSlug]);

  const defaultTitle = locale === 'ar' ? 'هدايا لكل لحظة' : 'Gifts for Every Moment';
  const defaultSubtitle =
    locale === 'ar'
      ? 'اختر الهدية المثالية لتوثيق أروع لحظاتك ومناسباتك السعيدة'
      : 'Handcrafted floral statements and curated keepsakes for life’s most precious celebrations';

  const headingText = title ?? defaultTitle;
  const subtitleText = subtitle ?? defaultSubtitle;

  const content = (
    <div className={cn(isContained ? 'site-container' : 'w-full')}>
      {/* Section Heading */}
      {!hideHeader && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#201B18]">
            {headingText}
          </h2>
          {subtitleText && (
            <p className="text-xs sm:text-sm text-[#5A5049] mt-1">
              {subtitleText}
            </p>
          )}
        </div>
      )}

      {/* Carousel with Side Navigation Arrows */}
      <div className="relative flex items-center">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label={locale === 'ar' ? 'السابق' : 'Previous'}
          className={cn(
            'shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#E4D8CB] bg-[#FAF7F2] text-[#201B18] shadow-2xs flex items-center justify-center transition-all duration-200 z-10 me-2 sm:me-3',
            canScrollPrev
              ? 'hover:bg-white hover:border-[#435849]/40 hover:scale-105 active:scale-95 cursor-pointer opacity-100'
              : 'opacity-30 cursor-not-allowed pointer-events-none'
          )}
        >
          {isRtl ? (
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        {/* Smooth Embla Viewport */}
        <div
          ref={emblaRef}
          className="overflow-hidden flex-1 py-3 -my-3 px-1 -mx-1 select-none"
          tabIndex={0}
          aria-label="Moments list"
        >
          <div className="flex gap-4 sm:gap-6 md:gap-7 lg:gap-8 cursor-grab active:cursor-grabbing items-center">
            {sliderItems.map((item) => {
              const displayName = cleanTitle(item.name[locale] || item.name.en || '');
              return (
                <div key={item.id} className="shrink-0">
                  <Link
                    href={item.link}
                    className="group flex flex-col items-center text-center select-none cursor-pointer focus:outline-none rounded-2xl p-1"
                  >
                    {/* Circular Pastel Disc (#EFE8DE) */}
                    <div
                      className={cn(
                        'relative w-20 h-20 sm:w-26 sm:h-26 md:w-28 md:h-28 lg:w-30 lg:h-30 xl:w-32 xl:h-32 rounded-full transition-all duration-300 flex items-center justify-center shadow-2xs overflow-hidden',
                        item.isSelected
                          ? 'bg-[#EAE0D4] ring-2 ring-[#435849] ring-offset-2 ring-offset-white scale-105 shadow-md'
                          : 'bg-[#EFE8DE] group-hover:bg-[#EAE0D4] group-hover:scale-105 group-hover:shadow-md'
                      )}
                    >
                      <div className="relative w-full h-full p-2">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 80px, (max-width: 1024px) 112px, 128px"
                          className="object-contain group-hover:scale-110 transition-transform duration-300 ease-out"
                        />
                      </div>
                    </div>

                    {/* Clean Title Text Below Circle */}
                    <span
                      className={cn(
                        'mt-2 sm:mt-2.5 text-xs sm:text-sm transition-colors whitespace-nowrap',
                        item.isSelected
                          ? 'font-extrabold text-[#435849]'
                          : 'font-bold text-[#201B18] group-hover:text-[#435849]'
                      )}
                    >
                      {displayName}
                    </span>

                    {/* Active Underline Pill */}
                    {item.isSelected && (
                      <span className="mt-1 w-5 h-1 bg-[#435849] rounded-full inline-block" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label={locale === 'ar' ? 'التالي' : 'Next'}
          className={cn(
            'shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#E4D8CB] bg-[#FAF7F2] text-[#201B18] shadow-2xs flex items-center justify-center transition-all duration-200 z-10 ms-2 sm:ms-3',
            canScrollNext
              ? 'hover:bg-white hover:border-[#435849]/40 hover:scale-105 active:scale-95 cursor-pointer opacity-100'
              : 'opacity-30 cursor-not-allowed pointer-events-none'
          )}
        >
          {isRtl ? (
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <section
      aria-label={headingText}
      className={cn('pt-8 sm:pt-12 lg:pt-14 bg-white', className)}
    >
      {content}
    </section>
  );
}

