export interface CookieItem {
  name: string;
  duration: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
}

export interface ConsentCategory {
  id: 'necessary' | 'functional' | 'analytics' | 'performance' | 'advertisement' | 'uncategorized';
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  alwaysActive?: boolean;
  defaultChecked?: boolean;
  cookies?: CookieItem[];
}

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  performance: boolean;
  advertisement: boolean;
  uncategorized: boolean;
  updatedAt: string;
}

export const COOKIE_CONSENT_KEY = 'grass_cookie_consent_preferences';

export const COOKIE_CATEGORIES: ConsentCategory[] = [
  {
    id: 'necessary',
    title: {
      en: 'Necessary',
      ar: 'ضرورية',
    },
    description: {
      en: 'Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data.',
      ar: 'ملفات تعريف الارتباط الضرورية مطلوبة لتمكين الميزات الأساسية لهذا الموقع، مثل توفير تسجيل دخول آمن أو ضبط تفضيلات موافقتك. لا تقوم ملفات تعريف الارتباط هذه بتخزين أي بيانات شخصية محددة للهوية.',
    },
    alwaysActive: true,
    cookies: [
      {
        name: 'cookieyes-consent',
        duration: { en: '1 year', ar: 'سنة واحدة' },
        description: {
          en: "CookieYes sets this cookie to remember users' consent preferences so that their preferences are respected on subsequent visits to this site. It does not collect or store any personal information about the site visitors.",
          ar: 'يقوم CookieYes بتعيين ملف تعريف الارتباط هذا لتذكر تفضيلات موافقة المستخدمين بحيث يتم احترام تفضيلاتهم في الزيارات اللاحقة للموقع. لا يجمع أو يخزن أي معلومات شخصية.',
        },
      },
      {
        name: 'rc::a',
        duration: { en: 'Never Expires', ar: 'لا تنتهي صلاحيته' },
        description: {
          en: 'This cookie is set by the Google recaptcha service to identify bots to protect the website against malicious spam attacks.',
          ar: 'يتم تعيين ملف تعريف الارتباط هذا بواسطة خدمة Google reCAPTCHA لتحديد الروبوتات وحماية الموقع من الهجمات العشوائية.',
        },
      },
      {
        name: 'rc::c',
        duration: { en: 'session', ar: 'جلسة العمل' },
        description: {
          en: 'This cookie is set by the Google recaptcha service to identify bots to protect the website against malicious spam attacks.',
          ar: 'يتم تعيين ملف تعريف الارتباط هذا بواسطة خدمة Google reCAPTCHA لحماية الموقع ضد الهجمات العشوائية وحظر الروبوتات.',
        },
      },
      {
        name: 'woocommerce_items_in_cart',
        duration: { en: 'session', ar: 'جلسة العمل' },
        description: {
          en: 'WooCommerce sets this cookie to record if there are any items in the WooCommerce shopping cart.',
          ar: 'يتم تعيين هذا الملف لمعرفة وتتبع ما إذا كانت هناك أي عناصر موجودة في سلة التسوق.',
        },
      },
      {
        name: 'woocommerce_cart_hash',
        duration: { en: 'session', ar: 'جلسة العمل' },
        description: {
          en: 'WooCommerce sets this cookie to determine when cart contents/data changes.',
          ar: 'يحدد متى تتغير محتويات أو بيانات سلة التسوق الخاصة بالعميل.',
        },
      },
      {
        name: 'wp_woocommerce_session_*',
        duration: { en: '2 days', ar: 'يومان' },
        description: {
          en: 'WooCommerce sets this cookie to make a unique code for each customer so that it knows where to find the cart data in the database for each one.',
          ar: 'ينشئ كوداً فريداً لكل عميل حتى يتعرف النظام على سلة التسوق الخاصة به في قاعدة البيانات.',
        },
      },
      {
        name: '_cfuvid',
        duration: { en: 'session', ar: 'جلسة العمل' },
        description: {
          en: 'Calendly sets this cookie to track users across sessions to optimize user experience by maintaining session consistency and providing personalized services',
          ar: 'يُستخدم لتتبع المستخدمين عبر الجلسات لتحسين تجربة المستخدم والحفاظ على اتساق الجلسة.',
        },
      },
    ],
  },
  {
    id: 'functional',
    title: {
      en: 'Functional',
      ar: 'وظيفية',
    },
    description: {
      en: 'Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.',
      ar: 'تساعد ملفات تعريف الارتباط الوظيفية في أداء وظائف معينة مثل مشاركة محتوى الموقع على منصات وسائل التواصل الاجتماعي وجمع التعليقات وميزات الجهات الخارجية الأخرى.',
    },
    defaultChecked: true,
  },
  {
    id: 'analytics',
    title: {
      en: 'Analytics',
      ar: 'تحليلية',
    },
    description: {
      en: 'Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.',
      ar: 'تُستخدم ملفات تعريف الارتباط التحليلية لفهم كيفية تفاعل الزوار مع الموقع. وتساعد في توفير مقاييس مثل عدد الزوار ومعدل الارتداد ومصدر الزيارات وغيرها.',
    },
    defaultChecked: true,
    cookies: [
      {
        name: '_fbp',
        duration: { en: '3 months', ar: '3 أشهر' },
        description: {
          en: 'Facebook sets this cookie to display advertisements when either on Facebook or on a digital platform powered by Facebook advertising after visiting the website.',
          ar: 'تستخدم فيسبوك هذا الملف لعرض الإعلانات ذات الصلة عند زيارة المنصة أو الشبكات الإعلانية التابعة لها.',
        },
      },
      {
        name: 'sbjs_migrations',
        duration: { en: 'session', ar: 'جلسة العمل' },
        description: {
          en: 'Sourcebuster sets this cookie to identify the source of a visit and stores user action information in cookies. This analytical and behavioural cookie is used to enhance the visitor experience on the website.',
          ar: 'يحدد مصدر الزيارة ويخزن بيانات تفاعل المستخدم لتحسين التجربة التحليلية والسلوكية.',
        },
      },
      {
        name: 'sbjs_current_add',
        duration: { en: 'session', ar: 'جلسة العمل' },
        description: {
          en: 'Sourcebuster sets this cookie to identify the source of a visit and stores user action information in cookies. This analytical and behavioural cookie is used to enhance the visitor experience on the website.',
          ar: 'يحدد مصدر وتفاصيل الزيارة الحالية لأغراض تحليلية.',
        },
      },
      {
        name: 'sbjs_first_add',
        duration: { en: 'session', ar: 'جلسة العمل' },
        description: {
          en: 'Sourcebuster sets this cookie to identify the source of a visit and stores user action information in cookies. This analytical and behavioural cookie is used to enhance the visitor experience on the website.',
          ar: 'يحدد مصدر الزيارة الأولى لأغراض الإحصاء ومتابعة حركة المرور.',
        },
      },
      {
        name: 'sbjs_current',
        duration: { en: 'session', ar: 'جلسة العمل' },
        description: {
          en: 'Sourcebuster sets this cookie to identify the source of a visit and stores user action information in cookies. This analytical and behavioural cookie is used to enhance the visitor experience on the website.',
          ar: 'يسجل بيانات الجلسة الحالية وتصرفات الزائر لتحسين أداء الموقع.',
        },
      },
      {
        name: 'sbjs_first',
        duration: { en: 'session', ar: 'جلسة العمل' },
        description: {
          en: 'Sourcebuster sets this cookie to identify the source of a visit and stores user action information in cookies. This analytical and behavioural cookie is used to enhance the visitor experience on the website.',
          ar: 'يخزن معلومات الزيارة الأولى لتحليل مسار تصفح المستخدمين.',
        },
      },
      {
        name: 'sbjs_udata',
        duration: { en: 'session', ar: 'جلسة العمل' },
        description: {
          en: 'Sourcebuster sets this cookie to identify the source of a visit and stores user action information in cookies. This analytical and behavioural cookie is used to enhance the visitor experience on the website.',
          ar: 'يخزن بيانات الزائر الفنية لتحسين مستوى التفاعل والخدمة.',
        },
      },
      {
        name: 'sbjs_session',
        duration: { en: '1 hour', ar: 'ساعة واحدة' },
        description: {
          en: 'Sourcebuster sets this cookie to identify the source of a visit and stores user action information in cookies. This analytical and behavioural cookie is used to enhance the visitor experience on the website.',
          ar: 'يحتفظ ببيانات الجلسة السلوكية لمدة ساعة لمتابعة النشاط التحليلي.',
        },
      },
      {
        name: '_ga',
        duration: { en: '1 year 1 month 4 days', ar: 'سنة وشهر و 4 أيام' },
        description: {
          en: 'Google Analytics sets this cookie to calculate visitor, session and campaign data and track site usage for the site\'s analytics report. The cookie stores information anonymously and assigns a randomly generated number to recognise unique visitors.',
          ar: 'يستخدمه Google Analytics لحساب بيانات الزوار والجلسات والحملات وتتبع استخدام الموقع بشكل مجهول الهوية.',
        },
      },
      {
        name: '_ga_*',
        duration: { en: '1 year 1 month 4 days', ar: 'سنة وشهر و 4 أيام' },
        description: {
          en: 'Google Analytics sets this cookie to store and count page views.',
          ar: 'يقوم Google Analytics بتعيين هذا الملف لتخزين وإحصاء عدد مشاهدات الصفحات.',
        },
      },
      {
        name: '_gcl_au',
        duration: { en: '3 months', ar: '3 أشهر' },
        description: {
          en: 'Google Tag Manager sets the cookie to experiment advertisement efficiency of websites using their services.',
          ar: 'يستخدمه Google Tag Manager لقياس كفاءة الإعلانات والتحويلات التسويقية.',
        },
      },
      {
        name: 'ajs_anonymous_id',
        duration: { en: '1 year', ar: 'سنة واحدة' },
        description: {
          en: 'This cookie is set by Segment to count the number of people who visit a certain site by tracking if they have visited before.',
          ar: 'يحدد ما إذا كان الزائر قد زار الموقع مسبقاً لإحصاء عدد الزوار المميزين بدقة.',
        },
      },
    ],
  },
  {
    id: 'performance',
    title: {
      en: 'Performance',
      ar: 'الأداء',
    },
    description: {
      en: 'Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.',
      ar: 'تُستخدم ملفات تعريف الارتباط الخاصة بالأداء لفهم وتحليل مؤشرات الأداء الرئيسية للموقع، مما يساعد في تقديم تجربة مستخدم أفضل وأسرع للزوار.',
    },
    defaultChecked: true,
  },
  {
    id: 'advertisement',
    title: {
      en: 'Advertisement',
      ar: 'الإعلانات',
    },
    description: {
      en: 'Advertisement cookies are used to provide visitors with customized advertisements based on the pages you visited previously and to analyze the effectiveness of the ad campaigns.',
      ar: 'تُستخدم ملفات تعريف الارتباط الإعلانية لتزويد الزوار بإعلانات مخصصة بناءً على الصفحات التي زرتها سابقاً وتحليل فعالية الحملات الإعلانية.',
    },
    defaultChecked: true,
  },
  {
    id: 'uncategorized',
    title: {
      en: 'Uncategorized',
      ar: 'غير مصنفة',
    },
    description: {
      en: 'Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.',
      ar: 'ملفات تعريف الارتباط غير المصنفة الأخرى هي تلك التي يتم تحليلها ولم يتم تصنيفها في أي فئة محددة حتى الآن.',
    },
    defaultChecked: true,
    cookies: [
      {
        name: 'woodmart_recently_viewed_products',
        duration: { en: '7 days', ar: '7 أيام' },
        description: {
          en: 'Description is currently not available.',
          ar: 'الوصف غير متوفر حالياً.',
        },
      },
      {
        name: 'xxx111otrckid',
        duration: { en: '1 year 1 month 4 days', ar: 'سنة وشهر و 4 أيام' },
        description: {
          en: 'Description is currently not available.',
          ar: 'الوصف غير متوفر حالياً.',
        },
      },
      {
        name: '_dd_s',
        duration: { en: '15 minutes', ar: '15 دقيقة' },
        description: {
          en: 'No description available.',
          ar: 'لا يوجد وصف متاح.',
        },
      },
      {
        name: '__tld__',
        duration: { en: 'session', ar: 'جلسة العمل' },
        description: {
          en: 'Description is currently not available.',
          ar: 'الوصف غير متوفر حالياً.',
        },
      },
    ],
  },
];

export const CONSENT_TEXT = {
  en: {
    bannerTitle: 'We Value Your Privacy',
    bannerText:
      'We use cookies to help you navigate efficiently and perform certain functions. You will find detailed information about all cookies under each consent category below.',
    customize: 'Customize',
    rejectAll: 'Reject All',
    acceptAll: 'Accept All',
    savePreferences: 'Save My Preferences',
    modalTitle: 'Customize Consent Preferences',
    introP1:
      'We use cookies to help you navigate efficiently and perform certain functions. You will find detailed information about all cookies under each consent category below.',
    introP2:
      'The cookies that are categorized as "Necessary" are stored on your browser as they are essential for enabling the basic functionalities of the site.',
    introP3:
      'We also use third-party cookies that help us analyze how you use this website, store your preferences, and provide the content and advertisements that are relevant to you. These cookies will only be stored in your browser with your prior consent.',
    introP4:
      'You can choose to enable or disable some or all of these cookies but disabling some of them may affect your browsing experience.',
    showMore: 'Show more',
    showLess: 'Show less',
    alwaysActive: 'Always Active',
    cookieLabel: 'Cookie',
    durationLabel: 'Duration',
    descriptionLabel: 'Description',

    cookieSettings: 'Cookie Settings',
    cookiePreferences: 'Cookie Preferences',
  },
  ar: {
    bannerTitle: 'نحن نقدر خصوصيتك',
    bannerText:
      'نستخدم ملفات تعريف الارتباط لمساعدتك على التنقل بكفاءة وأداء وظائف معينة. ستجد معلومات مفصلة حول جميع ملفات تعريف الارتباط ضمن كل فئة موافقة أدناه.',
    customize: 'تخصيص',
    rejectAll: 'رفض الكل',
    acceptAll: 'قبول الكل',
    savePreferences: 'حفظ تفضيلاتي',
    modalTitle: 'تخصيص تفضيلات الموافقة',
    introP1:
      'نستخدم ملفات تعريف الارتباط لمساعدتك على التنقل بكفاءة وأداء وظائف معينة. ستجد معلومات مفصلة حول جميع ملفات تعريف الارتباط ضمن كل فئة موافقة أدناه.',
    introP2:
      'يتم تخزين ملفات تعريف الارتباط المصنفة كـ "ضرورية" على متصفحك لأنها ضرورية لتمكين الوظائف الأساسية للموقع.',
    introP3:
      'نستخدم أيضاً ملفات تعريف ارتباط خاصة بأطراف خارجية تساعدنا في تحليل كيفية استخدامك لهذا الموقع، وتخزين تفضيلاتك، وتقديم المحتوى والإعلانات ذات الصلة بك. سيتم تخزين هذه الملفات في متصفحك فقط بموافقتك المسبقة.',
    introP4:
      'يمكنك اختيار تمكين أو تعطيل بعض أو كل ملفات تعريف الارتباط هذه، ولكن تعطيل بعضها قد يؤثر على تجربة التصفح الخاصة بك.',
    showMore: 'أظهر المزيد',
    showLess: 'أظهر أقل',
    alwaysActive: 'نشط دائماً',
    cookieLabel: 'ملف تعريف الارتباط',
    durationLabel: 'المدة',
    descriptionLabel: 'الوصف',
    cookieSettings: 'إعدادات ملفات تعريف الارتباط',
    cookiePreferences: 'تفضيلات ملفات تعريف الارتباط',
  },
};
