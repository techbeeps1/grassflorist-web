import React from 'react';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Heart, Leaf, Truck } from 'lucide-react';

interface AboutPageViewProps {
  locale: Locale;
}

export function AboutPageView({ locale }: AboutPageViewProps) {
  const dict = getDictionary(locale);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.about.title },
  ];

  return (
    <div className="py-6 bg-surface min-h-[80vh]">
      <div className="max-w-[1280px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto my-8">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
            {locale === 'ar' ? 'أصالة وفخامة' : 'HERITAGE & CRAFTSMANSHIP'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main leading-tight mb-3">
            {dict.about.title}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {dict.about.subtitle}
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-12">
          <div className="lg:col-span-6 space-y-4 text-start">
            <h2 className="text-xl sm:text-2xl font-bold text-text-main">
              {dict.about.ourStory}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {dict.about.storyP1}
            </p>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {dict.about.storyP2}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2.5">
                <Leaf className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-text-main">
                  {locale === 'ar' ? 'مزارع هولندية مستدامة' : 'Dutch Sustainable Farms'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-secondary" />
                <span className="text-xs font-bold text-text-main">
                  {locale === 'ar' ? 'تنسيق يدوي بأيدي محترفين' : 'Hand-Tied Masterpieces'}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-border">
            <Image
              src="https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=1200&q=80"
              alt={dict.about.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Cold Chain Feature */}
        <div className="my-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#F4ECE2] via-[#EFE7DC] to-[#EAE0D3] text-text-main shadow-md border border-border text-center max-w-4xl mx-auto">
          <Truck className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl sm:text-2xl font-bold text-[#25211E] mb-2">
            {dict.about.coldChainTitle}
          </h3>
          <p className="text-xs sm:text-sm text-[#5C524B] leading-relaxed max-w-2xl mx-auto">
            {dict.about.coldChainDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
