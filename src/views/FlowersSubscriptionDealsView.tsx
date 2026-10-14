'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Locale } from '@/config/site';
import { useGetSubscriptionDealsQuery } from '@/store/api/subscriptionApi';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import {
  Truck,
  Gift,
  Percent,
  CheckCircle2,
  Calendar,
  RotateCw,
  Heart,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

import { SubscriptionLandingSkeleton } from '@/components/subscription/SubscriptionLandingSkeleton';

interface FlowersSubscriptionDealsViewProps {
  locale: Locale;
}

export function FlowersSubscriptionDealsView({ locale }: FlowersSubscriptionDealsViewProps) {
  const isAr = locale === 'ar';
  const { data: response, isLoading } = useGetSubscriptionDealsQuery({ locale });

  const landing = response?.data;
  const plans = landing?.plans || [];

  if (isLoading || !landing) {
    return <SubscriptionLandingSkeleton locale={locale} />;
  }

  const breadcrumbs = [
    { label: isAr ? 'الرئيسية' : 'Home', href: isAr ? '/' : '/en' },
    { label: isAr ? 'اشتراكات الزهور' : 'Flower Subscriptions', href: isAr ? '/flowers-subscription-deals' : '/en/flowers-subscription-deals' },
  ];

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1E1915]">
      {/* 1. Breadcrumbs */}
      <div className="site-container pt-4">
        <Breadcrumbs items={breadcrumbs} locale={locale} />
      </div>

      {/* 2. Floward-Inspired Luxury Hero Banner */}
      <div className="site-container mt-3">
        <section className="relative rounded-3xl overflow-hidden shadow-lg border border-[#E8DFD3] min-h-[360px] sm:min-h-[440px] flex items-center">
          {/* Background Image with Ambient Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src={landing?.hero?.image || 'https://api.grassflorist.com/storage/products/g46220flower20delivery20jeddah202-600x600-1.jpg'}
              alt="Grass Flower Subscriptions"
              fill
              priority
              className="object-cover object-center brightness-[0.78] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent rtl:bg-gradient-to-l" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-6 sm:p-12 md:p-16 max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs sm:text-sm font-semibold mb-4 border border-white/25">
              <span>{isAr ? 'عروض وباقات الاشتراكات الدورية' : 'Grass Premium Recurring Subscriptions'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-serif tracking-tight leading-[1.15] mb-4 drop-shadow-sm">
              {isAr ? (landing?.hero?.title?.ar || 'اشتراكات غراس') : (landing?.hero?.title?.en || 'Grass Subscriptions')}
            </h1>

            <p className="text-base sm:text-xl text-white/90 leading-relaxed font-medium mb-8 max-w-xl drop-shadow-xs">
              {isAr
                ? (landing?.hero?.subtitle?.ar || 'اجعل كل يوم مميزاً بزهور طبيعية منعشة تصلك أو لمن تحب دورياً وبأعلى معايير الفخامة.')
                : (landing?.hero?.subtitle?.en || 'Make any day special with fresh flowers delivered to you or your loved ones regularly.')}
            </p>

            <a
              href="#select-plan"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#8fae2a] hover:bg-[#7e9b25] text-white font-bold text-base transition-all shadow-md hover:shadow-xl active:scale-95"
            >
              <span>{isAr ? 'اختر باقتك الآن' : 'Select Your Plan'}</span>
              {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </a>
          </div>
        </section>
      </div>

      {/* 3. Three Highlight Perks Bar */}
      <section className="site-container mt-8">
        <div className="bg-white rounded-2xl border border-[#E8DFD3] p-4 sm:p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-[#E8DFD3]">
          {/* Perk 1 */}
          <div className="flex items-center gap-3.5 pt-2 md:pt-0 justify-center sm:justify-start px-2">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#1E1915]">
                {isAr ? 'اشترك ووفر حتى 20%' : 'Subscribe & save up to 20%'}
              </h3>
              <p className="text-xs text-[#7D7065]">
                {isAr ? 'خصم فوري على كل التوصيلات الدورية' : 'Instant savings applied on recurring deliveries'}
              </p>
            </div>
          </div>

          {/* Perk 2 */}
          <div className="flex items-center gap-3.5 pt-4 md:pt-0 justify-center sm:justify-start px-2">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#1E1915]">
                {isAr ? 'توصيل مجدول ومبرد' : 'Scheduled & Fresh Delivery'}
              </h3>
              <p className="text-xs text-[#7D7065]">
                {isAr ? 'شحن مبرد ومخصص يحافظ على نضارة الورد في موعدك المختار' : 'Temperature-controlled delivery ensuring peak bloom freshness'}
              </p>
            </div>
          </div>

          {/* Perk 3 */}
          <div className="flex items-center gap-3.5 pt-4 md:pt-0 justify-center sm:justify-start px-2">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#1E1915]">
                {isAr ? 'مزهرية فاخرة مجاناً مع أول طلب' : 'Free luxury vase on 1st delivery!'}
              </h3>
              <p className="text-xs text-[#7D7065]">
                {isAr ? 'هدية حصرية ترحيبية ترافق باقتك الأولى' : 'Exclusive vase gift included in your welcome box'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "Select Your Plan" Grid Section (Matching Screenshot 1) */}
      <section id="select-plan" className="site-container py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1E1915] mb-2 tracking-tight">
            {isAr ? 'اختر باقة اشتراكك' : 'Select Your Plan'}
          </h2>
          <p className="text-sm sm:text-base text-[#7D7065]">
            {isAr
              ? 'باقات صممت بعناية لتناسب مختلف الأذواق والمناسبات مع كامل المرونة للتعديل والإيقاف'
              : 'Handcrafted plans tailored for your home and office with 100% pause/cancel flexibility'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-[#E8DFD3] animate-pulse space-y-4">
                <div className="h-64 bg-gray-200 rounded-2xl" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {plans.map((plan) => {
              const planName = isAr ? (plan.name?.ar || plan.localized_name) : (plan.name?.en || plan.localized_name);
              const planDesc = isAr
                ? (plan.description?.ar || plan.localized_description)
                : (plan.description?.en || plan.localized_description);
              const planBadge = isAr ? plan.badge?.ar : plan.badge?.en;
              const detailUrl = isAr
                ? `/flowers-subscription-deals/${plan.slug}`
                : `/en/flowers-subscription-deals/${plan.slug}`;

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Plan Image Container with Circular Podium Backdrop */}
                  <div className="relative aspect-[4/3] w-full bg-[#FAF7F2] overflow-hidden">
                    <Image
                      src={plan.image}
                      alt={planName}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge Pill */}
                    {planBadge && (
                      <div className="absolute top-3.5 start-3.5 z-10 px-2.5 py-1 rounded-full bg-[#1E1915]/80 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
                        {planBadge}
                      </div>
                    )}
                  </div>

                  {/* Plan Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title & Starting Price */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-black font-serif text-[#1E1915]">
                          {planName}
                        </h3>
                        <div className="text-end shrink-0">
                          <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                            <span className="text-[10.5px] uppercase tracking-wider text-[#7D7065] font-semibold">
                              {isAr ? 'تبدأ من' : 'From'}
                            </span>
                            <span className="text-base sm:text-lg font-black text-[#2D3F33] inline-flex items-center gap-0.5">
                              <CurrencySymbol forcedCurrency="SAR" className="w-3.5 h-3.5 text-[#8fae2a]" />
                              <span>{plan.starting_price}</span>
                            </span>
                            {plan.original_price && plan.original_price > plan.starting_price && (
                              <span className="text-[11px] line-through text-[#A69B91]">
                                {plan.original_price} {isAr ? 'ر.س' : 'SAR'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#7D7065] block font-medium mt-0.5">
                            {isAr ? 'لكل توصيلة' : 'Per Delivery'}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {planDesc && (
                        <p className="text-xs text-[#5C524B] leading-relaxed mb-3 line-clamp-2">
                          {planDesc}
                        </p>
                      )}
                    </div>

                    {/* CTAs (More Details & Subscribe Now) */}
                    <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#E8DFD3] mt-2">
                      <Link
                        href={detailUrl}
                        className="w-full py-2.5 px-3 rounded-full border border-[#2D3F33] text-[#2D3F33] hover:bg-[#FAF7F2] font-bold text-xs sm:text-sm text-center transition-all active:scale-95 flex items-center justify-center"
                      >
                        {isAr ? 'تفاصيل أكثر' : 'More Details'}
                      </Link>

                      <Link
                        href={`${detailUrl}/frequency`}
                        className="w-full py-2.5 px-3 rounded-full bg-[#2D3F33] hover:bg-[#1E2922] text-white font-bold text-xs sm:text-sm text-center shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <span>{isAr ? 'اشترك الآن' : 'Subscribe Now'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. "How It Works?" Section (Matching Screenshot 1) */}
      <section className="bg-white border-y border-[#E8DFD3] py-14 sm:py-18">
        <div className="site-container">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1E1915] mb-2 tracking-tight">
              {isAr ? 'كيف يعمل الاشتراك؟' : 'How It Works?'}
            </h2>
            <p className="text-sm text-[#7D7065]">
              {isAr
                ? 'ثلاث خطوات بسيطة للاستمتاع بزهور طبيعية منعشة ومبهجة تصلك بانتظام'
                : 'Three seamless steps to regular fresh blooms brought to your doorstep'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#FAF7F2] rounded-3xl p-7 border border-[#E8DFD3] text-start relative group hover:border-[#8fae2a] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#2D3F33] text-white flex items-center justify-center font-black text-lg mb-5 shadow-md">
                1
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-[#1E1915] mb-2">
                {isAr ? 'اختر باقتك المفضلة' : 'Choose your plan'}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C524B] leading-relaxed">
                {isAr
                  ? 'اختر من بين باقاتنا الكلاسيكية، أو الموسمية المتجددة، أو صندوق التنسيق الذاتي لتناسب مساحتك وذوقك.'
                  : 'Select from classic, seasonal, or DIY box to keep the love and fragrance flowing.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF7F2] rounded-3xl p-7 border border-[#E8DFD3] text-start relative group hover:border-[#8fae2a] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#8fae2a] text-white flex items-center justify-center font-black text-lg mb-5 shadow-md">
                2
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-[#1E1915] mb-2">
                {isAr ? 'حدد جدول التكرار والبدء' : 'Choose your frequency'}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C524B] leading-relaxed">
                {isAr
                  ? 'اختر اليوم والوقت وتكرار التوصيل (أسبوعياً، أسبوعين، أو شهرياً) مع خصومات إضافية كلما زادت مدة التزامك.'
                  : 'Pick the day you want the flowers to arrive, and we’ll handle the rest with care.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF7F2] rounded-3xl p-7 border border-[#E8DFD3] text-start relative group hover:border-[#8fae2a] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#2D3F33] text-white flex items-center justify-center font-black text-lg mb-5 shadow-md">
                3
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-[#1E1915] mb-2">
                {isAr ? 'استمتع بالبهجة والجمال' : 'Let every bouquet bring joy'}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C524B] leading-relaxed">
                {isAr
                  ? 'مع كل توصيلة، استمتع بزهور منسقة طازجة، مغلفة بعناية مع مزهرية فاخرة مجانية ترافق أول توصيلة.'
                  : 'With every delivery, a moment of joy, love, and warmth reaches your home or office.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      </div>
    );
  }
