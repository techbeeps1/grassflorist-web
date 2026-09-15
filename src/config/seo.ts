import { siteConfig, type Locale } from './site';

export const seoConfig = {
  defaultTitle: {
    ar: 'فلوريل | باقات زهور وتنسيقات هدايا فاخرة مع توصيل فوري',
    en: 'Florelle | Luxury Fresh Flowers & Handcrafted Gifting',
  },
  titleTemplate: {
    ar: '%s | فلوريل للزهور والهدايا',
    en: '%s | Florelle Luxury Floral',
  },
  defaultDescription: {
    ar: 'اكتشف أرقى باقات الورد الطبيعي وتنسيقات الهدايا الفخمة في السعودية. توصيل في نفس اليوم لجميع المناسبات مع بطاقة إهداء مخصصة وشوكولاتة فاخرة.',
    en: 'Discover curated fresh floral bouquets and luxury gifting collections across Saudi Arabia. Same-day delivery for birthdays, anniversaries, and special moments.',
  },
  keywords: {
    ar: [
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
      'flower delivery riyadh',
      'flower delivery jeddah',
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
    siteName: 'Florelle Luxury Floral Atelier',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Florelle Luxury Floral Collections',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@florelle_sa',
    creator: '@florelle_sa',
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
