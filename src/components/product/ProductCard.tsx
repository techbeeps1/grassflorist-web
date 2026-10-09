'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { type Locale } from '@/config/site';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleWishlist, selectIsInWishlist } from '@/store/slices/wishlistSlice';
import { addItem } from '@/store/slices/cartSlice';
import { useAddToCartMutation } from '@/store/api/cartApi';
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistServerMutation,
} from '@/store/api/wishlistApi';
import { setCartDrawerOpen, addToast } from '@/store/slices/uiSlice';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import { formatStorageUrl } from '@/lib/wordpress/store-api';
import { CurrencySymbol, PriceDisplay } from '@/components/common/CurrencySymbol';
import { Heart, ShoppingBag, Check, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  locale: Locale;
  priority?: boolean;
}

export function ProductCard({ product, locale, priority = false }: ProductCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isInWishlist = useAppSelector((state) => selectIsInWishlist(state, product.id));
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const productSlug =
    product.slug?.[locale] || product.slug?.ar || product.slug?.en || product.id;

  const productUrl =
    locale === 'ar' ? `/product/${productSlug}` : `/en/product/${productSlug}`;

  const discount = calculateDiscount(product.price, product.originalPrice);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [addWishlistServer] = useAddToWishlistMutation();
  const [removeWishlistServer] = useRemoveFromWishlistServerMutation();

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated) {
      if (isInWishlist) {
        removeWishlistServer(product.id).unwrap().catch(() => {});
      } else {
        addWishlistServer(product.id).unwrap().catch(() => {});
      }
    }

    dispatch(toggleWishlist(product));
    dispatch(
      addToast({
        type: 'info',
        message: isInWishlist
          ? locale === 'ar'
            ? 'تمت إزالة المنتج من قائمة الرغبات'
            : 'Removed from wishlist'
          : locale === 'ar'
            ? 'تمت إضافة المنتج إلى قائمة الرغبات'
            : 'Added to wishlist',
      })
    );
  };

  const [addServerCart] = useAddToCartMutation();

  const isOutOfStock =
    (product.stock !== undefined && product.stock <= 0) ||
    product.availability === 'out_of_stock';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const cartItemId = `${product.id}-standard`;
    dispatch(
      addItem({
        cartItemId,
        productId: product.id,
        product,
        quantity: 1,
        itemTotal: product.price,
      })
    );

    // Instant drawer open (0ms lag)
    dispatch(setCartDrawerOpen(true));

    // Sync to server in background
    addServerCart({ productId: product.id, quantity: 1 }).unwrap().catch(() => {});
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBuyingNow(true);

    const cartItemId = `${product.id}-standard`;
    dispatch(
      addItem({
        cartItemId,
        productId: product.id,
        product,
        quantity: 1,
        itemTotal: product.price,
      })
    );

    addServerCart({ productId: product.id, quantity: 1 }).unwrap().catch(() => {});

    const checkoutUrl = locale === 'ar' ? '/checkout' : '/en/checkout';
    router.push(checkoutUrl);
  };

  const currentImage =
    isHovered && product.images.length > 1 ? product.images[1] : product.thumbnail;

  // Small subtle pastel badge
  const getBadge = () => {
    if (product.bestseller) {
      return {
        label: locale === 'ar' ? 'الأكثر طلباً' : 'Bestseller',
        className: 'bg-[#FAF0E6] text-[#B86A3E] border border-[#F2DECE]',
      };
    }
    if (product.newArrival) {
      return {
        label: locale === 'ar' ? 'جديد' : 'New',
        className: 'bg-[#EAF3EC] text-[#3B704A] border border-[#D5EADB]',
      };
    }
    if (discount && discount > 0) {
      return {
        label: locale === 'ar' ? `خصم ${discount}%` : `-${discount}%`,
        className: 'bg-[#FCE8E8] text-[#C44D4D] border border-[#F7D2D2]',
      };
    }
    return null;
  };

  const badge = getBadge();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border border-[#EBE3D7] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_rgba(67,88,73,0.09)] hover:border-[#D8CFBF] hover:-translate-y-1 transition-all duration-300 h-full select-none"
    >
      {/* 1. Main Visual Frame */}
      <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#FAF7F2]">
        <Link href={productUrl} prefetch={true} className="block w-full h-full">
          <Image
            src={formatStorageUrl(currentImage)}
            alt={product.name[locale]}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Small Subtle Luxury Badge */}
        {badge && (
          <div className="absolute top-2.5 start-2.5 z-10 pointer-events-none">
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-semibold shadow-xs block tracking-wide',
                badge.className
              )}
            >
              {badge.label}
            </span>
          </div>
        )}

        {/* Minimal Floating Glassmorphic Wishlist Button */}
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
          className="absolute top-2.5 end-2.5 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-[#ECE5DB] flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 active:scale-95 cursor-pointer"
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
      <div className="relative px-1 pt-3 sm:pt-3.5 pb-0.5 flex flex-col justify-end min-h-[64px] sm:min-h-[72px]">
        {/* Default View: Title & Price (Hides on desktop hover) */}
        <div className="transition-all duration-300 md:group-hover:opacity-0 md:group-hover:invisible md:group-hover:pointer-events-none md:group-hover:translate-y-1">
          {/* Product Title */}
          <Link href={productUrl} prefetch={true} className="block group/title mb-1.5">
            <h3 className="text-[15px] md:text-[17px] font-bold text-[#1E1915] group-hover/title:text-[#435849] transition-colors line-clamp-1 leading-snug">
              {product.name[locale]}
            </h3>
          </Link>

          {/* Price & Mobile Action Row */}
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
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
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-[#FAF7F2] text-[#2C382F] border border-[#DDD3C4] shadow-xs hover:border-[#435849]'
            )}
          >
            {isOutOfStock ? (
              <span className="truncate">{locale === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}</span>
            ) : isAdding ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span className="truncate">{locale === 'ar' ? 'تمت الإضافة' : 'Added'}</span>
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
