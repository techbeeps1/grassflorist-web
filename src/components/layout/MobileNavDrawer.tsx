'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store';
import { setMobileMenuOpen } from '@/store/slices/uiSlice';
import { Drawer } from '@/components/ui/Drawer';
import { mainNavItems } from '@/config/navigation';
import { siteConfig, type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavDrawerProps {
  locale: Locale;
}

export function MobileNavDrawer({ locale }: MobileNavDrawerProps) {
  const isOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);
  const dispatch = useAppDispatch();
  const dict = getDictionary(locale);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

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
      </div>
    </Drawer>
  );
}
