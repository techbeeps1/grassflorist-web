'use client';

import React, { useState, useEffect } from 'react';
import { type Locale } from '@/config/site';
import { Product } from '@/types/product';
import { PriceDisplay } from '@/components/common/CurrencySymbol';
import {
  Calendar,
  Clock,
  CheckCircle2,
  HelpCircle,
  Truck,
  RotateCw,
  Percent,
  CalendarRange,
  Info,
} from 'lucide-react';

export type PurchaseType = 'one_time' | 'subscription';

export interface SubscriptionConfig {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  durationType: '3_months' | '6_months' | '12_months' | 'until_cancelled' | 'custom';
  startDate?: string;
  timeSlot?: string;
  customDates?: string[];
  calculatedPricing?: any;
}

export interface GlobalSubscriptionSettings {
  is_enabled: boolean;
  default_discount_percentage: number;
  allowed_frequencies: string[];
  duration_mode: 'fixed' | 'customer_choice';
  fixed_duration: string;
  allowed_durations: string[];
  customer_notes_enabled: boolean;
}

interface SubscriptionPurchaseSelectorProps {
  product: Product;
  locale: Locale;
  quantity: number;
  purchaseType: PurchaseType;
  onPurchaseTypeChange: (type: PurchaseType) => void;
  subscriptionConfig: SubscriptionConfig;
  onSubscriptionConfigChange: (config: SubscriptionConfig) => void;
}

export function SubscriptionPurchaseSelector({
  product,
  locale,
  quantity,
  purchaseType,
  onPurchaseTypeChange,
  subscriptionConfig,
  onSubscriptionConfigChange,
}: SubscriptionPurchaseSelectorProps) {
  const isAr = locale === 'ar';

  // Global settings state
  const [settings, setSettings] = useState<GlobalSubscriptionSettings | null>(null);

  const [calculation, setCalculation] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch global subscription settings on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const activeLocale = locale === 'en' ? 'en' : 'ar';
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '').replace(/\/api$/, '') + `/api/${activeLocale}`;
        const res = await fetch(`${apiBase}/subscriptions/settings`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setSettings(json.data);

            // If duration mode is fixed, lock durationType to the fixed duration automatically
            if (json.data.duration_mode === 'fixed') {
              const fixedDur = json.data.fixed_duration || 'until_cancelled';
              if (subscriptionConfig.durationType !== fixedDur) {
                onSubscriptionConfigChange({
                  ...subscriptionConfig,
                  durationType: fixedDur as any,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load subscription settings:', err);
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const isGloballyEnabled = settings ? settings.is_enabled : true;
  const isSubEnabled = Boolean(product.is_subscription_enabled) && isGloballyEnabled;

  const discountPercent =
    product.subscription_discount_percentage !== undefined &&
    product.subscription_discount_percentage !== null &&
    Number(product.subscription_discount_percentage) > 0
      ? Number(product.subscription_discount_percentage)
      : (settings?.default_discount_percentage ?? 10);

  const durationMode = settings?.duration_mode ?? 'fixed';
  const fixedDuration = settings?.fixed_duration ?? 'until_cancelled';

  // Frequency Options
  const allFrequencyOptions = [
    {
      id: 'weekly',
      label: isAr ? 'أسبوعياً' : 'Every Week',
      desc: isAr ? 'توصيل متجدد كل 7 أيام' : 'Fresh delivery every 7 days',
    },
    {
      id: 'biweekly',
      label: isAr ? 'كل أسبوعين' : 'Every 2 Weeks',
      desc: isAr ? 'توصيل متجدد كل 14 يوم' : 'Fresh delivery every 14 days',
    },
    {
      id: 'monthly',
      label: isAr ? 'شهرياً' : 'Every Month',
      desc: isAr ? 'توصيل مرة واحدة شهرياً' : 'Fresh delivery once a month',
    },
  ];

  const allowedFreqList = settings?.allowed_frequencies || ['weekly', 'biweekly', 'monthly'];
  const frequencyOptions = allFrequencyOptions.filter((opt) => allowedFreqList.includes(opt.id));

  // Duration Options
  const allDurationOptions = [
    {
      id: '3_months',
      label: isAr ? '3 أشهر' : '3 Months',
      badge: isAr ? 'الأكثر طلباً' : 'Popular',
    },
    {
      id: '6_months',
      label: isAr ? '6 أشهر' : '6 Months',
      badge: isAr ? 'توفير أكبر' : 'Value',
    },
    {
      id: '12_months',
      label: isAr ? 'سنة كاملة' : '12 Months',
      badge: isAr ? 'الأفضل قيمة' : 'Best Value',
    },
    {
      id: 'until_cancelled',
      label: isAr ? 'حتى الإلغاء' : 'Until Cancelled',
      badge: isAr ? 'مرن' : 'Flexible',
    },
  ];

  const allowedDurList = settings?.allowed_durations || ['3_months', '6_months', '12_months', 'until_cancelled'];
  const durationOptions = allDurationOptions.filter((opt) => allowedDurList.includes(opt.id));

  // Fetch zero-trust calculated pricing from backend API
  useEffect(() => {
    if (!isSubEnabled || purchaseType !== 'subscription') return;

    let isMounted = true;
    const fetchPricing = async () => {
      setIsCalculating(true);
      try {
        const activeLocale = locale === 'en' ? 'en' : 'ar';
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '').replace(/\/api$/, '') + `/api/${activeLocale}`;
        const res = await fetch(`${apiBase}/subscriptions/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity: quantity,
            frequency: subscriptionConfig.frequency,
            duration_type: durationMode === 'fixed' ? fixedDuration : subscriptionConfig.durationType,
            shipping_method_code: 'inside_jeddah',
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted) {
            setCalculation(json.data);
            onSubscriptionConfigChange({
              ...subscriptionConfig,
              durationType: durationMode === 'fixed' ? (fixedDuration as any) : subscriptionConfig.durationType,
              calculatedPricing: json.data,
            });
          }
        }
      } catch (err) {
        console.error('Pricing calculation error', err);
      } finally {
        if (isMounted) setIsCalculating(false);
      }
    };

    const timeout = setTimeout(fetchPricing, 200);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [
    isSubEnabled,
    purchaseType,
    product.id,
    quantity,
    subscriptionConfig.frequency,
    subscriptionConfig.durationType,
    durationMode,
    fixedDuration,
  ]);

  if (!isSubEnabled) {
    return null;
  }

  const discountedSinglePrice = Math.round(product.price * (1 - discountPercent / 100));

  return (
    <div className="space-y-4 pt-2">
      {/* 🌟 Header Selector Tabs: One-Time Purchase vs Subscribe & Save */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: One-Time Purchase */}
        <button
          type="button"
          onClick={() => onPurchaseTypeChange('one_time')}
          className={`relative p-3.5 sm:p-4 rounded-2xl border text-start transition-all cursor-pointer select-none ${
            purchaseType === 'one_time'
              ? 'border-[#435849] bg-[#FAF7F2] shadow-sm ring-1 ring-[#435849]'
              : 'border-[#E4D8CB] bg-white hover:border-[#C8B8A6] hover:bg-[#FCFAF7]'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-[#2C382F]">
                <span>{isAr ? 'شراء لمرة واحدة' : 'One-Time Purchase'}</span>
              </div>
              <p className="text-xs text-[#7A6E65] mt-0.5">
                {isAr ? 'طلب فردي بدون التزام' : 'Standard single order'}
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                purchaseType === 'one_time'
                  ? 'border-[#435849] bg-[#435849] text-white'
                  : 'border-[#C8B8A6] bg-white'
              }`}
            >
              {purchaseType === 'one_time' && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E4D8CB]/60 flex items-baseline justify-between">
            <span className="text-xs text-[#7A6E65]">{isAr ? 'السعر' : 'Price'}:</span>
            <PriceDisplay
              amount={product.price * quantity}
              locale={locale}
              className="text-base font-extrabold text-[#2C382F]"
              symbolClassName="w-3.5 h-3.5"
            />
          </div>
        </button>

        {/* Card 2: Subscribe & Save */}
        <button
          type="button"
          onClick={() => onPurchaseTypeChange('subscription')}
          className={`relative p-3.5 sm:p-4 rounded-2xl border text-start transition-all cursor-pointer select-none overflow-hidden ${
            purchaseType === 'subscription'
              ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-600'
              : 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-400'
          }`}
        >
          {/* Top Discount Badge */}
          <div className="absolute top-0 end-0 bg-emerald-700 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider">
            {isAr ? `وفر ${discountPercent}%` : `Save ${discountPercent}%`}
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-emerald-950">
                <RotateCw className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{isAr ? 'اشتراك متكرر' : 'Subscribe & Save'}</span>
              </div>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                {isAr ? 'توصيل دوري متجدد' : 'Recurring fresh floral plans'}
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                purchaseType === 'subscription'
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-emerald-300 bg-white'
              }`}
            >
              {purchaseType === 'subscription' && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-baseline justify-between">
            <span className="text-xs text-emerald-800">{isAr ? 'لكل توصيل' : 'Per Delivery'}:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-stone-400 line-through">
                {product.price * quantity}
              </span>
              <PriceDisplay
                amount={discountedSinglePrice * quantity}
                locale={locale}
                className="text-base font-extrabold text-emerald-800"
                symbolClassName="w-3.5 h-3.5 text-emerald-700"
              />
            </div>
          </div>
        </button>
      </div>

      {/* Subscription Configuration Panel (Shown only when 'subscription' is selected) */}
      {purchaseType === 'subscription' && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 bg-white shadow-xs space-y-4 animate-in fade-in duration-300">
          {/* Key Value Propositions */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex flex-wrap gap-y-2 gap-x-4 text-xs text-emerald-900">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {isAr
                  ? `خصم ${discountPercent}% على كل دورة توصيل`
                  : `${discountPercent}% discount on every delivery`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {isAr
                  ? 'تخطي أو تأجيل أو تعديل الموعد في أي وقت'
                  : 'Skip, pause, or reschedule anytime'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {isAr
                  ? 'زهور طازجة منتقاة بعناية دورياً'
                  : 'Handpicked fresh daily blooms'}
              </span>
            </div>
          </div>

          {/* 1. Frequency Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#2C382F] flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-[#435849]" />
              <span>{isAr ? 'تكرار التوصيل' : 'Delivery Frequency'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {frequencyOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onSubscriptionConfigChange({
                      ...subscriptionConfig,
                      frequency: opt.id as any,
                    })
                  }
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    subscriptionConfig.frequency === opt.id
                      ? 'border-[#435849] bg-[#435849] text-white shadow-xs font-bold'
                      : 'border-[#E4D8CB] bg-[#FAF7F2] hover:bg-white text-[#2C382F]'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-semibold">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Duration Selection: Rendered ONLY if duration_mode is 'customer_choice' */}
          {durationMode === 'customer_choice' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C382F] flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-[#435849]" />
                <span>{isAr ? 'مدة خطة الاشتراك' : 'Subscription Duration'}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {durationOptions.map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() =>
                      onSubscriptionConfigChange({
                        ...subscriptionConfig,
                        durationType: dur.id as any,
                      })
                    }
                    className={`relative p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      subscriptionConfig.durationType === dur.id
                        ? 'border-[#435849] bg-[#FAF7F2] ring-1 ring-[#435849] text-[#2C382F] font-bold'
                        : 'border-[#E4D8CB] bg-white hover:bg-[#FCFAF7] text-[#5C524B]'
                    }`}
                  >
                    <span className="text-xs block">{dur.label}</span>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                      {dur.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Note: Date and time are chosen during standard checkout */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E8E1D5] text-xs text-[#5C524B]">
            <Calendar className="w-3.5 h-3.5 text-[#435849] shrink-0" />
            <span>
              {isAr
                ? 'يتم تحديد تاريخ ووقت أول توصيل بسهولة في صفحة إتمام الطلب (Checkout)'
                : 'First delivery date & preferred time slot are selected at Checkout'}
            </span>
          </div>

          {/* 4. Live Server Pricing Breakdown Summary */}
          {calculation && (
            <div className="mt-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#E4D8CB] space-y-1.5 text-xs text-[#5C524B]">
              <div className="flex items-center justify-between">
                <span>{isAr ? 'سعر التوصيل الواحد بعد الخصم' : 'Discounted Delivery Price'}:</span>
                <span className="font-semibold text-[#2C382F]">
                  SAR {calculation.subtotal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isAr ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}:</span>
                <span>SAR {calculation.tax_amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isAr ? 'رسوم التوصيل' : 'Delivery Fee'}:</span>
                <span>SAR {calculation.delivery_fee}</span>
              </div>
              <div className="pt-2 border-t border-[#DDD3C4] flex items-center justify-between font-bold text-sm text-[#2C382F]">
                <span>{isAr ? 'إجمالي الدفعة لكل دورة' : 'Total Per Delivery Cycle'}:</span>
                <span className="text-emerald-700 text-base font-black">
                  SAR {calculation.total_per_delivery}
                </span>
              </div>

              {calculation.projected_total_savings && (
                <div className="mt-1 text-center py-1 bg-emerald-100/60 rounded-lg text-emerald-800 font-bold text-xs">
                  🎉 {isAr ? `إجمالي التوفير المتوقع للحرص:` : `Estimated total plan savings:`}{' '}
                  SAR {calculation.projected_total_savings}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
