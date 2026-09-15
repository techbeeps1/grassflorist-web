import { FAQItem } from '@/types/faq';

export const faqs: FAQItem[] = [
  // 1. DELIVERY
  {
    id: 'faq-01',
    category: 'delivery',
    question: {
      ar: 'كم يستغرق توصيل الطلب في الرياض وجدة والخبر؟',
      en: 'How fast is express delivery in Riyadh, Jeddah, and Khobar?',
    },
    answer: {
      ar: 'نوفر خدمة التوصيل الفوري السريع في نفس اليوم خلال ساعتين إلى ثلاث ساعات من تأكيد الطلب للطلبات داخل المدن الرئيسية (الرياض، جدة، الخبر، الدمام). كما يمكنك جدولة الطلب واختيار موعد وتاريخ محدد يناسبك أو يناسب المستلم.',
      en: 'We offer express same-day refrigerated delivery within 2 to 3 hours of order confirmation across major metropolitan areas (Riyadh, Jeddah, Khobar, and Dammam). You can also schedule advance delivery for any specific date and time slot.',
    },
  },
  {
    id: 'faq-02',
    category: 'delivery',
    question: {
      ar: 'كيف تضمنون وصول الزهور طازجة وغير ذابلة في حرارة الصيف؟',
      en: 'How do you preserve floral freshness during hot summer weather?',
    },
    answer: {
      ar: 'نمتلك أسطولاً خاصاً من سيارات النقل المجهزة بنظام تبريد حراري مدروس (درجة حرارة 16-18 مئوية)، كما يتم تزويد سيقان الزهور بكبسولات ترطيب مائية تحافظ على امتصاص الماء حتى لحظة التسليم لباب العميل أو المستلم.',
      en: 'Our entire delivery fleet is custom-fitted with temperature-regulated climate control (16–18°C). Stems are hydrated with individual water reservoirs ensuring zero wilting between our atelier and the recipient doorstep.',
    },
  },
  {
    id: 'faq-03',
    category: 'delivery',
    question: {
      ar: 'هل يمكنني إرسال الزهور كهدية مفاجئة دون معرفة العنوان الدقيق للمستلم؟',
      en: 'Can I send a surprise gift if I do not have the recipient full address?',
    },
    answer: {
      ar: 'نعم بكل تأكيد! يكفيك تزويدنا باسم المستلم ورقم جواله، وسيقوم فريق خدمة العملاء اللبق بالتواصل معه عبر الواتساب لتحديد الموقع الجغرافي المناسب وموعد الاستلام دون إفساد عنصر المفاجأة أو ذكر تفاصيل الهدية.',
      en: 'Yes! Simply provide the recipient’s name and mobile number. Our concierge will discreetly coordinate delivery location and timing via WhatsApp while keeping the nature of the gift a pleasant surprise.',
    },
  },
  {
    id: 'faq-04',
    category: 'delivery',
    question: {
      ar: 'هل يتوفر التوصيل إلى المستشفيات والفنادق وقاعات الاحتفالات؟',
      en: 'Do you deliver directly to hospitals, luxury hotels, and event venues?',
    },
    answer: {
      ar: 'نعم، نقوم بالتوصيل المباشر إلى غرف المستشفيات وأجنحة الفنادق وصالات الأفراح والمكاتب التنفيذية. يرجى تزويدنا برقم الغرفة أو اسم الجناح واسم المستلم عند إتمام الطلب.',
      en: 'Yes, we deliver directly to hospital patient rooms, luxury hotel concierges, corporate towers, and wedding venues. Please include room numbers or suite details in checkout notes.',
    },
  },

  // 2. ORDERING & CUSTOMIZATION
  {
    id: 'faq-05',
    category: 'ordering',
    question: {
      ar: 'هل يمكنني إضافة رسالة إهداء خاصة مكتوبة بخط اليد؟',
      en: 'Can I include a personalized handwritten greeting card?',
    },
    answer: {
      ar: 'نعم، نوفر مع كل باقة أو هدية بطاقة إهداء فاخرة مجانية مختومة بختم الشمع. يمكنك كتابة رسالتك أثناء إتمام الطلب وسيقوم خطاط محترف بكتابتها بخط أنيق قبل تسليم الهدية.',
      en: 'Complimentary bespoke greeting cards sealed with artisan wax are included with every order. Type your heartfelt words at checkout, and our calligrapher will handwrite them prior to delivery.',
    },
  },
  {
    id: 'faq-06',
    category: 'ordering',
    question: {
      ar: 'هل يمكن إرسال الهدية كمجهول الهوية دون الكشف عن اسمي؟',
      en: 'Is it possible to send a gift completely anonymously?',
    },
    answer: {
      ar: 'نعم، يتوفر خيار "إرسال كمجهول" عند صفحة الدفع. في هذه الحالة لن يتم ذكر اسم المرسل أو رقم هاتفه للمستلم، ونلتزم بالسرية التامة للبيانات وفق سياسة الخصوصية.',
      en: 'Yes, you can toggle the "Send Anonymously" option at checkout. We strictly protect sender identity and will never disclose your details to the recipient.',
    },
  },
  {
    id: 'faq-07',
    category: 'ordering',
    question: {
      ar: 'هل يمكنني تعديل أو إلغاء الطلب بعد تأكيده؟',
      en: 'Can I modify or cancel my order after confirmation?',
    },
    answer: {
      ar: 'يمكنك تعديل بيانات التوصيل أو نص بطاقة الإهداء أو إلغاء الطلب واسترداد المبلغ بالكامل ما دام الطلب في مرحلة "قيد الانتظار" ولم يبدأ خبير التنسيق بتجهيز وقص الزهور (خلال 30 دقيقة من الطلب).',
      en: 'Modifications to delivery details, card text, or cancellations are accepted as long as the order has not entered physical floral arrangement (within 30 minutes of placement).',
    },
  },

  // 3. FLOWER CARE
  {
    id: 'faq-08',
    category: 'flowerCare',
    question: {
      ar: 'كيف أعتني بباقة الورد لتدوم أطول فترة ممكنة؟',
      en: 'How do I care for my fresh flower bouquet to prolong its lifespan?',
    },
    answer: {
      ar: 'قص أطراف السيقان بزاوية 45 درجة بمقدار 2 سم كل يومين، ضع الزهور في ماء بارد ونظيف مع إضافة غذاء الزهور المرفق، وأبعد الفازة عن أشعة الشمس المباشرة ومصادر التكييف الحار أو البارد المباشر.',
      en: 'Trim stems diagonally at a 45-degree angle every 2 days, replenish fresh cold water enriched with the provided floral preservative packet, and position away from direct drafts and sunlight.',
    },
  },
  {
    id: 'faq-09',
    category: 'flowerCare',
    question: {
      ar: 'ما هو الورد الدائم وكم تدوم مدة بقائه؟',
      en: 'What are preserved forever roses and how long do they last?',
    },
    answer: {
      ar: 'الورد الدائم هو ورد طبيعي 100% تم قطفه في قمة تفتحه واستبدال عصارة النبات الطبيعية بمحلول عضوي غير سام يحافظ على ملمس البتلات ولونها الطبيعي لمدة تتراوح بين سنة إلى ثلاث سنوات دون الحاجة لماء أو شمس.',
      en: 'Preserved roses are 100% natural flowers harvested at peak bloom, treated with an eco-friendly biological preservation formula that retains soft petal texture and vibrancy for 1 to 3 years without watering.',
    },
  },
  {
    id: 'faq-10',
    category: 'flowerCare',
    question: {
      ar: 'كيف أعتني بنباتات الظل الداخلية مثل زنبق السلام والمونستيرا؟',
      en: 'How do I care for indoor plants such as Peace Lilies and Monsteras?',
    },
    answer: {
      ar: 'تحتاج هذه النباتات إلى إضاءة ساطعة ولكن غير مباشرة، وري معتدل عند جفاف السطح العلوي للتربة بمقدار 2-3 سم (مرة كل أسبوع إلى 10 أيام)، مع مسح أوراقها برفق بقطعة قماش مبللة لإزالة الغبار.',
      en: 'Place in medium-to-bright indirect ambient light. Water thoroughly only when the top 2-3 cm of soil feels dry (typically once every 7–10 days). Wipe broad leaves with a damp cloth occasionally.',
    },
  },

  // 4. PAYMENTS & GUARANTEE
  {
    id: 'faq-11',
    category: 'payments',
    question: {
      ar: 'ما هي طرق الدفع المتاحة على متجر فلوريل؟',
      en: 'What payment methods are supported on Florelle?',
    },
    answer: {
      ar: 'نقبل جميع وسائل الدفع الإلكترونية الآمنة: مدى (Mada)، أبل باي (Apple Pay)، فيزا وماستركارد، وخيار التقسيط عبر تابي (Tabby) على 4 دفعات ميسرة بدون أي فوائد، بالإضافة للدفع عند الاستلام.',
      en: 'We accept Mada, Apple Pay, Visa, MasterCard, Tabby (split into 4 interest-free installments), and Cash on Delivery.',
    },
  },
  {
    id: 'faq-12',
    category: 'payments',
    question: {
      ar: 'ما هو ضمان النضارة لمدة 7 أيام وكيف يعمل؟',
      en: 'What is your 7-day freshness guarantee policy?',
    },
    answer: {
      ar: 'نحن واثقون تماماً من جودة زهورنا المستوردة مباشرة من المزارع. إذا ذبلت زهورك بشكل غير طبيعي خلال 7 أيام من الاستلام رغم اتباع إرشادات العناية، سنقوم باستبدال الباقة مجاناً أو إعادة قيمتها.',
      en: 'We pride ourselves on farm-direct blooms. If your arrangement wilts prematurely within 7 days despite proper care, we will gladly replace it free of charge or issue a full refund.',
    },
  },
];
