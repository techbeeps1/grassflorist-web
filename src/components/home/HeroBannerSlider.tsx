'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface BannerSlide {
  id: string;
  image: string;
  link: { ar: string; en: string } | string;
  title: { ar: string; en: string };
  badge?: { ar: string; en: string };
  promoCode?: string;
  tag?: string;
}

export const bannerSlides: BannerSlide[] = [
  {
    id: 'slide-1',
    image: '/banner-1.jpg',
    link: {
      ar: '/category/جميع-الزهور',
      en: '/en/category/all-flowers',
    },
    title: {
      ar: 'توصيل الزهور في جدة خلال نفس اليوم',
      en: 'Flowers delivery in Jeddah within the Same Day',
    },
    badge: {
      ar: 'توصيل سريع مبرد',
      en: 'Refrigerated Express',
    },
    tag: 'Jeddah Express',
  },
  {
    id: 'slide-2',
    image: '/banner-2.jpg',
    link: {
      ar: '/category/باقات-فاخرة',
      en: '/en/category/luxury-bouquets',
    },
    title: {
      ar: 'تنسيقات بأيدي خبراء الزهور المحترفين',
      en: 'Prepared by Professional Florists',
    },
    badge: {
      ar: 'إتقان وحرفية',
      en: 'Artisan Crafted',
    },
    tag: 'Haute Floristry',
  },
  {
    id: 'slide-3',
    image: '/banner-3.jpg',
    link: {
      ar: '/products',
      en: '/en/products',
    },
    title: {
      ar: 'عزنا بطبعنا — خصم 15% بكود Saudi96',
      en: 'Enjoy 15% OFF with code Saudi96',
    },
    badge: {
      ar: 'كود الخصم: Saudi96',
      en: 'Code: Saudi96',
    },
    promoCode: 'Saudi96',
    tag: '15% OFF',
  },
];

interface HeroBannerSliderProps {
  locale: Locale;
}

const SLIDE_DURATION = 5500; // 5.5 seconds per slide

export function HeroBannerSlider({ locale }: HeroBannerSliderProps) {
  const isRtl = locale === 'ar';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % bannerSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, nextSlide]);

  // Touch Swipe handlers
  const minSwipeDistance = 45;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isRtl) {
      // In RTL: swipe left goes to previous, swipe right goes to next
      if (isLeftSwipe) prevSlide();
      if (isRightSwipe) nextSlide();
    } else {
      // In LTR: swipe left goes to next, swipe right goes to previous
      if (isLeftSwipe) nextSlide();
      if (isRightSwipe) prevSlide();
    }
  };

  // Resolve localized URLs
  const getLocalizedLink = (link: { ar: string; en: string } | string) => {
    if (typeof link === 'object' && link !== null) {
      return link[locale];
    }
    if (locale === 'ar') return link;
    return link.startsWith('/en') ? link : `/en${link}`;
  };

  return (
    <section aria-label="Hero Banners" className="relative w-full overflow-hidden bg-white">
      {/* Main Full-Width Edge-to-Edge Slider Container */}
      <div
        className="group relative w-full select-none overflow-hidden"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Slides Track */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] select-none">
          {bannerSlides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={slide.id}
                aria-hidden={!isActive}
                className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${isActive
                    ? 'opacity-100 z-10 scale-100'
                    : 'opacity-0 z-0 scale-105 pointer-events-none'
                  }`}
              >
                <Link
                  href={getLocalizedLink(slide.link)}
                  className="block relative w-full h-full cursor-pointer"
                  tabIndex={isActive ? 0 : -1}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title[locale]}
                    fill
                    unoptimized
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : undefined}
                    sizes="(max-width: 768px) 100vw, (max-width: 1400px) 100vw, 1400px"
                    className={`object-cover w-full h-full transition-transform duration-[6000ms] ease-out ${isActive ? 'scale-100 md:scale-102' : 'scale-105'
                      }`}
                  />

                  {/* Subtle aesthetic gradient protection at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-40 sm:opacity-25" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Previous Arrow Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label={locale === 'ar' ? 'الشريحة السابقة' : 'Previous slide'}
          className="absolute top-1/2 -translate-y-1/2 start-3 sm:start-6 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-lg hover:shadow-xl backdrop-blur-md border border-white/60 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100 cursor-pointer"
        >
          {isRtl ? (
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>

        {/* Next Arrow Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label={locale === 'ar' ? 'الشريحة التالية' : 'Next slide'}
          className="absolute top-1/2 -translate-y-1/2 end-3 sm:end-6 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-lg hover:shadow-xl backdrop-blur-md border border-white/60 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100 cursor-pointer"
        >
          {isRtl ? (
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>

        {/* Subtle Minimal Dots Indicator */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {bannerSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`${locale === 'ar' ? 'الذهاب إلى الشريحة' : 'Go to slide'} ${index + 1}`}
              className={`transition-all duration-300 rounded-full h-2 sm:h-2.5 cursor-pointer ${index === currentIndex
                ? 'w-7 sm:w-8 bg-white shadow-md'
                : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/80'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
