'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { occasions } from '@/data/occasions';
import { type Locale } from '@/config/site';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '@/types/category';

interface CategorySliderProps {
  locale: Locale;
  categories?: Category[];
}

function cleanTitle(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();
}

export function CategorySlider({ locale, categories }: CategorySliderProps) {
  const isRtl = locale === 'ar';

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

  const sliderItems =
    categories && categories.length > 0
      ? categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        image: cat.image || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
        link: locale === 'ar' ? `/category/${cat.slug}` : `/en/category/${cat.slug}`,
      }))
      : occasions.map((occ) => ({
        id: occ.id,
        name: occ.name,
        image: occ.image,
        link: locale === 'ar' ? `/products?occasion=${occ.slug}` : `/en/products?occasion=${occ.slug}`,
      }));

  return (
    <section aria-label="Gifts for Every Moment" className="py-12 sm:py-16 bg-white">
      <div className="site-container">
        {/* Section Heading matching all other sections */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#201B18]">
            {locale === 'ar' ? 'هدايا لكل لحظة' : 'Gifts for Every Moment'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5A5049] mt-1">
            {locale === 'ar'
              ? 'اختر الهدية المثالية لتوثيق أروع لحظاتك ومناسباتك السعيدة'
              : 'Handcrafted floral statements and curated keepsakes for life’s most precious celebrations'}
          </p>
        </div>

        {/* Carousel with Side Navigation Arrows */}
        <div className="relative flex items-center">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label={locale === 'ar' ? 'السابق' : 'Previous'}
            className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#E4D8CB] bg-[#FAF7F2] text-[#201B18] shadow-2xs flex items-center justify-center transition-all duration-200 z-10 me-2 sm:me-3 ${canScrollPrev
              ? 'hover:bg-white hover:border-[#435849]/40 hover:scale-105 active:scale-95 cursor-pointer opacity-100'
              : 'opacity-30 cursor-not-allowed pointer-events-none'
              }`}
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
            <div className="flex gap-4 sm:gap-6 md:gap-7 lg:gap-8 cursor-grab active:cursor-grabbing">
              {sliderItems.map((item) => {
                const displayName = cleanTitle(item.name[locale] || item.name.en || '');
                return (
                  <div key={item.id} className="shrink-0">
                    <Link
                      href={item.link}
                      className="group flex flex-col items-center text-center select-none cursor-pointer focus:outline-none rounded-2xl p-1"
                    >
                      {/* Circular Pastel Disc (#EFE8DE) */}
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-30 md:h-30 lg:w-32 lg:h-32 xl:w-34 xl:h-34 rounded-full bg-[#EFE8DE] group-hover:bg-[#EAE0D4] transition-all duration-300 flex items-center justify-center group-hover:scale-105 shadow-2xs group-hover:shadow-md overflow-hidden ">
                        <div className="relative w-full h-full">
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 96px, (max-width: 1024px) 120px, 136px"
                            className="object-contain group-hover:scale-110 transition-transform duration-300 ease-out"
                          />
                        </div>
                      </div>

                      {/* Clean Title Text Below Circle */}
                      <span className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-bold text-[#201B18] group-hover:text-[#435849] transition-colors whitespace-nowrap">
                        {displayName}
                      </span>
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
            className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#E4D8CB] bg-[#FAF7F2] text-[#201B18] shadow-2xs flex items-center justify-center transition-all duration-200 z-10 ms-2 sm:ms-3 ${canScrollNext
              ? 'hover:bg-white hover:border-[#435849]/40 hover:scale-105 active:scale-95 cursor-pointer opacity-100'
              : 'opacity-30 cursor-not-allowed pointer-events-none'
              }`}
          >
            {isRtl ? (
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
