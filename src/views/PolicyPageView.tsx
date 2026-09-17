import React from 'react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export type PolicyType = 'privacy' | 'terms' | 'shipping' | 'returns';

interface PolicyPageViewProps {
  type: PolicyType;
  locale: Locale;
}

export function PolicyPageView({ type, locale }: PolicyPageViewProps) {
  const dict = getDictionary(locale);

  const titles: Record<PolicyType, string> = {
    privacy: dict.policies.privacyTitle,
    terms: dict.policies.termsTitle,
    shipping: dict.policies.shippingTitle,
    returns: dict.policies.returnsTitle,
  };

  const breadcrumbItems = [
    { label: dict.nav.home, href: locale === 'ar' ? '/' : '/en' },
    { label: titles[type] },
  ];

  const policyContent: Record<PolicyType, { ar: string[]; en: string[] }> = {
    privacy: {
      ar: [
        'نحن في بوتيك غراس فلوريست نلتزم بأعلى معايير حماية وخصوصية بيانات عملائنا وفق الأنظمة واللوائح المعمول بها في المملكة العربية السعودية.',
        'نقوم بجمع البيانات الضرورية فقط لإتمام وتنفيذ وتوصيل الطلبات، مثل الاسم، رقم الهاتف، وعنوان التوصيل.',
        'في حال اختيارك إرسال الهدية كـ "مجهول الهوية"، نضمن عدم الإفصاح عن هويتك أو رقم هاتفك للمستلم تحت أي ظرف.',
        'نستخدم بروتوكولات تشفير SSL/TLS المتقدمة لضمان أمان جميع العمليات المالية والبيانات البنكية، ولا نقوم بتخزين أي معلومات متعلقة بأرقام البطاقات الائتمانية على خوادمنا.',
      ],
      en: [
        'At Grass Florist Luxury Floral Atelier, we are committed to upholding the highest standards of data security and privacy in accordance with Saudi Arabian regulations.',
        'We collect only the essential personal details required to coordinate, assemble, and deliver your orders with utmost care.',
        'If you elect to send your gift anonymously, we strictly protect and withhold your identity and contact information from the recipient.',
        'All payment transactions are encrypted using enterprise SSL/TLS protocols. We never store sensitive debit or credit card credentials on our servers.',
      ],
    },
    terms: {
      ar: [
        'تحدد هذه الشروط والأحكام القواعد العامة لاستخدام متجر غراس فلوريست الإلكتروني وإتمام طلبات الشراء.',
        'تخضع جميع الزهور الطبيعية لتوفر المواسم الزراعية؛ وفي حال تعذر توفر صنف معين، يلتزم منسقونا باستبداله بصنف ذي قيمة وجودة مساوية أو أعلى مع الحفاظ على التدرج اللوني وشكل الباقة الأصلي.',
        'يتم تأكيد الطلب فور إتمام عملية الدفع بنجاح أو اختيار الدفع عند الاستلام وفق الشروط المحددة.',
        'تحتفظ غراس فلوريست بكافة حقوق الملكية الفكرية والعلامات التجارية والتصاميم والصور المعروضة على الموقع.',
      ],
      en: [
        'These terms govern the use of Grass Florist online boutique services and all purchasing agreements.',
        'Fresh flower varieties are subject to seasonal grower availability. In the rare event a specific stem is unavailable, our master florists substitute with blooms of equal or greater prestige while honoring original palette harmony.',
        'Orders are formally confirmed upon successful payment verification or selection of approved Cash on Delivery terms.',
        'Grass Florist retains full intellectual property, trademark, and aesthetic rights over all content and designs presented on this platform.',
      ],
    },
    shipping: {
      ar: [
        'نوفر خدمة التوصيل المبرد الفوري في نفس اليوم خلال ساعتين إلى ثلاث ساعات في الرياض وجدة والخبر والدمام.',
        'تُنقل جميع الباقات في سيارات مكيفة خصيصاً ومزودة بأنظمة تبريد تحافظ على حرارة ما بين 16 إلى 18 درجة مئوية لحماية بتلات الزهور من حرارة الطقس الخارجية.',
        'رسوم التوصيل السريع هي 35 ر.س، وتكون مجانية تماماً لأي طلب تتجاوز قيمته 250 ر.س.',
        'يمكن للعميل جدولة موعد وتاريخ التوصيل بدقة واختيار الفترة الصباحية، الظهيرة، أو المسائية المناسبة.',
      ],
      en: [
        'We provide express same-day climate-controlled delivery within 2 to 3 hours across Riyadh, Jeddah, Khobar, and Dammam.',
        'All arrangements travel in refrigerated fleet vehicles regulated between 16°C and 18°C, shielding delicate blossoms from ambient heat.',
        'Standard express delivery is 35 SAR, and completely complimentary on all qualifying orders exceeding 250 SAR.',
        'Clients can schedule exact future delivery dates and select preferred morning, afternoon, or evening delivery intervals.',
      ],
    },
    returns: {
      ar: [
        'نظراً للطبيعة الحساسة للزهور الطبيعية والمأكولات الطازجة، لا يمكن إرجاع الباقات بعد استلامها بحالة سليمة ومطابقة للمواصفات.',
        'نقدم ضمان نضارة ذهبي لمدة 7 أيام: إذا ذبلت زهورك بشكل غير طبيعي أو كان هناك أي تلف ناتج عن النقل، يرجى التواصل معنا خلال 24 ساعة وسنقوم باستبدال الباقة فوراً أو إعادة قيمتها بالكامل.',
        'يمكن إلغاء الطلب واسترداد المبلغ بالكامل قبل بدء خبير التنسيق بتجهيز وقص الزهور (خلال 30 دقيقة من الطلب).',
      ],
      en: [
        'Due to the perishable nature of fresh botanical arrangements and gourmet confections, returns are not accepted once delivered in pristine condition.',
        'We uphold a 7-Day Freshness Guarantee: If stems display premature wilting despite recommended care guidelines, report within 24 hours for immediate complimentary replacement or full reimbursement.',
        'Orders may be cancelled for a 100% refund prior to floral stem trimming and physical arrangement (within 30 minutes of placement).',
      ],
    },
  };

  return (
    <div className="py-6 bg-surface min-h-[80vh]">
      <div className="max-w-[800px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        <div className="my-8 text-start">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main mb-2">
            {titles[type]}
          </h1>
          <span className="text-xs text-text-muted">
            {dict.policies.lastUpdated}: 2026-03-14
          </span>
        </div>

        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border space-y-4 text-start leading-relaxed text-xs sm:text-sm text-text-secondary">
          {policyContent[type][locale].map((para, idx) => (
            <p key={idx} className="pb-3 border-b border-border/50 last:border-0 last:pb-0">
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
