import React from 'react';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

export type PolicyType = 'privacy' | 'terms' | 'shipping' | 'returns';

interface PolicyPageViewProps {
  type: PolicyType;
  locale: Locale;
}

interface PolicySection {
  title?: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
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

  const privacySectionsAr: PolicySection[] = [
    {
      title: '1. خصوصيتك أمر في غاية الأهمية لدى GRASS',
      paragraphs: [
        'في Grass Florist، نحترم خصوصيتك ونضعها في صميم كل ما نقوم به.',
        'نقوم بجمع المعلومات الضرورية فقط لمعالجة طلبات الزهور الخاصة بك، وتحسين تجربتك الشرائية، وتقديم خدمة متميزة في جميع أنحاء المملكة العربية السعودية.',
        'نحن لا نبيع، ولا نتبادل، ولا نؤجر بياناتك لأي طرف ثالث.',
        'تُستخدم المعلومات التي تقدمها فقط لتأكيد الطلبات، وتنسيق عمليات التوصيل، وتخصيص التجربة لتسهيل عملية الإهداء وجعلها أكثر تميزاً.',
        'من خلال تصفحك لموقعنا أو إتمام عملية الشراء عبر www.grassflorist.com، فإنك توافق على سياسة الخصوصية هذه وعلى معاملة بياناتك وفقاً لقانون حماية البيانات الشخصية السعودي (PDPL).',
        'إذا كنت لا توافق على هذه البنود، يمكنك التوقف عن استخدام موقعنا في أي وقت.',
      ],
    },
    {
      title: '2. المعلومات التي نجمعها',
      paragraphs: [
        'لخدمتك بشكل أفضل وضمان توصيل الطلبات بسلاسة، قد نقوم بجمع ما يلي:',
      ],
      bullets: [
        'اسمك الكامل، عنوانك، رقم هاتفك، وبريدك الإلكتروني.',
        'تفاصيل الدفع (تُعالج بشكل آمن عبر بوابات دفع موثوقة).',
        'معلومات المستلم، مثل الاسم وعنوان التوصيل (عند إرسال الهدايا).',
        'البيانات التقنية مثل عنوان الـ IP، ونوع المتصفح، وسلوك التصفح على موقعنا.',
      ],
      note: 'تُساعدنا هذه المعلومات في إدارة الطلبات بكفاءة، وتحسين الأداء، وتعزيز تجربة المستخدم بشكل عام. يتم جمع جميع البيانات بشفافية وموافقتك الصريحة.',
    },
    {
      title: '3. كيفية استخدامنا للمعلومات',
      paragraphs: [
        'نستخدم المعلومات التي نجمعها لتقديم تجربة خدمة سهلة وموثوقة وشخصية.',
        'وبشكل خاص، تُساعدنا بياناتك في:',
      ],
      bullets: [
        'تأكيد الطلبات ومعالجتها وتوصيلها في الوقت المحدد.',
        'تقديم الدعم الفني وخدمة العملاء.',
        'تحسين تصميم الموقع وسرعته وتجربة المستخدم العامة.',
        'إرسال تحديثات حول الطلبات والعروض الجديدة (في حال وافقت على تلقيها).',
        'الوفاء بالالتزامات القانونية والمالية.',
      ],
      note: 'قد نشارك بعض المعلومات المحدودة مع مزودي الخدمات الموثوقين مثل شركات التوصيل أو بوابات الدفع، وجميعهم ملتزمون باتفاقيات سرية وحماية بيانات صارمة.',
    },
    {
      title: '4. أمان البيانات',
      paragraphs: [
        'نطبق إجراءات حماية رقمية قوية لضمان بقاء معلوماتك آمنة وسرية.',
      ],
      bullets: [
        'يتم تأمين جميع مسارات نقل البيانات عبر تشفير SSL.',
        'تتم معالجة بيانات الدفع حصرياً عبر بوابات دفع آمنة ومعتمدة.',
        'يتم تقييد الوصول إلى البيانات الشخصية على الموظفين المصرّح لهم والمعنيين فقط.',
      ],
      note: 'نقوم بمراجعة أنظمتنا وتحديثها باستمرار لمنع أي وصول غير مصرح به أو إساءة استخدام. ثقتك تهمنا، ولهذا نبذل أقصى جهدنا لحماية تفاصيلك الشخصية ومعاملاتك الإلكترونية.',
    },
    {
      title: '5. الاحتفاظ بالبيانات',
      paragraphs: [
        'نحتفظ بمعلوماتك الشخصية فقط للمدة اللازمة لإتمام طلباتك، أو للوفاء بالالتزامات النظامية، أو لتحسين خدمات الدعم.',
        'عند انتهاء الحاجة إلى هذه المعلومات، نقوم بحذفها أو إخفاء هويتها بشكل آمن لحماية خصوصيتك.',
        'قد تختلف فترة الاحتفاظ بحسب نوع البيانات والمتطلبات القانونية في المملكة العربية السعودية.',
        'سياسة الاحتفاظ لدينا تتماشى مع أفضل الممارسات في الصناعة ومعايير قانون حماية البيانات الشخصية السعودي (PDPL) لضمان عدم الاحتفاظ بالمعلومات لفترة أطول من اللازم.',
      ],
    },
    {
      title: '6. حقوق المستخدم',
      paragraphs: [
        'أنت صاحب القرار الكامل بشأن بياناتك.',
        'وفقاً لقانون حماية البيانات الشخصية السعودي (PDPL)، لديك الحق في:',
      ],
      bullets: [
        'الوصول إلى المعلومات الشخصية التي نحتفظ بها عنك.',
        'طلب تصحيح أو حذف أي بيانات غير دقيقة.',
        'سحب موافقتك على الرسائل التسويقية في أي وقت.',
        'الاستفسار عن كيفية جمع بياناتك واستخدامها.',
      ],
      note: 'لأي طلبات تتعلق بالخصوصية، يمكنك التواصل معنا عبر البريد الإلكتروني: info@grassflorist.com. نلتزم بالرد على جميع الطلبات في أسرع وقت ممكن، ووفق اللوائح المعمول بها في المملكة.',
    },
    {
      title: '7. تحديثات سياسة الخصوصية',
      paragraphs: [
        'نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر لتعكس التقنيات الجديدة أو التحسينات في خدماتنا أو المتطلبات القانونية. عند إجراء أي تعديل، سنقوم بتحديث تاريخ "آخر تحديث" أعلى هذه الصفحة. نوصيك بزيارة هذه الصفحة بانتظام للاطلاع على أحدث التغييرات المتعلقة بحماية بياناتك واستمرارك في استخدام موقعنا بعد نشر التعديلات، فإنك توافق على النسخة المحدثة من سياسة الخصوصية.',
      ],
    },
    {
      title: '8. الامتثال القانوني',
      paragraphs: [
        'تعمل Grass Florist وفقاً لأحكام قانون حماية البيانات الشخصية السعودي (PDPL) ولوائح التجارة الإلكترونية في دول مجلس التعاون الخليجي.',
        'كما نلتزم بالمعايير الدولية لحماية الخصوصية وأمن البيانات.',
        'مهمتنا هي حماية حقوقك وضمان تجربة تسوق آمنة وشفافة وموثوقة.',
        'إذا كان لديك أي استفسار حول ممارساتنا أو امتثالنا للقوانين، يمكنك التواصل معنا في أي وقت عبر البريد الإلكتروني: info@grassflorist.com.',
      ],
    },
  ];

  const privacySectionsEn: PolicySection[] = [
    {
      title: '1. Your Privacy Is Critically Important To GRASS',
      paragraphs: [
        "At Grass Florist, your privacy isn't just important, it's at the heart of everything we do.",
        'We collect only the information necessary to process your flower orders, enhance your shopping experience, and deliver exceptional service throughout Jeddah city in Saudi Arabia.',
        'We never trade, sell, or rent your data to anyone. The information you share helps us confirm orders, coordinate deliveries, and offer personalized experiences that make gift-giving easier and more meaningful.',
        'By continuing to browse or make a purchase on www.grassflorist.com, you agree to this Privacy Policy and to data handling in line with the Saudi Personal Data Protection Law (PDPL).',
        'If you do not consent to these terms, you may choose to stop using our website.',
      ],
    },
    {
      title: '2. Information We Collect',
      paragraphs: [
        'To serve you better and ensure smooth order delivery, we may collect:',
      ],
      bullets: [
        'Your name, address, phone number, and email',
        'Payment details (processed through secure third-party gateways)',
        'Recipient information, such as their name and delivery address (when sending gifts)',
        'Technical data, including IP address, browser type, and browsing behavior on our site',
      ],
      note: 'This information allows us to manage orders efficiently, track performance, and enhance the overall customer experience. All data is collected transparently, with your consent.',
    },
    {
      title: '3. How We Use The Information',
      paragraphs: [
        'We use the information you provide to deliver an easy, reliable, and personalized service experience. Specifically, your data helps us:',
      ],
      bullets: [
        'Confirm, process, and deliver your flower orders.',
        'Provide customer support and resolve inquiries.',
        'Improve our website’s design, speed, and user experience.',
        'Send updates on orders, payments, or new collections (only if you choose to receive them)',
        'Fulfill legal and financial obligations.',
      ],
      note: 'We may share limited information with trusted service providers such as delivery partners or payment processors who operate under strict confidentiality and data protection standards.',
    },
    {
      title: '4. Data Security',
      paragraphs: [
        'We implement strong digital safeguards to ensure your information remains safe and private.',
      ],
      bullets: [
        'All data transfers are protected by SSL encryption.',
        'Payment data is handled exclusively by verified and secure gateways.',
        'Internal access to personal information is limited to trained, authorized employees.',
      ],
      note: 'We routinely review and upgrade our systems to prevent unauthorized access or misuse. Your trust matters to us, and we go the extra mile to keep your transactions and personal details secure.',
    },
    {
      title: '5. Data Retention',
      paragraphs: [
        'We retain your information only for as long as necessary to complete your orders, meet regulatory requirements, or provide enhanced customer support.',
        'Once the information is no longer required, it is securely deleted or anonymized to protect your privacy. Retention timelines may vary depending on the type of data and Saudi legal obligations.',
        'Our retention policy aligns with industry best practices and Saudi PDPL standards, ensuring your data is never kept longer than necessary.',
      ],
    },
    {
      title: '6. User Rights',
      paragraphs: [
        'You are always in control of your data. Under the Saudi PDPL, you have the right to:',
      ],
      bullets: [
        'Access the personal information we store about you.',
        'Request corrections or deletions of inaccurate data.',
        'Withdraw consent for marketing communications.',
        'Ask how your data is being collected and used.',
      ],
      note: 'For any privacy-related request, please contact info@grassflorist.com, and our support team will respond promptly. We value your right to transparency and are committed to maintaining open communication regarding your privacy.',
    },
    {
      title: '7. Updates To The Privacy Policy',
      paragraphs: [
        'As our services evolve, this Privacy Policy may be updated to reflect new technologies, business improvements, or changes in applicable laws and regulations.',
        'Whenever we make updates, we will revise the “Last Updated” date at the top of this page.',
        'We encourage you to review this page periodically to stay informed about how we protect your data.',
        'By continuing to use our website after changes are posted, you acknowledge and accept the updated version of our Privacy Policy.',
      ],
    },
    {
      title: '8. Legal Compliance',
      paragraphs: [
        'Grass Florist operates in full compliance with the Saudi Personal Data Protection Law (PDPL) and related GCC eCommerce regulations.',
        'We also follow internationally recognized standards of privacy and data security.',
        'Our mission is to protect your privacy rights while offering a safe, transparent, and trustworthy shopping experience.',
        'If you have any questions about our compliance practices or this policy, please contact us anytime at info@grassflorist.com.',
      ],
    },
  ];

  const returnsSectionsAr: PolicySection[] = [
    {
      title: 'مرحبًا بكم في غراس فلوريست',
      paragraphs: [
        'نحرص على رضاكم الكامل وسعادتكم بكل طلب. نظرًا لأننا نقدم منتجات طبيعية وسريعة التلف (كالزهور والنباتات)، فإن سياسة الاسترجاع والاسترداد لدينا تختلف قليلاً عن سياسات المنتجات الأخرى. نرجو قراءة الشروط بعناية قبل إتمام الطلب.',
      ],
    },
    {
      title: '1. الزهور والنباتات الطبيعية',
      paragraphs: [
        'جميع تنسيقات الزهور والنباتات لدينا تُحضّر خصيصًا لكل طلب. لذلك، لا يمكننا قبول الإرجاع أو الاستبدال في حال تغيير الرأي أو عدم الرغبة بالمنتج بعد تجهيزه أو تسليمه.',
        'ومع ذلك، إذا وصلت الزهور أو النباتات تالفة أو ذابلة أو مختلفة بشكل واضح عن المواصفات المطلوبة، سنقوم بمراجعة الحالة وتقديم التعويض المناسب.',
      ],
    },
    {
      title: '2. الحالات المؤهلة للاسترداد أو الاستبدال',
      paragraphs: [
        'يحق لك طلب استرداد أو استبدال في الحالات التالية فقط:',
      ],
      bullets: [
        'المنتج تعرّض للتلف أثناء التوصيل.',
        'تم تسليم منتج خاطئ.',
        'المنتج مختلف بشكل ملحوظ عن الوصف أو الصورة المعروضة.',
      ],
      note: 'للتأهل للاستبدال أو الاسترداد:\n1. يجب التواصل معنا خلال 24 ساعة من استلام الطلب.\n2. إرسال صور واضحة للمنتج والتغليف.\n3. تزويدنا بـ رقم الطلب وتاريخ التوصيل ومعلومات التواصل.\n* الطلبات المقدمة بعد 24 ساعة قد لا تكون مؤهلة، نظرًا لطبيعة الزهور القابلة للتلف.',
    },
    {
      title: '3. عملية الاسترداد',
      paragraphs: [
        'بعد مراجعة الطلب والموافقة عليه:',
      ],
      bullets: [
        'يمكنك اختيار استبدال المنتج بآخر مماثل أو استرداد المبلغ إلى وسيلة الدفع الأصلية.',
        'تتم معالجة الاسترداد عادةً خلال 5 إلى 10 أيام عمل بعد الموافقة.',
        'قد يتم استرداد جزء من المبلغ إذا كان جزء من الطلب سليمًا أو إذا كان الخلل بسيطًا.',
      ],
    },
    {
      title: '4. سياسة الإلغاء',
      bullets: [
        'قبل التجهيز أو الإرسال: يمكن إلغاء الطلب واسترداد المبلغ بالكامل إذا تم الإلغاء قبل تجهيز الطلب أو شحنه.',
        'بعد الإرسال: بمجرد خروج الطلب من المتجر أو تجهيزه للتوصيل، لا يمكن إلغاؤه أو استرداد قيمته.',
        'إذا كان عنوان التوصيل غير صحيح أو غير مكتمل، لا يمكننا استرداد رسوم التوصيل.',
      ],
    },
    {
      title: '5. الاستبدال في حال نفاد بعض الأصناف',
      paragraphs: [
        'نظرًا لتوفر الزهور حسب الموسم، قد نضطر أحيانًا إلى استبدال بعض الأنواع بأخرى مماثلة من نفس القيمة أو أعلى لضمان توصيل الطلب في الوقت المحدد. هذا الإجراء لا يُعتبر خطأ أو سببًا للاسترداد.',
      ],
    },
    {
      title: '6. الحالات غير المؤهلة للاسترداد',
      bullets: [
        'الطلبات الخاصة أو تجهيزات المناسبات (مثل حفلات الزفاف والمناسبات الكبرى).',
        'الزهور أو النباتات التي تم استلامها منذ أكثر من 24 ساعة دون الإبلاغ عن مشكلة.',
        'الطلبات التي تحتوي على معلومات توصيل غير صحيحة مقدمة من العميل.',
      ],
    },
    {
      title: '7. كيفية تقديم طلب استرداد',
      paragraphs: [
        'للتقديم على طلب استرداد أو استبدال، يرجى التواصل معنا عبر البريد الإلكتروني: info@grassflorist.com',
        'يرجى تزويدنا بالمعلومات التالية:',
      ],
      bullets: [
        'رقم الطلب.',
        'تاريخ التوصيل.',
        'وصف دقيق للمشكلة.',
        'صور واضحة للزهور المستلمة.',
      ],
      note: 'سيقوم فريق خدمة العملاء بالرد خلال 24 إلى 48 ساعة.',
    },
    {
      title: '8. تحديثات السياسة',
      paragraphs: [
        'تحتفظ غراس فلوريست بالحق في تعديل هذه السياسة في أي وقت لتتوافق مع التغييرات التشغيلية أو المتطلبات القانونية. سيتم نشر أي تحديثات جديدة على هذه الصفحة.',
      ],
    },
    {
      title: 'التزامنا',
      paragraphs: [
        'نحن في غراس فلوريست نؤمن أن كل باقة زهور تعبر عن مشاعر جميلة. نعدكم بالجودة والاهتمام بكل التفاصيل، ونسعى دائمًا لحل أي مشكلة بطريقة تضمن رضاكم الكامل.',
        'شكرًا لاختياركم غراس فلوريست لتكون وجهتكم في عالم الزهور والجمال الطبيعي.',
      ],
    },
  ];

  const returnsSectionsEn: PolicySection[] = [
    {
      title: 'Welcome to Grass Florist',
      paragraphs: [
        'We are dedicated to ensuring your complete delight with every order. Because our fresh flowers and living plants are naturally perishable, our Returns and Refunds policy is tailored specifically for botanical creations. Please review these terms carefully prior to placing your order.',
      ],
    },
    {
      title: '1. Fresh Flowers & Perishable Botanicals',
      paragraphs: [
        'All floral arrangements and plant creations are bespoke and prepared on-demand. Therefore, returns or exchanges due to change of mind cannot be accepted once prepared or delivered.',
        'However, if your blooms arrive damaged, wilted, or noticeably different from requested specifications, our concierge will review the case promptly to provide fair compensation.',
      ],
    },
    {
      title: '2. Eligible Cases for Refund or Replacement',
      paragraphs: ['You are entitled to request a replacement or refund strictly in the following cases:'],
      bullets: [
        'The product was damaged during transit.',
        'An incorrect item was delivered.',
        'The product differs substantially from the description or imagery displayed.',
      ],
      note: 'To qualify for replacement or refund:\n1. Contact us within 24 hours of delivery.\n2. Provide clear photos of the product and packaging.\n3. Include your Order Number, delivery date, and contact info.\n* Requests submitted after 24 hours may not qualify due to the perishable nature of fresh flowers.',
    },
    {
      title: '3. Refund Process',
      paragraphs: ['Following review and claim approval:'],
      bullets: [
        'You may choose a complimentary replacement or a full refund to your original payment method.',
        'Refund processing typically takes 5 to 10 business days depending on banking channels.',
        'Partial refunds may be issued if only a component of the order was affected.',
      ],
    },
    {
      title: '4. Cancellation Policy',
      bullets: [
        'Prior to Preparation: Full refund if cancelled before floral stem cutting and dispatch preparation.',
        'Post Dispatch: Once your order leaves our atelier or is routed with delivery drivers, cancellations or refunds cannot be accepted.',
        'If delivery fails due to an invalid or incomplete recipient address, delivery charges are non-refundable.',
      ],
    },
    {
      title: '5. Seasonal Stem Substitutions',
      paragraphs: [
        'Due to seasonal harvest variations, master florists may occasionally substitute select blooms with stems of equal or greater value to preserve design integrity and ensure on-time delivery. Such substitutions are not considered defects or grounds for refunds.',
      ],
    },
    {
      title: '6. Non-Refundable Situations',
      bullets: [
        'Bespoke event installations and large-scale celebrations (weddings, galas).',
        'Flowers or plants received over 24 hours prior without reported issues.',
        'Orders containing incorrect or incomplete delivery details provided by the customer.',
      ],
    },
    {
      title: '7. How to Submit a Claim',
      paragraphs: [
        'To submit a refund or replacement request, please email info@grassflorist.com with the following details:',
      ],
      bullets: [
        'Order Number.',
        'Delivery Date.',
        'Detailed description of the issue.',
        'High-resolution photos of the delivered flowers.',
      ],
      note: 'Our customer care team will respond within 24 to 48 hours.',
    },
    {
      title: '8. Policy Updates',
      paragraphs: [
        'Grass Florist reserves the right to amend this policy at any time to reflect operational or legal requirements. Updates will be posted on this page.',
      ],
    },
    {
      title: 'Our Commitment',
      paragraphs: [
        'At Grass Florist, we believe every bouquet carries precious emotions. We promise artisanal quality, meticulous care, and a dedicated team committed to your absolute satisfaction.',
        'Thank you for choosing Grass Florist as your destination in the world of fresh flowers and natural elegance.',
      ],
    },
  ];

  const standardPolicies: Record<'terms' | 'shipping', { ar: string[]; en: string[] }> = {
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
        'نوفر خدمة التوصيل المبرد الفوري في نفس اليوم داخل مدينة جدة وجميع مدن المملكة الرئيسية.',
        'تُنقل جميع الباقات في سيارات مكيفة خصيصاً ومزودة بأنظمة تبريد تحافظ على نضارة بتلات الزهور من حرارة الطقس.',
        'رسوم التوصيل محددة بوضوح عند الدفع وتكون مجانية على الطلبات المؤهلة.',
        'يمكن للعميل جدولة موعد وتاريخ التوصيل بدقة واختيار الفترة المناسبة.',
      ],
      en: [
        'We provide express same-day climate-controlled delivery across Jeddah and major Saudi cities.',
        'All arrangements travel in refrigerated fleet vehicles shielding delicate blossoms from ambient heat.',
        'Delivery fees are clearly indicated at checkout and complimentary on eligible orders.',
        'Clients can schedule exact future delivery dates and select preferred delivery windows.',
      ],
    },
  };

  const sectionsToRender =
    type === 'privacy'
      ? locale === 'ar'
        ? privacySectionsAr
        : privacySectionsEn
      : type === 'returns'
      ? locale === 'ar'
        ? returnsSectionsAr
        : returnsSectionsEn
      : null;

  return (
    <div className="py-6 bg-surface min-h-[80vh]">
      <div className="max-w-[880px] mx-auto px-4 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} locale={locale} />

        <div className="my-8 text-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF3ED] text-[#435849] border border-[#DDD3C6] mb-3">
            <ShieldCheck className="w-4 h-4 text-[#435849]" />
            <span>{locale === 'ar' ? 'ضمان وخدمة موثوقة' : 'ASSURANCE & CARE'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main mb-2">
            {titles[type]}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted flex items-center gap-2">
            <span>{dict.policies.lastUpdated}:</span>
            <span className="font-semibold text-text-main">2026-10-06</span>
          </p>
        </div>

        {sectionsToRender ? (
          <div className="space-y-6">
            {sectionsToRender.map((sec, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E2D5C4] shadow-xs text-start space-y-3.5"
              >
                {sec.title && (
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#25211E] pb-2 border-b border-[#E2D5C4]/60">
                    {sec.title}
                  </h2>
                )}

                {sec.paragraphs &&
                  sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm sm:text-base text-[#4A4036] leading-relaxed whitespace-pre-line">
                      {p}
                    </p>
                  ))}

                {sec.bullets && (
                  <ul className="space-y-2 pt-1">
                    {sec.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-[#4A4036]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#435849] mt-2 shrink-0" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {sec.note && (
                  <div className="text-xs sm:text-sm text-[#5C524B] bg-[#FAF3ED] p-4 rounded-2xl border border-[#DDD3C6] leading-relaxed mt-3 whitespace-pre-line">
                    {sec.note}
                  </div>
                )}
              </div>
            ))}

            {/* Contact Support Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#F4ECE2] via-[#EFE7DC] to-[#EAE0D3] border border-[#DDD3C6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-start">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#25211E] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>{locale === 'ar' ? 'هل تحتاج إلى مساعدة أو تقديم طلب استرداد؟' : 'Need help with a return or refund?'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#5C524B] mt-1">
                  {locale === 'ar'
                    ? 'فريق خدمة العملاء متاح للرد على استفساراتكم ومساعدتكم بكل سرور'
                    : 'Our customer support concierge is ready to assist you promptly'}
                </p>
              </div>
              <a
                href="mailto:info@grassflorist.com"
                className="px-5 py-2.5 rounded-full bg-[#201B18] text-white text-xs sm:text-sm font-bold hover:bg-[#435849] transition-colors shrink-0 shadow-xs"
              >
                info@grassflorist.com
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E2D5C4] space-y-4 text-start leading-relaxed text-sm sm:text-base text-[#4A4036]">
            {standardPolicies[type as 'terms' | 'shipping'][locale].map((para, idx) => (
              <p key={idx} className="pb-3 border-b border-[#E2D5C4]/50 last:border-0 last:pb-0">
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


