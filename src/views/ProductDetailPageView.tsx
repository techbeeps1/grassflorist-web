'use client';

import React, { useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductTabs } from '@/components/product/ProductTabs';
import { ProductReviews } from '@/components/product/ProductReviews';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { StarRating } from '@/components/common/StarRating';
import { QuantitySelector } from '@/components/common/QuantitySelector';
import { Button } from '@/components/ui/Button';
import { products } from '@/data/products';
import { Product } from '@/types/product';
import { useAppDispatch, useAppSelector } from '@/store';
import { addItem } from '@/store/slices/cartSlice';
import { toggleWishlist, selectIsInWishlist } from '@/store/slices/wishlistSlice';
import { setCartDrawerOpen, addToast } from '@/store/slices/uiSlice';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/schema';
import {
  Heart,
  ShoppingBag,
  Clock,
  Gift,
  Check,
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
  const product =
    initialProduct ||
    products.find(
      (p) =>
        p.slug.ar.toLowerCase() === decodedSlug ||
        p.slug.en.toLowerCase() === decodedSlug ||
        p.id === decodedSlug
    );
  if (!product) {
    notFound();
  }

  const isInWishlist = useAppSelector((state) => selectIsInWishlist(state, product.id));

  // Gifting Addon states
  const [quantity, setQuantity] = useState(1);
  const [selectedVase, setSelectedVase] = useState<'none' | 'classic' | 'luxury'>('none');
  const [addChocolates, setAddChocolates] = useState(false);
  const [cardMessage, setCardMessage] = useState('');
  const [cardSender, setCardSender] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Compute live price with options
  const vasePrice = selectedVase === 'classic' ? 45 : selectedVase === 'luxury' ? 75 : 0;
  const chocolatesPrice = addChocolates ? 65 : 0;
  const totalItemPrice = (product.price + vasePrice + chocolatesPrice) * quantity;

  const discount = calculateDiscount(product.price, product.originalPrice);

  const relatedProducts =
    initialRelatedProducts && initialRelatedProducts.length > 0
      ? initialRelatedProducts
      : products
          .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
          .slice(0, 4);

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
    const cartItemId = `${product.id}-${selectedVase}-${addChocolates ? 'choc' : 'nochoc'}`;

    dispatch(
      addItem({
        cartItemId,
        productId: product.id,
        product,
        quantity,
        addons: {
          vase:
            selectedVase !== 'none'
              ? {
                  id: selectedVase,
                  name: selectedVase === 'classic' ? dict.product.classicVase : dict.product.luxuryVase,
                  price: vasePrice,
                }
              : undefined,
          chocolates: addChocolates
            ? {
                name: dict.product.luxuryChocolatesAddon,
                price: chocolatesPrice,
              }
            : undefined,
          greetingCard: cardMessage.trim()
            ? {
                message: cardMessage.trim(),
                senderName: cardSender.trim() || undefined,
                isAnonymous,
              }
            : undefined,
        },
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

                {/* Rating & SKU */}
                <div className="flex items-center gap-4 mt-2.5">
                  <StarRating rating={product.rating} count={product.reviewCount} size="sm" />
                  <span className="text-xs text-text-muted">
                    {dict.product.sku}: <span className="font-mono">{product.sku}</span>
                  </span>
                </div>
              </div>

              {/* Pricing Box */}
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border/80 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-primary">
                      {formatPrice(product.price, locale)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-text-muted line-through">
                        {formatPrice(product.originalPrice, locale)}
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

              {/* Delivery Promise Badge */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-950 block">
                    {dict.product.inStock}
                  </span>
                  <span className="text-emerald-800/80">
                    {locale === 'ar'
                      ? 'توصيل مبرد في سيارة مكيفة لحفظ نضارة الورد'
                      : 'Delivered in climate-controlled refrigerated vehicle'}
                  </span>
                </div>
              </div>

              {/* Gifting Add-ons (Upsells) */}
              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-primary" />
                  <span>{dict.product.selectOptions}</span>
                </h3>

                {/* Vase Selector */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-2">
                    {dict.product.chooseVase}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'none', label: dict.product.noVase, price: 0 },
                        { id: 'classic', label: dict.product.classicVase, price: 45 },
                        { id: 'luxury', label: dict.product.luxuryVase, price: 75 },
                      ] as const
                    ).map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVase(v.id)}
                        className={`p-3 rounded-xl border text-start text-xs font-semibold transition-all cursor-pointer ${
                          selectedVase === v.id
                            ? 'border-primary bg-primary-light/30 text-primary shadow-xs'
                            : 'border-border hover:border-primary/40 bg-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">{v.id === 'none' ? '—' : `+${v.price} ${siteConfig.currency.symbol[locale]}`}</span>
                          {selectedVase === v.id && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <span className="block text-text-secondary line-clamp-2">{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chocolates Addon Checkbox */}
                <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="addon-choc"
                      checked={addChocolates}
                      onChange={(e) => setAddChocolates(e.target.checked)}
                      className="w-4 h-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="addon-choc" className="text-xs font-bold text-text-main cursor-pointer">
                      {dict.product.luxuryChocolatesAddon}
                    </label>
                  </div>
                  <span className="text-xs font-extrabold text-primary">
                    +{formatPrice(65, locale)}
                  </span>
                </div>

                {/* Free Greeting Card Input */}
                <div className="p-4 rounded-xl border border-border bg-surface-subtle space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-main">
                      {dict.product.greetingCard}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                      {dict.common.free}
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                    placeholder={dict.product.cardMessagePlaceholder}
                    className="w-full p-2.5 text-xs bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <input
                      type="text"
                      value={cardSender}
                      disabled={isAnonymous}
                      onChange={(e) => setCardSender(e.target.value)}
                      placeholder={dict.product.cardSenderPlaceholder}
                      className="w-full sm:flex-1 p-2 text-xs bg-surface border border-border rounded-lg disabled:opacity-50"
                    />

                    <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-3.5 h-3.5 text-primary rounded"
                      />
                      <span>{dict.product.cardAnonymous}</span>
                    </label>
                  </div>
                </div>
              </div>

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

                  <span className="text-lg font-black text-primary ms-auto">
                    {formatPrice(totalItemPrice, locale)}
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

          {/* Product Tabs: Description, Care, Specs, Shipping */}
          <ProductTabs product={product} locale={locale} />

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
