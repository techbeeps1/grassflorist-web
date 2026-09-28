'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Locale, siteConfig } from '@/config/site';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EventBookingForm } from '@/components/events/EventBookingForm';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Crown,
  Heart,
  Calendar,
  Building2,
  Flower2,
  CheckCircle2,
  MessageCircle,
  Clock,
  MapPin,
  ShieldCheck,
  Palette,
  ArrowRight,
  ArrowLeft,
  Gem,
  Award,
} from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/schema';

interface EventBookingPageViewProps {
  locale: Locale;
}

export function EventBookingPageView({ locale }: EventBookingPageViewProps) {
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const breadcrumbItems = [
    { label: isRtl ? 'الرئيسية' : 'Home', href: isRtl ? '/' : '/en' },
    { label: isRtl ? 'حجز وتنظيم مناسبة' : 'Event Booking' },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: isRtl ? 'الرئيسية' : 'Home', url: isRtl ? siteConfig.url : `${siteConfig.url}/en` },
    {
      name: isRtl ? 'حجز وتنظيم مناسبة' : 'Event Booking',
      url: isRtl ? `${siteConfig.url}/حجز-مناسبة` : `${siteConfig.url}/en/event-booking`,
    },
  ]);

  // 5 Essential Core Services with Real Grass Event Portfolio Images
  const services = [
    {
      id: 'weddings',
      icon: Crown,
      number: '01',
      title: {
        en: 'Wedding Day Planning & Organization',
        ar: 'تنظيم وتنسيق حفلات الزفاف الفاخرة',
      },
      desc: {
        en: 'Meticulous wedding day organization, encompassing comprehensive budgeting strategies and timeline planning for a flawless celebration.',
        ar: 'تنظيم دقيق ومتكامل ليوم الزفاف، يشمل استراتيجيات ميزانية شاملة وتنسيق كافة تفاصيل الكوشة والمسرح لاحتفال استثنائي.',
      },
      badge: { en: 'Signature Weddings', ar: 'حفلات زفاف ملكية' },
      image: '/images/events/wedding-ballroom.jpg',
    },
    {
      id: 'rentals',
      icon: Gem,
      number: '02',
      title: {
        en: 'Impeccable Table Setups & Furniture Rental',
        ar: 'تجهيز وتأجير الطاولات والكراسي الملكية',
      },
      desc: {
        en: 'Impeccable table setups and the provision of luxury chairs, tables, and tableware on rent, ensuring a stylish and comfortable ambiance.',
        ar: 'تنسيق وتجهيز طاولات وكراسي فاخرة ومفارش ملكية للإيجار، لضمان أجواء ساحرة ومريحة تليق بضيوفكم الكرام.',
      },
      badge: { en: 'Luxury Rentals', ar: 'تأجير أثاث فاخر' },
      image: '/images/events/table-setup.jpg',
    },
    {
      id: 'florals',
      icon: Flower2,
      number: '03',
      title: {
        en: 'Exquisite Floral Scenography & Installations',
        ar: 'تنسيقات زهور حصرية وتركيبات إبداعية',
      },
      desc: {
        en: 'Exquisite floral arrangements crafted with precision and creativity, enhancing the beauty, fragrance, and elegance of every celebration.',
        ar: 'تنسيقات زهور طبيعية استثنائية تُصنع بحرفية وشغف لتضفي لمسة ساحرة من الأناقة والجمال على كل زاوية من الحفل.',
      },
      badge: { en: 'Master Floristry', ar: 'إتقان تنسيق الورد' },
      image: '/images/events/floral-scenography.jpg',
    },
    {
      id: 'baby-reception',
      icon: Heart,
      number: '04',
      title: {
        en: 'Newborn & Baby Reception Decor',
        ar: 'ديكورات واستقبال المواليد الجدد',
      },
      desc: {
        en: 'Artistic decorations to celebrate the joyous arrival of a newborn, creating a delightful atmosphere filled with warmth, pastel tones, and happiness.',
        ar: 'ديكورات وتنسيقات فنية مبتكرة للاحتفال بقدوم المولود الجديد، تغمر المكان بالدفء والبهجة والذكريات السعيدة.',
      },
      badge: { en: 'Baby Celebrations', ar: 'استقبال مواليد' },
      image: '/images/events/baby-reception.jpg',
    },
    {
      id: 'b2b-supply',
      icon: Building2,
      number: '05',
      title: {
        en: 'Flower Supply & B2B Corporate Partnerships',
        ar: 'توريد الزهور والشراكات الحصرية للشركات',
      },
      desc: {
        en: 'We proudly collaborate with esteemed companies, hotels, and flower delivery platforms, exclusively catering to valued clients across Jeddah & Saudi Arabia.',
        ar: 'شراكات وتوريد مستمر لأرقى الفنادق، الشركات، ومنصات توصيل الزهور، مع خدمات مخصصة لكبار العملاء في جدة والمملكة.',
      },
      badge: { en: 'Corporate Supply', ar: 'توريد وشراكات' },
      image: '/images/events/wedding-runway.jpg',
    },
  ];

  // 4 Steps Process
  const steps = [
    {
      step: '01',
      title: { en: 'Inquiry & Consultation', ar: 'طلب الحجز والاستشارة' },
      desc: {
        en: 'Fill out our booking form or connect via WhatsApp with your date, event type, and vision.',
        ar: 'قم بتعبئة نموذج الحجز أو التواصل معنا لتحديد موعد المناسبة ونوع الفعالية ورؤيتكم الأولية.',
      },
    },
    {
      step: '02',
      title: { en: 'Concept & Moodboard', ar: 'التصميم ولوحة الأفكار' },
      desc: {
        en: 'Our master florists create a bespoke floral palette, 3D theme layout, and decor moodboard.',
        ar: 'يقوم منسقونا بتصميم لوحة ألوان وزهور خاصة مع تصور شامل لديكور القاعة والطاولات.',
      },
    },
    {
      step: '03',
      title: { en: 'Tailored Budgeting', ar: 'الميزانية والتخطيط الشامل' },
      desc: {
        en: 'We provide clear, flexible budgeting for furniture rentals, floral styling, and logistics.',
        ar: 'نقدم خطة ميزانية واضحة تشمل تكاليف الزهور، تأجير الأثاث، والخدمات اللوجستية بدقة.',
      },
    },
    {
      step: '04',
      title: { en: 'Flawless Execution', ar: 'التنفيذ والإشراف الميداني' },
      desc: {
        en: 'Our dedicated team manages full on-site setup, flower freshness, and pristine event delivery.',
        ar: 'فريقنا المتخصص يتولى تجهيز الموقع بالكامل، وضمان نضارة الزهور وانسيابية الحفل.',
      },
    },
  ];

  return (
    <>
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-[#FAF8F5] min-h-screen py-6 sm:py-10">
        <div className="site-container">
          <Breadcrumbs items={breadcrumbItems} locale={locale} />

          {/* 1. HERO SECTION */}
          <section
            aria-label="Event Management Hero"
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2D3F33] via-[#1E2B23] to-[#141E18] text-white p-8 sm:p-12 lg:p-16 mb-12 sm:mb-16 shadow-[0_20px_60px_rgba(20,30,24,0.25)]"
          >
            {/* Subtle botanical backdrop ambient */}
            <div className="absolute top-0 end-0 w-96 h-96 bg-[#8CA841]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-80 h-80 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              <div className="lg:col-span-7 text-start">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-[#D8E6C8] border border-white/15 text-xs font-bold uppercase tracking-wider mb-4 sm:mb-5 backdrop-blur-xs">
                  <span>{isRtl ? 'غراس فلوريست | إدارة وتنظيم المناسبات' : 'GRASS ATELIER | BESPOKE EVENTS'}</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
                  {isRtl
                    ? 'إدارة وتنظيم أفخم المناسبات وتنسيقات الزهور الحصرية'
                    : 'Bespoke Event Management & Floral Scenography'}
                </h1>

                <p className="text-xs sm:text-sm lg:text-base text-[#D4C8BC] leading-relaxed mb-6 sm:mb-8 max-w-xl">
                  {isRtl
                    ? 'غراس هي شركة متميزة لإدارة وتنظيم المناسبات والفعاليات، تقدم حلولاً شاملة ومجموعة واسعة من الخدمات الاستثنائية لعملائنا الكرام. نحن ملتزمون بتقديم تجارب استثنائية، عناية فائقة بأدق التفاصيل، وتحقيق أعلى درجات رضا العملاء.'
                    : 'GRASS is a distinguished Event Management Company that offers comprehensive planning resources and a range of exceptional services to our esteemed clients. We are dedicated to delivering exceptional experiences, meticulous attention to detail, and unparalleled customer satisfaction.'}
                </p>

                {/* Call to Actions */}
                <div className="flex flex-wrap items-center gap-3.5">
                  <a
                    href="#booking-form"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-[#8CA841] hover:bg-[#7b9636] text-[#141E18] font-extrabold text-sm sm:text-base shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{isRtl ? 'احجز استشارة مناسبتك الآن' : 'Book Your Event Consultation'}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </a>

                  <a
                    href="https://wa.me/966555134211"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm sm:text-base backdrop-blur-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>{isRtl ? 'محادثة فورية واتساب' : 'WhatsApp Concierge'}</span>
                  </a>
                </div>

                {/* Trust stats pill bar */}
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-start">
                  <div>
                    <span className="block text-xl sm:text-2xl font-extrabold text-[#8CA841]">500+</span>
                    <span className="text-[11px] sm:text-xs text-[#B5ABA0]">{isRtl ? 'مناسبة نُفذت بنجاح' : 'Curated Events'}</span>
                  </div>
                  <div>
                    <span className="block text-xl sm:text-2xl font-extrabold text-[#8CA841]">100%</span>
                    <span className="text-[11px] sm:text-xs text-[#B5ABA0]">{isRtl ? 'زهور طبيعية طازجة' : 'Fresh Flora'}</span>
                  </div>
                  <div>
                    <span className="block text-xl sm:text-2xl font-extrabold text-[#8CA841]">Jeddah</span>
                    <span className="text-[11px] sm:text-xs text-[#B5ABA0]">{isRtl ? 'تغطية جدة والمملكة' : '& Across KSA'}</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Image Card */}
              <div className="lg:col-span-5 flex justify-start lg:justify-center">
                <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-4 border-white/15 shadow-2xl group">
                  <Image
                    src="/images/events/event-hero.jpg"
                    alt="Grass Florist Event Booking"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 start-4 end-4 p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-start text-white">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D8E6C8] block mb-0.5">
                      {isRtl ? 'غراس لتنظيم وتنسيق الحفلات' : 'Grass Floral & Wedding Design'}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold">
                      {isRtl ? 'نحول كل لحظة إلى ذكرى خالدة' : 'Crafting Extraordinary Moments'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. SIGNATURE EVENT SERVICES SECTION */}
          <section aria-label="Our Services" className="mb-14 sm:mb-20">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5EE] text-[#435849] border border-[#DDD3C6] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
                <Award className="w-3.5 h-3.5 text-[#8CA841]" />
                <span>{isRtl ? 'خدماتنا الاستثنائية' : 'OUR DISTINGUISHED SERVICES'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#201B18] tracking-tight">
                {isRtl ? 'حلول تنظيم متكاملة لجميع المناسبات' : 'Comprehensive Event Planning & Styling'}
              </h2>
              <p className="text-sm sm:text-base text-[#685D54] mt-2 leading-relaxed">
                {isRtl
                  ? 'من حفلات الزفاف الملكية إلى الفعاليات الرسمية، نقدم حلولاً متكاملة تضمن دقة التنظيم وجمال الديكور.'
                  : 'From royal weddings to corporate galas, our team orchestrates every element with unmatched finesse.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, idx) => {
                const IconComp = service.icon;
                return (
                  <div
                    key={service.id}
                    className={cn(
                      'group relative bg-white rounded-3xl overflow-hidden border border-[#EBE3D5] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 hover:-translate-y-1',
                      idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                    )}
                  >
                    <div>
                      {/* Top Row: Badge */}
                      <div className="flex items-center justify-start mb-3">
                        <span className="text-xs font-extrabold text-[#8CA841] tracking-widest uppercase">
                          {service.badge[locale]}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-extrabold text-[#201B18] mb-2.5 group-hover:text-[#435849] transition-colors">
                        {service.title[locale]}
                      </h3>

                      <p className="text-sm sm:text-base text-[#685D54] leading-relaxed mb-6">
                        {service.desc[locale]}
                      </p>
                    </div>

                    {/* Image Preview */}
                    <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden mt-auto">
                      <Image
                        src={service.image}
                        alt={service.title[locale]}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. 4-STEP PROCESS JOURNEY */}
          <section aria-label="Planning Process" className="mb-14 sm:mb-20 bg-[#FAF5EE] rounded-3xl p-8 sm:p-12 lg:p-14 border border-[#E8DFC0]">
            <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
              <span className="text-xs font-bold text-[#8CA841] uppercase tracking-widest block mb-2">
                {isRtl ? 'كيف نعمل معكم' : 'HOW WE WORK'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201B18]">
                {isRtl ? '٤ خطوات بسيطة لحفل أحلامكم' : '4 Steps to Your Dream Event'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((st) => (
                <div key={st.step} className="bg-white rounded-2xl p-6 border border-[#E4DACD] shadow-2xs text-start relative">
                  <span className="text-2xl font-serif font-black text-[#8CA841]/40 block mb-3">
                    {st.step}
                  </span>
                  <h4 className="text-base font-extrabold text-[#201B18] mb-2">
                    {st.title[locale]}
                  </h4>
                  <p className="text-xs text-[#685D54] leading-relaxed">
                    {st.desc[locale]}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. INTERACTIVE BOOKING FORM */}
          <section id="booking-form" className="scroll-mt-24">
            <EventBookingForm locale={locale} />
          </section>
        </div>
      </div>
    </>
  );
}
