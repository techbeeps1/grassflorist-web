'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { type Locale } from '@/config/site';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleWishlist, selectIsInWishlist } from '@/store/slices/wishlistSlice';
import { addItem } from '@/store/slices/cartSlice';
import { setCartDrawerOpen, addToast } from '@/store/slices/uiSlice';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { Heart, ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  locale: Locale;
  priority?: boolean;
}

export function ProductCard({ product, locale, priority = false }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const isInWishlist = useAppSelector((state) => selectIsInWishlist(state, product.id));
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const productUrl =
    locale === 'ar' ? `/product/${product.slug.ar}` : `/en/product/${product.slug.en}`;

  const discount = calculateDiscount(product.price, product.originalPrice);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);

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

    setTimeout(() => {
      setIsAdding(false);
      dispatch(setCartDrawerOpen(true));
      dispatch(
        addToast({
          type: 'success',
          message:
            locale === 'ar'
              ? `تمت إضافة "${product.name.ar}" إلى سلة المشتريات!`
              : `Added "${product.name.en}" to shopping bag!`,
        })
      );
    }, 250);
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
        <Link href={productUrl} className="block w-full h-full">
          <Image
            src={currentImage}
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

        {/* Desktop Hover Quick-Add Overlay */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 hidden md:block pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className={cn(
              'w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-lg transition-all duration-300 ease-out flex items-center justify-center gap-2 cursor-pointer',
              'transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100',
              isAdding
                ? 'bg-emerald-600 text-white'
                : 'bg-[#435849] hover:bg-[#34463A] text-white active:scale-[0.98]'
            )}
          >
            {isAdding ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>{locale === 'ar' ? 'تمت الإضافة' : 'Added to Bag'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span>{locale === 'ar' ? 'أضف للسلة' : 'Add to Bag'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Product Information Details */}
      <div className="px-1 pt-3 sm:pt-3.5 pb-0.5 flex flex-col justify-between flex-1">
        <div>
          {/* Product Title */}
          <Link href={productUrl} className="block group/title mb-2">
            <h3 className="text-sm sm:text-[15px] font-bold text-[#1E1915] group-hover/title:text-[#435849] transition-colors line-clamp-1 leading-snug">
              {product.name[locale]}
            </h3>
          </Link>
        </div>

        {/* Price & Mobile Action Row */}
        <div className="flex items-center justify-between gap-1.5 mt-auto pt-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span dir="ltr" className="text-sm sm:text-base font-extrabold text-[#1E1915] inline-flex items-center gap-1">
              <CurrencySymbol className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{product.price}</span>
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span dir="ltr" className="text-xs sm:text-[13px] text-[#9E9186] line-through font-normal inline-flex items-center gap-0.5">
                <CurrencySymbol className="w-2.5 h-2.5 opacity-60" />
                <span>{product.originalPrice}</span>
              </span>
            )}
          </div>

          {/* Mobile-only Quick Add Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label={locale === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
            className="md:hidden w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#435849] text-[#201B18] hover:text-white border border-[#E0D7CC] flex items-center justify-center transition-colors shrink-0 cursor-pointer active:scale-95"
          >
            {isAdding ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
