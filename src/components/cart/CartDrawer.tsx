'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCartDrawerOpen } from '@/store/slices/uiSlice';
import { useCartDynamicTotals } from '@/hooks/useCartDynamicTotals';
import { getLocalizedProductName } from '@/store/api/cartApi';
import { useCartActions } from '@/hooks/useCartActions';
import { Drawer } from '@/components/ui/Drawer';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { formatStorageUrl } from '@/lib/wordpress/store-api';
import { CurrencySymbol, PriceDisplay } from '@/components/common/CurrencySymbol';
import { CartDrawerItemSkeleton } from '@/components/ui/Skeleton';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Plus, Minus, Loader2, RotateCw } from 'lucide-react';

interface CartDrawerProps {
  locale: Locale;
}

export function CartDrawer({ locale }: CartDrawerProps) {
  const isOpen = useAppSelector((state) => state.ui.isCartDrawerOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const dict = getDictionary(locale);

  const { total } = useCartDynamicTotals(locale);
  const { updateQuantity, removeItem, pendingAddItem, updatingItemIds, removingItemIds } = useCartActions();

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const checkoutUrl = locale === 'ar' ? '/checkout' : '/en/checkout';
  const catalogUrl = locale === 'ar' ? '/products' : '/en/products';

  const handleClose = () => dispatch(setCartDrawerOpen(false));

  const totalItemCount = cartItems.reduce((acc, it) => acc + it.quantity, 0) + (pendingAddItem ? (pendingAddItem.quantity || 1) : 0);
  const hasItemsOrPending = cartItems.length > 0 || Boolean(pendingAddItem);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      side="end"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#435849]/10 flex items-center justify-center text-[#435849] shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#201B18] tracking-tight">
                {dict.cart.title}
              </h3>
              {totalItemCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#435849] text-white text-[11px] font-black">
                  {totalItemCount}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8C8075] font-medium">
              {locale === 'ar' ? 'تصاميم وزهور فاخرة' : 'Haute Floral Atelier'}
            </p>
          </div>
        </div>
      }
      footer={
        hasItemsOrPending ? (
          <div className="space-y-4">
            {/* Total Row */}
            <div className="flex justify-between items-baseline text-base">
              <div>
                <span className="font-extrabold text-[#201B18] block">{dict.cart.total}</span>
                <span className="text-[10px] text-[#8C8075] block -mt-0.5">
                  {locale === 'ar' ? 'شامل الضريبة المضافة' : 'VAT Included'}
                </span>
              </div>
              <div dir="ltr" className="text-xl sm:text-2xl font-black text-[#435849]">
                <PriceDisplay amount={total} />
              </div>
            </div>

            {/* Checkout CTA */}
            <div>
              <Link href={checkoutUrl} onClick={handleClose} className="block w-full">
                <button className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-[#435849] hover:bg-[#334438] text-white text-xs sm:text-sm font-extrabold tracking-wide shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                  <span>{dict.cart.proceedToCheckout}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* 100% Secure Trust Perk */}
            <div className="flex items-center justify-center text-[11px] text-[#8C8075] pt-0.5">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#435849]" />
                {locale === 'ar' ? 'دفع آمن 100%' : '100% Secure'}
              </span>
            </div>
          </div>
        ) : undefined
      }
    >
      {hasItemsOrPending ? (
        <div className="space-y-3">
          {/* 🌟 1. Skeleton Loading for newly added item while API responds */}
          {pendingAddItem && (
            <div className="relative">
              <div className="absolute top-2 end-2 z-10">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#435849] text-white text-[10px] font-bold shadow-xs">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>{locale === 'ar' ? 'جارٍ الإضافة...' : 'Adding...'}</span>
                </span>
              </div>
              <CartDrawerItemSkeleton
                title={
                  pendingAddItem.product
                    ? getLocalizedProductName(pendingAddItem.product.name, locale)
                    : undefined
                }
              />
            </div>
          )}
          {cartItems.map((item) => {
            const isRemoving = Boolean(removingItemIds[item.cartItemId] || removingItemIds[String(item.productId)]);
            const isUpdating = Boolean(updatingItemIds[item.cartItemId] || updatingItemIds[String(item.productId)]);

            if (isRemoving) {
              return (
                <div
                  key={item.cartItemId}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5]/80 border border-rose-200/60 flex gap-3.5 items-center animate-pulse transition-all select-none"
                >
                  <div className="w-20 h-20 rounded-xl bg-[#E8E2D8] shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-bold text-gray-400 line-through truncate block">
                        {getLocalizedProductName(item.product.name, locale)}
                      </span>
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500 shrink-0" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-bold">
                      <span>{locale === 'ar' ? 'جارٍ حذف المنتج...' : 'Removing item...'}</span>
                    </div>
                    <div className="h-3 w-1/3 rounded-md bg-[#EAE4DA]" />
                  </div>
                </div>
              );
            }

            const slug = getLocalizedProductName(item.product.slug, locale) || item.productId;
            const productUrl =
              locale === 'ar'
                ? `/product/${slug}`
                : `/en/product/${slug}`;

            return (
              <div
                key={item.cartItemId}
                className={`p-3.5 rounded-2xl bg-[#FAF8F5] border transition-all duration-200 flex gap-3.5 items-center group ${
                  isUpdating
                    ? 'border-[#435849]/50 ring-1 ring-[#435849]/20'
                    : 'border-[#EFE8DE] hover:border-[#DDD3C4]'
                }`}
              >
                {/* Thumbnail */}
                <Link
                  href={productUrl}
                  onClick={handleClose}
                  className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-white border border-[#EAE2D5] shadow-2xs"
                >
                  <Image
                    src={formatStorageUrl(item.product.thumbnail)}
                    alt={getLocalizedProductName(item.product.name, locale)}
                    fill
                    sizes="80px"
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                  {/* Title & Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={productUrl}
                      onClick={handleClose}
                      className="text-[13px] sm:text-[13.5px] font-bold text-[#1E1915] hover:text-[#435849] transition-colors line-clamp-2 leading-snug"
                    >
                      {getLocalizedProductName(item.product.name, locale)}
                    </Link>

                    <button
                      disabled={isUpdating}
                      onClick={() => removeItem(item.productId, item.cartItemId)}
                      className="text-[#9E9285] hover:text-red-600 p-1 -mt-1 -me-1 rounded-full hover:bg-red-50/80 transition-colors cursor-pointer shrink-0 disabled:opacity-30 disabled:pointer-events-none"
                      title={locale === 'ar' ? 'حذف المنتج' : 'Remove item'}
                      aria-label={locale === 'ar' ? 'حذف المنتج' : 'Remove item'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* ⚡ Subscription Badge */}
                  {item.isSubscription && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#435849] bg-[#EBF3E8] px-2 py-0.5 rounded-md mt-1 w-fit">
                      <RotateCw className="w-3 h-3 text-[#546e3a]" />
                      <span>{locale === 'ar' ? 'اشتراك' : 'Subscription'}</span>
                    </span>
                  )}

                  {/* Addons (if selected) */}
                  {(item.addons?.vase || item.addons?.chocolates || item.addons?.greetingCard?.message) && (
                    <div className="flex flex-wrap gap-1 my-1">
                      {item.addons?.vase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#6B5E52] bg-white px-1.5 py-0.5 rounded border border-[#E8E1D5]">
                          🏺 {item.addons.vase.name}
                        </span>
                      )}
                      {item.addons?.chocolates && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#6B5E52] bg-white px-1.5 py-0.5 rounded border border-[#E8E1D5]">
                          🍫 {item.addons.chocolates.name}
                        </span>
                      )}
                      {item.addons?.greetingCard?.message && (
                        <span className="inline-flex items-center gap-1 text-[10px] italic text-[#435849] bg-emerald-50/60 px-1.5 py-0.5 rounded border border-emerald-100 truncate max-w-full">
                          ✉️ &ldquo;{item.addons.greetingCard.message}&rdquo;
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quantity Stepper & Price with In-Stock Check */}
                  {(() => {
                    const itemStock = item.product.stock !== undefined ? item.product.stock : 99;
                    const isOutOfStock = itemStock <= 0;
                    const isMaxStockReached = item.quantity >= itemStock;

                    return (
                      <div className="mt-2 space-y-1">
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-rose-600 block">
                            {locale === 'ar' ? 'نفدت الكمية من المخزون' : 'Out of stock'}
                          </span>
                        ) : itemStock <= 5 ? (
                          <span className="text-[10px] font-medium text-amber-700 block">
                            {locale === 'ar' ? `متبقي ${itemStock} قطع بالمخزون` : `Only ${itemStock} left in stock`}
                          </span>
                        ) : null}

                        <div className="flex items-center justify-between">
                          <div className={`inline-flex items-center h-7 rounded-lg bg-white border border-[#E2DAD0] shadow-2xs ${isUpdating ? 'opacity-70' : ''}`}>
                            <button
                              type="button"
                              disabled={isUpdating || item.quantity <= 1}
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.cartItemId)}
                              aria-label="Decrease quantity"
                              className="w-7 h-full flex items-center justify-center text-[#6B5E52] hover:text-[#1E1915] hover:bg-[#F5EFE6] transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer rounded-s-lg"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className="min-w-[26px] text-center text-xs font-bold text-[#1E1915] tabular-nums select-none px-0.5">
                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin text-[#435849] mx-auto" />
                              ) : (
                                item.quantity
                              )}
                            </span>

                            <button
                              type="button"
                              disabled={isUpdating || isOutOfStock || isMaxStockReached}
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.cartItemId)}
                              aria-label="Increase quantity"
                              className="w-7 h-full flex items-center justify-center text-[#6B5E52] hover:text-[#1E1915] hover:bg-[#F5EFE6] transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer rounded-e-lg"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div dir="ltr" className="text-[14px] sm:text-[15px] font-extrabold text-[#1E1915] tracking-tight">
                            {isUpdating ? (
                              <div className="h-4 w-16 bg-[#E8E2D8] rounded-md animate-pulse" />
                            ) : (
                              <PriceDisplay amount={item.itemTotal} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-[#FAF3ED] flex items-center justify-center text-[#435849] mb-5 shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-[#201B18] mb-1.5">
            {dict.cart.emptyTitle}
          </h4>
          <p className="text-xs text-[#5C524B] max-w-xs mb-6 leading-relaxed">
            {dict.cart.emptyDesc}
          </p>
          <Link href={catalogUrl} onClick={handleClose}>
            <button className="py-3 px-8 rounded-full bg-[#435849] hover:bg-[#334438] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer">
              <span>{dict.cart.continueShopping}</span>
            </button>
          </Link>
        </div>
      )}
    </Drawer>
  );
}
