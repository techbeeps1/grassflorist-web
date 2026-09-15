'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Sparkles, ShieldCheck, Truck, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductTabsProps {
  product: Product;
  locale: Locale;
}

export function ProductTabs({ product, locale }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'desc' | 'care' | 'specs' | 'shipping'>('desc');
  const dict = getDictionary(locale);

  const tabs = [
    { id: 'desc', label: locale === 'ar' ? 'الوصف والتفاصيل' : 'Description' },
    { id: 'care', label: dict.product.careInstructions },
    { id: 'specs', label: dict.product.specifications },
    { id: 'shipping', label: dict.product.shippingAndReturns },
  ] as const;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      {/* Tab Navigation */}
      <div className="flex border-b border-border gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-3.5 text-xs sm:text-sm font-bold transition-all border-b-2 shrink-0 cursor-pointer',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="py-6 text-sm text-text-secondary leading-relaxed animate-fade-in">
        {activeTab === 'desc' && (
          <div className="space-y-4 max-w-3xl">
            <p className="text-base text-text-main leading-relaxed">
              {product.description[locale]}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-text-main">
                    {locale === 'ar' ? 'تنسيق يدوي فندقي' : 'Hand-Tied Atelier Design'}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    {locale === 'ar'
                      ? 'تم تنسيق هذه الباقة بأيدي أمهر خبراء الزهور المعتمدين.'
                      : 'Arranged by certified master florists using Dutch standards.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-text-main">
                    {locale === 'ar' ? 'ضمان النضارة التامة' : 'Guaranteed Freshness'}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    {locale === 'ar'
                      ? 'زهور طازجة 100% مستوردة جواً ومحفوظة بدرجة تبريد مثالية.'
                      : '100% farm-direct flowers transported under refrigerated care.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'care' && (
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-start gap-3">
              <Droplets className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-text-main">
                  {locale === 'ar' ? 'تجديد الماء وقص السيقان' : 'Water Renewal & Stem Trimming'}
                </h4>
                <p className="text-xs text-text-muted mt-1">
                  {locale === 'ar'
                    ? 'قم بقص 2 سم من أسفل السيقان بزاوية 45 درجة كل يومين، وغيّر ماء الفازة بماء بارد ونظيف مع إضافة غذاء الزهور المرفق.'
                    : 'Trim stems 2cm at a 45-degree angle every two days. Replenish with clean, cold water and add the included flower nutrient packet.'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-3 border-t border-border">
              <Sparkles className="w-5 h-5 text-secondary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-text-main">
                  {locale === 'ar' ? 'الموقع المناسب في المنزل' : 'Optimal Placement'}
                </h4>
                <p className="text-xs text-text-muted mt-1">
                  {locale === 'ar'
                    ? 'احفظ الباقة في غرفة معتدلة البرودة بعيداً عن أشعة الشمس المباشرة أو فتحات التكييف والحرارة المباشرة.'
                    : 'Position in a cool room away from direct sunlight, air conditioning streams, and ripe fruit.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="max-w-xl">
            <dl className="divide-y divide-border text-xs">
              <div className="py-2.5 flex justify-between">
                <dt className="text-text-muted">{dict.product.sku}</dt>
                <dd className="font-mono font-bold text-text-main">{product.sku}</dd>
              </div>
              {product.attributes?.stemCount && (
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">
                    {locale === 'ar' ? 'عدد السيقان / الورود' : 'Stem Count'}
                  </dt>
                  <dd className="font-bold text-text-main">
                    {product.attributes.stemCount} {locale === 'ar' ? 'زهرة' : 'stems'}
                  </dd>
                </div>
              )}
              {product.attributes?.dimensions && (
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">
                    {locale === 'ar' ? 'الأبعاد التقريبية' : 'Approximate Dimensions'}
                  </dt>
                  <dd className="font-bold text-text-main">{product.attributes.dimensions}</dd>
                </div>
              )}
              {product.attributes?.flowerTypes && (
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">
                    {locale === 'ar' ? 'أنواع الزهور المستخدمة' : 'Botanical Varieties'}
                  </dt>
                  <dd className="font-bold text-text-main">
                    {product.attributes.flowerTypes[locale]}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-text-main">
                  {locale === 'ar' ? 'توصيل مبرد في نفس اليوم' : 'Same-Day Chilled Delivery'}
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {locale === 'ar'
                    ? 'نوفر التوصيل خلال ساعتين داخل الرياض وجدة والخبر عبر سياراتنا المبردة خصيصاً للحفاظ على حيوية الورود. كما يمكنك تحديد فترة صباحية أو مسائية تناسب المستلم.'
                    : 'Delivered in under 2 hours in Riyadh, Jeddah, and Khobar via climate-controlled fleet. You can select specific morning, afternoon, or evening windows.'}
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-semibold">
              {locale === 'ar'
                ? 'شحن مجاني فوري للطلبات بقيمة 250 ر.س فما فوق.'
                : 'Free express delivery automatically applied on orders of 250 SAR or more.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
