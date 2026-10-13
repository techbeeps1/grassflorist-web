'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Locale } from '@/config/site';
import { useGetSubscriptionDealBySlugQuery } from '@/store/api/subscriptionApi';
import { useGetShippingMethodsQuery } from '@/store/api/checkoutApi';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';
import { useCurrency } from '@/hooks/useCurrency';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import {
  Calendar,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RotateCw,
  Gift,
} from 'lucide-react';

interface SubscriptionFrequencyConfigViewProps {
  slug: string;
  locale: Locale;
}

export function SubscriptionFrequencyConfigView({ slug, locale }: SubscriptionFrequencyConfigViewProps) {
  const isAr = locale === 'ar';
  const router = useRouter();

  const { data: response, isLoading } = useGetSubscriptionDealBySlugQuery({ slug, locale });
  const deal = response?.data;

  // Dynamic Shipping Methods and rates managed from Filament Admin
  const { data: shippingMethodsData } = useGetShippingMethodsQuery();
  const shippingMethods = useMemo(() => shippingMethodsData?.data || [], [shippingMethodsData]);
  const activeShippingMethod = useMemo(
    () => shippingMethods.find((m) => m.is_active) || shippingMethods[0],
    [shippingMethods]
  );

  // Dynamic Settings and currency conversion from Global Settings
  const { data: globalSettings } = useGetGlobalSettingsQuery();
  const { sarToUsdRate } = useCurrency(locale);
  const vatPercentage = Number(globalSettings?.tax?.vat_percentage ?? 15);
  const isVatIncluded = Boolean(globalSettings?.tax?.is_vat_included);

  // Selections
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [duration, setDuration] = useState<'1_month' | '3_months' | '6_months' | '12_months'>('12_months');

  // Dates
  const tomorrowObj = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const dayAfterTomorrowObj = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d;
  }, []);

  const formatDateLabel = (d: Date) => {
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = isAr ? dayNamesAr[d.getDay()] : dayNamesEn[d.getDay()];
    const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
    return `${dayName}, ${dateStr}`;
  };

  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];
  const dayAfterTomorrowStr = dayAfterTomorrowObj.toISOString().split('T')[0];

  const [dateSelectionMode, setDateSelectionMode] = useState<'tomorrow' | 'day_after' | 'custom'>('tomorrow');
  const [startDate, setStartDate] = useState(tomorrowStr);
  const [customDate, setCustomDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('Morning (09:00 AM - 01:00 PM)');
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Pricing calculations
  const discounts = deal?.duration_discounts || {
    '1_month': 0,
    '3_months': 10,
    '6_months': 15,
    '12_months': 20,
  };

  const basePrice = Number(deal?.original_price || deal?.starting_price || 210);

  // Delivery count multipliers based on duration and frequency
  const deliveryCount = useMemo(() => {
    const weeksMap: Record<string, number> = {
      '1_month': 4,
      '3_months': 12,
      '6_months': 24,
      '12_months': 48,
    };
    const totalWeeks = weeksMap[duration] || 48;
    if (frequency === 'weekly') return totalWeeks;
    if (frequency === 'biweekly') return Math.round(totalWeeks / 2);
    return Math.round(totalWeeks / 4);
  }, [duration, frequency]);

  const discountPercent = discounts[duration] ?? 0;
  const discountedPerDelivery = Math.round(basePrice * (1 - discountPercent / 100));
  const discountAmount = Math.max(0, basePrice - discountedPerDelivery);
  const planTotal = discountedPerDelivery * deliveryCount;

  // Dynamic Shipping Fee (Default 30 SAR matching admin and normal checkout)
  const shippingFee = Number(
    activeShippingMethod?.price ??
    shippingMethodsData?.default_shipping_fee ??
    globalSettings?.shipping?.inside_jeddah_fee ??
    30
  );

  // VAT Calculation (Matching Admin setting: isVatIncluded = false, percentage = 15%)
  const vat = isVatIncluded
    ? Number((discountedPerDelivery - discountedPerDelivery / (1 + vatPercentage / 100)).toFixed(2))
    : Number((discountedPerDelivery * (vatPercentage / 100)).toFixed(2));

  const totalPerDelivery = Number((isVatIncluded
    ? discountedPerDelivery + shippingFee
    : discountedPerDelivery + vat + shippingFee).toFixed(2));

  // USD conversions matching normal checkout
  const subtotalUsd = Number((basePrice * sarToUsdRate).toFixed(2));
  const discountUsd = Number((discountAmount * sarToUsdRate).toFixed(2));
  const shippingFeeUsd = Number((shippingFee * sarToUsdRate).toFixed(2));
  const vatUsd = Number((vat * sarToUsdRate).toFixed(2));
  const totalUsd = Number((totalPerDelivery * sarToUsdRate).toFixed(2));

  const displayName = isAr
    ? (deal?.name?.ar || deal?.localized_name || deal?.name?.en || 'باقة الموسم')
    : (deal?.name?.en || deal?.localized_name || deal?.name?.ar || 'Seasonal');

  const displayDescription = isAr
    ? (deal?.description?.ar || deal?.localized_description || deal?.description?.en || '')
    : (deal?.description?.en || deal?.localized_description || deal?.description?.ar || '');

  const breadcrumbs = [
    { label: isAr ? 'الرئيسية' : 'Home', href: isAr ? '/' : '/en' },
    {
      label: isAr ? 'الاشتراكات' : 'Subscriptions',
      href: isAr ? '/flowers-subscription-deals' : '/en/flowers-subscription-deals',
    },
    {
      label: displayName,
      href: isAr ? `/flowers-subscription-deals/${slug}` : `/en/flowers-subscription-deals/${slug}`,
    },
    { label: isAr ? 'جدول التكرار' : 'Frequency' },
  ];

  // Duration options list
  const durationOptions = [
    {
      key: '1_month' as const,
      label: isAr ? 'شهر واحد' : '1 Month',
      discount: discounts['1_month'] ?? 0,
    },
    {
      key: '3_months' as const,
      label: isAr ? '3 أشهر' : '3 Months',
      discount: discounts['3_months'] ?? 10,
    },
    {
      key: '6_months' as const,
      label: isAr ? '6 أشهر' : '6 Months',
      discount: discounts['6_months'] ?? 15,
    },
    {
      key: '12_months' as const,
      label: isAr ? '12 شهراً' : '12 Months',
      discount: discounts['12_months'] ?? 20,
    },
  ];

  // Frequency options list
  const frequencyOptions = [
    {
      key: 'weekly' as const,
      label: isAr ? 'كل أسبوع' : 'Every week',
    },
    {
      key: 'biweekly' as const,
      label: isAr ? 'كل أسبوعين' : 'Every two weeks',
    },
    {
      key: 'monthly' as const,
      label: isAr ? 'مرة بالشهر' : 'Once a month',
    },
  ];

  const handleProceedToPayment = () => {
    if (!deal) return;

    const chosenDate = dateSelectionMode === 'custom' ? (customDate || tomorrowStr) : startDate;

    const payload = {
      deal_id: deal.id,
      deal_slug: deal.slug,
      deal_name: deal.name,
      deal_image: deal.image,
      product_id: deal.product_id || deal.id,
      frequency,
      duration_type: duration,
      discount_percent: discountPercent,
      per_delivery_price: discountedPerDelivery,
      base_price: basePrice,
      total_deliveries: deliveryCount,
      plan_total: planTotal,
      shipping_fee: shippingFee,
      tax_amount: vat,
      total_per_delivery: totalPerDelivery,
      start_date: chosenDate,
      delivery_time_slot: deliveryTimeSlot,
      gift_message: giftMessage,
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('grass_direct_subscription', JSON.stringify(payload));
    }

    router.push(isAr ? '/subscribe-checkout' : '/en/subscribe-checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-10 h-10 border-4 border-[#2D3F33] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-[#FAF7F2] text-center">
        <h2 className="text-2xl font-bold mb-3">{isAr ? 'الباقة غير موجودة' : 'Plan Not Found'}</h2>
        <button
          onClick={() => router.push(isAr ? '/flowers-subscription-deals' : '/en/flowers-subscription-deals')}
          className="px-6 py-2.5 rounded-full bg-[#2D3F33] text-white font-bold"
        >
          {isAr ? 'العودة لباقات الاشتراكات' : 'Back to Subscriptions'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Breadcrumbs matching Screenshot */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbs} locale={locale} />
        </div>

        {/* Main Title matching Screenshot (e.g. Seasonal Subscription) */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-[#2D3F33] mb-8">
          {displayName} {isAr ? 'اشتراك' : 'Subscription'}
        </h1>

        {/* 2-Column Grid matching Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Section 1: Delivery Frequency */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-[#2D3F33] mb-4">
                {isAr ? 'تكرار التوصيل' : 'Delivery Frequency'}
              </h2>
              <div className="space-y-3">
                {frequencyOptions.map((opt) => {
                  const isSelected = frequency === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setFrequency(opt.key)}
                      className={`w-full p-4 rounded-xl border transition-all text-start flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#2D3F33] bg-white ring-1 ring-[#2D3F33]'
                          : 'border-[#E8DFD3] bg-white hover:border-[#2D3F33]/40'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#2D3F33]' : 'border-[#C8BCB0]'
                        }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#2D3F33]" />}
                      </div>
                      <span className="text-sm sm:text-base font-bold text-[#1E1915]">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Subscription Duration */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-[#2D3F33] mb-4">
                {isAr ? 'مدة خطة الاشتراك' : 'Subscription Duration'}
              </h2>
              <div className="space-y-3">
                {durationOptions.map((opt) => {
                  const isSelected = duration === opt.key;
                  const itemDiscount = opt.discount;
                  const itemPrice = Math.round(basePrice * (1 - itemDiscount / 100));

                  // Calculate total deliveries for subtitle
                  const weeksMap: Record<string, number> = {
                    '1_month': 4,
                    '3_months': 12,
                    '6_months': 24,
                    '12_months': 48,
                  };
                  const subTotalWeeks = weeksMap[opt.key] || 48;
                  const itemDeliveries = frequency === 'weekly'
                    ? subTotalWeeks
                    : frequency === 'biweekly'
                    ? Math.round(subTotalWeeks / 2)
                    : Math.round(subTotalWeeks / 4);
                  const itemPlanTotal = itemPrice * itemDeliveries;

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setDuration(opt.key)}
                      className={`w-full p-4 rounded-xl border transition-all text-start flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#2D3F33] bg-white ring-1 ring-[#2D3F33]'
                          : 'border-[#E8DFD3] bg-white hover:border-[#2D3F33]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#2D3F33]' : 'border-[#C8BCB0]'
                          }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#2D3F33]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-bold text-[#1E1915]">{opt.label}</span>
                            {itemDiscount > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#B35338] text-white">
                                {isAr ? `خصم ${itemDiscount}%` : `${itemDiscount}% Off`}
                              </span>
                            )}
                          </div>
                          {opt.key === '12_months' && (
                            <span className="text-[11px] text-[#7D7065] block mt-0.5">
                              {isAr
                                ? `${itemDeliveries} توصيلة إجمالاً - ${itemPlanTotal.toLocaleString()} ر.س`
                                : `${itemDeliveries} deliveries total - SAR ${itemPlanTotal.toLocaleString()}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        {itemDiscount > 0 && (
                          <span className="text-[11px] line-through text-[#A69B91] block">
                            SAR {basePrice}
                          </span>
                        )}
                        <span className="text-sm sm:text-base font-extrabold text-[#1E1915]">
                          SAR {itemPrice}
                        </span>
                        <span className="text-[10px] text-[#7D7065] block">
                          {isAr ? 'لكل توصيلة' : 'Per delivery'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Starting Date */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-[#2D3F33] mb-4">
                {isAr ? 'تاريخ التوصيلة الأولى' : 'Starting date'}
              </h2>
              <div className="space-y-3">
                {/* Tomorrow */}
                <button
                  type="button"
                  onClick={() => {
                    setDateSelectionMode('tomorrow');
                    setStartDate(tomorrowStr);
                  }}
                  className={`w-full p-4 rounded-xl border transition-all text-start flex items-center gap-3 cursor-pointer ${
                    dateSelectionMode === 'tomorrow'
                      ? 'border-[#2D3F33] bg-white ring-1 ring-[#2D3F33]'
                      : 'border-[#E8DFD3] bg-white hover:border-[#2D3F33]/40'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      dateSelectionMode === 'tomorrow' ? 'border-[#2D3F33]' : 'border-[#C8BCB0]'
                    }`}
                  >
                    {dateSelectionMode === 'tomorrow' && <div className="w-2.5 h-2.5 rounded-full bg-[#2D3F33]" />}
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#1E1915]">
                    {formatDateLabel(tomorrowObj)}
                  </span>
                </button>

                {/* Day after tomorrow */}
                <button
                  type="button"
                  onClick={() => {
                    setDateSelectionMode('day_after');
                    setStartDate(dayAfterTomorrowStr);
                  }}
                  className={`w-full p-4 rounded-xl border transition-all text-start flex items-center gap-3 cursor-pointer ${
                    dateSelectionMode === 'day_after'
                      ? 'border-[#2D3F33] bg-white ring-1 ring-[#2D3F33]'
                      : 'border-[#E8DFD3] bg-white hover:border-[#2D3F33]/40'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      dateSelectionMode === 'day_after' ? 'border-[#2D3F33]' : 'border-[#C8BCB0]'
                    }`}
                  >
                    {dateSelectionMode === 'day_after' && <div className="w-2.5 h-2.5 rounded-full bg-[#2D3F33]" />}
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#1E1915]">
                    {formatDateLabel(dayAfterTomorrowObj)}
                  </span>
                </button>

                {/* Select other date */}
                <div
                  onClick={() => setDateSelectionMode('custom')}
                  className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    dateSelectionMode === 'custom'
                      ? 'border-[#2D3F33] bg-white ring-1 ring-[#2D3F33]'
                      : 'border-[#E8DFD3] bg-white hover:border-[#2D3F33]/40'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        dateSelectionMode === 'custom' ? 'border-[#2D3F33]' : 'border-[#C8BCB0]'
                      }`}
                    >
                      {dateSelectionMode === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-[#2D3F33]" />}
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#1E1915]">
                      {isAr ? 'اختيار تاريخ آخر' : 'Select Other date'}
                    </span>
                  </div>

                  <div className="relative">
                    <Calendar className="w-5 h-5 text-[#2D3F33]" />
                    <input
                      type="date"
                      min={tomorrowStr}
                      value={customDate || startDate}
                      onChange={(e) => {
                        setDateSelectionMode('custom');
                        setCustomDate(e.target.value);
                        setStartDate(e.target.value);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                  </div>
                </div>

                {dateSelectionMode === 'custom' && customDate && (
                  <p className="text-xs text-[#2D3F33] font-bold px-2">
                    {isAr ? `التاريخ المختار: ${customDate}` : `Selected Date: ${customDate}`}
                  </p>
                )}

                {/* Info Callout */}
                <div className="flex items-start gap-2 pt-1 text-xs text-[#7D7065]">
                  <Info className="w-4 h-4 text-[#7D7065] shrink-0 mt-0.5" />
                  <span>
                    {isAr
                      ? 'سنختار أفضل وقت وموعد توصيل مناسب بناءً على منطقتك وتاريخ الاستلام.'
                      : "We'll choose the best delivery time based on your area and delivery date."}
                  </span>
                </div>
              </div>
            </div>

            {/* Gift Card Message / Notes (Optional) */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD3]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E1915] block mb-2">
                {isAr ? 'بطاقة إهداء أو ملاحظات التوصيل (اختياري):' : 'Gift Card Message or Delivery Notes (Optional):'}
              </label>
              <textarea
                rows={2}
                maxLength={150}
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder={
                  isAr
                    ? 'أضف عبارة جميلة سنطبعها مجاناً في كرت فاخر مع كل باقة...'
                    : 'Add a message we will print on a complimentary card with every delivery...'
                }
                className="w-full p-3 text-xs rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] focus:outline-none focus:border-[#2D3F33] resize-none"
              />
            </div>
          </div>

          {/* Right Column: Sticky Product Summary Card (5 cols) matching Screenshot */}
          <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-6">
            <div className="rounded-3xl bg-white border border-[#E8DFD3] shadow-md overflow-hidden">
              {/* Product Image */}
              <div className="relative aspect-4/3 w-full bg-[#FAF7F2] overflow-hidden">
                <Image
                  src={deal.image || '/images/placeholder.jpg'}
                  alt={displayName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-xl sm:text-2xl font-black font-serif text-[#2D3F33] mb-2">
                  {displayName}
                </h3>

                {displayDescription && (
                  <p className="text-xs sm:text-sm text-[#5C524B] leading-relaxed mb-4">
                    {displayDescription}
                  </p>
                )}

                {/* More Details Collapsible */}
                {deal.features && deal.features.length > 0 && (
                  <div className="border-t border-[#F2ECE1] pt-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                      className="w-full flex items-center justify-between text-xs font-bold text-[#2D3F33] py-1"
                    >
                      <span>{isAr ? 'محتويات ومزايا الباقة' : 'More Details'}</span>
                      {isDetailsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isDetailsExpanded && (
                      <ul className="mt-2 space-y-1.5 text-xs text-[#5C524B] list-disc list-inside">
                        {deal.features.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Summary Section matching Normal Checkout */}
                <div className="border-t border-[#E8DFD3] pt-4 space-y-3">
                  <h4 className="text-base sm:text-lg font-bold font-serif text-[#1E1915]">
                    {isAr ? 'الملخص' : 'Summary'}
                  </h4>
                  <p className="text-xs text-[#7D7065]">
                    {isAr ? 'تفاصيل دفع التوصيلة الأولى' : 'First delivery payment details'}
                  </p>

                  <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center">
                      <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <div dir="ltr" className="text-end">
                        <span className="font-semibold text-gray-900 flex items-center justify-end gap-1">
                          <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                          <span>{basePrice} SAR</span>
                        </span>
                        <span className="text-[10.5px] text-gray-500 block">
                          ${subtotalUsd} USD
                        </span>
                      </div>
                    </div>

                    {/* Discount */}
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 font-bold">
                        <span>{isAr ? 'خصم الاشتراك' : 'Subscription Discount'}</span>
                        <div dir="ltr" className="text-end">
                          <span className="flex items-center justify-end gap-1">
                            <span>-</span>
                            <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                            <span>{discountAmount} SAR</span>
                          </span>
                          <span className="text-[10.5px] text-emerald-500 font-normal block">
                            -${discountUsd} USD
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Shipping Method */}
                    <div className="flex justify-between items-center">
                      <span>
                        {activeShippingMethod
                          ? (isAr
                            ? (activeShippingMethod.name_ar || activeShippingMethod.name)
                            : (activeShippingMethod.name_en || activeShippingMethod.name))
                          : (isAr ? 'التوصيل داخل جدة' : 'Delivery Inside Jeddah')}
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {shippingFee === 0 ? (
                          isAr ? 'توصيل مجاني' : 'Free Delivery'
                        ) : (
                          <div dir="ltr" className="text-end">
                            <span className="flex items-center justify-end gap-1 text-gray-900">
                              <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                              <span>{shippingFee} SAR</span>
                            </span>
                            <span className="text-[10.5px] text-gray-500 font-normal block">
                              ${shippingFeeUsd} USD
                            </span>
                          </div>
                        )}
                      </span>
                    </div>

                    {/* VAT */}
                    <div className="flex justify-between items-center">
                      <span>
                        {isAr
                          ? `ضريبة القيمة المضافة (${vatPercentage}%)${isVatIncluded ? ' (مشمولة بالأسعار)' : ''}`
                          : `Saudi Arabia VAT (${vatPercentage}%)${isVatIncluded ? ' (Included in prices)' : ''}`}
                      </span>
                      <div dir="ltr" className="text-end">
                        <span className="font-semibold text-gray-900 flex items-center justify-end gap-1">
                          <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                          <span>{Number(vat).toFixed(2)} SAR</span>
                        </span>
                        <span className="text-[10.5px] text-gray-500 block">
                          ${vatUsd} USD
                        </span>
                      </div>
                    </div>

                    {/* Grand Total SAR and USD */}
                    <div className="pt-3 border-t border-gray-200 space-y-1.5">
                      <div className="flex justify-between items-baseline text-base font-black text-gray-900">
                        <span>{isAr ? 'المجموع' : 'Total'} (SAR)</span>
                        <span dir="ltr" className="text-[#8fae2a] flex items-center gap-1 text-lg">
                          <CurrencySymbol className="w-4 h-4" forcedCurrency="SAR" />
                          <span>{Number(totalPerDelivery).toFixed(2)} SAR</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline text-xs font-bold text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span>{isAr ? 'المجموع المقابل بالدولار الأمريكي:' : 'Equivalent in US Dollar:'}</span>
                        <span dir="ltr" className="text-[#a2c03e] font-extrabold text-sm">
                          ${totalUsd} USD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Proceed to Payment Button */}
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="w-full mt-4 py-3.5 px-6 rounded-xl bg-[#2D3F33] hover:bg-[#1E2922] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isAr ? 'المتابعة إلى الدفع' : 'Proceed To Payment'}</span>
                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Guarantees Box */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8DFD3] text-center text-xs text-[#7D7065] flex items-center justify-around">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#8fae2a]" />
                <span>{isAr ? 'توصيل مجدول ومنتظم' : 'Scheduled Delivery'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#8fae2a]" />
                <span>{isAr ? 'مزهرية مجانية' : 'Free Vase'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <RotateCw className="w-4 h-4 text-[#8fae2a]" />
                <span>{isAr ? 'إلغاء بأي وقت' : 'Cancel Anytime'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
