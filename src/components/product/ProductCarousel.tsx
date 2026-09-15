'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { Product } from '@/types/product';
import { type Locale } from '@/config/site';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

interface ProductCarouselProps {
  products: Product[];
  locale: Locale;
  title?: string;
  subtitle?: string;
  badge?: string;
  viewAllUrl?: string;
  viewAllLabel?: string;
  className?: string;
}

export function ProductCarousel({
  products,
  locale,
  title,
  subtitle,
  badge,
  viewAllUrl,
  viewAllLabel,
  className = '',
}: ProductCarouselProps) {
  const isRtl = locale === 'ar';
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    direction: isRtl ? 'rtl' : 'ltr',
    dragFree: false,
    slidesToScroll: 1,
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

  return (
    <div className={`w-full ${className}`}>
      {/* Header with Title & View All */}
      {title && (
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#201B18]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#5A5049] mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {viewAllUrl && (
            <Link
              href={viewAllUrl}
              className="group hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF3ED] text-[#201B18] border border-[#D5C6B5] shadow-2xs text-xs font-bold whitespace-nowrap transition-all duration-200"
            >
              <span>{viewAllLabel || (locale === 'ar' ? 'عرض الكل' : 'View All')}</span>
              <span className="w-5 h-5 rounded-full bg-[#FAF3ED] group-hover:bg-[#435849] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <ArrowIcon className="w-3 h-3 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Relative Carousel Wrapper with Floating Side Arrows */}
      <div className="relative group/carousel">
        {/* Left Side Navigation Arrow (at start) */}
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label={locale === 'ar' ? 'المنتجات السابقة' : 'Previous products'}
          className={`absolute top-1/2 -translate-y-1/2 start-1 sm:-start-4 lg:-start-5 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-[#201B18] border border-[#E4D8CB] shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.18)] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
            canScrollPrev
              ? 'opacity-90 hover:opacity-100 cursor-pointer'
              : 'opacity-0 pointer-events-none sm:opacity-30 sm:cursor-not-allowed sm:pointer-events-none'
          }`}
        >
          <PrevIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Embla Smooth Carousel Viewport */}
        <div
          ref={emblaRef}
          className="overflow-hidden py-3 -my-3 px-1 -mx-1 select-none"
          tabIndex={0}
          aria-label={title || 'Product carousel'}
        >
          <div className="flex -ms-4 sm:-ms-5 lg:-ms-6 cursor-grab active:cursor-grabbing">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-0 shrink-0 grow-0 ps-4 sm:ps-5 lg:ps-6 basis-[78%] sm:basis-[48%] md:basis-[33.333%] lg:basis-[25%]"
              >
                <ProductCard product={product} locale={locale} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Navigation Arrow (at end) */}
        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label={locale === 'ar' ? 'المنتجات التالية' : 'Next products'}
          className={`absolute top-1/2 -translate-y-1/2 end-1 sm:-end-4 lg:-end-5 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-[#201B18] border border-[#E4D8CB] shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.18)] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
            canScrollNext
              ? 'opacity-90 hover:opacity-100 cursor-pointer'
              : 'opacity-0 pointer-events-none sm:opacity-30 sm:cursor-not-allowed sm:pointer-events-none'
          }`}
        >
          <NextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Mobile View All Button */}
      {viewAllUrl && (
        <div className="mt-6 text-center sm:hidden">
          <Link
            href={viewAllUrl}
            className="group inline-flex items-center justify-center gap-2.5 w-full py-3 px-4 text-xs font-bold text-[#201B18] bg-white hover:bg-[#FAF3ED] border border-[#D5C6B5] rounded-full shadow-2xs transition-colors whitespace-nowrap"
          >
            <span>{viewAllLabel || (locale === 'ar' ? 'عرض جميع التشكيلات' : 'View All Products')}</span>
            <span className="w-5 h-5 rounded-full bg-[#FAF3ED] group-hover:bg-[#435849] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
              <ArrowIcon className="w-3 h-3" />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
