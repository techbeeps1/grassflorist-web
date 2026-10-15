'use client';

import React, { useState, useEffect, useRef } from 'react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { ProductFilterState } from '@/types/product';
import { Category, Subcategory } from '@/types/category';
import { decodeHtmlEntities } from '@/lib/wordpress/store-api';
import { RotateCcw, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFiltersProps {
  locale: Locale;
  filters: ProductFilterState;
  onFilterChange: (newFilters: ProductFilterState) => void;
  onReset: () => void;
  categories?: Category[];
  activeCategorySlug?: string;
  subcategories?: Subcategory[];
  activeSubcategory?: string;
  onSubcategorySelect?: (subSlug?: string) => void;
  categorySlug?: string;
  className?: string;
}

function cleanTitle(str?: string): string {
  if (!str) return '';
  let cleaned = decodeHtmlEntities(str);
  if (cleaned.includes('%')) {
    try {
      cleaned = decodeURIComponent(cleaned);
    } catch {}
  }
  return cleaned;
}

export function CategoryFilters({
  locale,
  filters,
  onFilterChange,
  onReset,
  categories: dynamicCategories,
  activeCategorySlug,
  subcategories,
  activeSubcategory,
  onSubcategorySelect,
  categorySlug,
  className,
}: CategoryFiltersProps) {
  const dict = getDictionary(locale);

  const DEFAULT_VISIBLE_COUNT = 8;
  const subListRef = useRef<HTMLDivElement>(null);
  const [collapsedHeight, setCollapsedHeight] = useState<number | undefined>(undefined);



  // Subcategories expand / collapse logic
  const [isSubExpanded, setIsSubExpanded] = useState(() => {
    if (!subcategories || !activeSubcategory) return false;
    const activeSubIndex = subcategories.findIndex((sub) => {
      const decodedActive = decodeURIComponent(activeSubcategory).toLowerCase().trim();
      const decodedSubSlug = decodeURIComponent(sub.slug).toLowerCase().trim();
      return (
        decodedActive === decodedSubSlug ||
        decodedActive === sub.slug.toLowerCase().trim() ||
        String(sub.id) === decodedActive
      );
    });
    return activeSubIndex >= DEFAULT_VISIBLE_COUNT;
  });

  useEffect(() => {
    if (!subcategories || !activeSubcategory) return;
    const activeSubIndex = subcategories.findIndex((sub) => {
      const decodedActive = decodeURIComponent(activeSubcategory).toLowerCase().trim();
      const decodedSubSlug = decodeURIComponent(sub.slug).toLowerCase().trim();
      return (
        decodedActive === decodedSubSlug ||
        decodedActive === sub.slug.toLowerCase().trim() ||
        String(sub.id) === decodedActive
      );
    });
    if (activeSubIndex >= DEFAULT_VISIBLE_COUNT) {
      setIsSubExpanded(true);
    }
  }, [activeSubcategory, subcategories]);

  // Track exact collapsed height so card height never shrinks when clicking "+ More"
  useEffect(() => {
    if (!isSubExpanded && subListRef.current) {
      const h = subListRef.current.offsetHeight || subListRef.current.scrollHeight;
      if (h > 0) {
        setCollapsedHeight(h);
      }
    }
  }, [isSubExpanded, subcategories]);

  const visibleSubcategories = isSubExpanded
    ? subcategories || []
    : (subcategories || []).slice(0, DEFAULT_VISIBLE_COUNT);

  const handlePriceChange = (min?: number, max?: number) => {
    onFilterChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const priceRanges = [
    { label: locale === 'ar' ? 'الكل' : 'All Prices', min: undefined, max: undefined },
    { label: locale === 'ar' ? 'أقل من 150 ر.س' : 'Under 150 ر.س', min: 0, max: 150 },
    { label: locale === 'ar' ? '150 إلى 250 ر.س' : '150 to 250 ر.س', min: 150, max: 250 },
    { label: locale === 'ar' ? '250 إلى 350 ر.س' : '250 to 350 ر.س', min: 250, max: 350 },
    { label: locale === 'ar' ? '350 إلى 500 ر.س' : '350 to 500 ر.س', min: 350, max: 500 },
    { label: locale === 'ar' ? '500 إلى 750 ر.س' : '500 to 750 ر.س', min: 500, max: 750 },
    { label: locale === 'ar' ? 'أكثر من 750 ر.س' : 'Above 750 ر.س', min: 750, max: undefined },
  ];

  const allProductsUrl = locale === 'ar' ? '/products' : '/en/products';

  const hasPriceFilter = Boolean(
    (typeof filters?.minPrice === 'number' && !isNaN(filters.minPrice)) ||
    (typeof filters?.maxPrice === 'number' && !isNaN(filters.maxPrice))
  );

  const hasActiveFilters = Boolean(hasPriceFilter || Boolean(activeSubcategory));

  const handleResetFilters = () => {
    handlePriceChange(undefined, undefined);
    onSubcategorySelect?.(undefined);
    onReset();
  };

  return (
    <aside aria-label="Catalog Filters" className={cn('space-y-4 text-start select-none', className)}>
      {/* Header & Reset */}
      <div className="flex items-center justify-between min-h-[1.75rem] pb-3 border-b border-border">
        <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
          {dict.category.filters}
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer animate-in fade-in duration-150"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{dict.category.clearAll}</span>
          </button>
        )}
      </div>

      {/* Subcategories Filter (Shown when category has subcategories) */}
      {subcategories && subcategories.length > 0 && (
        <div className="pb-3 border-b border-border">
          <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
            {locale === 'ar' ? 'التصنيفات الفرعية' : 'Subcategories'}
          </h4>
          <div
            ref={subListRef}
            className={cn(
              'space-y-1',
              isSubExpanded && 'overflow-y-auto pe-1.5 custom-scrollbar'
            )}
            style={
              isSubExpanded
                ? {
                    height: collapsedHeight ? `${collapsedHeight}px` : '290px',
                    maxHeight: collapsedHeight ? `${collapsedHeight}px` : '290px',
                  }
                : undefined
            }
          >
            {/* All Subcategories Option */}
            <button
              type="button"
              onClick={() => onSubcategorySelect?.(undefined)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start outline-none focus:outline-none',
                !activeSubcategory
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-text-secondary hover:bg-surface-subtle hover:text-text-main'
              )}
            >
              <span>{locale === 'ar' ? 'جميع التشكيلات' : 'All Subcategories'}</span>
              {!activeSubcategory && <Check className="w-3.5 h-3.5 shrink-0 ms-1" />}
            </button>

            {/* Subcategory Items */}
            {visibleSubcategories.map((sub) => {
              const decodedActive = activeSubcategory
                ? decodeURIComponent(activeSubcategory).toLowerCase().trim()
                : '';
              const decodedSubSlug = decodeURIComponent(sub.slug).toLowerCase().trim();
              const cleanActive = decodedActive.replace(/[-_\s]+/g, ' ');
              const cleanSubSlug = decodedSubSlug.replace(/[-_\s]+/g, ' ');
              const cleanSubEn = sub.name?.en
                ? sub.name.en.toLowerCase().trim().replace(/[-_\s]+/g, ' ')
                : '';
              const cleanSubAr = sub.name?.ar
                ? sub.name.ar.toLowerCase().trim().replace(/[-_\s]+/g, ' ')
                : '';

              const isSelected = Boolean(
                decodedActive &&
                  (decodedActive === decodedSubSlug ||
                    decodedActive === sub.slug.toLowerCase().trim() ||
                    (sub.id && String(decodedActive) === String(sub.id)) ||
                    cleanActive === cleanSubSlug ||
                    cleanActive === cleanSubEn ||
                    cleanActive === cleanSubAr)
              );

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSubcategorySelect?.(isSelected ? undefined : sub.slug)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start outline-none focus:outline-none',
                    isSelected
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-main'
                  )}
                >
                  <span className="truncate">
                    {cleanTitle(sub.name[locale] || sub.name.en || sub.name.ar)}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ms-1" />}
                </button>
              );
            })}
          </div>

          {/* More / Less Subcategories Toggle */}
          {subcategories.length > DEFAULT_VISIBLE_COUNT && (
            <button
              type="button"
              onClick={() => {
                if (isSubExpanded && subListRef.current) {
                  subListRef.current.scrollTop = 0;
                }
                setIsSubExpanded(!isSubExpanded);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer border border-dashed border-primary/30 rounded-xl hover:bg-primary/5 mt-2"
            >
              {isSubExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>{locale === 'ar' ? 'عرض أقل' : 'Show Less'}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>
                    {locale === 'ar'
                      ? `+ المزيد (${subcategories.length - DEFAULT_VISIBLE_COUNT})`
                      : `+ More (${subcategories.length - DEFAULT_VISIBLE_COUNT})`}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Price Range Filter (Compact 2-col Grid) */}
      <div className={cn(subcategories && subcategories.length > 0 && 'pt-3 border-t border-border')}>
        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
          {dict.category.priceRange}
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {priceRanges.map((range, idx) => {
            const isSelected =
              filters.minPrice === range.min && filters.maxPrice === range.max;
            const isAll = idx === 0;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePriceChange(range.min, range.max)}
                className={cn(
                  'flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-start border',
                  isAll && 'col-span-2',
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface text-text-secondary border-border/70 hover:bg-surface-subtle hover:text-text-main hover:border-primary/40'
                )}
              >
                <span className="truncate">{range.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ms-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
