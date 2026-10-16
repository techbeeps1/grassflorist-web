'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { type Locale } from '@/config/site';
import { useGetSubscriptionDealBySlugQuery } from '@/store/api/subscriptionApi';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Gift,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  X,
  RotateCw,
  Heart,
  Info,
} from 'lucide-react';

interface SubscriptionDealDetailViewProps {
  slug: string;
  locale: Locale;
}

export function SubscriptionDealDetailView({ slug, locale }: SubscriptionDealDetailViewProps) {
  const isAr = locale === 'ar';
  const router = useRouter();

  const { data: response, isLoading } = useGetSubscriptionDealBySlugQuery({ slug, locale });
  const deal = response?.data;

  // Gallery state
  const gallery = useMemo(() => {
    if (!deal) return [];
    if (deal.gallery && deal.gallery.length > 0) return deal.gallery;
    return [deal.image];
  }, [deal]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Configurator selections (matching Screenshot 3)
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [duration, setDuration] = useState<'1_month' | '3_months' | '6_months' | '12_months'>('3_months');

  // Starting Date logic
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const dayAfterTomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(tomorrow);
  const [customDate, setCustomDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('Morning (09:00 AM - 01:00 PM)');
  const [giftMessage, setGiftMessage] = useState('');

  // Duration discounts mapping
  const discounts = deal?.duration_discounts || {
    '1_month': 0,
    '3_months': 10,
    '6_months': 15,
    '12_months': 20,
  };

  const discountPercent = discounts[duration] ?? 0;
  const basePrice = deal?.original_price || deal?.starting_price || 129;
  const discountedPerDelivery = Math.round(basePrice * (1 - discountPercent / 100));

  // Breadcrumbs
  const breadcrumbs = [
    { label: isAr ? 'الرئيسية' : 'Home', href: isAr ? '/' : '/en' },
    { label: isAr ? 'اشتراكات الزهور' : 'Subscriptions', href: isAr ? '/flowers-subscription-deals' : '/en/flowers-subscription-deals' },
    { label: isAr ? (deal?.name?.ar || deal?.localized_name || 'الباقة') : (deal?.name?.en || deal?.localized_name || 'Plan') },
  ];

  // Frequency options
  const frequencyOptions = [
    {
      key: 'weekly' as const,
      label: isAr ? 'كل أسبوع (أسبوعياً)' : 'Every week',
      desc: isAr ? 'توصيل باقة منعشة كل 7 أيام' : 'Fresh bouquet every 7 days',
    },
    {
      key: 'biweekly' as const,
      label: isAr ? 'كل أسبوعين' : 'Every two weeks',
      desc: isAr ? 'توصيل باقة كل 14 يوماً' : 'Fresh bouquet every 14 days',
    },
    {
      key: 'monthly' as const,
      label: isAr ? 'مرة بالشهر (شهرياً)' : 'Once a month',
      desc: isAr ? 'توصيل باقة كل 30 يوماً' : 'Fresh bouquet once every month',
    },
  ];

  // Duration options (matching Screenshot 3 with badge pills)
  const durationOptions = [
    {
      key: '1_month' as const,
      label: isAr ? 'شهر واحد' : '1 Month',
      discount: discounts['1_month'] ?? 0,
      badge: discounts['1_month'] > 0 ? (isAr ? `وفر ${discounts['1_month']}%` : `${discounts['1_month']}% OFF`) : null,
    },
    {
      key: '3_months' as const,
      label: isAr ? '3 أشهر' : '3 Months',
      discount: discounts['3_months'] ?? 10,
      badge: (discounts['3_months'] ?? 10) > 0 ? (isAr ? `وفر ${discounts['3_months'] ?? 10}%` : `${discounts['3_months'] ?? 10}% OFF`) : null,
    },
    {
      key: '6_months' as const,
      label: isAr ? '6 أشهر' : '6 Months',
      discount: discounts['6_months'] ?? 15,
      badge: (discounts['6_months'] ?? 15) > 0 ? (isAr ? `وفر ${discounts['6_months'] ?? 15}%` : `${discounts['6_months'] ?? 15}% OFF`) : null,
    },
    {
      key: '12_months' as const,
      label: isAr ? '12 شهراً (سنة)' : '12 Months',
      discount: discounts['12_months'] ?? 20,
      badge: (discounts['12_months'] ?? 20) > 0 ? (isAr ? `وفر ${discounts['12_months'] ?? 20}%` : `${discounts['12_months'] ?? 20}% OFF`) : null,
    },
  ];

  // Handle direct Proceed To Payment (Bypasses Cart Completely!)
  const handleProceedToPayment = () => {
    if (!deal) return;

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
      start_date: startDate,
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

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center p-8 bg-[#FAF7F2]"><div className="w-10 h-10 border-4 border-[#2D3F33] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!deal) {
    notFound();
  }

  const planName = isAr ? (deal.name?.ar || deal.localized_name) : (deal.name?.en || deal.localized_name);
  const planDesc = isAr ? (deal.description?.ar || deal.localized_description) : (deal.description?.en || deal.localized_description);
  const planDetails = isAr ? (deal.details_content?.ar || deal.localized_details) : (deal.details_content?.en || deal.localized_details);

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1E1915] pb-24">
      {/* 1. Breadcrumbs */}
      <div className="max-w-[1280px] mx-auto px-4 pt-4">
        <Breadcrumbs items={breadcrumbs} locale={locale} />
      </div>

      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ================= LEFT COLUMN: GALLERY & CONFIGURATOR ================= */}
          <div className="lg:col-span-7 space-y-8">
            {/* Gallery Section (Matching Screenshot 2) */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E8DFD3] shadow-xs">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Thumbnails strip */}
                {gallery.length > 1 && (
                  <div className="flex sm:flex-col gap-3 shrink-0 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto max-h-[460px] pb-2 sm:pb-0">
                    {gallery.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-[#2D3F33] ring-2 ring-[#2D3F33]/20 shadow-xs'
                            : 'border-[#E8DFD3] hover:border-gray-400 opacity-75'
                        }`}
                      >
                        <Image src={img} alt={`${planName} thumb ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Preview with Zoom Button */}
                <div className="relative aspect-[4/3] sm:aspect-square flex-1 w-full rounded-2xl overflow-hidden bg-[#FAF7F2] order-1 sm:order-2">
                  <Image
                    src={gallery[activeImageIndex] || deal.image}
                    alt={planName}
                    fill
                    priority
                    className="object-cover object-center"
                  />
                  <button
                    type="button"
                    onClick={() => setIsZoomOpen(true)}
                    className="absolute bottom-4 end-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md text-[#1E1915] hover:bg-white flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Zoom image"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Title & Detailed Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD3] shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5">
                  <span>{isAr ? 'اشتراك زهور دوري مباشر' : 'Direct Recurring Subscription'}</span>
                </span>
                {deal.localized_badge && (
                  <span className="px-3 py-1 rounded-full bg-[#1E1915] text-white text-xs font-bold">
                    {deal.localized_badge}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1E1915]">
                {planName}
              </h1>

              <p className="text-sm sm:text-base text-[#5C524B] leading-relaxed">
                {planDetails || planDesc}
              </p>

              {/* Features Pill List */}
              {deal.features && deal.features.length > 0 && (
                <div className="pt-4 border-t border-[#E8DFD3] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {deal.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-[#2D3F33] font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ================= CONFIGURATOR CARD (Matching Screenshot 3) ================= */}
            <div id="configure" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD3] shadow-xs space-y-8">
              {/* Step 1: Delivery Frequency */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-full bg-[#2D3F33] text-white font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1E1915]">
                    {isAr ? 'تكرار التوصيل (Delivery Frequency)' : 'Delivery Frequency'}
                  </h3>
                </div>

                <div className="space-y-3">
                  {frequencyOptions.map((opt) => (
                    <label
                      key={opt.key}
                      onClick={() => setFrequency(opt.key)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        frequency === opt.key
                          ? 'border-[#2D3F33] bg-[#FAF7F2] shadow-xs'
                          : 'border-[#E8DFD3] hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            frequency === opt.key ? 'border-[#2D3F33] bg-[#2D3F33]' : 'border-gray-300'
                          }`}
                        >
                          {frequency === opt.key && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm sm:text-base text-[#1E1915]">{opt.label}</div>
                          <div className="text-xs text-[#7D7065]">{opt.desc}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 2: Subscription Duration & Discounts */}
              <div className="pt-6 border-t border-[#E8DFD3]">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-full bg-[#2D3F33] text-white font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1E1915]">
                    {isAr ? 'مدة خطة الاشتراك (Subscription Duration)' : 'Subscription Duration'}
                  </h3>
                </div>

                <div className="space-y-3">
                  {durationOptions.map((dOpt) => {
                    const isSelected = duration === dOpt.key;
                    const tierPrice = Math.round(basePrice * (1 - dOpt.discount / 100));

                    return (
                      <label
                        key={dOpt.key}
                        onClick={() => setDuration(dOpt.key)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#2D3F33] bg-[#FAF7F2] shadow-xs'
                            : 'border-[#E8DFD3] hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-[#2D3F33] bg-[#2D3F33]' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-[#1E1915]">{dOpt.label}</span>
                            {dOpt.badge && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                {dOpt.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-end">
                          {dOpt.discount > 0 && (
                            <span className="text-xs text-gray-400 line-through me-1.5 font-medium">
                              {basePrice} SAR
                            </span>
                          )}
                          <span className="font-black text-sm sm:text-base text-[#2D3F33]">
                            {tierPrice} SAR
                          </span>
                          <span className="text-[10px] text-[#7D7065] block">
                            {isAr ? 'لكل توصيلة' : 'Per delivery'}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Starting Date (Matching Screenshot 3) */}
              <div className="pt-6 border-t border-[#E8DFD3]">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-full bg-[#2D3F33] text-white font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1E1915]">
                    {isAr ? 'تاريخ أول توصيلة (Starting Date)' : 'Starting Date'}
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Tomorrow pill */}
                  <label
                    onClick={() => {
                      setStartDate(tomorrow);
                      setCustomDate('');
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      startDate === tomorrow && !customDate
                        ? 'border-[#2D3F33] bg-[#FAF7F2]'
                        : 'border-[#E8DFD3] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          startDate === tomorrow && !customDate ? 'border-[#2D3F33] bg-[#2D3F33]' : 'border-gray-300'
                        }`}
                      >
                        {startDate === tomorrow && !customDate && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="font-bold text-sm text-[#1E1915]">
                        {isAr ? `غداً (${tomorrow})` : `Tomorrow (${tomorrow})`}
                      </span>
                    </div>
                  </label>

                  {/* Day After Tomorrow pill */}
                  <label
                    onClick={() => {
                      setStartDate(dayAfterTomorrow);
                      setCustomDate('');
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      startDate === dayAfterTomorrow && !customDate
                        ? 'border-[#2D3F33] bg-[#FAF7F2]'
                        : 'border-[#E8DFD3] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          startDate === dayAfterTomorrow && !customDate
                            ? 'border-[#2D3F33] bg-[#2D3F33]'
                            : 'border-gray-300'
                        }`}
                      >
                        {startDate === dayAfterTomorrow && !customDate && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="font-bold text-sm text-[#1E1915]">
                        {isAr ? `بعد غد (${dayAfterTomorrow})` : `Day after tomorrow (${dayAfterTomorrow})`}
                      </span>
                    </div>
                  </label>

                  {/* Custom Date Input */}
                  <div
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      customDate ? 'border-[#2D3F33] bg-[#FAF7F2]' : 'border-[#E8DFD3] bg-white'
                    }`}
                  >
                    <label className="block text-xs font-bold text-[#7D7065] mb-1.5">
                      {isAr ? 'اختر تاريخاً آخر (Select Other Date):' : 'Select Other Date:'}
                    </label>
                    <input
                      type="date"
                      min={tomorrow}
                      value={customDate}
                      onChange={(e) => {
                        setCustomDate(e.target.value);
                        if (e.target.value) setStartDate(e.target.value);
                      }}
                      className="w-full bg-transparent border-0 text-sm font-bold text-[#1E1915] focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-[#7D7065] mt-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {isAr
                      ? 'نوفر أفضل مواعيد التوصيل صباحاً ومساءً داخل مدينة جدة مع اتصال مسبق لتأكيد الاستلام.'
                      : 'We deliver temperature-controlled fresh blooms with advance call notification.'}
                  </span>
                </p>
              </div>

              {/* Step 4: Special Gift Card Message (Optional) */}
              <div className="pt-6 border-t border-[#E8DFD3]">
                <label className="block text-sm font-bold text-[#1E1915] mb-2">
                  {isAr ? 'رسالة بطاقة الإهداء (اختياري):' : 'Gift Card Message (Optional):'}
                </label>
                <textarea
                  rows={3}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder={
                    isAr
                      ? 'اكتب رسالة رقيقة ترافق باقتك الأولى...'
                      : 'Write a heartfelt message for your complimentary gift card...'
                  }
                  className="w-full p-3.5 rounded-2xl border border-[#E8DFD3] text-sm focus:border-[#2D3F33] focus:outline-none bg-[#FAF7F2]/50"
                />
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: STICKY LIVE SUMMARY (Matching Screenshot 3) ================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DFD3] shadow-md space-y-6">
              {/* Product Mini Overview */}
              <div className="flex gap-4 items-center pb-5 border-b border-[#E8DFD3]">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#E8DFD3]">
                  <Image src={deal.image} alt={planName} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-extrabold text-lg text-[#1E1915]">{planName}</h4>
                  <p className="text-xs text-[#7D7065] mt-0.5">
                    {frequencyOptions.find((f) => f.key === frequency)?.label}
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold mt-1">
                    {durationOptions.find((d) => d.key === duration)?.label}
                  </span>
                </div>
              </div>

              {/* Summary Heading */}
              <div>
                <h3 className="font-black text-xl font-serif text-[#1E1915] mb-1">
                  {isAr ? 'ملخص الاشتراك' : 'Summary'}
                </h3>
                <p className="text-xs text-[#7D7065]">
                  {isAr ? 'تفاصيل الدفعة الأولى للتوصيلة' : 'First delivery payment details'}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-[#5C524B]">
                  <span>{isAr ? 'قيمة الباقة (قبل الخصم)' : 'Base Price'}</span>
                  <span>{basePrice} SAR</span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-bold">
                    <span>
                      {isAr ? `خصم الالتزام (${discountPercent}%)` : `Duration Discount (${discountPercent}%)`}
                    </span>
                    <span>-{basePrice - discountedPerDelivery} SAR</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[#5C524B]">
                  <span>{isAr ? 'المجموع الفرعي (لكل باقة)' : 'Subtotal'}</span>
                  <span className="font-bold text-[#1E1915]">{discountedPerDelivery} SAR</span>
                </div>

                <div className="flex justify-between items-center text-[#5C524B]">
                  <span>{isAr ? 'رسوم التوصيل' : 'Delivery Charges'}</span>
                  <span className="font-bold text-emerald-700 uppercase tracking-wider text-xs px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    {isAr ? 'مجاني' : 'Free'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#E8DFD3] text-base sm:text-lg font-black text-[#1E1915]">
                  <span>{isAr ? 'إجمالي الدفعة الأولى:' : 'Total (1st Delivery):'}</span>
                  <div className="text-end">
                    <span className="text-[#2D3F33] flex items-center justify-end gap-1">
                      <CurrencySymbol forcedCurrency="SAR" className="w-4 h-4 text-[#8fae2a]" />
                      <span>{discountedPerDelivery}</span>
                    </span>
                    <span className="text-[10px] text-[#7D7065] font-normal block">
                      {isAr ? 'شامل ضريبة القيمة المضافة 15%' : 'Includes 15% VAT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Perks Checklist */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2 text-xs text-[#5C524B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'مزهرية فاخرة مجانية ترافق أول توصيلة' : 'Free luxury vase included in 1st delivery'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'بدون سلة أو رسوم خفية - دفع فوري مباشر' : 'No cart needed - direct streamlined checkout'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'تحكم كامل وتعديل المواعيد من حسابك' : 'Pause or modify dates easily from your account'}</span>
                </div>
              </div>

              {/* BIG CTA BUTTON (Proceed To Payment - Bypasses Cart) */}
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full py-4 px-6 rounded-full bg-[#2D3F33] hover:bg-[#1E2922] text-white font-extrabold text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAr ? 'المتابعة للدفع' : 'Proceed To Payment'}</span>
                {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Image Zoom */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 end-6 text-white hover:text-gray-300 p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-3xl max-h-[85vh] w-full h-[75vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={gallery[activeImageIndex] || deal.image}
              alt={planName}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
