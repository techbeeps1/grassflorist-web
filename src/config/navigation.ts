export interface NavSubItem {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  href: {
    en: string;
    ar: string;
  };
  children?: NavSubItem[];
}

export interface NavItem {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  href: {
    en: string;
    ar: string;
  };
  hasDropdown: boolean;
  dropdownType?: 'mega' | 'simple';
  subcategories?: NavSubItem[];
  featuredCard?: {
    title: { en: string; ar: string };
    desc: { en: string; ar: string };
    image: string;
    tag: { en: string; ar: string };
  };
}

export const mainNavItems: NavItem[] = [
  {
    id: 'home',
    name: {
      en: 'HOME',
      ar: 'الرئيسية',
    },
    href: {
      en: '/en',
      ar: '/',
    },
    hasDropdown: false,
  },
  {
    id: 'all-flowers',
    name: {
      en: 'ALL FLOWERS',
      ar: 'جميع الزهور',
    },
    href: {
      en: '/en/category/all-flowers',
      ar: '/category/جميع-الزهور',
    },
    hasDropdown: false,
  },
  {
    id: 'occasions',
    name: {
      en: 'OCCASIONS',
      ar: 'المناسبات',
    },
    href: {
      en: '/en/category/occasions',
      ar: '/category/المناسبات',
    },
    hasDropdown: true,
    subcategories: [
      { id: 'for-mother', name: { en: 'For Mother', ar: 'للأم' }, href: { en: '/en/category/for-mother', ar: '/category/للأم' } },
      { id: 'birthday', name: { en: 'Birthday', ar: 'عيد ميلاد' }, href: { en: '/en/category/birthday', ar: '/category/عيد-ميلاد' } },
      { id: 'for-father', name: { en: 'For Father', ar: 'للآب' }, href: { en: '/en/category/for-father', ar: '/category/للآب' } },
      { id: 'for-her', name: { en: 'For Her', ar: 'للمرأة' }, href: { en: '/en/category/for-her', ar: '/category/للمرأة' } },
      { id: 'for-him', name: { en: 'For Him', ar: 'للرجل' }, href: { en: '/en/category/for-him', ar: '/category/للرجل' } },
      { id: 'love', name: { en: 'Love', ar: 'حب' }, href: { en: '/en/category/love', ar: '/category/حب' } },
      { id: 'get-well', name: { en: 'Get well', ar: 'تمني بالشفاء' }, href: { en: '/en/category/get-well', ar: '/category/تمني-بالشفاء' } },
      { id: 'graduation', name: { en: 'Graduation', ar: 'تخرج' }, href: { en: '/en/category/graduation', ar: '/category/تخرج' } },
      { id: 'hand-bouquet', name: { en: 'Hand Bouquet', ar: 'هاند بوكيه' }, href: { en: '/en/category/hand-bouquet', ar: '/category/هاند-بوكيه' } },
      { id: 'i-am-sorry', name: { en: 'I am Sorry', ar: 'اعتذار' }, href: { en: '/en/category/i-am-sorry', ar: '/category/اعتذار' } },
      { id: 'new-baby', name: { en: 'New Baby', ar: 'مولود جديد' }, href: { en: '/en/category/new-baby', ar: '/category/مولود-جديد' } },
      { id: 'new-job', name: { en: 'New job and promotion', ar: 'وظيفة وترقية' }, href: { en: '/en/category/new-job', ar: '/category/وظيفة-وترقية' } },
    ],
    featuredCard: {
      title: { en: 'Every Special Moment', ar: 'لكل لحظة مميزة' },
      desc: { en: 'Curated artisanal flowers tailored for your cherished celebrations.', ar: 'باقات زهور طبيعية منسقة بعناية لجميع مناسباتكم السعيدة.' },
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      tag: { en: 'Same-Day Delivery', ar: 'توصيل في نفس اليوم' },
    },
  },
  {
    id: 'luxury-bouquets',
    name: {
      en: 'LUXURY BOUQUETS',
      ar: 'باقات فاخرة',
    },
    href: {
      en: '/en/category/luxury-bouquets',
      ar: '/category/باقات-فاخرة',
    },
    hasDropdown: false,
  },
  {
    id: 'fruits-bouquet',
    name: {
      en: 'FRUITS BOUQUET',
      ar: 'باقات الفواكه',
    },
    href: {
      en: '/en/category/fruits-bouquet',
      ar: '/category/باقات-الفواكه',
    },
    hasDropdown: false,
  },
  {
    id: 'hand-bouquet',
    name: {
      en: 'HAND BOUQUET',
      ar: 'هاند بوكيه',
    },
    href: {
      en: '/en/category/hand-bouquet',
      ar: '/category/هاند-بوكيه',
    },
    hasDropdown: false,
  },
  {
    id: 'cake-chocolate',
    name: {
      en: 'CAKE & CHOCOLATE',
      ar: 'كيك وشوكولاته',
    },
    href: {
      en: '/en/category/cake-chocolate',
      ar: '/category/كيك-وشوكولاته',
    },
    hasDropdown: true,
    dropdownType: 'simple',
    subcategories: [
      { id: 'chocolate', name: { en: 'Chocolate', ar: 'شوكولاته' }, href: { en: '/en/category/chocolate', ar: '/category/شوكولاته' } },
      { id: 'cake', name: { en: 'Cake', ar: 'كيك' }, href: { en: '/en/category/cake', ar: '/category/كيك' } },
      { id: 'chocolate-bouquet', name: { en: 'Chocolate Bouquet', ar: 'بوكيه شوكولاته' }, href: { en: '/en/category/chocolate-bouquet', ar: '/category/بوكيه-شوكولاته' } },
    ],
  },
  {
    id: 'balloons',
    name: {
      en: 'BALLOONS',
      ar: 'بالونات',
    },
    href: {
      en: '/en/category/balloons',
      ar: '/category/بالونات',
    },
    hasDropdown: true,
    dropdownType: 'simple',
    subcategories: [
      {
        id: 'latex-balloons',
        name: { en: 'Latex Balloons', ar: 'بالونات مطاطية' },
        href: { en: '/en/category/latex-balloons', ar: '/category/بالونات-مطاطية' },
      },
      {
        id: 'letters-balloons',
        name: { en: 'Letters Balloons', ar: 'بالونات الحروف' },
        href: { en: '/en/category/letters-balloons', ar: '/category/بالونات-الحروف' },
        children: [
          {
            id: 'golden-letters',
            name: { en: 'Golden Letters', ar: 'أحرف ذهبية' },
            href: { en: '/en/category/golden-letters', ar: '/category/أحرف-ذهبية' },
          },
          {
            id: 'silver-letters',
            name: { en: 'Silver Letters', ar: 'أحرف فضية' },
            href: { en: '/en/category/silver-letters', ar: '/category/أحرف-فضية' },
          },
        ],
      },
      {
        id: 'numbers-balloons',
        name: { en: 'Numbers Balloons', ar: 'بالونات الأرقام' },
        href: { en: '/en/category/numbers-balloons', ar: '/category/بالونات-الأرقام' },
        children: [
          {
            id: 'golden-numbers',
            name: { en: 'Golden Numbers', ar: 'أرقام ذهبية' },
            href: { en: '/en/category/golden-numbers', ar: '/category/الأرقام-الذهبية' },
          },
          {
            id: 'silver-numbers',
            name: { en: 'Silver Numbers', ar: 'أرقام فضية' },
            href: { en: '/en/category/silver-numbers', ar: '/category/أرقام-فضية' },
          },
        ],
      },
    ],
  },
  {
    id: 'about-grass',
    name: {
      en: 'ABOUT GRASS',
      ar: 'عن غراس',
    },
    href: {
      en: '/en/about',
      ar: '/about',
    },
    hasDropdown: true,
    dropdownType: 'simple',
    subcategories: [
      { id: 'about-us', name: { en: 'About Us', ar: 'من نحن' }, href: { en: '/en/about', ar: '/about' } },
      { id: 'delivery-privacy', name: { en: 'Delivery & Privacy Policy', ar: 'سياسة التوصيل والخصوصية' }, href: { en: '/en/policies/privacy', ar: '/policies/privacy' } },
      { id: 'refund-returns', name: { en: 'Refund and Returns Policy', ar: 'سياسة الاسترجاع والاستبدال' }, href: { en: '/en/policies/returns', ar: '/policies/returns' } },
      { id: 'contact-us', name: { en: 'Contact Us', ar: 'اتصل بنا' }, href: { en: '/en/contact', ar: '/contact' } },
      { id: 'blog', name: { en: 'Blog', ar: 'المدونة' }, href: { en: '/en/blog', ar: '/blog' } },
    ],
  },
];
