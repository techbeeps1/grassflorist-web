import React from 'react';
import { type Locale } from '@/config/site';
import { Sprout, Package, Wallet } from 'lucide-react';

interface BenefitsSectionProps {
  locale: Locale;
}

export function BenefitsSection({ locale }: BenefitsSectionProps) {
  const isRtl = locale === 'ar';

  const benefits = [
    {
      id: 'assortment',
      icon: Sprout,
      title: isRtl ? 'تشكيلة واسعة وكبيرة' : 'Large Assortment',
      desc: isRtl
        ? 'العديد من أنواع الزهور والتنسيقات الفاخرة التي تناسب جميع مناسباتكم.'
        : 'Many different types of products with fewer variations.',
    },
    {
      id: 'delivery',
      icon: Package,
      title: isRtl ? 'التسليم في نفس اليوم' : 'Same day delivery',
      desc: isRtl
        ? 'مدة التسليم يوم واحد أو أقل، خيار تسليم سريع مع أسطول مبرد.'
        : '1-day or less delivery time, an expedited delivery option.',
    },
    {
      id: 'payment',
      icon: Wallet,
      title: isRtl ? 'الدفع السهل والآمن' : 'Easy and Secure Payment',
      desc: isRtl
        ? 'طرق دفع إلكترونية متعددة وآمنة تماماً لراحة بال تامة.'
        : 'Answers to any business related query within a few hours.',
    },
  ];

  return (
    <section aria-label="Brand Benefits" className="py-14 sm:py-20 bg-[#EFE7DC]">
      <div className="site-container">
        {/* Modern 3-Card Grid with Top Overlapping Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 lg:gap-8 pt-6 sm:pt-8">
          {benefits.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col items-center text-center pt-14 sm:pt-16 pb-8 sm:pb-10 px-6 sm:px-8 rounded-3xl bg-white border border-[#E3D7C7] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(67,88,73,0.12)] hover:border-[#435849]/40 hover:-translate-y-2 transition-all duration-300"
              >
                {/* Floating Top Circular Badge (Overlapping the card border) */}
                <div className="absolute -top-9 sm:-top-10 start-1/2 -translate-x-1/2 w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#435849] to-[#2F4135] group-hover:from-[#8cb83e] group-hover:to-[#7aa433] text-white flex items-center justify-center shadow-[0_8px_22px_rgba(67,88,73,0.28)] group-hover:shadow-[0_12px_28px_rgba(140,184,62,0.4)] border-4 border-[#EFE7DC] group-hover:scale-110 transition-all duration-300 shrink-0">
                  <IconComponent className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.75] transition-transform duration-300" />
                </div>

                {/* Card Title */}
                <h3 className="text-lg sm:text-xl font-bold text-[#1E1915] mb-2.5 tracking-tight group-hover:text-[#435849] transition-colors duration-200">
                  {item.title}
                </h3>

                {/* Card Description */}
                <p className="text-xs sm:text-[13px] text-[#6B6057] leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>

                {/* Subtle Interactive Bottom Accent Bar */}
                <div className="w-8 h-1 rounded-full bg-[#EFE7DC] group-hover:bg-[#8cb83e] group-hover:w-14 transition-all duration-300 mt-6" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
