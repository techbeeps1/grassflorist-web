'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { setMobileMenuOpen, setCityModalOpen, addToast } from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/authSlice';
import { Drawer } from '@/components/ui/Drawer';
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher';
import { mainNavItems } from '@/config/navigation';
import { siteConfig, type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { ChevronDown, MapPin, Phone, ArrowRight, ArrowLeft, User as UserIcon, Package, LogOut, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavDrawerProps {
  locale: Locale;
}

export function MobileNavDrawer({ locale }: MobileNavDrawerProps) {
  const isOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);
  const activeCity = useAppSelector((state) => state.ui.activeCity);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const dict = getDictionary(locale);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const cityName =
    siteConfig.locations.find((l) => l.id === activeCity)?.name[locale] ||
    siteConfig.locations[0].name[locale];

  const handleClose = () => dispatch(setMobileMenuOpen(false));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      side="start"
      title={siteConfig.shortName[locale]}
      footer={
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">
              {locale === 'ar' ? 'اللغة' : 'Language'}
            </span>
            <LanguageSwitcher currentLocale={locale} />
          </div>
          <a
            href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-surface-subtle hover:bg-surface text-text-main text-xs font-bold rounded-xl border border-border transition-colors"
          >
            <Phone className="w-4 h-4 text-primary" />
            <span dir="ltr">{siteConfig.contact.phone}</span>
          </a>
        </div>
      }
    >
      <div className="space-y-5">
        {/* User Account / Auth Mobile Banner */}
        {isAuthenticated && user ? (
          <div className="p-3.5 bg-gradient-to-r from-[#FAF3ED] to-[#F5ECE2] border border-[#E4D8CB] rounded-2xl space-y-3 text-start">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#435849] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user.name.charAt(0) || 'G'}
                </div>
                <div>
                  <span className="text-xs font-black text-[#201B18] block truncate max-w-[150px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#7D7065] block truncate max-w-[150px]">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  dispatch(logout());
                  dispatch(
                    addToast({
                      type: 'info',
                      message: dict.auth.logoutSuccess,
                    })
                  );
                  handleClose();
                }}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title={dict.account.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E4D8CB]/70 text-xs font-bold">
              <Link
                href={locale === 'ar' ? '/account' : '/en/account'}
                onClick={handleClose}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white rounded-lg border border-[#E4D8CB] text-[#435849]"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{dict.account.profileTab}</span>
              </Link>
              <Link
                href={locale === 'ar' ? '/account' : '/en/account'}
                onClick={handleClose}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white rounded-lg border border-[#E4D8CB] text-[#435849]"
              >
                <Package className="w-3.5 h-3.5" />
                <span>{dict.account.ordersTab}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-gradient-to-r from-[#FAF3ED] to-[#F5ECE2] border border-[#E4D8CB] rounded-2xl flex items-center justify-between gap-3 text-start">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EBF1ED] text-[#435849] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-[#201B18] block">
                  {dict.auth.loginTitle}
                </span>
                <span className="text-[10px] text-[#7D7065] block">
                  {locale === 'ar' ? 'للتمتع بتجربة تسوق متكاملة' : 'Enjoy exclusive member perks'}
                </span>
              </div>
            </div>
            <Link
              href={locale === 'ar' ? '/login' : '/en/login'}
              onClick={handleClose}
              className="px-3.5 py-1.5 bg-[#435849] hover:bg-[#344539] text-white text-xs font-bold rounded-xl shadow-xs shrink-0"
            >
              <span>{dict.auth.signIn}</span>
            </Link>
          </div>
        )}
        {/* City Selector Quick Bar */}
        <button
          onClick={() => {
            dispatch(setCityModalOpen(true));
            handleClose();
          }}
          className="w-full flex items-center justify-between p-3.5 bg-primary-light/40 border border-primary/20 rounded-xl text-start cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <div>
              <div className="text-[11px] text-text-muted">{dict.header.deliveryTo}</div>
              <div className="text-xs font-bold text-primary">{cityName}</div>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-primary underline">
            {locale === 'ar' ? 'تغيير' : 'Change'}
          </span>
        </button>

        {/* Category Accordion */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 px-1">
            {dict.footer.categories}
          </div>
          <div className="divide-y divide-border/60">
            {mainNavItems.map((item) => {
              const itemUrl = item.href[locale];
              const isExpanded = expandedCat === item.id;
              const hasSub = item.hasDropdown && item.subcategories && item.subcategories.length > 0;

              return (
                <div key={item.id} className="py-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={itemUrl}
                      onClick={handleClose}
                      className="text-sm font-semibold text-text-main hover:text-primary transition-colors py-1.5 flex-1 uppercase tracking-wide"
                    >
                      {item.name[locale]}
                    </Link>

                    {hasSub && (
                      <button
                        onClick={() => setExpandedCat(isExpanded ? null : item.id)}
                        className="p-2 text-text-muted hover:text-text-main cursor-pointer"
                        aria-label="Toggle subcategories"
                      >
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            isExpanded && 'transform rotate-180 text-primary'
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* Subcategories list */}
                  {isExpanded && hasSub && (
                    <div className="ps-4 py-2 space-y-2 border-s-2 border-primary/20 ms-2 animate-fade-in">
                      {item.subcategories!.map((sub) => {
                        const hasNested = sub.children && sub.children.length > 0;

                        return (
                          <div key={sub.id} className="space-y-1">
                            <Link
                              href={sub.href[locale]}
                              onClick={handleClose}
                              className={cn(
                                'block text-xs text-text-secondary hover:text-primary transition-colors py-1',
                                hasNested ? 'font-bold text-[#1E1915]' : 'font-medium'
                              )}
                            >
                              {sub.name[locale]}
                            </Link>

                            {hasNested && (
                              <div className="ps-3 space-y-1 border-s border-border/70 ms-1">
                                {sub.children!.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={child.href[locale]}
                                    onClick={handleClose}
                                    className="block text-[11px] font-medium text-text-muted hover:text-primary transition-colors py-0.5"
                                  >
                                    {child.name[locale]}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Pages */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 px-1">
            {dict.footer.quickLinks}
          </div>
          <div className="space-y-2.5">
            <Link
              href={locale === 'ar' ? '/blog' : '/en/blog'}
              onClick={handleClose}
              className="block text-xs font-semibold text-text-main hover:text-primary transition-colors"
            >
              {dict.nav.blog}
            </Link>
            <Link
              href={locale === 'ar' ? '/about' : '/en/about'}
              onClick={handleClose}
              className="block text-xs font-semibold text-text-main hover:text-primary transition-colors"
            >
              {dict.nav.about}
            </Link>
            <Link
              href={locale === 'ar' ? '/contact' : '/en/contact'}
              onClick={handleClose}
              className="block text-xs font-semibold text-text-main hover:text-primary transition-colors"
            >
              {dict.nav.contact}
            </Link>
            <Link
              href={locale === 'ar' ? '/faq' : '/en/faq'}
              onClick={handleClose}
              className="block text-xs font-semibold text-text-main hover:text-primary transition-colors"
            >
              {dict.nav.faq}
            </Link>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
