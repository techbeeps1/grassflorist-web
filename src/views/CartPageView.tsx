'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { QuantitySelector } from '@/components/common/QuantitySelector';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  removeItem,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  selectCartTotals,
  selectFreeShippingProgress,
} from '@/store/slices/cartSlice';
import { addToast } from '@/store/slices/uiSlice';
import { formatPrice } from '@/lib/utils';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { Trash2, ShoppingBag, Sparkles, Tag, ArrowRight, ArrowLeft } from 'lucide-react';

interface CartPageViewProps {
  locale: Locale;
}

export function CartPageView({ locale }: CartPageViewProps) {
  const dict = getDictionary(locale);
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const couponCode = useAppSelector((state) => state.cart.couponCode);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const { subtotal, discount, vat, shippingFee, total } = useAppSelector(selectCartTotals);
  const { remaining, percentage, isFree } = useAppSelector(selectFreeShippingProgress);

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const checkoutUrl = locale === 'ar' ? '/checkout' : '/en/checkout';
  const catalogUrl = locale === 'ar' ? '/products' : '/en/products';

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.cart.title },
  ];

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCodeInput.trim()) {
      dispatch(applyCoupon(promoCodeInput.trim()));
      dispatch(
        addToast({
          type: 'success',
          message:
            locale === 'ar'
              ? 'تم تطبيق كود الخصم بنجاح!'
              : 'Promo code applied successfully!',
        })
      );
      setPromoCodeInput('');
    }
  };

  return (
    <div className="py-6 bg-surface min-h-[80vh]">
      <div className="max-w-[1280px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        <div className="mb-8 text-start">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
            {dict.cart.title}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            {locale === 'ar'
              ? 'راجع باقاتك وتنسيقات الهدايا قبل الانتقال إلى مرحلة الدفع وتحديد موعد التوصيل.'
              : 'Review your floral arrangements before proceeding to checkout and delivery scheduling.'}
          </p>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Progress Indicator */}
              <div className="p-4 bg-secondary-light/60 rounded-2xl border border-secondary/30">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8C6D45] mb-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>
                    {isFree
                      ? dict.cart.freeShippingUnlocked
                      : dict.cart.freeShippingRemaining.replace('{amount}', remaining.toString())}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-surface rounded-2xl border border-border divide-y divide-border overflow-hidden shadow-xs">
                {cartItems.map((item) => {
                  const productUrl =
                    locale === 'ar'
                      ? `/product/${item.product.slug.ar}`
                      : `/en/product/${item.product.slug.en}`;

                  return (
                    <div
                      key={item.cartItemId}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between text-start"
                    >
                      <div className="flex items-center gap-4">
                        <Link
                          href={productUrl}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-surface-subtle shrink-0 border border-border"
                        >
                          <Image
                            src={item.product.thumbnail}
                            alt={item.product.name[locale]}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </Link>
                        <div>
                          <span className="text-[11px] text-text-muted block">
                            {item.product.category[locale]}
                          </span>
                          <Link
                            href={productUrl}
                            className="text-sm sm:text-base font-bold text-text-main hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.product.name[locale]}
                          </Link>

                          {/* Addon details */}
                          {item.addons?.vase && (
                            <p className="text-xs text-text-muted mt-0.5">
                              + {item.addons.vase.name} ({formatPrice(item.addons.vase.price, locale)})
                            </p>
                          )}
                          {item.addons?.chocolates && (
                            <p className="text-xs text-text-muted mt-0.5">
                              + {item.addons.chocolates.name} ({formatPrice(item.addons.chocolates.price, locale)})
                            </p>
                          )}
                          {item.addons?.greetingCard?.message && (
                            <p className="text-xs text-emerald-800 italic mt-0.5 line-clamp-1">
                              &ldquo;{item.addons.greetingCard.message}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                        <QuantitySelector
                          quantity={item.quantity}
                          onIncrease={() =>
                            dispatch(
                              updateQuantity({
                                cartItemId: item.cartItemId,
                                quantity: item.quantity + 1,
                              })
                            )
                          }
                          onDecrease={() =>
                            dispatch(
                              updateQuantity({
                                cartItemId: item.cartItemId,
                                quantity: item.quantity - 1,
                              })
                            )
                          }
                        />

                        <span dir="ltr" className="text-base font-extrabold text-primary min-w-[90px] text-end inline-flex items-center justify-end gap-1">
                          <CurrencySymbol className="w-3.5 h-3.5" />
                          <span>{item.itemTotal}</span>
                        </span>

                        <button
                          onClick={() => dispatch(removeItem(item.cartItemId))}
                          className="p-2 text-text-muted hover:text-error transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-36">
              <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs space-y-5 text-start">
                <h3 className="text-base font-bold text-text-main pb-3 border-b border-border">
                  {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h3>

                {/* Promo Code Input */}
                {couponCode ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span dir="ltr" className="inline-flex items-center gap-1">
                        <span>{couponCode} (-</span>
                        <CurrencySymbol className="w-3 h-3" />
                        <span>{discount})</span>
                      </span>
                    </div>
                    <button
                      onClick={() => dispatch(removeCoupon())}
                      className="text-text-muted hover:text-error text-xs font-bold underline cursor-pointer"
                    >
                      {dict.cart.remove}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder={dict.cart.promoCodePlaceholder}
                      className="flex-1 px-3 py-2 text-xs bg-surface-subtle border border-border rounded-xl focus:outline-none focus:border-primary uppercase"
                    />
                    <Button type="submit" variant="secondary" size="sm" className="font-bold shrink-0">
                      {dict.cart.apply}
                    </Button>
                  </form>
                )}

                {/* Subtotals & Total */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-text-muted">
                    <span>{dict.cart.subtotal}</span>
                    <span dir="ltr" className="inline-flex items-center gap-1 font-medium">
                      <CurrencySymbol className="w-3 h-3" />
                      <span>{subtotal}</span>
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>{dict.cart.discount} ({couponCode})</span>
                      <span dir="ltr" className="inline-flex items-center gap-1">
                        <span>-</span>
                        <CurrencySymbol className="w-3 h-3" />
                        <span>{discount}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-muted">
                    <span>{dict.cart.shipping}</span>
                    <span className={isFree ? 'text-emerald-600 font-bold' : ''}>
                      {isFree ? dict.cart.freeShipping : (
                        <span dir="ltr" className="inline-flex items-center gap-1">
                          <CurrencySymbol className="w-3 h-3" />
                          <span>{shippingFee}</span>
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>{dict.cart.vat}</span>
                    <span dir="ltr" className="inline-flex items-center gap-1">
                      <CurrencySymbol className="w-3 h-3" />
                      <span>{vat}</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-text-main pt-3 border-t border-border">
                    <span>{dict.cart.total}</span>
                    <span dir="ltr" className="text-primary inline-flex items-center gap-1.5">
                      <CurrencySymbol className="w-4 h-4" />
                      <span>{total}</span>
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link href={checkoutUrl} className="block w-full">
                  <Button variant="primary" size="lg" className="w-full font-bold text-sm shadow-md">
                    <span>{dict.cart.proceedToCheckout}</span>
                    <ArrowIcon className="w-4 h-4 ms-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center flex flex-col items-center justify-center p-6 bg-surface rounded-2xl border border-border">
            <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center text-primary mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-text-main mb-2">
              {dict.cart.emptyTitle}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
              {dict.cart.emptyDesc}
            </p>
            <Link href={catalogUrl}>
              <Button variant="primary" size="lg" className="font-bold">
                <span>{dict.cart.continueShopping}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
