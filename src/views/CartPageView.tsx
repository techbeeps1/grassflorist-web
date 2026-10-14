'use client';

import React, { useState, useEffect } from 'react';
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
  setAppliedCoupon,
  removeCoupon,
} from '@/store/slices/cartSlice';
import {
  useApplyServerCouponMutation,
  getLocalizedProductName,
} from '@/store/api/cartApi';
import { useCartActions } from '@/hooks/useCartActions';
import { useCartDynamicTotals } from '@/hooks/useCartDynamicTotals';
import { addToast } from '@/store/slices/uiSlice';
import { formatPrice } from '@/lib/utils';
import { formatStorageUrl } from '@/lib/wordpress/store-api';
import { CurrencySymbol, PriceDisplay } from '@/components/common/CurrencySymbol';
import { CartPageItemSkeleton } from '@/components/ui/Skeleton';
import { CartPageSkeleton } from '@/components/cart/CartPageSkeleton';
import { Trash2, ShoppingBag, Tag, ArrowRight, ArrowLeft, Loader2, RotateCw } from 'lucide-react';

interface CartPageViewProps {
  locale: Locale;
}

export function CartPageView({ locale }: CartPageViewProps) {
  const dict = getDictionary(locale);
  const dispatch = useAppDispatch();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const cartItems = useAppSelector((state) => state.cart.items);
  const couponCode = useAppSelector((state) => state.cart.couponCode);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const {
    subtotal,
    discount,
    shippingFee,
    isFreeShipping,
    vat,
    total,
    shippingLabel,
    vatLabel,
  } = useCartDynamicTotals(locale);

  const { updateQuantity, removeItem, pendingAddItem, updatingItemIds, removingItemIds } = useCartActions();
  const [applyServerCoupon] = useApplyServerCouponMutation();

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const checkoutUrl = locale === 'ar' ? '/checkout' : '/en/checkout';
  const catalogUrl = locale === 'ar' ? '/products' : '/en/products';
  const hasItemsOrPending = cartItems.length > 0 || Boolean(pendingAddItem);

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.cart.title },
  ];

  if (!hasMounted) {
    return <CartPageSkeleton locale={locale} />;
  }

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCodeInput.trim();
    if (!code) return;
    try {
      const res = await applyServerCoupon({ code, subtotal }).unwrap();
      dispatch(
        setAppliedCoupon({
          code: res.code || code,
          type: res.type,
          value: Number(res.value),
          maxDiscountAmount: Number(res.max_discount_amount || 0),
        })
      );
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
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          message:
            err?.data?.message ||
            (locale === 'ar'
              ? 'رمز القسيمة غير صالح أو منتهي الصلاحية'
              : 'Invalid or expired coupon code'),
        })
      );
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
          <p className="text-sm sm:text-base text-text-muted mt-1">
            {locale === 'ar'
              ? 'راجع باقاتك وتنسيقات الهدايا قبل الانتقال إلى مرحلة الدفع وتحديد موعد التوصيل.'
              : 'Review your floral arrangements before proceeding to checkout and delivery scheduling.'}
          </p>
        </div>

        {hasItemsOrPending ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Items Card List */}
              <div className="bg-surface rounded-2xl border border-border divide-y divide-border overflow-hidden shadow-xs">
                {/* 🌟 1. Skeleton Loading for newly added item while API responds */}
                {pendingAddItem && (
                  <div className="relative">
                    <div className="absolute top-4 end-4 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-xs">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{locale === 'ar' ? 'جارٍ الإضافة إلى السلة...' : 'Adding to cart...'}</span>
                      </span>
                    </div>
                    <CartPageItemSkeleton
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
                        className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between text-start opacity-60 bg-surface-subtle/50 animate-pulse select-none"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#E8E2D8] shrink-0" />
                          <div className="space-y-2">
                            <span className="text-sm sm:text-base font-bold text-text-muted line-through">
                              {getLocalizedProductName(item.product.name, locale)}
                            </span>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 text-xs font-bold">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>{locale === 'ar' ? 'جارٍ حذف المنتج من السلة...' : 'Removing item from cart...'}</span>
                            </div>
                          </div>
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
                      className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between text-start transition-colors ${isUpdating ? 'bg-primary/5' : ''
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <Link
                          href={productUrl}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-surface-subtle shrink-0 border border-border"
                        >
                          <Image
                            src={formatStorageUrl(item.product.thumbnail)}
                            alt={getLocalizedProductName(item.product.name, locale)}
                            fill
                            sizes="96px"
                            unoptimized
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
                            {getLocalizedProductName(item.product.name, locale)}
                          </Link>

                          {/* ⚡ Subscription Badge */}
                          {item.isSubscription && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#435849] bg-[#EBF3E8] px-2 py-0.5 rounded-md mt-1 w-fit">
                              <RotateCw className="w-3 h-3 text-[#546e3a]" />
                              <span>{locale === 'ar' ? 'اشتراك' : 'Subscription'}</span>
                            </span>
                          )}

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

                      <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                        {(() => {
                          const itemStock = item.product.stock !== undefined ? item.product.stock : 99;
                          const isOutOfStock = itemStock <= 0;

                          return (
                            <>
                              <div className="flex items-center justify-between sm:justify-end gap-6 w-full">
                                <QuantitySelector
                                  quantity={item.quantity}
                                  max={Math.max(1, itemStock)}
                                  disabled={isOutOfStock || isUpdating}
                                  onIncrease={() => updateQuantity(item.productId, item.quantity + 1, item.cartItemId)}
                                  onDecrease={() => updateQuantity(item.productId, item.quantity - 1, item.cartItemId)}
                                />

                                <div dir="ltr" className="text-base font-extrabold text-primary min-w-[90px] text-end">
                                  {isUpdating ? (
                                    <div className="h-5 w-20 bg-[#E8E2D8] rounded-md animate-pulse ms-auto" />
                                  ) : (
                                    <PriceDisplay amount={item.itemTotal} />
                                  )}
                                </div>

                                <button
                                  disabled={isUpdating}
                                  onClick={() => removeItem(item.productId, item.cartItemId)}
                                  className="p-2 text-text-muted hover:text-error transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {isOutOfStock ? (
                                <span className="text-[11px] font-bold text-rose-600 block">
                                  {locale === 'ar' ? 'نفدت الكمية من المخزون' : 'Out of stock'}
                                </span>
                              ) : itemStock <= 5 ? (
                                <span className="text-[11px] font-medium text-amber-700 block">
                                  {locale === 'ar' ? `متبقي ${itemStock} قطع بالمخزون` : `Only ${itemStock} left in stock`}
                                </span>
                              ) : null}
                            </>
                          );
                        })()}
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
                    <PriceDisplay amount={subtotal} />
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>{dict.cart.discount} ({couponCode})</span>
                      <span dir="ltr" className="inline-flex items-center gap-1">
                        <span>-</span>
                        <PriceDisplay amount={discount} />
                      </span>
                    </div>
                  )}
                  {/* Dynamic Shipping Row from Admin Config */}
                  <div className="flex justify-between items-center text-text-muted">
                    <span>{shippingLabel}</span>
                    <span className={isFreeShipping ? 'text-emerald-600 font-bold' : ''}>
                      {isFreeShipping ? (
                        locale === 'ar' ? 'توصيل مجاني' : 'Free Delivery'
                      ) : (
                        <PriceDisplay amount={shippingFee} />
                      )}
                    </span>
                  </div>

                  {/* Dynamic VAT Row from Admin Config */}
                  <div className="flex justify-between items-center text-text-muted">
                    <span>{vatLabel}</span>
                    <PriceDisplay amount={vat} />
                  </div>

                  {/* Total Amount */}
                  <div className="flex justify-between items-center text-lg font-black text-text-main pt-3 border-t border-border">
                    <span>{dict.cart.total}</span>
                    <div dir="ltr" className="text-primary font-black">
                      <PriceDisplay amount={total} />
                    </div>
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
            <p className="text-sm sm:text-base text-text-muted max-w-sm mb-6 leading-relaxed">
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
