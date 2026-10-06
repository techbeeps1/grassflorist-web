import React from 'react';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Heart, Sparkles, Compass, ShieldCheck, MapPin, Truck, Award } from 'lucide-react';

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
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        {/* Hero Title Section */}
        <div className="text-center max-w-3xl mx-auto my-8 sm:my-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#FAF3ED] text-[#435849] border border-[#DDD3C6] mb-3">
            {locale === 'ar' ? 'غراس فلوريست للزهور والهدايا' : 'GRASS FLORIST BOUTIQUE'}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-main leading-tight mb-4">
            {dict.about.title}
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl mx-auto">
            {dict.about.subtitle}
          </p>
        </div>

        {/* Main Intro Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-10 sm:my-14">
          <div className="lg:col-span-6 space-y-5 text-start">
            <div className="inline-flex items-center gap-2 text-primary font-bold text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{locale === 'ar' ? 'تجارب تنبض بالمشاعر' : 'Experiences That Resonate'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main leading-snug">
              {dict.about.ourStory}
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              {dict.about.storyP1}
            </p>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              {dict.about.storyP2}
            </p>

            {/* Quick Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-border">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DC]">
                <div className="w-9 h-9 rounded-xl bg-[#FAF3ED] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-main">
                    {locale === 'ar' ? 'توصيل داخل جدة' : 'Delivery in Jeddah'}
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    {locale === 'ar' ? 'خدمة سريعة في نفس اليوم' : 'Fast same-day service'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DC]">
                <div className="w-9 h-9 rounded-xl bg-[#FAF3ED] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-main">
                    {locale === 'ar' ? 'جودة وإبداع واحترافية' : 'Quality & Creativity'}
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    {locale === 'ar' ? 'شراكات محلية وعالمية' : 'Top grower partnerships'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-2 border-white">
            <Image
              src="/editorial-flowers-sharp.webp"
              alt={dict.about.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </div>
        </div>

        {/* Vision, Mission, Promise Cards */}
        <div className="my-14 sm:my-18">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Vision Card */}
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#FAF8F5] to-[#F4ECE2] border border-[#E2D5C4] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDD3C6] flex items-center justify-center text-primary mb-5 shadow-2xs">
                  <Sparkles className="w-6 h-6 text-[#435849]" />
                </div>
                <h3 className="text-xl font-extrabold text-text-main mb-3">
                  {dict.about.visionTitle}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {dict.about.visionDesc}
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E2D5C4]/60 flex items-center gap-2 text-xs font-bold text-primary">
                <span>{locale === 'ar' ? 'طموح وإلهام' : 'Inspiration & Love'}</span>
              </div>
            </div>

            {/* Mission Card */}
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#FAF8F5] to-[#F4ECE2] border border-[#E2D5C4] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDD3C6] flex items-center justify-center text-primary mb-5 shadow-2xs">
                  <Compass className="w-6 h-6 text-[#435849]" />
                </div>
                <h3 className="text-xl font-extrabold text-text-main mb-3">
                  {dict.about.missionTitle}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {dict.about.missionDesc}
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E2D5C4]/60 flex items-center gap-2 text-xs font-bold text-primary">
                <span>{locale === 'ar' ? 'عناية بأدق التفاصيل' : 'Attention to Details'}</span>
              </div>
            </div>

            {/* Promise Card */}
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#FAF8F5] to-[#F4ECE2] border border-[#E2D5C4] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDD3C6] flex items-center justify-center text-primary mb-5 shadow-2xs">
                  <Heart className="w-6 h-6 text-[#A24857]" />
                </div>
                <h3 className="text-xl font-extrabold text-text-main mb-3">
                  {dict.about.promiseTitle}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {dict.about.promiseDesc}
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E2D5C4]/60 flex items-center gap-2 text-xs font-bold text-[#A24857]">
                <span>{locale === 'ar' ? 'مشاعر صادقة تدوم' : 'Enduring Memories'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cold Chain / Fast Delivery Feature */}
        <div className="my-12 sm:my-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#F4ECE2] via-[#EFE7DC] to-[#EAE0D3] text-text-main shadow-md border border-border text-center max-w-4xl mx-auto">
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

