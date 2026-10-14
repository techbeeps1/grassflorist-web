'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Locale } from '@/config/site';
import { useGetSubscriptionDealBySlugQuery } from '@/store/api/subscriptionApi';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductGallery } from '@/components/product/ProductGallery';
import { PriceDisplay } from '@/components/common/CurrencySymbol';
import { ProductDetailPageSkeleton } from '@/components/product/ProductDetailPageSkeleton';
import { Zap } from 'lucide-react';

interface SubscriptionProductDetailViewProps {
  slug: string;
  locale: Locale;
}

export function SubscriptionProductDetailView({ slug, locale }: SubscriptionProductDetailViewProps) {
  const isAr = locale === 'ar';
  const router = useRouter();

  const { data: response, isLoading } = useGetSubscriptionDealBySlugQuery({ slug, locale });
  const deal = response?.data;

  // Gallery images array
  const galleryImages = useMemo(() => {
    if (!deal) return [];
    if (Array.isArray(deal.gallery) && deal.gallery.length > 0) {
      return deal.gallery.filter(Boolean);
    }
    if (deal.image) {
      return [deal.image];
    }
    return ['/images/placeholder.jpg'];
  }, [deal]);

  const displayName = isAr
    ? (deal?.name?.ar || deal?.localized_name || deal?.name?.en || 'باقة الزهور')
    : (deal?.name?.en || deal?.localized_name || deal?.name?.ar || 'Flower Subscription');

  const rawShortDescription =
    (locale === 'en'
      ? deal?.short_description?.en || deal?.localized_short_description
      : deal?.short_description?.ar || deal?.localized_short_description) ||
    '';
  const displayShortDescription = (rawShortDescription || '').trim();

  const rawDescription =
    (locale === 'en'
      ? deal?.description?.en || deal?.localized_description
      : deal?.description?.ar || deal?.localized_description) ||
    '';
  const cleanDescription = (rawDescription || '').trim();

  const hasDistinctDescription = Boolean(cleanDescription);

  const displayCategory = isAr ? 'اشتراكات الزهور' : 'FLOWER SUBSCRIPTIONS';

  const basePrice = Number(deal?.original_price || deal?.starting_price || 129);
  const startingPrice = Number(deal?.starting_price || basePrice);
  const discount = basePrice > startingPrice
    ? Math.round(((basePrice - startingPrice) / basePrice) * 100)
    : 0;

  const breadcrumbItems = [
    { label: isAr ? 'الرئيسية' : 'Home', href: isAr ? '/' : '/en' },
    {
      label: displayCategory,
      href: isAr ? '/flowers-subscription-deals' : '/en/flowers-subscription-deals',
    },
    { label: displayName },
  ];

  const frequencyStepUrl = isAr
    ? `/flowers-subscription-deals/${slug}/frequency`
    : `/en/flowers-subscription-deals/${slug}/frequency`;

  if (isLoading) {
    return <ProductDetailPageSkeleton locale={locale} />;
  }

  if (!deal) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-surface text-center">
        <h2 className="text-2xl font-bold mb-3 text-text-main">
          {isAr ? 'الباقة غير موجودة' : 'Plan Not Found'}
        </h2>
        <button
          onClick={() => router.push(isAr ? '/flowers-subscription-deals' : '/en/flowers-subscription-deals')}
          className="px-6 py-2.5 rounded-full bg-primary text-white font-bold"
        >
          {isAr ? 'العودة لباقات الاشتراكات' : 'Back to Subscriptions'}
        </button>
      </div>
    );
  }

  return (
    <div className="py-6 bg-surface min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Breadcrumbs matching PDP */}
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        {/* Main PDP Grid: Gallery & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-4 items-start">
          {/* Gallery Column (Exact same ProductGallery as PDP) */}
          <div className="lg:col-span-6 lg:sticky lg:top-36">
            <ProductGallery
              images={galleryImages}
              productName={displayName}
              price={startingPrice}
              originalPrice={basePrice > startingPrice ? basePrice : undefined}
              locale={locale}
            />
          </div>

          {/* Product Details & Ordering Column */}
          <div className="lg:col-span-6 space-y-6 text-start">
            {/* Category & Title */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary block mb-1">
                {displayCategory}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main leading-tight">
                {displayName}
              </h1>
            </div>

            {/* Pricing Box (Matching PDP 1:1) */}
            <div className="p-4 rounded-2xl bg-surface-subtle border border-border/80 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <PriceDisplay
                    amount={startingPrice}
                    originalAmount={basePrice > startingPrice ? basePrice : undefined}
                    locale={locale}
                    className="text-2xl sm:text-3xl font-black text-primary"
                    symbolClassName="w-5 h-5 sm:w-6 sm:h-6"
                  />
                </div>
              </div>

              {discount > 0 && (
                <span className="px-3 py-1 bg-error/10 text-error text-xs font-extrabold rounded-full border border-error/20">
                  {discount}% {isAr ? 'وفر' : 'SAVE'}
                </span>
              )}
            </div>

            {/* Short Description */}
            {displayShortDescription && (
              <div className="text-sm text-[#5C524B] leading-relaxed">
                <p className="whitespace-pre-line leading-relaxed">
                  {displayShortDescription}
                </p>
              </div>
            )}

            {/* CTA Button */}
            <div className="pt-4 border-t border-border">
              <Link
                href={frequencyStepUrl}
                className="w-full min-h-[48px] sm:min-h-[52px] py-3.5 px-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer select-none bg-[#435849] hover:bg-[#34463A]"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white" />
                <span>{isAr ? 'اشترك الآن' : 'Subscribe Now'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Product Description Section (Matching PDP) */}
        {hasDistinctDescription && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="w-full space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-text-main flex items-center gap-2">
                <span>{isAr ? 'تفاصيل المنتج' : 'Product Description'}</span>
              </h2>
              <div className="text-sm sm:text-base text-[#5C524B] leading-relaxed whitespace-pre-line">
                {cleanDescription}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
