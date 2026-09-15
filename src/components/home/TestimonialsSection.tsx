'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { testimonials } from '@/data/testimonials';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { StarRating } from '@/components/common/StarRating';
import { Quote, CheckCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface TestimonialsSectionProps {
  locale: Locale;
}

export function TestimonialsSection({ locale }: TestimonialsSectionProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === 'ar';
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    direction: isRtl ? 'rtl' : 'ltr',
    dragFree: false,
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
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

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <section aria-label="Customer Reviews" className="py-14 sm:py-20 bg-white relative overflow-hidden">
      <div className="site-container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#201B18]">
            {dict.home.testimonialsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#5A5049] mt-2">
            {dict.home.testimonialsSubtitle}
          </p>
        </div>

        {/* Carousel Outer Wrapper with Floating Navigation Arrows */}
        <div className="relative group/testimonials px-1">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label={locale === 'ar' ? 'التقييمات السابقة' : 'Previous testimonials'}
            className={`absolute top-1/2 -translate-y-1/2 start-1 sm:-start-4 lg:-start-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#201B18] border border-[#E3D7C7] shadow-[0_4px_18px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 ${canScrollPrev
                ? 'opacity-90 hover:opacity-100 cursor-pointer'
                : 'opacity-0 pointer-events-none sm:opacity-30 sm:cursor-not-allowed sm:pointer-events-none'
              }`}
          >
            <PrevIcon className="w-5 h-5" />
          </button>

          {/* Embla Viewport */}
          <div
            ref={emblaRef}
            className="overflow-hidden py-4 -my-4 px-1 -mx-1 select-none"
            tabIndex={0}
            aria-label="Testimonials carousel"
          >
            <div className="flex -ms-5 sm:-ms-6 cursor-grab active:cursor-grabbing">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="min-w-0 shrink-0 grow-0 ps-5 sm:ps-6 basis-[88%] sm:basis-[48%] lg:basis-[33.333%]"
                >
                  <div className="group relative flex flex-col justify-between p-7 sm:p-8 bg-white rounded-3xl border border-[#E8DFD3] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(40,32,24,0.08)] hover:border-[#435849]/40 hover:-translate-y-1 transition-all duration-300 text-start h-full">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#435849] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl" />

                    <div>
                      {/* Rating and Quote Badge */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <StarRating rating={t.rating} size="sm" showCount={false} />
                          <span className="text-xs font-extrabold text-[#B88746] mt-0.5">5.0</span>
                        </div>

                        <div className="w-10 h-10 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D3] flex items-center justify-center text-[#435849] group-hover:bg-[#435849] group-hover:text-white transition-colors duration-300 shrink-0 shadow-2xs">
                          <Quote className="w-4 h-4 fill-current opacity-80" />
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-[13px] sm:text-[14px] text-[#2C2520] leading-relaxed mb-5 font-serif italic line-clamp-4">
                        &ldquo;{t.comment[locale]}&rdquo;
                      </p>

                      {/* Occasion / Product Tag */}
                      <div className="mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EF] text-[#435849] text-[11px] font-bold border border-[#EFE5D8]">
                          <Sparkles className="w-3 h-3 text-[#B88746]" />
                          <span>{t.occasion[locale]}</span>
                        </span>
                      </div>
                    </div>

                    {/* Author Row */}
                    <div className="pt-5 border-t border-[#F2ECE3] flex items-center gap-3.5">
                      <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-[#EAE0D3] ring-offset-2 ring-offset-white bg-[#FAF5EF]">
                        <Image
                          src={t.avatar}
                          alt={t.name[locale]}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[#1E1915]">
                            {t.name[locale]}
                          </span>
                          {t.verified && (
                            <CheckCircle className="w-3.5 h-3.5 text-[#435849]" />
                          )}
                        </div>
                        <span className="text-xs text-[#8C8075]">
                          {t.city[locale]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label={locale === 'ar' ? 'التقييمات التالية' : 'Next testimonials'}
            className={`absolute top-1/2 -translate-y-1/2 end-1 sm:-end-4 lg:-end-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#201B18] border border-[#E3D7C7] shadow-[0_4px_18px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 ${canScrollNext
                ? 'opacity-90 hover:opacity-100 cursor-pointer'
                : 'opacity-0 pointer-events-none sm:opacity-30 sm:cursor-not-allowed sm:pointer-events-none'
              }`}
          >
            <NextIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Minimal Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`${locale === 'ar' ? 'الذهاب إلى التقييم' : 'Go to review'} ${index + 1}`}
              className={`transition-all duration-300 rounded-full h-1.5 cursor-pointer ${index === selectedIndex
                  ? 'w-6 bg-[#435849]'
                  : 'w-1.5 bg-[#D5C6B5] hover:bg-[#A89887]'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
