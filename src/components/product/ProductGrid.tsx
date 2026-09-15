import React from 'react';
import { Product } from '@/types/product';
import { type Locale } from '@/config/site';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  locale: Locale;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  locale,
  isLoading = false,
  emptyMessage,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center flex flex-col items-center justify-center p-6 bg-surface rounded-2xl border border-border">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary mb-4">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-text-main mb-1">
          {locale === 'ar' ? 'لا توجد منتجات مطابقة' : 'No matching products'}
        </h3>
        <p className="text-xs sm:text-sm text-text-muted max-w-sm">
          {emptyMessage ||
            (locale === 'ar'
              ? 'جرّب تعديل الفلاتر أو تصفح الأقسام الأخرى للعثور على باقتك المثالية.'
              : 'Try adjusting your filters or browse other categories to discover arrangements.')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          priority={idx < 4}
        />
      ))}
    </div>
  );
}
