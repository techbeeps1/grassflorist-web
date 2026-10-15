'use client';

import React from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { CategoryFilters } from './CategoryFilters';
import { Button } from '@/components/ui/Button';
import { ProductFilterState, ProductAttributeItem } from '@/types/product';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';

import { Category, Subcategory } from '@/types/category';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  filters: ProductFilterState;
  onFilterChange: (newFilters: ProductFilterState) => void;
  onReset: () => void;
  productCount: number;
  categories?: Category[];
  activeCategorySlug?: string;
  subcategories?: Subcategory[];
  activeSubcategory?: string;
  onSubcategorySelect?: (subSlug?: string) => void;
  categorySlug?: string;
  attributes?: ProductAttributeItem[];
  onAttributeToggle?: (attrSlug: string, valueSlug: string) => void;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  locale,
  filters,
  onFilterChange,
  onReset,
  productCount,
  categories,
  activeCategorySlug,
  subcategories,
  activeSubcategory,
  onSubcategorySelect,
  categorySlug,
  attributes,
  onAttributeToggle,
}: MobileFilterDrawerProps) {
  const dict = getDictionary(locale);

  const hasPriceFilter = Boolean(
    (typeof filters?.minPrice === 'number' && !isNaN(filters.minPrice)) ||
    (typeof filters?.maxPrice === 'number' && !isNaN(filters.maxPrice))
  );

  const hasSelectedAttributes = Boolean(
    filters.selectedAttributes &&
    Object.values(filters.selectedAttributes).some((vals) => vals && vals.length > 0)
  );

  const hasActiveFilters = Boolean(hasPriceFilter || Boolean(activeSubcategory) || hasSelectedAttributes);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="start"
      title={dict.category.filters}
      footer={
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                onFilterChange({
                  ...filters,
                  minPrice: undefined,
                  maxPrice: undefined,
                  selectedAttributes: {},
                });
                onReset();
              }}
              className="flex-1 font-bold text-xs"
            >
              {dict.category.clearAll}
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="flex-1 font-bold text-xs"
          >
            {locale === 'ar' ? `عرض (${productCount})` : `Show (${productCount})`}
          </Button>
        </div>
      }
    >
      <CategoryFilters
        locale={locale}
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onReset}
        categories={categories}
        activeCategorySlug={activeCategorySlug}
        subcategories={subcategories}
        activeSubcategory={activeSubcategory}
        onSubcategorySelect={onSubcategorySelect}
        categorySlug={categorySlug}
        attributes={attributes}
        onAttributeToggle={onAttributeToggle}
      />
    </Drawer>
  );
}
