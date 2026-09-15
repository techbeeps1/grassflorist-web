'use client';

import React from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { CategoryFilters } from './CategoryFilters';
import { Button } from '@/components/ui/Button';
import { ProductFilterState } from '@/types/product';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  filters: ProductFilterState;
  onFilterChange: (newFilters: ProductFilterState) => void;
  onReset: () => void;
  productCount: number;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  locale,
  filters,
  onFilterChange,
  onReset,
  productCount,
}: MobileFilterDrawerProps) {
  const dict = getDictionary(locale);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="start"
      title={dict.category.filters}
      footer={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onReset}
            className="flex-1 font-bold text-xs"
          >
            {dict.category.clearAll}
          </Button>
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
      />
    </Drawer>
  );
}
