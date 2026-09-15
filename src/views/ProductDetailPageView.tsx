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
import { Button } from '@/components/ui/Button';
import { Product } from '@/types/product';
import { useAppDispatch, useAppSelector } from '@/store';
import { addItem } from '@/store/slices/cartSlice';
import { toggleWishlist, selectIsInWishlist } from '@/store/slices/wishlistSlice';
import { setCartDrawerOpen, addToast } from '@/store/slices/uiSlice';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/schema';
import {
  Heart,
  ShoppingBag,
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

  // Lookup product by initialProduct or slug
  const decodedSlug = decodeURIComponent(slug).trim().toLowerCase();
  const product = initialProduct;
  if (!product) {
    notFound();
  }

  const isInWishlist = useAppSelector((state) => selectIsInWishlist(state, product.id));

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Compute live price
  const totalItemPrice = product.price * quantity;

  const discount = calculateDiscount(product.price, product.originalPrice);

  const relatedProducts = initialRelatedProducts || [];

  // Schema Generation
  const productSchema = generateProductSchema(product, locale);
  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: dict.nav.home, url: locale === 'ar' ? siteConfig.url : `${siteConfig.url}/en` },
    {
      name: product.category[locale],
      url:
        locale === 'ar'
          ? `${siteConfig.url}/category/${product.categorySlug}`
          : `${siteConfig.url}/en/category/${product.categorySlug}`,
    },
    {
      name: product.name[locale],
      url:
        locale === 'ar'
          ? `${siteConfig.url}/product/${product.slug.ar}`
          : `${siteConfig.url}/en/product/${product.slug.en}`,
    },
  ]);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    {
      label: product.category[locale],
      href: locale === 'ar' ? `/category/${product.categorySlug}` : `/en/category/${product.categorySlug}`,
    },
    { label: product.name[locale] },
  ];

  const handleAddToCart = (directToCheckout = false) => {
    setIsAdding(true);
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

    setTimeout(() => {
      setIsAdding(false);
      if (directToCheckout) {
        router.push(locale === 'ar' ? '/checkout' : '/en/checkout');
      } else {
        dispatch(setCartDrawerOpen(true));
        dispatch(
          addToast({
            type: 'success',
            message:
              locale === 'ar'
                ? `تمت إضافة "${product.name.ar}" إلى حقيبة التسوق!`
                : `Added "${product.name.en}" to shopping bag!`,
          })
        );
      }
    }, 250);
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
                productName={product.name[locale]}
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
                  {product.category[locale]}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main leading-tight">
                  {product.name[locale]}
                </h1>
              </div>

              {/* Pricing Box */}
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border/80 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span dir="ltr" className="text-2xl sm:text-3xl font-black text-primary inline-flex items-center gap-1.5">
                      <CurrencySymbol className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>{product.price}</span>
                    </span>
                    {product.originalPrice && (
                      <span dir="ltr" className="text-sm text-text-muted line-through inline-flex items-center gap-0.5">
                        <CurrencySymbol className="w-3 h-3 opacity-60" />
                        <span>{product.originalPrice}</span>
                      </span>
                    )}
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

              {/* Product Description */}
              {(product.description?.[locale] || product.shortDescription?.[locale]) && (
                <div className="py-3 text-xs sm:text-sm text-[#5C524B] leading-relaxed border-t border-border/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#25211E] block mb-1.5">
                    {locale === 'ar' ? 'تفاصيل المنتج' : 'Product Description'}
                  </span>
                  <p className="whitespace-pre-line text-[#6E6258] leading-relaxed">
                    {product.description?.[locale] || product.shortDescription?.[locale]}
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

                  <span dir="ltr" className="text-lg font-black text-primary ms-auto inline-flex items-center gap-1">
                    <CurrencySymbol className="w-4 h-4" />
                    <span>{totalItemPrice}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    isLoading={isAdding}
                    onClick={() => handleAddToCart(false)}
                    className="flex-1 font-bold text-sm shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4 me-2" />
                    <span>{dict.product.addToCart}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => handleAddToCart(true)}
                    className="flex-1 font-bold text-sm shadow-sm"
                  >
                    <span>{dict.product.buyNow}</span>
                  </Button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => dispatch(toggleWishlist(product))}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isInWishlist
                        ? 'border-rose-300 bg-rose-50 text-rose-600'
                        : 'border-border bg-surface text-text-muted hover:text-rose-600 hover:border-rose-300'
                    }`}
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-600' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

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
