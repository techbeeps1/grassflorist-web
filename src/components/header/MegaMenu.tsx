'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { type Locale } from '@/config/site';
import { mainNavItems, type NavItem } from '@/config/navigation';
import { type DynamicNavItem } from '@/lib/wordpress/store-api';
import {
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Heart,
  Cake,
  Gift,
  GraduationCap,
  Baby,
  Briefcase,
  Flower2,
  Sparkles,
  Sun,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MegaMenuProps {
  locale: Locale;
  navItems?: DynamicNavItem[];
}

// Icon mapper for Occasions & subcategories
const getOccasionIcon = (iconNameOrId?: string) => {
  switch (iconNameOrId) {
    case 'heart':
    case 'love':
    case 'for-mother':
      return Heart;
    case 'sparkles':
    case 'for-her':
      return Sparkles;
    case 'sun':
    case 'get-well':
      return Sun;
    case 'flower':
    case 'i-am-sorry':
    case 'hand-bouquet':
      return Flower2;
    case 'cake':
    case 'birthday':
      return Cake;
    case 'gift':
    case 'for-him':
      return Gift;
    case 'graduation-cap':
    case 'graduation':
      return GraduationCap;
    case 'baby':
    case 'new-baby':
      return Baby;
    case 'shield':
    case 'for-father':
      return Shield;
    case 'briefcase':
    case 'new-job':
      return Briefcase;
    default:
      return Flower2;
  }
};

export function MegaMenu({ locale, navItems }: MegaMenuProps) {
  const [items, setItems] = useState<DynamicNavItem[]>((navItems as DynamicNavItem[]) || (mainNavItems as unknown as DynamicNavItem[]));
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [activeSubItem, setActiveSubItem] = useState<string | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const subTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const SubChevron = isRtl ? ChevronLeft : ChevronRight;

  // Fetch dynamic navigation items from backend if not provided via props
  useEffect(() => {
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
            showcaseType: item.showcase_type || 'none',
            featuredCategoryId: item.featured_category_id,
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
              icon: sub.icon || 'flower',
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
            featuredProduct: item.featured_product || undefined,
            featuredCard: item.featured_card || undefined,
          }));
          setItems(normalized);
        }
      })
      .catch((err) => {
        console.warn('[MegaMenu] Failed to fetch dynamic navigation:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMouseEnterItem = (itemId: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveItem(itemId);
  };

  const handleMouseLeaveItem = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setActiveItem(null);
      setActiveSubItem(null);
    }, 250);
  };

  const handleMouseEnterSub = (subId: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (subTimerRef.current) {
      clearTimeout(subTimerRef.current);
      subTimerRef.current = null;
    }
    setActiveSubItem(subId);
  };

  const handleMouseLeaveSub = () => {
    if (subTimerRef.current) {
      clearTimeout(subTimerRef.current);
    }
    subTimerRef.current = setTimeout(() => {
      setActiveSubItem(null);
    }, 200);
  };

  const closeMenusImmediately = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (subTimerRef.current) clearTimeout(subTimerRef.current);
    setActiveItem(null);
    setActiveSubItem(null);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (subTimerRef.current) clearTimeout(subTimerRef.current);
    };
  }, []);

  return (
    <nav
      aria-label="Main Navigation"
      className="relative z-40 bg-white border-t border-[#F0ECE4] select-none"
    >
      <div className="site-container">
        {/* Main Nav Items List: centered with responsive gaps */}
        <ul className="flex items-center justify-center gap-2 xl:gap-4 2xl:gap-6 overflow-visible flex-wrap md:flex-nowrap mx-auto">
          {items.map((item) => {
            const itemUrl = item.href?.[locale] || (locale === 'ar' ? '/' : '/en');
            const isOpen = activeItem === item.id;

            // Determine if item is currently active
            const isHome = item.id === 'home';
            const isActive = isHome
              ? pathname === '/' || pathname === '/en' || pathname === '/en/'
              : pathname === itemUrl || pathname.startsWith(itemUrl + '/');

            const hasDropdown = Boolean(item.hasDropdown) && Array.isArray(item.subcategories) && item.subcategories.length > 0;
            const isMega = item.dropdownType === 'mega';

            return (
              <li
                key={item.id}
                className="group shrink-0 relative flex items-center"
                onMouseEnter={() => hasDropdown && handleMouseEnterItem(item.id)}
                onMouseLeave={() => hasDropdown && handleMouseLeaveItem()}
              >
                <Link
                  href={itemUrl}
                  className={cn(
                    'inline-flex items-center gap-1 xl:gap-1.5 py-3 xl:py-3.5 px-1 xl:px-1.5 text-[11px] xl:text-[11.5px] 2xl:text-[12.5px] font-bold tracking-wide uppercase transition-all duration-200 border-b-2 cursor-pointer whitespace-nowrap',
                    isActive
                      ? 'text-[#1E1915] border-[#8CA841]'
                      : 'text-[#5C534B] hover:text-[#1E1915] border-transparent hover:border-[#8CA841]/50',
                    isOpen && 'text-[#1E1915] border-[#8CA841]'
                  )}
                  aria-expanded={hasDropdown ? isOpen : undefined}
                >
                  <span>{item.name?.[locale] || ''}</span>
                  {hasDropdown && (
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-[#8C8075] group-hover:text-[#1E1915] transition-transform duration-200',
                        isOpen && 'transform rotate-180 text-[#8CA841]'
                      )}
                    />
                  )}
                </Link>

                {/* Dropdown Menu for items with subcategories */}
                {hasDropdown && isOpen && (
                  !isMega ? (
                    /* Simple Vertical Dropdown (Default style) */
                    <div
                      className={cn(
                        'absolute top-full min-w-[230px] sm:min-w-[250px] bg-white border border-[#EFE8DE] shadow-xl rounded-xl py-2 mt-0 z-50 overflow-visible',
                        item.id === 'about-grass' || item.id === 'balloons'
                          ? isRtl
                            ? 'start-0'
                            : 'end-0'
                          : isRtl
                          ? 'end-0'
                          : 'start-0'
                      )}
                      onMouseEnter={() => handleMouseEnterItem(item.id)}
                    >
                      {/* Generous hover bridge to prevent flicker from any direction */}
                      <div className="absolute -top-3 inset-x-0 h-3 bg-transparent pointer-events-auto" />

                      <div className="flex flex-col">
                        {item.subcategories?.map((sub) => {
                          const hasChildren = Array.isArray(sub.children) && sub.children.length > 0;
                          const isSubOpen = activeSubItem === sub.id;
                          const subUrl = sub.href?.[locale] || '#';

                          if (!hasChildren) {
                            return (
                              <Link
                                key={sub.id}
                                href={subUrl}
                                onClick={closeMenusImmediately}
                                className="px-4 py-2 text-xs sm:text-[13px] font-medium text-[#4A4036] hover:text-[#1E1915] hover:bg-[#FAF7F2] transition-colors flex items-center justify-between group/sub"
                              >
                                <span>{sub.name?.[locale] || ''}</span>
                                <ArrowIcon className="w-3.5 h-3.5 opacity-0 group-hover/sub:opacity-100 group-hover/sub:translate-x-0.5 rtl:group-hover/sub:-translate-x-0.5 transition-all text-[#435849]" />
                              </Link>
                            );
                          }

                          return (
                            <div
                              key={sub.id}
                              className="relative"
                              onMouseEnter={() => handleMouseEnterSub(sub.id)}
                              onMouseLeave={handleMouseLeaveSub}
                            >
                              <Link
                                href={subUrl}
                                onClick={closeMenusImmediately}
                                className={cn(
                                  'px-4 py-2 text-xs sm:text-[13px] font-medium text-[#4A4036] hover:text-[#1E1915] hover:bg-[#FAF7F2] transition-colors flex items-center justify-between group/sub',
                                  isSubOpen && 'bg-[#FAF7F2] text-[#1E1915] font-semibold'
                                )}
                              >
                                <span>{sub.name?.[locale] || ''}</span>
                                <SubChevron className="w-3.5 h-3.5 text-[#8C8075] group-hover/sub:text-[#435849]" />
                              </Link>

                              {/* Nested 3rd-level submenu flyout */}
                              {isSubOpen && (
                                <div
                                  className={cn(
                                    'absolute top-0 min-w-[200px] bg-white border border-[#EFE8DE] shadow-xl rounded-xl py-2 z-50',
                                    isRtl ? 'right-full me-1' : 'left-full ms-1'
                                  )}
                                  onMouseEnter={() => handleMouseEnterSub(sub.id)}
                                >
                                  {sub.children?.map((child) => (
                                    <Link
                                      key={child.id}
                                      href={child.href?.[locale] || '#'}
                                      onClick={closeMenusImmediately}
                                      className="px-4 py-2 text-xs sm:text-[12.5px] font-medium text-[#5C524B] hover:text-[#1E1915] hover:bg-[#FAF7F2] transition-colors block"
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
                    </div>
                  ) : (
                    /* Full-width Luxury Mega Dropdown (for Occasions or items marked as mega) */
                    <div
                      className="fixed top-auto start-0 end-0 left-0 right-0 bg-[#FCFAF7]/98 backdrop-blur-xl border-b border-[#E8E1D5] shadow-[0_20px_40px_rgba(30,25,21,0.08)] py-7 px-6 sm:px-8 z-50"
                      style={{ top: '100%' }}
                      onMouseEnter={() => handleMouseEnterItem(item.id)}
                    >
                      {/* Generous invisible hover bridge */}
                      <div className="absolute -top-4 inset-x-0 h-4 bg-transparent pointer-events-auto" />

                      <div className="site-container grid grid-cols-12 gap-8 items-start">
                        {/* Left: Category Sub-links in 3 Columns with Circular Icons */}
                        <div className={cn(
                          item.featuredProduct || item.featuredCard ? 'col-span-12 lg:col-span-8' : 'col-span-12',
                          'flex flex-col'
                        )}>
                          {/* Header Bar */}
                          <div className="pb-4 mb-2 border-b border-[#EFE7DC] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#435849] border border-[#EAE3D7] flex items-center justify-center shrink-0">
                                <Flower2 className="w-4.5 h-4.5 text-[#435849]" />
                              </div>
                              <h3 className="text-base sm:text-[17px] font-extrabold text-[#1E1915] tracking-wide uppercase font-sans">
                                {item.name?.[locale] || ''}
                              </h3>
                              <span className="text-[#D8CFBF] text-base font-light select-none">|</span>
                              <span className="text-xs sm:text-[13px] font-medium text-[#8C8075]">
                                {item.subcategories?.length || 0} {locale === 'ar' ? 'تصنيف' : 'Items'}
                              </span>
                            </div>

                            <Link
                              href={itemUrl}
                              onClick={closeMenusImmediately}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#435849] text-[#435849] hover:text-white border border-[#E8E0D4] text-xs font-semibold transition-all duration-200 group/all"
                            >
                              <span>{locale === 'ar' ? 'عرض الكل' : 'View All'}</span>
                              <ArrowIcon className="w-3.5 h-3.5 group-hover/all:translate-x-0.5 rtl:group-hover/all:-translate-x-0.5 transition-transform" />
                            </Link>
                          </div>

                          {/* 3-Column Subcategories List with Icons */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-0">
                            {item.subcategories?.map((sub) => {
                              const IconComponent = getOccasionIcon(sub.icon || sub.id);
                              const subUrl = sub.href?.[locale] || '#';
                              return (
                                <Link
                                  key={sub.id}
                                  href={subUrl}
                                  onClick={closeMenusImmediately}
                                  className="group/occ flex items-center gap-3 py-2.5 border-b border-[#F4EFEA] hover:border-[#8CA841]/50 transition-colors"
                                >
                                  <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#FAF7F2] group-hover/occ:bg-[#435849] border border-[#EAE3D7] group-hover/occ:border-[#435849] flex items-center justify-center transition-all duration-200 shrink-0 shadow-2xs">
                                    <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#435849] group-hover/occ:text-white transition-colors duration-200" />
                                  </div>
                                  <span className="text-xs sm:text-[13.5px] font-medium text-[#25211E] group-hover/occ:text-[#435849] group-hover/occ:font-semibold transition-colors truncate">
                                    {sub.name?.[locale] || ''}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right: Dynamic Category Random Product Showcase */}
                        {item.featuredProduct ? (
                          <div className="col-span-12 lg:col-span-4">
                            <Link
                              href={locale === 'ar' ? `/product/${item.featuredProduct.slug.ar}` : `/en/product/${item.featuredProduct.slug.en}`}
                              onClick={closeMenusImmediately}
                              className="group/card block bg-white p-3.5 rounded-2xl border border-[#EFE8DE] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(67,88,73,0.10)] hover:border-[#D8CFBF] transition-all duration-300"
                            >
                              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-[#FAF7F2]">
                                <Image
                                  src={item.featuredProduct.image}
                                  alt={item.featuredProduct.name?.[locale] || 'Featured product'}
                                  fill
                                  sizes="380px"
                                  className="object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute top-2.5 start-2.5">
                                  <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider bg-white/95 text-[#435849] px-3 py-1 rounded-full shadow-xs backdrop-blur-md border border-[#EFE8DE]">
                                    {item.featuredProduct.badge?.[locale] || 'FEATURED'}
                                  </span>
                                </div>
                              </div>

                              <div className="px-1">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h4 className="font-serif text-sm sm:text-base font-bold text-[#1E1915] group-hover/card:text-[#435849] transition-colors leading-snug truncate">
                                    {item.featuredProduct.name?.[locale] || ''}
                                  </h4>
                                  <span className="text-xs sm:text-sm font-extrabold text-[#435849] shrink-0">
                                    {item.featuredProduct.price} {locale === 'ar' ? 'ر.س' : 'SAR'}
                                  </span>
                                </div>
                                <p className="text-xs text-[#7A7066] mt-0.5 line-clamp-1 leading-relaxed">
                                  {item.featuredProduct.categoryName?.[locale] || (locale === 'ar' ? 'تنسيق فاخر حصري' : 'Exclusive luxury floral arrangement')}
                                </p>
                                <div className="mt-3 pt-2 border-t border-[#F4EFEA] flex items-center gap-1.5 text-xs font-bold text-[#435849] group-hover/card:text-[#334438]">
                                  <span>{item.featuredProduct.cta?.[locale] || (locale === 'ar' ? 'عرض المنتج' : 'View Product')}</span>
                                  <ArrowIcon className="w-3.5 h-3.5 group-hover/card:translate-x-1 rtl:group-hover/card:-translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </Link>
                          </div>
                        ) : item.featuredCard ? (
                          /* Custom Banner Showcase Card */
                          <div className="col-span-12 lg:col-span-4">
                            <Link
                              href={item.featuredCard.link?.[locale] || itemUrl}
                              onClick={closeMenusImmediately}
                              className="group/card block bg-white p-3.5 rounded-2xl border border-[#EFE8DE] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(67,88,73,0.10)] hover:border-[#D8CFBF] transition-all duration-300"
                            >
                              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-[#FAF7F2]">
                                <Image
                                  src={item.featuredCard.image}
                                  alt={item.featuredCard.title?.[locale] || ''}
                                  fill
                                  sizes="380px"
                                  className="object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute top-2.5 start-2.5">
                                  <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider bg-white/95 text-[#435849] px-3 py-1 rounded-full shadow-xs backdrop-blur-md border border-[#EFE8DE]">
                                    {item.featuredCard.tag?.[locale] || ''}
                                  </span>
                                </div>
                              </div>

                              <div className="px-1">
                                <h4 className="font-serif text-sm sm:text-base font-bold text-[#1E1915] group-hover/card:text-[#435849] transition-colors leading-snug">
                                  {item.featuredCard.title?.[locale] || ''}
                                </h4>
                                <p className="text-xs text-[#7A7066] mt-1 line-clamp-2 leading-relaxed">
                                  {item.featuredCard.desc?.[locale] || ''}
                                </p>
                                <div className="mt-3 pt-2 border-t border-[#F4EFEA] flex items-center gap-1.5 text-xs font-bold text-[#435849] group-hover/card:text-[#334438]">
                                  <span>{locale === 'ar' ? 'تصفح التشكيلة الكاملة' : 'Explore Curated Flowers'}</span>
                                  <ArrowIcon className="w-3.5 h-3.5 group-hover/card:translate-x-1 rtl:group-hover/card:-translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
