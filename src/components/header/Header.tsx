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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-xs transition-shadow">
      {/* Announcement Bar */}
      <AnnouncementBar locale={locale} />

      {/* Main Navigation Bar */}
      <div className="site-container py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => dispatch(setMobileMenuOpen(true))}
            className="md:hidden p-2 text-text-main hover:text-primary hover:bg-surface-subtle rounded-lg cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo */}
          <Link
            href={homeUrl}
            className="flex items-center gap-2.5 group select-none shrink-0"
            aria-label="Grass Flowers"
          >
            <div className="relative">
              <Image
                src="/grass-logo.jpg"
                alt="Grass غراس"
                width={150}
                height={80}
                className="w-[60px]"
                priority
              />
            </div>

          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center max-w-md lg:max-w-lg">
            <SearchBar locale={locale} />
          </div>

          {/* Header Actions (Wishlist, Cart, Language) */}
          <HeaderActions locale={locale} />
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <SearchBar locale={locale} />
        </div>
      </div>

      {/* Desktop Mega Menu Bar */}
      <div className="hidden md:block">
        <MegaMenu locale={locale} />
      </div>

      {/* Modals & Drawers */}
      <CitySelectorModal locale={locale} />
      <MobileNavDrawer locale={locale} />
      <CartDrawer locale={locale} />
    </header>
  );
}
