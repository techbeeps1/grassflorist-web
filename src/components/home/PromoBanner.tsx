import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface PromoBannerProps {
  locale: Locale;
}

export function PromoBanner({ locale }: PromoBannerProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const targetUrl =
    locale === 'ar'
      ? '/product/royal-empress-gift-hamper'
      : '/en/product/royal-empress-gift-hamper';

  return (
    <section aria-label="Curated Highlight" className="py-14 sm:py-20 bg-white">
      <div className="site-container">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FAF3ED] via-[#F4ECE2] to-[#EAE0D3] text-[#201B18] shadow-md border border-[#E2D5C4]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 p-6 sm:p-12 lg:p-16 space-y-5 text-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#435849] text-xs font-bold border border-[#E2D5C4] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#B08E77]" />
                <span>{dict.home.promoBadge}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#201B18] leading-tight">
                {dict.home.promoTitle}
              </h2>

              <p className="text-xs sm:text-sm text-[#5A5049] leading-relaxed max-w-lg">
                {dict.home.promoSubtitle}
              </p>

              <div className="pt-2">
                <Link href={targetUrl}>
                  <Button variant="primary" size="lg" className="font-bold shadow-md">
                    <span>{dict.home.promoCta}</span>
                    <ArrowIcon className="w-4 h-4 ms-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Media */}
            <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80"
                alt={dict.home.promoTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r rtl:lg:bg-gradient-to-l from-transparent to-[#FAF4EE]/70 lg:w-1/3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
