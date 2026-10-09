'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Flower2,
  CalendarDays,
  Star,
  Sprout,
  Package,
  Wallet,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BenefitItem {
  id?: string;
  icon?: string;
  title: string;
  description: string;
}

export interface EventSlideItem {
  image?: string;
  title?: string;
  service_tag?: string;
  serviceTag?: string;
  url?: string;
}

export interface EventsSectionData {
  badge?: string;
  title_main?: string;
  titleMain?: string;
  title_highlight?: string;
  titleHighlight?: string;
  description?: string;
  button_text?: string;
  buttonText?: string;
  button_url?: string;
  buttonUrl?: string;
  tags?: Array<{ icon?: string; label: string }>;
  slides?: EventSlideItem[];
}

interface HomeEventsSectionProps {
  locale: Locale;
  benefits?: BenefitItem[];
  events?: EventsSectionData;
}

const DEFAULT_EVENT_SLIDES = [
  {
    src: '/images/events/wedding-runway.jpg',
    alt: 'Grass Florist Wedding Venue Candle Walkway',
    title: { en: 'Romantic Walkways', ar: 'ممرات الزفاف الرومانسية' },
  },
  {
    src: '/images/events/baby-reception.jpg',
    alt: 'Grass Florist Floral Stage & Scenography Setup',
    title: { en: 'Haute Floral Stages', ar: 'كوشات ومنصات زهور فاخرة' },
  },
  {
    src: '/images/events/wedding-cake.jpg',
    alt: 'Grass Florist Luxury Tiered Wedding Cake',
    title: { en: 'Bespoke Wedding Cakes', ar: 'كيك وحلويات الزفاف' },
  },
  {
    src: '/images/events/wedding-ballroom.jpg',
    alt: 'Grass Florist Grand Ballroom Setup',
    title: { en: 'Grand Ballrooms', ar: 'قاعات ملكية فخمة' },
  },
  {
    src: '/images/events/table-setup.jpg',
    alt: 'Grass Florist Luxury Table Setting & Candelabras',
    title: { en: 'VIP Tablescapes', ar: 'طاولات وضيافة كبار الشخصيات' },
  },
  {
    src: '/images/events/floral-scenography.jpg',
    alt: 'Grass Florist Floral Installations',
    title: { en: 'Floral Scenography', ar: 'سينوغرافيا الزهور' },
  },
];

function getBenefitIcon(iconName?: string) {
  switch (iconName) {
    case 'package':
      return Package;
    case 'wallet':
      return Wallet;
    case 'flower':
      return Flower2;
    case 'star':
      return Star;
    case 'shield':
      return Shield;
    case 'sprout':
    default:
      return Sprout;
  }
}

function getFeatureIcon(iconName?: string, fallbackIdx = 0) {
  if (iconName === 'calendar') return CalendarDays;
  if (iconName === 'star') return Star;
  if (iconName === 'flower') return Flower2;
  if (fallbackIdx === 1) return CalendarDays;
  if (fallbackIdx === 2) return Star;
  return Flower2;
}

export function HomeEventsSection({ locale, benefits, events }: HomeEventsSectionProps) {
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const defaultBookingUrl = isRtl ? '/حجز-مناسبة' : '/en/event-booking';
  const eventBookingUrl = events?.button_url || events?.buttonUrl || defaultBookingUrl;

  // 1. Resolve Slides
  const dynamicSlides = Array.isArray(events?.slides) && events.slides.length > 0
    ? events.slides.map((s, idx) => ({
        src: s.image || DEFAULT_EVENT_SLIDES[idx % DEFAULT_EVENT_SLIDES.length].src,
        alt: s.title || 'Grass Florist Event Service',
        title: s.title || '',
        serviceTag: s.service_tag || s.serviceTag || (isRtl ? 'باقة المناسبات' : 'EVENT SERVICE'),
        url: s.url || eventBookingUrl,
      }))
    : DEFAULT_EVENT_SLIDES.map((s) => ({
        src: s.src,
        alt: s.alt,
        title: s.title[locale],
        serviceTag: isRtl ? 'باقة المناسبات' : 'EVENT SERVICE',
        url: eventBookingUrl,
      }));

  const total = dynamicSlides.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(Math.max(0, total - 2)); // Default for desktop (2 cards visible)
  const [isPaused, setIsPaused] = useState(false);

  // Responsive max index calculation (1 card on mobile < 640px, 2 cards on sm+)
  useEffect(() => {
    const updateMax = () => {
      const isMobile = window.innerWidth < 640;
      setMaxIndex(Math.max(0, isMobile ? total - 1 : total - 2));
    };
    updateMax();
    window.addEventListener('resize', updateMax);
    return () => window.removeEventListener('resize', updateMax);
  }, [total]);

  // Ensure current index is within bounds if maxIndex changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  // 2. Resolve Benefits
  const defaultBenefits = [
    {
      id: 'assortment',
      icon: Sprout,
      title: isRtl ? 'تشكيلة واسعة وكبيرة' : 'Large Assortment',
      desc: isRtl
        ? 'العديد من أنواع الزهور والتنسيقات الفاخرة التي تناسب جميع مناسباتكم.'
        : 'Many different types of products with fewer variations.',
    },
    {
      id: 'delivery',
      icon: Package,
      title: isRtl ? 'التسليم في نفس اليوم' : 'Same day delivery',
      desc: isRtl
        ? 'مدة التسليم يوم واحد أو أقل، خيار تسليم سريع مع أسطول مبرد.'
        : '1-day or less delivery time, an expedited delivery option.',
    },
    {
      id: 'payment',
      icon: Wallet,
      title: isRtl ? 'الدفع السهل والآمن' : 'Easy and Secure Payment',
      desc: isRtl
        ? 'طرق دفع إلكترونية متعددة وآمنة تماماً لراحة بال تامة.'
        : 'Answers to any business related query within a few hours.',
    },
  ];

  const displayBenefits = Array.isArray(benefits) && benefits.length > 0
    ? benefits.map((item, idx) => ({
        id: item.id || `benefit-${idx}`,
        icon: getBenefitIcon(item.icon),
        title: item.title,
        desc: item.description,
      }))
    : defaultBenefits;

  // 3. Resolve Event Texts
  const displayBadge = events?.badge || (isRtl ? 'المناسبات' : 'EVENTS');
  const displayTitleMain = events?.title_main || events?.titleMain || (isRtl ? 'أضف لمسة من السحر\nلمناسباتك مع' : 'Blossom your\nevents with our');
  const displayTitleHighlight = events?.title_highlight || events?.titleHighlight || (isRtl ? 'لمستنا الاحترافية!' : 'expert touch!');
  const displayDesc = events?.description || (isRtl
    ? 'اكتشف التناغم المثالي بين أناقة الزهور وخبرة تنظيم المناسبات مع بوتيك غراس. دعنا ننبض الحياة في مناسباتكم بعناية فائقة بأدق التفاصيل وتنسيقات زهور مذهلة. من حفلات الزفاف إلى الفعاليات الرسمية، سيبتكر فريقنا من المحترفين أجواءً ساحرة تفوق توقعاتكم.'
    : 'Discover the perfect harmony of floral elegance and event planning expertise with our flower shop. Let us bring your events to life with our meticulous attention to detail and stunning floral arrangements. From weddings to corporate gatherings, our team of professionals will create a captivating ambiance that exceeds your expectations.');
  const displayButtonText = events?.button_text || events?.buttonText || (isRtl ? 'احجز الآن' : 'BOOK NOW');

  const defaultFeatures = [
    { icon: Flower2, label: isRtl ? 'حفلات الزفاف' : 'Weddings' },
    { icon: CalendarDays, label: isRtl ? 'فعاليات الشركات' : 'Corporate Events' },
    { icon: Star, label: isRtl ? 'مناسبات خاصة' : 'Special Occasions' },
  ];

  const displayFeatures = Array.isArray(events?.tags) && events.tags.length > 0
    ? events.tags.map((t, idx) => ({
        icon: getFeatureIcon(t.icon, idx),
        label: t.label,
      }))
    : defaultFeatures;

  const titleLines = displayTitleMain.split('\n');

  return (
    <section
      aria-label="Brand Benefits & Events Planning"
      className="py-12 mt-10 sm:mt-14 sm:py-16 lg:py-20 bg-[#FAF7F2] w-full select-none"
    >
      <div className="site-container w-full space-y-14 sm:space-y-18 lg:space-y-20">
        {/* 1. TOP SECTION: 3 Pillar Benefit Boxes */}
        <div className="pt-4 sm:pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 lg:gap-8">
            {displayBenefits.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col items-center text-center pt-14 sm:pt-16 pb-8 sm:pb-10 px-6 sm:px-8 rounded-3xl bg-white border border-[#E8DFC0]/70 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(67,88,73,0.12)] hover:border-[#435849]/40 hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Floating Top Circular Badge (Matching Section BG) */}
                  <div className="absolute -top-9 sm:-top-10 left-1/2 -translate-x-1/2 w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#435849] to-[#2F4135] group-hover:from-[#8cb83e] group-hover:to-[#7aa433] text-white flex items-center justify-center shadow-[0_8px_22px_rgba(67,88,73,0.28)] group-hover:shadow-[0_12px_28px_rgba(140,184,62,0.4)] border-4 border-[#FAF7F2] group-hover:scale-110 transition-all duration-300 shrink-0">
                    <IconComponent className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.75] transition-transform duration-300" />
                  </div>

                  {/* Card Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#1E1915] mb-2.5 tracking-tight group-hover:text-[#435849] transition-colors duration-200">
                    {item.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-sm sm:text-base text-[#6B6057] leading-relaxed max-w-xs mx-auto">
                    {item.desc}
                  </p>

                  {/* Subtle Interactive Bottom Accent Bar */}
                  <div className="w-8 h-1 rounded-full bg-[#EAE3D6] group-hover:bg-[#8cb83e] group-hover:w-14 transition-all duration-300 mt-6" />
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. BOTTOM SECTION: Events Showcase (Left Static Text + Right 2-Card Carousel) */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 w-full">
          {/* Left Content */}
          <div className="w-full lg:w-[42%] shrink-0 text-start flex flex-col justify-center">
            {/* Header Badge with Horizontal Line & Dot */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-[1.5px] bg-[#6B8E23]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B8E23]" />
              <span className="text-xs font-bold text-[#6B8E23] uppercase tracking-widest">
                {displayBadge}
              </span>
            </div>

            {/* Headline matching design */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-extrabold text-[#1E2D24] leading-[1.18] tracking-tight mb-5">
              {titleLines.map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
              <span className="relative inline-block italic font-normal text-[#6B8E23]">
                {displayTitleHighlight}
                {/* Decorative curved SVG stroke */}
                <svg
                  className="absolute -bottom-2 start-0 w-full h-3 text-[#6B8E23]/60"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 9C50 3 150 2 198 9"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            {/* Paragraph Text */}
            <p className="text-sm sm:text-base text-[#68625B] leading-relaxed mb-8 max-w-md pt-1">
              {displayDesc}
            </p>

            {/* Bottom Row: CTA Button + 3 Pillar Features */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-2">
              {/* Dark Olive Pill CTA Button */}
              <Link
                href={eventBookingUrl}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-full bg-[#3F5438] hover:bg-[#32432C] text-white font-bold text-sm uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
              >
                <span>{displayButtonText}</span>
                <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>

              {/* 3 Pillar Features with Dividers */}
              <div className="flex items-center gap-4 sm:gap-5">
                {displayFeatures.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <React.Fragment key={idx}>
                      {idx > 0 && <div className="w-[1px] h-8 bg-[#DCD4C6]" />}
                      <div className="flex flex-col items-center text-center group cursor-default">
                        <div className="w-8 h-8 rounded-full bg-[#EFE9DC] text-[#4F634A] flex items-center justify-center mb-1.5 transition-colors group-hover:bg-[#3F5438] group-hover:text-white">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-medium text-[#524C45] whitespace-nowrap">
                          {item.label}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Carousel Container */}
          <div
            className="w-full lg:w-[58%] min-w-0 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Carousel Viewport */}
            <div className="relative w-full overflow-hidden rounded-3xl">
              {/* Carousel Track */}
              <div
                className="flex [--slide-w:100%] sm:[--slide-w:50%] transition-transform duration-500 ease-out"
                style={{
                  transform: isRtl
                    ? `translateX(calc(var(--slide-w) * ${currentIndex}))`
                    : `translateX(calc(-1 * var(--slide-w) * ${currentIndex}))`,
                }}
              >
                {dynamicSlides.map((slide, idx) => (
                  <div
                    key={idx}
                    className="w-full sm:w-1/2 shrink-0 p-2 sm:p-2.5"
                  >
                    <Link
                      href={slide.url}
                      className="group relative block w-full h-[380px] sm:h-[420px] md:h-[450px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFC0] shadow-md hover:shadow-xl transition-shadow duration-300"
                      draggable={false}
                    >
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        draggable={false}
                      />
                      {/* Gradient overlay for contrast and typography readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                      {/* Event Details Card Overlay */}
                      <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white flex flex-col justify-end">
                        <span className="text-[11px] font-bold text-[#C5DC87] uppercase tracking-wider mb-1 drop-shadow-xs">
                          {slide.serviceTag}
                        </span>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-sm">
                          {slide.title}
                        </h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Navigation Arrow - Left */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous event slide"
                className="absolute start-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-xs text-[#2C3E2D] hover:bg-[#6B8E23] hover:text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-20 cursor-pointer border border-[#E8DFC0]"
              >
                <ChevronLeft className={cn('w-5 h-5', isRtl ? 'rotate-180' : '')} />
              </button>

              {/* Navigation Arrow - Right */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next event slide"
                className="absolute end-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-xs text-[#2C3E2D] hover:bg-[#6B8E23] hover:text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-20 cursor-pointer border border-[#E8DFC0]"
              >
                <ChevronRight className={cn('w-5 h-5', isRtl ? 'rotate-180' : '')} />
              </button>
            </div>

            {/* Pagination Dots indicator */}
            {total > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to event slide ${idx + 1}`}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300 cursor-pointer',
                      currentIndex === idx
                        ? 'w-6 bg-[#3F5438]'
                        : 'w-2 bg-[#D9CFBE] hover:bg-[#B5A894]'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
