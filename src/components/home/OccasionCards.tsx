import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { occasions } from '@/data/occasions';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface OccasionCardsProps {
  locale: Locale;
}

export function OccasionCards({ locale }: OccasionCardsProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section aria-label="Occasions" className="py-14 sm:py-20 bg-[#EFE7DC]">
      <div className="site-container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#25211E]">
            {dict.home.shopByOccasion}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C524B] mt-2">
            {dict.home.shopByOccasionSubtitle}
          </p>
        </div>

        {/* Occasion Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {occasions.map((occ) => {
            const occUrl =
              locale === 'ar'
                ? `/products?tag=${occ.tag}`
                : `/en/products?tag=${occ.tag}`;

            return (
              <Link
                key={occ.id}
                href={occUrl}
                className="group relative flex flex-col rounded-2xl overflow-hidden border border-[#D5C6B5] bg-white shadow-card hover:shadow-hover transition-all duration-300"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={occ.image}
                    alt={occ.name[locale]}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-3 start-3 end-3 text-white">
                    <h3 className="text-xs sm:text-sm font-bold leading-tight group-hover:text-secondary-light transition-colors">
                      {occ.name[locale]}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#E5DCD1] mt-1 opacity-90 group-hover:opacity-100 whitespace-nowrap">
                      <span>{locale === 'ar' ? 'تصفح التنسيقات' : 'Explore'}</span>
                      <ArrowIcon className="w-3 h-3 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform shrink-0" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
