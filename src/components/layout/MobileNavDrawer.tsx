'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store';
import { setMobileMenuOpen } from '@/store/slices/uiSlice';
import { Drawer } from '@/components/ui/Drawer';
import { mainNavItems } from '@/config/navigation';
import { type DynamicNavItem } from '@/lib/wordpress/store-api';
import { siteConfig, type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencySwitcher } from '@/components/common/CurrencySwitcher';

interface MobileNavDrawerProps {
  locale: Locale;
}

export function MobileNavDrawer({ locale }: MobileNavDrawerProps) {
  const [items, setItems] = useState<DynamicNavItem[]>((mainNavItems as unknown) as DynamicNavItem[]);
  const isOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);
  const dispatch = useAppDispatch();
  const dict = getDictionary(locale);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    fetch('/api/navigation')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.header) && data.header.length > 0) {
          const normalized: DynamicNavItem[] = data.header.map((item: any) => ({
            id: item.id || String(Math.random()),
            name: {
              en: item.name_en || (typeof item.name === 'object' ? item.name?.en : item.name) || '',
              ar: item.name_ar || (typeof item.name === 'object' ? item.name?.ar : item.name) || '',
            },
            href: {
              en: item.url_en || (typeof item.href === 'object' ? item.href?.en : item.href) || '',
              ar: item.url_ar || (typeof item.href === 'object' ? item.href?.ar : item.href) || '',
            },
            hasDropdown: Boolean(item.has_dropdown),
            dropdownType: item.dropdown_type || 'simple',
            subcategories: (item.subcategories || []).map((sub: any) => ({
              id: sub.id || String(Math.random()),
              name: {
                en: sub.name_en || (typeof sub.name === 'object' ? sub.name?.en : sub.name) || '',
                ar: sub.name_ar || (typeof sub.name === 'object' ? sub.name?.ar : sub.name) || '',
              },
              href: {
                en: sub.url_en || (typeof sub.href === 'object' ? sub.href?.en : sub.href) || '',
                ar: sub.url_ar || (typeof sub.href === 'object' ? sub.href?.ar : sub.href) || '',
              },
              children: (sub.children || []).map((child: any) => ({
                id: child.id || String(Math.random()),
                name: {
                  en: child.name_en || (typeof child.name === 'object' ? child.name?.en : child.name) || '',
                  ar: child.name_ar || (typeof child.name === 'object' ? child.name?.ar : child.name) || '',
                },
                href: {
                  en: child.url_en || (typeof child.href === 'object' ? child.href?.en : child.href) || '',
                  ar: child.url_ar || (typeof child.href === 'object' ? child.href?.ar : child.href) || '',
                },
              })),
            })),
          }));
          setItems(normalized);
        }
      })
      .catch((e) => console.warn('[MobileNavDrawer] Failed to fetch nav:', e));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleClose = () => dispatch(setMobileMenuOpen(false));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      side="start"
      title={
        <Link
          href={locale === 'ar' ? '/' : '/en'}
          onClick={handleClose}
          className="flex items-center select-none"
          aria-label="Grass Flowers"
        >
          <Image
            src="/grass-logo.jpg"
            alt="Grass غراس"
            width={130}
            height={65}
            className="w-[48px] sm:w-[54px] h-auto object-contain"
            priority
          />
        </Link>
      }
    >
      <div className="space-y-6 pt-1">
        {/* Category Navigation Accordion */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 px-1">
            {dict.footer.categories}
          </div>
          <div className="divide-y divide-border/60">
            {items.map((item) => {
              const itemUrl = item.href?.[locale] || (locale === 'ar' ? '/' : '/en');
              const isExpanded = expandedCat === item.id;
              const hasSub = Boolean(item.hasDropdown) && Array.isArray(item.subcategories) && item.subcategories.length > 0;

              return (
                <div key={item.id} className="py-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={itemUrl}
                      onClick={handleClose}
                      className="text-sm font-semibold text-text-main hover:text-primary transition-colors py-1.5 flex-1 uppercase tracking-wide"
                    >
                      {item.name?.[locale] || ''}
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
                              href={sub.href?.[locale] || '#'}
                              onClick={handleClose}
                              className={cn(
                                'block text-xs text-text-secondary hover:text-primary transition-colors py-1',
                                hasNested ? 'font-bold text-[#1E1915]' : 'font-medium'
                              )}
                            >
                              {sub.name?.[locale] || ''}
                            </Link>

                            {hasNested && (
                              <div className="ps-3 space-y-1 border-s border-border/70 ms-1">
                                {sub.children!.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={child.href?.[locale] || '#'}
                                    onClick={handleClose}
                                    className="block text-[11px] font-medium text-text-muted hover:text-primary transition-colors py-0.5"
                                  >
                                    {child.name?.[locale] || ''}
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

        {/* Currency Switcher in Mobile Drawer */}
        <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-gray-500">
            {locale === 'ar' ? 'العملة:' : 'Currency:'}
          </span>
          <CurrencySwitcher locale={locale} />
        </div>
      </div>
    </Drawer>
  );
}
