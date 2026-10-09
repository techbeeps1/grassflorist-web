'use client';

import React from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCartDrawerOpen } from '@/store/slices/uiSlice';
import { selectCartItemsCount, selectCartSubtotal } from '@/store/slices/cartSlice';
import { selectWishlistCount } from '@/store/slices/wishlistSlice';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AccountDropdown } from './AccountDropdown';
import { type Locale } from '@/config/site';
import { CurrencySymbol, PriceDisplay } from '@/components/common/CurrencySymbol';
import { Heart, ShoppingBag } from 'lucide-react';

interface HeaderActionsProps {
  locale: Locale;
}

export function HeaderActions({ locale }: HeaderActionsProps) {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartItemsCount);
  const cartSubtotal = useAppSelector(selectCartSubtotal);
  const wishlistCount = useAppSelector(selectWishlistCount);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayCartCount = mounted ? cartCount : 0;
  const displayWishlistCount = mounted ? wishlistCount : 0;
  const displaySubtotal = mounted ? cartSubtotal : '0.00';

  const wishlistUrl = locale === 'ar' ? '/wishlist' : '/en/wishlist';

  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      {/* Account Button / Dropdown (Desktop only) */}
      <div className="hidden xl:block">
        <AccountDropdown locale={locale} />
      </div>

      {/* Language Switcher (Always visible in Header) */}
      <LanguageSwitcher currentLocale={locale} />

      {/* Wishlist Link */}
      <Link
        href={wishlistUrl}
        aria-label="Wishlist"
        className="relative p-2 text-text-main hover:text-primary hover:bg-surface-subtle rounded-full transition-colors cursor-pointer shrink-0"
      >
        <Heart className="w-5 h-5" />
        {displayWishlistCount > 0 && (
          <span className="absolute top-0.5 end-0.5 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs animate-scale-in">
            {displayWishlistCount}
          </span>
        )}
      </Link>

      {/* Cart Button */}
      <button
        onClick={() => dispatch(setCartDrawerOpen(true))}
        aria-label="Open shopping bag"
        className="relative flex items-center gap-1.5 sm:gap-2 p-2 sm:px-3 sm:py-2 bg-primary text-white hover:bg-primary-hover rounded-full transition-all active:scale-[0.98] shadow-xs cursor-pointer select-none shrink-0"
      >
        <div className="relative">
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          {displayCartCount > 0 && (
            <span className="absolute -top-1.5 -end-1.5 min-w-[16px] h-[16px] bg-secondary text-[#1A1E21] text-[9px] font-black rounded-full flex items-center justify-center px-0.5 shadow-xs">
              {displayCartCount}
            </span>
          )}
        </div>

        {displayCartCount > 0 && (
          <span dir="ltr" className="hidden xl:inline-flex items-center gap-1 text-xs font-bold text-white ps-1">
            <PriceDisplay
              amount={Number(cartSubtotal) || 0}
              locale={locale}
              className="text-xs font-bold text-white"
              symbolClassName="w-3 h-3 text-white brightness-0 invert"
            />
          </span>
        )}
      </button>
    </div>
  );
}
