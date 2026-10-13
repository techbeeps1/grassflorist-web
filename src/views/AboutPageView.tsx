import React from 'react';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Sparkles, Heart, Eye, CheckCircle2 } from 'lucide-react';

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
    <div className="py-6 sm:py-10 bg-[#FAF8F5] min-h-[80vh]">
      <div className="site-container">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto my-8 sm:my-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF5EE] text-[#435849] border border-[#DDD3C6] text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#8CA841]" />
            <span>{dict.about.badge}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#201B18] leading-tight mb-4 tracking-tight">
            {dict.about.title}
          </h1>
          <p className="text-base sm:text-lg text-[#685D54] font-medium leading-relaxed">
            {dict.about.subtitle}
          </p>
        </div>

        {/* Section 1: About Grass Florist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-10 sm:my-16">
          <div className="lg:col-span-7 space-y-4 text-start">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201B18] tracking-tight mb-2">
              {dict.about.section1Title}
            </h2>
            <p className="text-sm sm:text-base text-[#5A5049] leading-relaxed">
              {dict.about.section1P1}
            </p>
            <p className="text-sm sm:text-base text-[#5A5049] leading-relaxed">
              {dict.about.section1P2}
            </p>
            <p className="text-sm sm:text-base text-[#5A5049] leading-relaxed">
              {dict.about.section1P3}
            </p>
            <p className="text-sm sm:text-base text-[#5A5049] leading-relaxed font-medium text-[#201B18]">
              {dict.about.section1P4}
            </p>
          </div>

          <div className="lg:col-span-5 relative aspect-[4/3] sm:aspect-[4/3] lg:aspect-[5/4] rounded-3xl overflow-hidden shadow-lg border border-[#EBE3D5]">
            <Image
              src="/about-img.png"
              alt={dict.about.title}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Section 2 & 3: Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 my-10 sm:my-16">
          {/* Vision Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#EBE3D5] shadow-xs flex flex-col justify-start text-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EE] text-[#435849] flex items-center justify-center mb-5 shrink-0 border border-[#DDD3C6]">
              <Eye className="w-6 h-6 text-[#8CA841]" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#201B18] tracking-tight mb-4">
              {dict.about.visionTitle}
            </h2>
            <div className="space-y-3.5 text-sm sm:text-base text-[#5A5049] leading-relaxed">
              <p>{dict.about.visionP1}</p>
              <p>{dict.about.visionP2}</p>
              <p>{dict.about.visionP3}</p>
            </div>
          </div>

          {/* Mission Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#EBE3D5] shadow-xs flex flex-col justify-start text-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EE] text-[#435849] flex items-center justify-center mb-5 shrink-0 border border-[#DDD3C6]">
              <Heart className="w-6 h-6 text-[#8CA841]" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#201B18] tracking-tight mb-4">
              {dict.about.missionTitle}
            </h2>
            <div className="space-y-3.5 text-sm sm:text-base text-[#5A5049] leading-relaxed">
              <p>{dict.about.missionP1}</p>
              <p>{dict.about.missionP2}</p>
              <p>{dict.about.missionP3}</p>
            </div>
          </div>
        </div>

        {/* Section 4: Our Promise to You */}
        <div className="my-10 sm:my-16 p-8 sm:p-12 lg:p-14 rounded-3xl bg-gradient-to-br from-[#FAF5EE] via-[#F4ECE2] to-[#EFE7DC] text-[#201B18] shadow-sm border border-[#DDD3C6] text-center max-w-4xl mx-auto relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-[#435849] border border-[#DDD3C6] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8CA841]" />
            <span>{locale === 'ar' ? 'عهدنا معكم' : 'OUR COMMITMENT'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#201B18] tracking-tight mb-5">
            {dict.about.promiseTitle}
          </h2>

          <div className="space-y-4 text-sm sm:text-base text-[#5A5049] leading-relaxed max-w-2xl mx-auto">
            <p className="font-semibold text-[#201B18]">{dict.about.promiseP1}</p>
            <p>{dict.about.promiseP2}</p>
            <p>{dict.about.promiseP3}</p>
          </div>

          {/* Slogan Badge */}
          <div className="mt-8 pt-6 border-t border-[#DDD3C6]/60">
            <div className="inline-block bg-white/90 backdrop-blur-xs py-3 px-6 sm:px-8 rounded-full border border-[#DDD3C6] shadow-xs">
              <span className="text-base sm:text-lg font-extrabold text-[#201B18]">
                {dict.about.slogan}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
