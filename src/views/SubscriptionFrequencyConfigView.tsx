'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { type Locale } from '@/config/site';
import { useGetSubscriptionDealBySlugQuery } from '@/store/api/subscriptionApi';
import { useGetShippingMethodsQuery } from '@/store/api/checkoutApi';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';
import { useCurrency } from '@/hooks/useCurrency';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { SubscriptionFrequencySkeleton } from '@/components/subscription/SubscriptionFrequencySkeleton';
import {
  Calendar,
  Info,
  ArrowRight,
  ArrowLeft,
  Gift,
  ShieldCheck,
  RotateCw,
  Tag,
  ChevronLeft,
  ChevronRight,
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
  const isShippingReady = Boolean(shippingMethodsData);
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
  const [giftMessage, setGiftMessage] = useState('');
  const [senderNameOnCard, setSenderNameOnCard] = useState('');

  // Custom calendar picker state (matching checkout DeliveryDatePicker design)
  const [isCustomCalendarOpen, setIsCustomCalendarOpen] = useState(false);
  const customCalendarRef = useRef<HTMLDivElement>(null);

  const selectedDateObj = useMemo(() => {
    try {
      const dateVal = customDate || startDate || tomorrowStr;
      const [y, m, d] = dateVal.split('-').map(Number);
      return new Date(y, m - 1, d);
    } catch {
      return tomorrowObj;
    }
  }, [customDate, startDate, tomorrowStr, tomorrowObj]);

  const [viewYear, setViewYear] = useState(() => tomorrowObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => tomorrowObj.getMonth());

  useEffect(() => {
    if (isCustomCalendarOpen) {
      setViewYear(selectedDateObj.getFullYear());
      setViewMonth(selectedDateObj.getMonth());
    }
  }, [isCustomCalendarOpen, selectedDateObj]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customCalendarRef.current && !customCalendarRef.current.contains(e.target as Node)) {
        setIsCustomCalendarOpen(false);
      }
    };
    if (isCustomCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCustomCalendarOpen]);

  const isPrevMonthDisabled = useMemo(() => {
    const minYear = tomorrowObj.getFullYear();
    const minM = tomorrowObj.getMonth();
    return viewYear < minYear || (viewYear === minYear && viewMonth <= minM);
  }, [viewYear, viewMonth, tomorrowObj]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPrevMonthDisabled) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  const startDayOfWeek = useMemo(() => {
    const day = new Date(viewYear, viewMonth, 1).getDay();
    return (day + 6) % 7; // Monday = 0, Sunday = 6
  }, [viewYear, viewMonth]);

  const monthTitle = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'long',
      year: 'numeric',
    }).format(d);
  }, [viewYear, viewMonth, locale]);

  const weekDayLabels = useMemo(() => {
    if (locale === 'ar') {
      return ['إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد'];
    }
    return ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  }, [locale]);

  const handleSelectCustomDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${mm}-${dd}`;
    setCustomDate(dateStr);
    setStartDate(dateStr);
    setDateSelectionMode('custom');
    setIsCustomCalendarOpen(false);
  };

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
      sender_name_on_card: senderNameOnCard,
      gift_message: giftMessage,
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('grass_direct_subscription', JSON.stringify(payload));
    }

    router.push(isAr ? '/subscribe-checkout' : '/en/subscribe-checkout');
  };

  if (isLoading) {
    return <SubscriptionFrequencySkeleton locale={locale} />;
  }

  if (!deal) {
    notFound();
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {frequencyOptions.map((opt) => {
                  const isSelected = frequency === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setFrequency(opt.key)}
                      className={`w-full p-3.5 sm:p-4 rounded-xl border transition-all text-start flex items-center gap-2.5 sm:gap-3 cursor-pointer ${
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
                      <span className="text-xs sm:text-sm font-bold text-[#1E1915] whitespace-nowrap">{opt.label}</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {durationOptions.map((opt) => {
                  const isSelected = duration === opt.key;
                  const itemDiscount = opt.discount;
                  const itemPrice = Math.round(basePrice * (1 - itemDiscount / 100));

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setDuration(opt.key)}
                      className={`w-full p-3.5 sm:p-4 rounded-xl border transition-all text-start flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#2D3F33] bg-white ring-1 ring-[#2D3F33]'
                          : 'border-[#E8DFD3] bg-white hover:border-[#2D3F33]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#2D3F33]' : 'border-[#C8BCB0]'
                          }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#2D3F33]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-[#1E1915] whitespace-nowrap">{opt.label}</span>
                            {itemDiscount > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#B35338] text-white whitespace-nowrap">
                                {isAr ? `خصم ${itemDiscount}%` : `${itemDiscount}% Off`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-end shrink-0 pl-2 rtl:pl-0 rtl:pr-2">
                        {itemDiscount > 0 && (
                          <span className="text-[10px] sm:text-[11px] line-through text-[#A69B91] block">
                            SAR {basePrice}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-extrabold text-[#1E1915]">
                          SAR {itemPrice}
                        </span>
                        <span className="text-[9.5px] sm:text-[10px] text-[#7D7065] block">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Tomorrow */}
                <button
                  type="button"
                  onClick={() => {
                    setDateSelectionMode('tomorrow');
                    setStartDate(tomorrowStr);
                    setIsCustomCalendarOpen(false);
                  }}
                  className={`w-full p-3.5 sm:p-4 rounded-xl border transition-all text-start flex items-center gap-2.5 sm:gap-3 cursor-pointer ${
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
                  <span className="text-xs sm:text-sm font-bold text-[#1E1915] whitespace-nowrap">
                    {formatDateLabel(tomorrowObj)}
                  </span>
                </button>

                {/* Day after tomorrow */}
                <button
                  type="button"
                  onClick={() => {
                    setDateSelectionMode('day_after');
                    setStartDate(dayAfterTomorrowStr);
                    setIsCustomCalendarOpen(false);
                  }}
                  className={`w-full p-3.5 sm:p-4 rounded-xl border transition-all text-start flex items-center gap-2.5 sm:gap-3 cursor-pointer ${
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
                  <span className="text-xs sm:text-sm font-bold text-[#1E1915] whitespace-nowrap">
                    {formatDateLabel(dayAfterTomorrowObj)}
                  </span>
                </button>

                {/* Select other date - Full Clickable Item with Custom Dropdown Calendar */}
                <div ref={customCalendarRef} className="relative w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setDateSelectionMode('custom');
                      setIsCustomCalendarOpen((prev) => !prev);
                    }}
                    className={`w-full p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer text-start ${
                      dateSelectionMode === 'custom'
                        ? 'border-[#2D3F33] bg-white ring-1 ring-[#2D3F33]'
                        : 'border-[#E8DFD3] bg-white hover:border-[#2D3F33]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          dateSelectionMode === 'custom' ? 'border-[#2D3F33]' : 'border-[#C8BCB0]'
                        }`}
                      >
                        {dateSelectionMode === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-[#2D3F33]" />}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#1E1915] whitespace-nowrap truncate">
                        {dateSelectionMode === 'custom' && customDate
                          ? formatDateLabel(new Date(customDate + 'T00:00:00'))
                          : (isAr ? 'اختيار تاريخ آخر' : 'Select Other date')}
                      </span>
                    </div>

                    <div className="shrink-0 text-[#2D3F33] ps-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#2D3F33]" />
                    </div>
                  </button>

                  {/* Styled Dropdown Calendar Popover matching DeliveryDatePicker */}
                  {isCustomCalendarOpen && (
                    <div className="absolute top-full start-0 sm:start-auto sm:end-0 mt-2 w-[310px] sm:w-[320px] max-w-[calc(100vw-32px)] bg-white border border-gray-200/90 rounded-2xl shadow-2xl z-50 p-3.5 animate-in fade-in zoom-in-95 duration-150">
                      {/* Calendar Header with Navigation */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <button
                          type="button"
                          disabled={isPrevMonthDisabled}
                          onClick={handlePrevMonth}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isPrevMonthDisabled
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer'
                          }`}
                          title={isAr ? 'الشهر السابق' : 'Previous Month'}
                        >
                          {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>

                        <span className="text-xs sm:text-sm font-black text-gray-800 capitalize tracking-tight">
                          {monthTitle}
                        </span>

                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                          title={isAr ? 'الشهر التالي' : 'Next Month'}
                        >
                          {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 gap-1 text-center pt-2.5 pb-1">
                        {weekDayLabels.map((lbl, idx) => (
                          <span key={idx} className="text-[10.5px] font-bold text-gray-400 py-0.5">
                            {lbl}
                          </span>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center py-1">
                        {/* Empty slots for start offset */}
                        {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                          <div key={`empty-${idx}`} className="h-8 sm:h-9 w-full" />
                        ))}

                        {/* Actual Days of viewMonth */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                          const day = idx + 1;
                          const cellDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                          // Disable past dates before tomorrowStr
                          const isPast = cellDateStr < tomorrowStr;
                          const isSelected = (customDate || startDate) === cellDateStr && dateSelectionMode === 'custom';
                          const isEarliest = cellDateStr === tomorrowStr;

                          return (
                            <button
                              key={`day-${day}`}
                              type="button"
                              disabled={isPast}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCustomDay(day);
                              }}
                              className={`h-8 sm:h-9 w-full rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer relative ${
                                isPast
                                  ? 'text-gray-300 opacity-40 cursor-not-allowed hover:bg-transparent'
                                  : isSelected
                                  ? 'bg-[#8fae2a] text-white font-black shadow-xs scale-102 ring-2 ring-[#8fae2a]/30'
                                  : isEarliest
                                  ? 'bg-[#8fae2a]/15 text-[#546e3a] font-bold hover:bg-[#8fae2a]/25'
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium'
                              }`}
                            >
                              <span>{day}</span>
                              {isEarliest && !isSelected && (
                                <span className="w-1 h-1 rounded-full bg-[#8fae2a] absolute bottom-1 inset-x-0 mx-auto" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Bottom Actions */}
                      <div className="pt-2.5 mt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomDate(tomorrowStr);
                            setStartDate(tomorrowStr);
                            setDateSelectionMode('custom');
                            setIsCustomCalendarOpen(false);
                          }}
                          className="text-[#546e3a] hover:text-[#8fae2a] font-bold py-1 px-2 rounded-lg hover:bg-[#8fae2a]/10 transition-colors cursor-pointer"
                        >
                          {isAr ? 'أقرب موعد' : 'Earliest Date'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCustomCalendarOpen(false);
                          }}
                          className="text-gray-500 hover:text-gray-800 font-medium py-1 px-2.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          {isAr ? 'إغلاق' : 'Close'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Callout */}
              <div className="flex items-start gap-2 pt-3 text-xs text-[#7D7065]">
                <Info className="w-4 h-4 text-[#7D7065] shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'سنختار أفضل وقت وموعد توصيل مناسب بناءً على منطقتك وتاريخ الاستلام.'
                    : "We'll choose the best delivery time based on your area and delivery date."}
                </span>
              </div>
            </div>

            {/* ---------------- GIFT CARD & DEDICATION ---------------- */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-gray-900 uppercase flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#8fae2a]" />
                  <span>{isAr ? 'كرت الإهداء والرسالة' : 'GIFT CARD & DEDICATION'}</span>
                </h2>
                <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">
                  {isAr ? 'اختياري' : 'Optional'}
                </span>
              </div>

              <div className="space-y-4">
                {/* Sender Name on the Gift Card */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    {isAr ? 'اسم المرسل على كرت الإهداء (اختياري)' : 'Sender name on the gift card (optional)'}
                  </label>
                  <input
                    type="text"
                    value={senderNameOnCard}
                    onChange={(e) => setSenderNameOnCard(e.target.value)}
                    placeholder={isAr ? 'اتركه فارغاً للإرسال كمجهول' : 'Leave empty for anonymous'}
                    className="w-full h-11 px-3.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#8fae2a]"
                  />
                </div>

                {/* Gift Message */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    {isAr ? 'رسالة الهدية (اختياري)' : 'Gift message (optional)'}
                  </label>
                  <textarea
                    rows={3}
                    maxLength={250}
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder={
                      isAr
                        ? 'اكتب رسالتك الجميلة هنا...'
                        : 'Write your heartfelt message here...'
                    }
                    className="w-full p-3.5 text-xs bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#8fae2a] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Product Summary Card (5 cols) matching Screenshot */}
          <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-4">
            <div className="rounded-3xl bg-white border border-[#E8DFD3] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden transition-all">
              {/* Product Image with Floating Badge */}
              <div className="relative aspect-4/3 w-full bg-[#FAF7F2] overflow-hidden">
                <Image
                  src={deal.image || '/images/placeholder.jpg'}
                  alt={displayName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute top-3.5 start-3.5 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-white/60 text-[11px] font-bold text-[#2D3F33]">
                  <span>{isAr ? 'اشتراك زهور دوري' : 'Flower Subscription'}</span>
                </div>
              </div>

              {/* Product Info & Summary */}
              <div className="p-6">
                {/* Plan Title */}
                <h3 className="text-xl sm:text-2xl font-black font-serif text-[#1E1915] leading-tight mb-3">
                  {displayName}
                </h3>

                {displayDescription && (
                  <p className="text-xs text-[#6B5E52] leading-relaxed mb-4 line-clamp-2">
                    {displayDescription}
                  </p>
                )}

                {/* Summary Section matching Normal Checkout */}
                <div className="border-t border-[#F2ECE1] pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold text-[#1E1915]">
                        {isAr ? 'ملخص الحساب' : 'Summary'}
                      </h4>
                      <p className="text-[11px] text-[#7D7065]">
                        {isAr ? 'تفاصيل دفع التوصيلة الأولى' : 'First delivery payment details'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3E8] text-[#435849]">
                      {isAr ? 'لكل دورة' : 'Per cycle'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <div dir="ltr" className="text-end">
                        <span className="font-bold text-gray-900 flex items-center justify-end gap-1">
                          <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                          <span>{basePrice} SAR</span>
                        </span>
                        <span className="text-[10.5px] text-gray-400 block font-normal">
                          ${subtotalUsd} USD
                        </span>
                      </div>
                    </div>

                    {/* Discount */}
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{isAr ? 'خصم الاشتراك' : 'Subscription Discount'}</span>
                        </span>
                        <div dir="ltr" className="text-end">
                          <span className="flex items-center justify-end gap-1 font-bold">
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
                    {isShippingReady && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">
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
                              <span className="flex items-center justify-end gap-1 text-gray-900 font-bold">
                                <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                                <span>{shippingFee} SAR</span>
                              </span>
                              <span className="text-[10.5px] text-gray-400 font-normal block">
                                ${shippingFeeUsd} USD
                              </span>
                            </div>
                          )}
                        </span>
                      </div>
                    )}

                    {/* VAT */}
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        {isAr
                          ? `ضريبة القيمة المضافة (${vatPercentage}%)${isVatIncluded ? ' (مشمولة)' : ''}`
                          : `Saudi Arabia VAT (${vatPercentage}%)${isVatIncluded ? ' (Included)' : ''}`}
                      </span>
                      <div dir="ltr" className="text-end">
                        <span className="font-bold text-gray-900 flex items-center justify-end gap-1">
                          <CurrencySymbol className="w-3 h-3" forcedCurrency="SAR" />
                          <span>{Number(vat).toFixed(2)} SAR</span>
                        </span>
                        <span className="text-[10.5px] text-gray-400 font-normal block">
                          ${vatUsd} USD
                        </span>
                      </div>
                    </div>

                    {/* Grand Total SAR and USD Highlight Box */}
                    <div className="mt-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-xs font-bold text-[#7D7065] uppercase tracking-wider block">
                            {isAr ? 'الإجمالي (SAR)' : 'Total (SAR)'}
                          </span>
                          <span className="text-[10px] text-[#A69B91]">
                            {isAr ? 'شامل الضريبة والتوصيل' : 'Incl. VAT & Delivery'}
                          </span>
                        </div>
                        <div dir="ltr" className="text-end">
                          <span className="text-xl sm:text-2xl font-black text-[#2D3F33] flex items-center justify-end gap-1">
                            <CurrencySymbol className="w-4 h-4 text-[#8fae2a]" forcedCurrency="SAR" />
                            <span>{Number(totalPerDelivery).toFixed(2)}</span>
                            <span className="text-xs font-bold text-[#7D7065] ms-0.5">SAR</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E8DFD3]/70 flex justify-between items-center text-xs">
                        <span className="text-[11px] font-semibold text-[#7D7065]">
                          {isAr ? 'المقابل التقريبي بالدولار:' : 'Equivalent in US Dollar:'}
                        </span>
                        <span dir="ltr" className="font-black text-[#608035] text-xs sm:text-sm">
                          ${totalUsd} USD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Proceed to Payment Button */}
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="w-full mt-4 h-13 py-3.5 px-6 rounded-xl bg-[#2D3F33] hover:bg-[#1E2922] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>{isAr ? 'المتابعة إلى الدفع' : 'Proceed To Payment'}</span>
                    {isAr ? (
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>

                  {/* Micro Trust Guarantee Footer */}
                  <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-[#8C7E72]">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8fae2a]" />
                      <span>{isAr ? 'دفع آمن 100%' : 'Secure Checkout'}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5 text-[#8fae2a]" />
                      <span>{isAr ? 'إلغاء أو تعديل بأي وقت' : 'Cancel Anytime'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
