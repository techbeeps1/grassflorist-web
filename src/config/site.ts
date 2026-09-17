export const siteConfig = {
  name: {
    ar: 'غراس فلوريست | بوتيك الزهور والهدايا الفاخرة',
    en: 'Grass Florist | Luxury Floral Atelier & Artisanal Gifts',
  },
  shortName: {
    ar: 'غراس فلوريست',
    en: 'Grass Florist',
  },
  description: {
    ar: 'بوتيك غراس فلوريست للزهور الفاخرة والهدايا الراقية في المملكة العربية السعودية. باقات زهور طبيعية منتقاة يدوياً، تنسيقات فخمة، شوكولاتة بلجيكية وعطور مميزة مع خدمة توصيل سريع في نفس اليوم.',
    en: 'Grass Florist — Artisanal luxury floral atelier and curated gifting boutique in Saudi Arabia. Handcrafted fresh bouquets, velvet box arrangements, Belgian chocolates and bespoke perfumes with express same-day delivery.',
  },
  url: 'https://grassflorist.com',
  defaultLocale: 'ar',
  locales: ['ar', 'en'] as const,
  currency: {
    code: 'SAR',
    symbol: {
      ar: 'ر.س',
      en: 'ر.س',
    },
  },
  contact: {
    email: 'info@grassflorist.com',
    phone: '+966 55 513 4211',
    whatsapp: '+966 55 513 4211',
    hours: {
      ar: 'يومياً من 9:00 صباحاً حتى 11:30 مساءً',
      en: 'Daily 9:00 AM – 11:30 PM AST',
    },
  },
  locations: [
    {
      id: 'jeddah',
      name: { ar: 'جدة', en: 'Jeddah' },
      address: {
        ar: '4366 شارع الكيال، حي الروضة، جدة 23434، المملكة العربية السعودية',
        en: '4366 Al Kayyal Street, Al-Rawdah District, Jeddah 23434, Saudi Arabia',
      },
      deliveryTime: { ar: 'توصيل خلال ساعتين', en: 'Delivery within 2 hours' },
    },
  ],
  socials: {
    instagram: 'https://instagram.com/grassflorist_sa',
    twitter: 'https://twitter.com/grassflorist_sa',
    facebook: 'https://facebook.com/grassflorist.sa',
    snapchat: 'https://snapchat.com/add/grassflorist_sa',
    tiktok: 'https://tiktok.com/@grassflorist_sa',
  },
  features: {
    freeShippingThreshold: 250,
    expressDeliveryFee: 35,
    vatRate: 0.15, // 15% Saudi VAT
  },
} as const;

export type SiteConfig = typeof siteConfig;
export type Locale = 'ar' | 'en';
