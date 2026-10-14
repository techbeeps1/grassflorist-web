'use client';

import React from 'react';
import Link from 'next/link';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { Heart, Lock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

interface WishlistPageViewProps {
  locale: Locale;
}

export function WishlistPageView({ locale }: WishlistPageViewProps) {
  const dict = getDictionary(locale);
  const isAr = locale === 'ar';
  const { items: wishlistItems, isLoading, isAuthenticated } = useWishlist(locale);

  const breadcrumbItems = [
    { label: dict.nav.home, href: isAr ? '/' : '/en' },
    { label: dict.wishlist.title },
  ];

  const catalogUrl = isAr ? '/products' : '/en/products';
  const loginUrl = isAr
    ? '/login?redirect=' + encodeURIComponent('/wishlist')
    : '/en/login?redirect=' + encodeURIComponent('/en/wishlist');

  return (
    <div className="py-6 sm:py-10 bg-surface min-h-[80vh]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        <div className="mb-8 text-start">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
              {dict.wishlist.title}
            </h1>
            {isAuthenticated && wishlistItems.length > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                {wishlistItems.length}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-text-muted mt-1">
            {isAr
              ? 'قائمة أمنياتك متزامنة ومحفوظة مباشرة مع حسابك الشخصي في غراس فلوريست.'
              : 'Your wishlist is securely synced with your personal Grass Florist account.'}
          </p>
        </div>

        {/* 1. Unauthenticated State (Strict Login Requirement) */}
        {!isAuthenticated ? (
          <div className="py-16 sm:py-24 text-center flex flex-col items-center justify-center p-6 sm:p-10 bg-white rounded-3xl border border-[#EBE4D8] shadow-xs max-w-xl mx-auto">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-xs">
                <Heart className="w-10 h-10 fill-rose-500/20" />
              </div>
              <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-[#3D4F41] text-white flex items-center justify-center shadow-md">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-3">
              {isAr
                ? 'تسجيل الدخول مطلوب للوصول إلى المفضلة'
                : 'Sign in to access your wishlist'}
            </h2>
            <p className="text-sm sm:text-base text-[#6E6359] max-w-md mb-8 leading-relaxed">
              {isAr
                ? 'تتيح لك قائمة أمنياتك حفظ ومزامنة باقاتك المفضلة مباشرة مع حسابك لطلبها في أي وقت ومن أي جهاز.'
                : 'Your wishlist is saved directly to your account. Log in to view, save, and manage your favorite arrangements on any device.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link href={loginUrl} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto px-8 font-bold gap-2 min-h-[48px]"
                >
                  <span>{isAr ? 'تسجيل الدخول إلى حسابي' : 'Sign In to My Account'}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </Link>
              <Link href={catalogUrl} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-6 font-semibold min-h-[48px] border-[#D9D0C3]"
                >
                  <span>{dict.wishlist.exploreCatalog}</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : isLoading ? (
          /* 2. Loading Skeleton */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-border p-3 animate-pulse space-y-3"
              >
                <div className="aspect-square bg-gray-100 rounded-xl w-full" />
                <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                <div className="h-4 bg-gray-100 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : wishlistItems.length > 0 ? (
          /* 3. Wishlist Items Grid (Live Account Data) */
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
          /* 4. Empty Wishlist State */
          <div className="py-20 text-center flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-[#EBE4D8] shadow-xs max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4 shadow-xs">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-2">
              {dict.wishlist.emptyTitle}
            </h2>
            <p className="text-sm sm:text-base text-text-muted max-w-sm mb-6 leading-relaxed">
              {dict.wishlist.emptyDesc}
            </p>
            <Link href={catalogUrl}>
              <Button variant="primary" size="lg" className="font-bold px-8 min-h-[48px]">
                <span>{dict.wishlist.exploreCatalog}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
