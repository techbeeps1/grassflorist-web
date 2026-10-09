'use client';

import React, { useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductReviews } from '@/components/product/ProductReviews';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { QuantitySelector } from '@/components/common/QuantitySelector';
import { Product } from '@/types/product';
import { useAppDispatch, useAppSelector } from '@/store';
import { useGetProductBySlugQuery } from '@/store/api/productsApi';
import { useAddToCartMutation } from '@/store/api/cartApi';
import { addItem } from '@/store/slices/cartSlice';
import { toggleWishlist, selectIsInWishlist } from '@/store/slices/wishlistSlice';
import { setCartDrawerOpen } from '@/store/slices/uiSlice';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { CurrencySymbol, PriceDisplay } from '@/components/common/CurrencySymbol';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/schema';
import {
  translateArabicProductName,
  translateArabicCategoryName,
  translateArabicToEnglishDescription,
} from '@/lib/wordpress/store-api';
import {
  Heart,
  ShoppingBag,
  Loader2,
  Zap,
} from 'lucide-react';

interface ProductDetailPageViewProps {
  slug: string;
  locale: Locale;
  initialProduct?: Product | null;
  initialRelatedProducts?: Product[];
}

export function ProductDetailPageView({
  slug,
  locale,
  initialProduct,
  initialRelatedProducts,
}: ProductDetailPageViewProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Client-side fallback if initialProduct is not provided
  const { data: clientProduct, isLoading: isClientLoading } = useGetProductBySlugQuery(slug, {
    skip: Boolean(initialProduct),
  });

  const product = initialProduct || clientProduct;

  if (!product && isClientLoading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center min-h-[60vh] bg-surface">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-semibold text-text-muted">
          {locale === 'ar' ? 'جاري تحميل تفاصيل الباقة...' : 'Loading product details...'}
        </p>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const isInWishlist = useAppSelector((state) => selectIsInWishlist(state, product.id));

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Compute live price
  const totalItemPrice = product.price * quantity;

  const discount = calculateDiscount(product.price, product.originalPrice);

  const relatedProducts = initialRelatedProducts || [];

  // Localized string resolution with automatic instant English translation guarantee
  const displayName =
    locale === 'en'
      ? (!product.name?.en || /[\u0600-\u06FF]/.test(product.name.en)
          ? translateArabicProductName(product.name?.ar || product.name?.en || '', product.slug?.en || slug)
          : product.name.en)
      : (product.name?.ar || product.name?.en || '');

  const displayCategory =
    locale === 'en'
      ? (!product.category?.en || /[\u0600-\u06FF]/.test(product.category.en)
          ? translateArabicCategoryName(product.category?.ar || product.category?.en || '', product.categorySlug)
          : product.category.en)
      : (product.category?.ar || product.category?.en || '');

  const rawShortDescription =
    product.shortDescription?.[locale] ||
    (locale === 'en' ? product.shortDescription?.en : product.shortDescription?.ar) ||
    '';
  const displayShortDescription = rawShortDescription.trim();

  const rawDescription =
    product.description?.[locale] ||
    (locale === 'en' ? product.description?.en : product.description?.ar) ||
    '';
  const displayDescription = rawDescription.trim() || displayShortDescription;

  // Schema Generation
  const productSchema = generateProductSchema(
    {
      ...product,
      name: { ar: product.name.ar, en: displayName },
      category: { ar: product.category.ar, en: displayCategory },
      description: { ar: product.description.ar, en: displayDescription },
    },
    locale
  );

  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: dict.nav.home, url: locale === 'ar' ? siteConfig.url : `${siteConfig.url}/en` },
    {
      name: displayCategory,
      url:
        locale === 'ar'
          ? `${siteConfig.url}/category/${product.categorySlug}`
          : `${siteConfig.url}/en/category/${product.categorySlug}`,
    },
    {
      name: displayName,
      url:
        locale === 'ar'
          ? `${siteConfig.url}/product/${product.slug.ar}`
          : `${siteConfig.url}/en/product/${product.slug.en}`,
    },
  ]);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    {
      label: displayCategory,
      href: locale === 'ar' ? `/category/${product.categorySlug}` : `/en/category/${product.categorySlug}`,
    },
    { label: displayName },
  ];

  const [addServerCart] = useAddToCartMutation();

  const handleAddToCart = (directToCheckout = false) => {
    if (directToCheckout) {
      setIsBuyingNow(true);
    } else {
      setIsAdding(true);
    }
    const cartItemId = product.id;

    dispatch(
      addItem({
        cartItemId,
        productId: product.id,
        product,
        quantity,
        itemTotal: totalItemPrice,
      })
    );

    addServerCart({ productId: product.id, quantity }).unwrap().catch(() => {});

    setIsAdding(false);
    setIsBuyingNow(false);
    if (directToCheckout) {
      router.push(locale === 'ar' ? '/checkout' : '/en/checkout');
    } else {
      dispatch(setCartDrawerOpen(true));
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />

      <div className="py-6 bg-surface min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4">
          <Breadcrumbs items={breadcrumbItems} locale={locale} />

          {/* Main PDP Grid: Gallery & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-4 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-6 lg:sticky lg:top-36">
              <ProductGallery
                images={product.images}
                productName={displayName}
                price={product.price}
                originalPrice={product.originalPrice}
                newArrival={product.newArrival}
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

              {/* Pricing Box */}
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border/80 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <PriceDisplay
                      amount={product.price}
                      originalAmount={product.originalPrice}
                      locale={locale}
                      className="text-2xl sm:text-3xl font-black text-primary"
                      symbolClassName="w-5 h-5 sm:w-6 sm:h-6"
                    />
                  </div>
                  <span className="text-[11px] text-text-muted mt-0.5 block">
                    {locale === 'ar' ? 'شامل ضريبة القيمة المضافة (15%)' : 'Inclusive of 15% VAT'}
                  </span>
                </div>

                {discount && discount > 0 && (
                  <span className="px-3 py-1 bg-error/10 text-error text-xs font-extrabold rounded-full border border-error/20">
                    {discount}% {locale === 'ar' ? 'وفر' : 'SAVE'}
                  </span>
                )}
              </div>

              {/* Short Description (Below Price) */}
              {displayShortDescription && (
                <div className="text-sm text-[#5C524B] leading-relaxed">
                  <p className="whitespace-pre-line leading-relaxed">
                    {displayShortDescription}
                  </p>
                </div>
              )}

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-main">
                      {dict.product.quantity}:
                    </span>
                    <QuantitySelector
                      quantity={quantity}
                      onIncrease={() => setQuantity((q) => q + 1)}
                      onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                    />
                  </div>

                  <PriceDisplay
                    amount={totalItemPrice}
                    locale={locale}
                    className="text-lg font-black text-primary ms-auto"
                    symbolClassName="w-4 h-4"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {/* Add to Bag Button */}
                  <button
                    type="button"
                    disabled={isAdding || isBuyingNow}
                    onClick={() => handleAddToCart(false)}
                    className="flex-1 min-h-[48px] sm:min-h-[52px] py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base bg-white hover:bg-[#FAF7F2] text-[#2C382F] border border-[#DDD3C4] hover:border-[#435849] shadow-xs hover:shadow-sm active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 select-none"
                  >
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#435849]" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#435849]" />
                    )}
                    <span>{dict.product.addToCart}</span>
                  </button>

                  {/* Buy Now Button */}
                  <button
                    type="button"
                    disabled={isAdding || isBuyingNow}
                    onClick={() => handleAddToCart(true)}
                    className="flex-1 min-h-[48px] sm:min-h-[52px] py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base bg-[#435849] hover:bg-[#34463A] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 select-none"
                  >
                    {isBuyingNow ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                    ) : (
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white" />
                    )}
                    <span>{dict.product.buyNow}</span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => dispatch(toggleWishlist(product))}
                    className={`min-h-[48px] sm:min-h-[52px] min-w-[48px] sm:min-w-[52px] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0 ${
                      isInWishlist
                        ? 'border-rose-300 bg-rose-50 text-rose-600'
                        : 'border-[#DDD3C4] bg-white text-[#6B5E55] hover:text-rose-600 hover:border-rose-300 shadow-xs'
                    }`}
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-600' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description Section (Above Reviews) */}
          {displayDescription && (
            <div className="mt-12 pt-8 border-t border-border">
              <div className="w-full space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-text-main flex items-center gap-2">
                  <span>{locale === 'ar' ? 'تفاصيل المنتج' : 'Product Description'}</span>
                </h2>
                <div className="text-sm sm:text-base text-[#5C524B] leading-relaxed whitespace-pre-line">
                  {displayDescription}
                </div>
              </div>
            </div>
          )}

          {/* Customer Reviews Section */}
          <ProductReviews product={product} locale={locale} />

          {/* Related Products Showcase */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-[#E4D8CB]">
              <ProductCarousel
                products={relatedProducts}
                locale={locale}
                badge={locale === 'ar' ? 'خيارات ملهمة' : 'CURATED ALTERNATIVES'}
                title={dict.product.relatedProducts}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
