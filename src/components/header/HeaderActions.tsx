'use client';

import React from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCartDrawerOpen } from '@/store/slices/uiSlice';
import { selectCartItemsCount, selectCartSubtotal } from '@/store/slices/cartSlice';
import { selectWishlistCount } from '@/store/slices/wishlistSlice';
import { LanguageSwitcher } from './LanguageSwitcher';
import { type Locale } from '@/config/site';
import { formatPrice } from '@/lib/utils';
import { Heart, ShoppingBag } from 'lucide-react';

interface HeaderActionsProps {
  locale: Locale;
}

export function HeaderActions({ locale }: HeaderActionsProps) {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartItemsCount);
  const cartSubtotal = useAppSelector(selectCartSubtotal);
  const wishlistCount = useAppSelector(selectWishlistCount);

  const wishlistUrl = locale === 'ar' ? '/wishlist' : '/en/wishlist';

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Language Switcher */}
      <LanguageSwitcher currentLocale={locale} />

      {/* Wishlist Link */}
      <Link
        href={wishlistUrl}
        aria-label="Wishlist"
        className="relative p-2 text-text-main hover:text-primary hover:bg-surface-subtle rounded-full transition-colors cursor-pointer"
      >
        <Heart className="w-5 h-5" />
        {wishlistCount > 0 && (
          <span className="absolute top-0.5 end-0.5 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs animate-scale-in">
            {wishlistCount}
          </span>
        )}
      </Link>

      {/* Cart Button */}
      <button
        onClick={() => dispatch(setCartDrawerOpen(true))}
        aria-label="Open shopping bag"
        className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 bg-primary text-white hover:bg-primary-hover rounded-full transition-all active:scale-[0.98] shadow-xs cursor-pointer select-none"
      >
        <div className="relative">
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -end-1.5 min-w-[16px] h-[16px] bg-secondary text-[#1A1E21] text-[9px] font-black rounded-full flex items-center justify-center px-0.5 shadow-xs">
              {cartCount}
            </span>
          )}
        </div>

        {cartCount > 0 && (
          <span className="hidden sm:inline-block text-xs font-bold text-white ps-1">
            {formatPrice(cartSubtotal, locale)}
          </span>
        )}
      </button>
    </div>
  );
}
