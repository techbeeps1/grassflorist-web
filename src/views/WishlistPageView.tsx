'use client';

import React from 'react';
import Link from 'next/link';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';
import { ProductCard } from '@/components/product/ProductCard';
import { Heart } from 'lucide-react';

interface WishlistPageViewProps {
  locale: Locale;
}

export function WishlistPageView({ locale }: WishlistPageViewProps) {
  const dict = getDictionary(locale);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.wishlist.title },
  ];

  const catalogUrl = locale === 'ar' ? '/products' : '/en/products';

  return (
    <div className="py-6 bg-surface min-h-[80vh]">
      <div className="max-w-[1280px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        <div className="mb-8 text-start">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
            {dict.wishlist.title}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            {locale === 'ar'
              ? 'احفظ باقاتك وتنسيقاتك المفضلة هنا لطلبها في المناسبات القادمة.'
              : 'Keep track of your admired arrangements and send them when milestones arrive.'}
          </p>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {wishlistItems.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                priority={idx < 4}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center flex flex-col items-center justify-center p-6 bg-surface rounded-2xl border border-border">
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-text-main mb-2">
              {dict.wishlist.emptyTitle}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
              {dict.wishlist.emptyDesc}
            </p>
            <Link href={catalogUrl}>
              <Button variant="primary" size="lg" className="font-bold">
                <span>{dict.wishlist.exploreCatalog}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

