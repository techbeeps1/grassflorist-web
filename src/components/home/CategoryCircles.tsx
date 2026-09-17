import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/data/categories';
import { getCategorySlugForLocale } from '@/lib/wordpress/store-api';
import { type Locale } from '@/config/site';

interface CategoryCirclesProps {
  locale: Locale;
}

export function CategoryCircles({ locale }: CategoryCirclesProps) {
  return (
    <section aria-label="Visual Categories" className="py-8 sm:py-10 bg-white">
      <div className="site-container">
        <div className="flex items-center justify-between gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
          {categories.map((cat) => {
            const categoryUrl =
              locale === 'ar'
                ? `/category/${getCategorySlugForLocale(cat.slug, 'ar')}`
                : `/en/category/${getCategorySlugForLocale(cat.slug, 'en')}`;

            return (
              <Link
                key={cat.id}
                href={categoryUrl}
                className="group flex flex-col items-center shrink-0 text-center select-none"
              >
                <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full p-1 border-2 border-[#D8C6B6] group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-xs">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-[#F5EFE6]">
                    <Image
                      src={cat.image}
                      alt={cat.name[locale]}
                      fill
                      sizes="88px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <span className="mt-2 text-xs font-bold text-[#25211E] group-hover:text-primary transition-colors max-w-[90px] truncate">
                  {cat.name[locale]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
