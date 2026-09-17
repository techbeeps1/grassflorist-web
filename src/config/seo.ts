import { siteConfig, type Locale } from './site';

export const seoConfig = {
  defaultTitle: {
    ar: 'غراس فلوريست | باقات زهور وتنسيقات هدايا فاخرة مع توصيل فوري',
    en: 'Grass Florist | Luxury Fresh Flowers & Handcrafted Gifting',
  },
  titleTemplate: {
    ar: '%s | غراس فلوريست للزهور والهدايا',
    en: '%s | Grass Florist Luxury Floral',
  },
  defaultDescription: {
    ar: 'اكتشف أرقى باقات الورد الطبيعي وتنسيقات الهدايا الفخمة من غراس فلوريست في السعودية. توصيل في نفس اليوم لجميع المناسبات مع بطاقة إهداء مخصصة وشوكولاتة فاخرة.',
    en: 'Discover curated fresh floral bouquets and luxury gifting collections from Grass Florist across Saudi Arabia. Same-day delivery for birthdays, anniversaries, and special moments.',
  },
  keywords: {
    ar: [
      'غراس فلوريست',
      'توصيل زهور الرياض',
      'توصيل ورد جدة',
      'باقات ورد طبيعي',
      'هدايا فاخرة',
      'تنسيق ورد مع شوكولاتة',
      'توصيل زهور نفس اليوم',
      'متجر زهور اونلاين',
      'بوكيه ورد عيد ميلاد',
      'هدايا ذكرى زواج',
      'نباتات داخلية فاخرة',
    ],
    en: [
      'grass florist',
      'grass flower delivery',
      'flower delivery jeddah',
      'flower delivery riyadh',
      'fresh floral bouquets',
      'luxury gifting saudi arabia',
      'same day flower delivery',
      'online flower shop',
      'birthday flower bouquet',
      'anniversary gifts',
      'luxury indoor plants',
      'belgian chocolates gift',
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'Grass Florist Luxury Floral Atelier',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Grass Florist Luxury Floral Collections',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@grassflorist_sa',
    creator: '@grassflorist_sa',
  },
};

export function getCanonicalUrl(path: string, locale: Locale): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'ar') {
    return cleanPath === '/' ? siteConfig.url : `${siteConfig.url}${cleanPath}`;
  }
  return cleanPath === '/' ? `${siteConfig.url}/en` : `${siteConfig.url}/en${cleanPath}`;
}

export function getHreflangUrls(path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const arUrl = cleanPath === '/' ? siteConfig.url : `${siteConfig.url}${cleanPath}`;
  const enUrl = cleanPath === '/' ? `${siteConfig.url}/en` : `${siteConfig.url}/en${cleanPath}`;

  return {
    ar: arUrl,
    en: enUrl,
    'x-default': arUrl,
  };
}
