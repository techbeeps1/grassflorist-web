'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { SearchBar } from './SearchBar';
import { HeaderActions } from './HeaderActions';
import { MegaMenu } from './MegaMenu';
import { CitySelectorModal } from '@/components/layout/CitySelectorModal';
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Menu } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { setMobileMenuOpen } from '@/store/slices/uiSlice';

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const dispatch = useAppDispatch();
  const homeUrl = locale === 'ar' ? '/' : '/en';

  return (
    <>
      {/* Top Announcement Bar (Non-sticky: scrolls away with page) */}
      <AnnouncementBar locale={locale} />

      {/* Main Navigation Header (Sticky on scroll) */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-xs transition-shadow">
        <div className="site-container py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2.5 sm:gap-4 lg:gap-6">
            {/* Left: Hamburger (shown on < xl) + Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Luxury Circular Hamburger Menu Button */}
              <button
                onClick={() => dispatch(setMobileMenuOpen(true))}
                className="xl:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#DDD3C6] bg-[#FAF8F5] hover:bg-[#2D3F33] text-[#1E1915] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0 group"
                aria-label="Open mobile and tablet menu"
              >
                <Menu className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[2.2] text-[#1E1915] group-hover:text-white transition-colors" />
              </button>

              <Link
                href={homeUrl}
                className="flex items-center select-none shrink-0"
                aria-label="Grass Flowers"
              >
                <Image
                  src="/grass-logo.jpg"
                  alt="Grass غراس"
                  width={130}
                  height={65}
                  className="w-[46px] sm:w-[52px] md:w-[58px] h-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Center: Search Bar (Integrated in main row on Tablet md: and Desktop xl:) */}
            <div className="hidden md:flex flex-1 justify-center max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-2">
              <SearchBar locale={locale} />
            </div>

            {/* Right: Actions (Language Switcher, Wishlist, Cart, Account) */}
            <HeaderActions locale={locale} />
          </div>

          {/* Mobile Search Bar (Only on small mobile screens < md) */}
          <div className="mt-2 md:hidden">
            <SearchBar locale={locale} />
          </div>
        </div>

        {/* Desktop Mega Menu Bar (Desktop only: >= xl) */}
        <div className="hidden xl:block">
          <MegaMenu locale={locale} />
        </div>
      </header>

      {/* Modals & Drawers */}
      <CitySelectorModal locale={locale} />
      <MobileNavDrawer locale={locale} />
      <CartDrawer locale={locale} />
    </>
  );
}
