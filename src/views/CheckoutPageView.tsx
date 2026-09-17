'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { type Locale, siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearCart, selectCartTotals } from '@/store/slices/cartSlice';
import { useCreateOrderMutation } from '@/store/api/ordersApi';
import { formatPrice } from '@/lib/utils';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { Order } from '@/types/order';
import {
  CheckCircle2,
  Calendar,
  Clock,
  CreditCard,
  Truck,
  Gift,
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface CheckoutPageViewProps {
  locale: Locale;
}

export function CheckoutPageView({ locale }: CheckoutPageViewProps) {
  const dict = getDictionary(locale);
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { subtotal, discount, vat, shippingFee, total } = useAppSelector(selectCartTotals);

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Form State
  const [recipientType, setRecipientType] = useState<'myself' | 'gift'>('gift');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [city, setCity] = useState(locale === 'ar' ? 'جدة' : 'Jeddah');
  const [district, setDistrict] = useState('');
  const [street, setStreet] = useState('');

  const [deliveryDate, setDeliveryDate] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');

  const [cardMessage, setCardMessage] = useState('');
  const [cardSender, setCardSender] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'apple_pay' | 'credit_card' | 'cod' | 'tabby'>('mada');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: dict.cart.title, href: locale === 'ar' ? '/cart' : '/en/cart' },
    { label: dict.checkout.title },
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!recipientName.trim()) errs.recipientName = dict.validation.required;
    if (!recipientPhone.trim()) errs.recipientPhone = dict.validation.required;
    if (!district.trim()) errs.district = dict.validation.required;
    if (!street.trim()) errs.street = dict.validation.required;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await createOrder({
        items: cartItems,
        recipient: {
          type: recipientType,
          name: recipientName,
          phone: recipientPhone,
          city,
          district,
          street,
        },
        delivery: {
          date: deliveryDate === 'today' ? 'Today' : deliveryDate === 'tomorrow' ? 'Tomorrow' : customDate,
          timeSlot,
        },
        giftCard: {
          message: cardMessage,
          senderName: cardSender,
          isAnonymous,
        },
        paymentMethod,
        subtotal,
        vat,
        shippingFee,
        discount,
        total,
      }).unwrap();

      setConfirmedOrder(result);
      dispatch(clearCart());
    } catch {
      // Error handling
    }
  };

  // If Order Confirmed Screen
  if (confirmedOrder) {
    return (
      <div className="py-16 bg-surface min-h-[80vh] flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
            {locale === 'ar' ? 'تم الدفع بنجاح' : 'PAYMENT SUCCESSFUL'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main mb-2">
            {dict.checkout.orderSuccessTitle}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
            {dict.checkout.orderSuccessDesc}
          </p>

          <div className="p-6 bg-surface-subtle border border-border rounded-2xl text-start space-y-3 mb-8">
            <div className="flex justify-between text-xs pb-3 border-b border-border">
              <span className="text-text-muted">{dict.checkout.orderNumber}:</span>
              <span className="font-mono font-bold text-text-main">{confirmedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">{dict.checkout.recipientName}:</span>
              <span className="font-semibold text-text-main">{confirmedOrder.recipient.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">{dict.checkout.deliveryCity}:</span>
              <span className="font-semibold text-text-main">
                {confirmedOrder.recipient.city} - {confirmedOrder.recipient.district}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">{dict.cart.total}:</span>
              <span dir="ltr" className="font-bold text-primary inline-flex items-center gap-1">
                <CurrencySymbol className="w-3.5 h-3.5" />
                <span>{confirmedOrder.total}</span>
              </span>
            </div>
          </div>

          <Link href={locale === 'ar' ? '/' : '/en'}>
            <Button variant="primary" size="lg" className="font-bold shadow-md">
              <span>{locale === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Return to Home'}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 bg-surface min-h-[80vh]">
      <div className="max-w-[1280px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        <div className="mb-8 text-start">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
            {dict.checkout.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{dict.footer.securePayments}</span>
          </div>
        </div>

        {cartItems.length > 0 ? (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Steps Form */}
            <div className="lg:col-span-8 space-y-6 text-start">
              {/* Step 1: Recipient Information */}
              <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs space-y-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span>{dict.checkout.step1}</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRecipientType('myself')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      recipientType === 'myself'
                        ? 'border-primary bg-primary-light/40 text-primary'
                        : 'border-border bg-surface text-text-muted hover:border-primary/40'
                    }`}
                  >
                    {dict.checkout.forMyself}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientType('gift')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      recipientType === 'gift'
                        ? 'border-primary bg-primary-light/40 text-primary'
                        : 'border-border bg-surface text-text-muted hover:border-primary/40'
                    }`}
                  >
                    {dict.checkout.asGift}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <Input
                    label={dict.checkout.recipientName}
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    error={errors.recipientName}
                  />
                  <Input
                    label={dict.checkout.recipientPhone}
                    required
                    placeholder="05XXXXXXXX"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    error={errors.recipientPhone}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                      {dict.checkout.deliveryCity}
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-11 px-3 text-xs bg-surface border border-border rounded-lg focus:border-primary focus:outline-none font-medium"
                    >
                      {siteConfig.locations.map((l) => (
                        <option key={l.id} value={l.name[locale]}>
                          {l.name[locale]}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10.5px] text-[#435849] font-medium mt-1 block">
                      {locale === 'ar' ? '• التوصيل متاح داخل مدينة جدة فقط' : '• Delivery exclusively within Jeddah'}
                    </span>
                  </div>
                  <Input
                    label={dict.checkout.deliveryDistrict}
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    error={errors.district}
                  />
                  <Input
                    label={dict.checkout.deliveryStreet}
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    error={errors.street}
                  />
                </div>
              </div>

              {/* Step 2: Delivery Date & Time Window */}
              <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs space-y-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{dict.checkout.step2}</span>
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { id: 'today', label: dict.checkout.today },
                      { id: 'tomorrow', label: dict.checkout.tomorrow },
                      { id: 'custom', label: dict.checkout.chooseDate },
                    ] as const
                  ).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDeliveryDate(d.id)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        deliveryDate === d.id
                          ? 'border-primary bg-primary-light/40 text-primary'
                          : 'border-border bg-surface text-text-muted hover:border-primary/40'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {deliveryDate === 'custom' && (
                  <input
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full h-11 px-3 text-xs bg-surface border border-border rounded-lg focus:border-primary"
                  />
                )}

                <div className="pt-2">
                  <label className="text-xs font-semibold text-text-secondary block mb-2">
                    {dict.checkout.timeSlot}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        { id: 'morning', label: dict.checkout.morningSlot },
                        { id: 'afternoon', label: dict.checkout.afternoonSlot },
                        { id: 'evening', label: dict.checkout.eveningSlot },
                      ] as const
                    ).map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setTimeSlot(slot.id)}
                        className={`p-3 rounded-xl text-start text-xs border transition-all cursor-pointer ${
                          timeSlot === slot.id
                            ? 'border-primary bg-primary-light/30 text-primary font-bold shadow-xs'
                            : 'border-border bg-surface text-text-secondary hover:border-primary/40'
                        }`}
                      >
                        <Clock className="w-4 h-4 mb-1 text-primary" />
                        <span>{slot.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Complimentary Gift Card Message */}
              <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs space-y-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <span>{dict.checkout.step3}</span>
                </h3>

                <textarea
                  rows={3}
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  placeholder={dict.product.cardMessagePlaceholder}
                  className="w-full p-3 text-xs bg-surface border border-border rounded-xl focus:outline-none focus:border-primary"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <input
                    type="text"
                    value={cardSender}
                    disabled={isAnonymous}
                    onChange={(e) => setCardSender(e.target.value)}
                    placeholder={dict.product.cardSenderPlaceholder}
                    className="w-full sm:flex-1 p-2.5 text-xs bg-surface border border-border rounded-lg disabled:opacity-50"
                  />
                  <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span>{dict.product.cardAnonymous}</span>
                  </label>
                </div>
              </div>

              {/* Step 4: Payment Method Selection */}
              <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs space-y-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span>{dict.checkout.step4}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    [
                      { id: 'mada', label: dict.checkout.mada },
                      { id: 'apple_pay', label: dict.checkout.applePay },
                      { id: 'credit_card', label: dict.checkout.creditCard },
                      { id: 'tabby', label: dict.checkout.tabby },
                      { id: 'cod', label: dict.checkout.cod },
                    ] as const
                  ).map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3.5 rounded-xl border text-start text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === pm.id
                          ? 'border-primary bg-primary-light/40 text-primary shadow-xs'
                          : 'border-border bg-surface text-text-main hover:border-primary/40'
                      }`}
                    >
                      <span>{pm.label}</span>
                      {paymentMethod === pm.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary Sticky Column */}
            <div className="lg:col-span-4 lg:sticky lg:top-36 space-y-6">
              <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs text-start space-y-4">
                <h3 className="text-base font-bold text-text-main pb-3 border-b border-border">
                  {locale === 'ar' ? 'ملخص الفاتورة' : 'Invoice Summary'}
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-text-muted">
                    <span>{dict.cart.subtotal}</span>
                    <span dir="ltr" className="inline-flex items-center gap-1 font-medium">
                      <CurrencySymbol className="w-3 h-3" />
                      <span>{subtotal}</span>
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>{dict.cart.discount}</span>
                      <span dir="ltr" className="inline-flex items-center gap-1">
                        <span>-</span>
                        <CurrencySymbol className="w-3 h-3" />
                        <span>{discount}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-muted">
                    <span>{dict.cart.shipping}</span>
                    <span className={shippingFee === 0 ? 'text-emerald-600 font-bold' : ''}>
                      {shippingFee === 0 ? dict.cart.freeShipping : (
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

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full font-bold text-sm shadow-md"
                >
                  <span>{dict.checkout.placeOrder}</span>
                  <ArrowIcon className="w-4 h-4 ms-2" />
                </Button>

                <p className="text-[11px] text-text-muted text-center leading-relaxed">
                  {locale === 'ar'
                    ? 'بإتمام الطلب، أنت توافق على الشروط والأحكام وسياسة التوصيل المبرد لبوتيك غراس فلوريست.'
                    : 'By placing order, you agree to Grass Florist terms of service and cold-chain policy.'}
                </p>
              </div>
            </div>
          </form>
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-lg font-bold text-text-main mb-4">
              {dict.cart.emptyTitle}
            </h3>
            <Link href={locale === 'ar' ? '/products' : '/en/products'}>
              <Button variant="primary" size="md">
                <span>{dict.cart.continueShopping}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
