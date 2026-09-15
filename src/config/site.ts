export const siteConfig = {
  name: {
    ar: 'غراس | بوتيك الزهور والهدايا الفاخرة',
    en: 'Grass | Luxury Floral Atelier & Artisanal Gifts',
  },
  shortName: {
    ar: 'غراس',
    en: 'Grass',
  },
  description: {
    ar: 'بوتيك الزهور الفاخرة والهدايا الراقية في المملكة العربية السعودية. باقات زهور طبيعية منتقاة يدوياً، تنسيقات فخمة، شوكولاتة بلجيكية وعطور مميزة مع خدمة توصيل سريع في نفس اليوم.',
    en: 'Artisanal luxury floral atelier and curated gifting boutique in Saudi Arabia. Handcrafted fresh bouquets, velvet box arrangements, Belgian chocolates and bespoke perfumes with express same-day delivery.',
  },
  url: 'https://florelle.com',
  defaultLocale: 'ar',
  locales: ['ar', 'en'] as const,
  currency: {
    code: 'SAR',
    symbol: {
      ar: 'ر.س',
      en: 'SAR',
    },
  },
  contact: {
    email: 'care@florelle.com',
    phone: '+966 800 124 0000',
    whatsapp: '+966 50 123 4567',
    hours: {
      ar: 'يومياً من 9:00 صباحاً حتى 11:30 مساءً',
      en: 'Daily 9:00 AM – 11:30 PM AST',
    },
  },
  locations: [
    {
      id: 'riyadh',
      name: { ar: 'الرياض', en: 'Riyadh' },
      address: { ar: 'طريق التخصصي، حي العليا، الرياض', en: 'Takhassusi St, Al Olaya, Riyadh' },
      deliveryTime: { ar: 'توصيل خلال ساعتين', en: 'Delivery within 2 hours' },
    },
    {
      id: 'jeddah',
      name: { ar: 'جدة', en: 'Jeddah' },
      address: { ar: 'طريق الملك عبدالعزيز، حي الروضة، جدة', en: 'King Abdulaziz Rd, Al Rawdah, Jeddah' },
      deliveryTime: { ar: 'توصيل خلال ساعتين', en: 'Delivery within 2 hours' },
    },
    {
      id: 'khobar',
      name: { ar: 'الخبر والدمام', en: 'Khobar & Dammam' },
      address: { ar: 'شارع الأمير فيصل بن فهد، الخبر', en: 'Prince Faisal Bin Fahd St, Al Khobar' },
      deliveryTime: { ar: 'توصيل في نفس اليوم', en: 'Same-day delivery' },
    },
  ],
  socials: {
    instagram: 'https://instagram.com/florelle_sa',
    twitter: 'https://twitter.com/florelle_sa',
    facebook: 'https://facebook.com/florelle.sa',
    snapchat: 'https://snapchat.com/add/florelle_sa',
    tiktok: 'https://tiktok.com/@florelle_sa',
  },
  features: {
    freeShippingThreshold: 250,
    expressDeliveryFee: 35,
    vatRate: 0.15, // 15% Saudi VAT
  },
} as const;

export type SiteConfig = typeof siteConfig;
export type Locale = 'ar' | 'en';
