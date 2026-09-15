'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import { removeFromWishlist } from '@/store/slices/wishlistSlice';
import { addItem } from '@/store/slices/cartSlice';
import { setCartDrawerOpen, addToast } from '@/store/slices/uiSlice';
import { formatPrice } from '@/lib/utils';
import { type Product } from '@/types/product';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

interface WishlistPageViewProps {
  locale: Locale;
}

export function WishlistPageView({ locale }: WishlistPageViewProps) {
  const dict = getDictionary(locale);
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.wishlist.title },
  ];

  const catalogUrl = locale === 'ar' ? '/products' : '/en/products';

  const handleMoveToCart = (product: Product) => {
    dispatch(
      addItem({
        cartItemId: `${product.id}-standard`,
        productId: product.id,
        product,
        quantity: 1,
        itemTotal: product.price,
      })
    );
    dispatch(removeFromWishlist(product.id));
    dispatch(setCartDrawerOpen(true));
    dispatch(
      addToast({
        type: 'success',
        message:
          locale === 'ar'
            ? `تم نقل "${product.name.ar}" إلى سلة المشتريات!`
            : `Moved "${product.name.en}" to shopping bag!`,
      })
    );
  };

  return (
    <div className="py-6 bg-surface min-h-[80vh]">
      <div className="max-w-[1280px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        <div className="mb-8 text-start">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
            {dict.wishlist.title}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            {locale === 'ar'
              ? 'احفظ باقاتك وتنسيقاتك المفضلة هنا لطلبها في المناسبات القادمة.'
              : 'Keep track of your admired arrangements and send them when milestones arrive.'}
          </p>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistItems.map((product) => {
              const productUrl =
                locale === 'ar'
                  ? `/product/${product.slug.ar}`
                  : `/en/product/${product.slug.en}`;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-surface rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 text-start"
                >
                  <div className="relative aspect-[4/5] bg-surface-subtle overflow-hidden">
                    <Link href={productUrl} className="block w-full h-full">
                      <Image
                        src={product.thumbnail}
                        alt={product.name[locale]}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <button
                      onClick={() => dispatch(removeFromWishlist(product.id))}
                      aria-label="Remove from wishlist"
                      className="absolute top-3 end-3 p-2 rounded-full bg-white/90 text-text-muted hover:text-error hover:bg-white shadow-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[11px] text-text-muted block truncate mb-1">
                        {product.category[locale]}
                      </span>
                      <Link href={productUrl}>
                        <h3 className="text-xs sm:text-sm font-bold text-text-main hover:text-primary transition-colors line-clamp-2">
                          {product.name[locale]}
                        </h3>
                      </Link>
                      <div className="mt-2 text-sm sm:text-base font-extrabold text-primary">
                        {formatPrice(product.price, locale)}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMoveToCart(product)}
                        className="w-full font-bold text-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 me-1.5" />
                        <span>{dict.wishlist.moveToCart}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center flex flex-col items-center justify-center p-6 bg-surface rounded-2xl border border-border">
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-text-main mb-2">
              {dict.wishlist.emptyTitle}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
              {dict.wishlist.emptyDesc}
            </p>
            <Link href={catalogUrl}>
              <Button variant="primary" size="lg" className="font-bold">
                <span>{dict.wishlist.exploreCatalog}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
