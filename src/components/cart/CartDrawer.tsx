'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCartDrawerOpen } from '@/store/slices/uiSlice';
import {
  removeItem,
  updateQuantity,
  selectCartTotals,
} from '@/store/slices/cartSlice';
import { Drawer } from '@/components/ui/Drawer';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { formatPrice } from '@/lib/utils';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Plus, Minus } from 'lucide-react';

interface CartDrawerProps {
  locale: Locale;
}

export function CartDrawer({ locale }: CartDrawerProps) {
  const isOpen = useAppSelector((state) => state.ui.isCartDrawerOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const dict = getDictionary(locale);

  const { total } = useAppSelector(selectCartTotals);

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const checkoutUrl = locale === 'ar' ? '/checkout' : '/en/checkout';
  const catalogUrl = locale === 'ar' ? '/products' : '/en/products';

  const handleClose = () => dispatch(setCartDrawerOpen(false));

  const totalItemCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

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
        cartItems.length > 0 ? (
          <div className="space-y-4">
            {/* Total Row */}
            <div className="flex justify-between items-baseline text-base">
              <div>
                <span className="font-extrabold text-[#201B18] block">{dict.cart.total}</span>
                <span className="text-[10px] text-[#8C8075] block -mt-0.5">
                  {locale === 'ar' ? 'شامل الضريبة المضافة' : 'VAT Included'}
                </span>
              </div>
              <span dir="ltr" className="text-xl sm:text-2xl font-black text-[#435849] inline-flex items-center gap-1.5">
                <CurrencySymbol className="w-4 h-4" />
                <span>{total}</span>
              </span>
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
      {cartItems.length > 0 ? (
        <div className="space-y-3">
          {cartItems.map((item) => {
            const productUrl =
              locale === 'ar'
                ? `/product/${item.product.slug.ar}`
                : `/en/product/${item.product.slug.en}`;

            return (
              <div
                key={item.cartItemId}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFE8DE] hover:border-[#DDD3C4] transition-all duration-200 flex gap-3.5 items-center group"
              >
                {/* Thumbnail */}
                <Link
                  href={productUrl}
                  onClick={handleClose}
                  className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-white border border-[#EAE2D5] shadow-2xs"
                >
                  <Image
                    src={item.product.thumbnail}
                    alt={item.product.name[locale]}
                    fill
                    sizes="80px"
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
                      {item.product.name[locale]}
                    </Link>

                    <button
                      onClick={() => dispatch(removeItem(item.cartItemId))}
                      className="text-[#9E9285] hover:text-red-600 p-1 -mt-1 -me-1 rounded-full hover:bg-red-50/80 transition-colors cursor-pointer shrink-0"
                      title={locale === 'ar' ? 'حذف المنتج' : 'Remove item'}
                      aria-label={locale === 'ar' ? 'حذف المنتج' : 'Remove item'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

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

                  {/* Quantity Stepper & Price */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="inline-flex items-center h-7 rounded-lg bg-white border border-[#E2DAD0] shadow-2xs">
                      <button
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              cartItemId: item.cartItemId,
                              quantity: item.quantity - 1,
                            })
                          )
                        }
                        aria-label="Decrease quantity"
                        className="w-7 h-full flex items-center justify-center text-[#6B5E52] hover:text-[#1E1915] hover:bg-[#F5EFE6] transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer rounded-s-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="min-w-[26px] text-center text-xs font-bold text-[#1E1915] tabular-nums select-none px-0.5">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        disabled={item.quantity >= 99}
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              cartItemId: item.cartItemId,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        aria-label="Increase quantity"
                        className="w-7 h-full flex items-center justify-center text-[#6B5E52] hover:text-[#1E1915] hover:bg-[#F5EFE6] transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer rounded-e-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span dir="ltr" className="text-[14px] sm:text-[15px] font-extrabold text-[#1E1915] tracking-tight inline-flex items-center gap-1">
                      <CurrencySymbol className="w-3.5 h-3.5" />
                      <span>{item.itemTotal}</span>
                    </span>
                  </div>
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
