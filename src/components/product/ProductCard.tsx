'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { type Locale } from '@/config/site';
import { useAppDispatch, useAppSelector } from '@/store';
import { useWishlist } from '@/hooks/useWishlist';
import { useCartActions } from '@/hooks/useCartActions';
import { calculateDiscount, cn } from '@/lib/utils';
import { formatStorageUrl } from '@/lib/wordpress/store-api';
import { PriceDisplay } from '@/components/common/CurrencySymbol';
import { Heart, ShoppingBag, Check, Zap, Loader2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  locale: Locale;
  priority?: boolean;
}

export function ProductCard({ product, locale, priority = false }: ProductCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isInWishlist: checkWishlist, toggleWishlist } = useWishlist(locale);
  const isInWishlist = checkWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const productSlug =
    product.slug?.[locale] || product.slug?.ar || product.slug?.en || product.id;

  const productUrl =
    locale === 'ar' ? `/product/${productSlug}` : `/en/product/${productSlug}`;

  const discount = calculateDiscount(product.price, product.originalPrice);

  const categoryName =
    ((typeof product.category === 'object' && product.category !== null
      ? product.category[locale] || product.category.ar || product.category.en
      : typeof product.category === 'string'
      ? product.category
      : '') ||
    (Array.isArray(product.categoriesList) && product.categoriesList.length > 0
      ? (locale === 'ar' ? product.categoriesList[0].slug_ar : product.categoriesList[0].slug_en) || product.categoriesList[0].name
      : ''))?.replace(/&amp;/g, '&');

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
  };

  const { addToCart } = useCartActions();

  const isOutOfStock =
    (product.stock !== undefined && product.stock <= 0) ||
    product.availability === 'out_of_stock';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;
    setIsAdding(true);
    await addToCart(product, 1, { openDrawer: true });
    setIsAdding(false);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;
    setIsBuyingNow(true);
    await addToCart(product, 1, { openDrawer: false });
    setIsBuyingNow(false);

    const checkoutUrl = locale === 'ar' ? '/checkout' : '/en/checkout';
    router.push(checkoutUrl);
  };

  const currentImage =
    isHovered && product.images?.length > 1 ? product.images[1] : product.thumbnail;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col w-full h-full select-none"
    >
      {/* 1. Main Visual Frame (4px border-radius) */}
      <div className="relative w-full aspect-square rounded-[4px] overflow-hidden bg-[#FAF7F2]">
        <Link href={productUrl} prefetch={true} className="block w-full h-full">
          <Image
            src={formatStorageUrl(currentImage)}
            alt={product.name[locale]}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out rounded-[4px]"
          />
        </Link>

        {/* Category / Status Badge (top-right / end-2.5) */}
        <div className="absolute top-2.5 end-2.5 z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="inline-block bg-neutral-800/80 text-white text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-[4px] tracking-wide shadow-xs">
              {locale === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}
            </span>
          ) : (
            <span className="inline-block bg-[#435849] text-white text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-[4px] tracking-wide shadow-xs max-w-[120px] sm:max-w-[140px] truncate">
              {categoryName || (locale === 'ar' ? 'إكسبرس' : 'Express')}
            </span>
          )}
        </div>

        {/* Minimal Floating Glassmorphic Wishlist Button (top-start / start-2.5) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={
            isInWishlist
              ? locale === 'ar'
                ? 'إزالة من المفضلة'
                : 'Remove from wishlist'
              : locale === 'ar'
                ? 'إضافة للمفضلة'
                : 'Add to wishlist'
          }
          className="absolute top-2.5 start-2.5 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-[#ECE5DB] flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 active:scale-95 cursor-pointer"
        >
          <Heart
            className={cn(
              'w-3.5 h-3.5 transition-colors',
              isInWishlist ? 'fill-rose-600 text-rose-600' : 'text-[#6B5E55] hover:text-rose-600'
            )}
          />
        </button>
      </div>

      {/* 2. Product Information Details & Hover Add to Bag */}
      <div className="relative pt-2.5 sm:pt-3 pb-0.5 flex flex-col justify-end min-h-[60px] sm:min-h-[64px]">
        {/* Default View: Price (Top) & Title (Bottom) (Hides on desktop hover) */}
        <div className="transition-all duration-300 md:group-hover:opacity-0 md:group-hover:invisible md:group-hover:pointer-events-none md:group-hover:translate-y-1">
          {/* Price & Mobile Action Row */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <PriceDisplay
                amount={product.price}
                originalAmount={product.originalPrice}
                locale={locale}
                className="text-sm sm:text-base font-extrabold text-[#1E1915]"
                symbolClassName="w-3 h-3 sm:w-3.5 sm:h-3.5"
              />
            </div>

            {/* Mobile-only Quick Add & Buy Actions */}
            <div className="md:hidden flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || isBuyingNow}
                aria-label={locale === 'ar' ? 'أضف للسلة' : 'Add to Bag'}
                title={locale === 'ar' ? 'أضف للسلة' : 'Add to Bag'}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#435849] text-[#201B18] hover:text-white border border-[#E0D7CC] flex items-center justify-center transition-colors shrink-0 cursor-pointer active:scale-95"
              >
                {isAdding ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isAdding || isBuyingNow}
                aria-label={locale === 'ar' ? 'شراء الآن' : 'Buy Now'}
                title={locale === 'ar' ? 'شراء الآن' : 'Buy Now'}
                className="w-8 h-8 rounded-full bg-[#435849] hover:bg-[#34463A] text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer active:scale-95 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

          {/* Product Title (below price) */}
          <Link href={productUrl} prefetch={true} className="block group/title mt-1.5">
            <h3 className="text-[14px] sm:text-[15px] font-bold text-[#1E1915] group-hover/title:text-[#435849] transition-colors line-clamp-1 leading-snug">
              {product.name[locale]}
            </h3>
          </Link>
        </div>

        {/* Desktop Hover View: Add to Bag & Buy Now Buttons in place of Title & Price */}
        <div className="hidden md:flex absolute inset-x-0 inset-y-1 items-center justify-center gap-1.5 pointer-events-none md:group-hover:pointer-events-auto opacity-0 md:group-hover:opacity-100 translate-y-1 md:group-hover:translate-y-0 transition-all duration-300 ease-out">
          {/* Add to Bag Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || isBuyingNow || isOutOfStock}
            className={cn(
              'flex-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]',
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                : isAdding
                ? 'bg-[#435849]/10 text-[#435849] border border-[#435849]/30 shadow-xs cursor-wait'
                : 'bg-white hover:bg-[#FAF7F2] text-[#2C382F] border border-[#DDD3C4] shadow-xs hover:border-[#435849]'
            )}
          >
            {isOutOfStock ? (
              <span className="truncate">{locale === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}</span>
            ) : isAdding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#435849]" />
                <span className="truncate">{locale === 'ar' ? 'جارٍ الإضافة...' : 'Adding...'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#435849]" />
                <span className="truncate">{locale === 'ar' ? 'أضف للسلة' : 'Add to Bag'}</span>
              </>
            )}
          </button>

          {/* Buy Now Button */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isAdding || isBuyingNow || isOutOfStock}
            className={cn(
              'flex-1 py-2.5 px-2 rounded-xl font-bold text-xs shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]',
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#435849] hover:bg-[#34463A] text-white hover:shadow-lg'
            )}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="truncate">{locale === 'ar' ? 'شراء الآن' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
