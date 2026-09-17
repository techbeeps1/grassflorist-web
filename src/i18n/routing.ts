import { type Locale } from './config';

const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  'all-flowers': 'جميع-الزهور',
  'occasions': 'المناسبات',
  'for-mother': 'للأم',
  'birthday': 'عيد-ميلاد',
  'for-father': 'للآب',
  'for-her': 'للمرأة',
  'for-him': 'للرجل',
  'love': 'حب',
  'get-well': 'تمني-بالشفاء',
  'graduation': 'تخرج',
  'hand-bouquet': 'هاند-بوكيه',
  'i-am-sorry': 'اعتذار',
  'new-baby': 'مولود-جديد',
  'new-job': 'وظيفة-وترقية',
  'luxury-bouquets': 'باقات-فاخرة',
  'fruits-bouquet': 'باقات-الفواكه',
  'cake-chocolate': 'كيك-وشوكولاته',
  'chocolate': 'شوكولاته',
  'cake': 'كيك',
  'chocolate-bouquet': 'بوكيه-شوكولاته',
  'balloons': 'بالونات',
  'latex-balloons': 'بالونات-مطاطية',
  'letters-balloons': 'بالونات-الحروف',
  'golden-letters': 'أحرف-ذهبية',
  'silver-letters': 'أحرف-فضية',
  'numbers-balloons': 'بالونات-الأرقام',
  'golden-numbers': 'الأرقام-الذهبية',
  'silver-numbers': 'أرقام-فضية',
  'flowers': 'جميع-الزهور',
  'luxury-arrangements': 'باقات-فاخرة',
  'chocolates-cakes': 'كيك-وشوكولاته',
};

const REVERSE_SLUG_ALIASES: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_ALIASES).map(([en, ar]) => [ar, en])
);

const PAGE_PATH_ALIASES: Record<string, string> = {
  '/about': '/عن-غراس',
  '/contact': '/اتصل-بنا',
  '/blog': '/المدونة',
  '/policies/privacy': '/الخصوصية',
  '/policies/returns': '/سياسة-الاسترجاع-والاسترداد',
  '/من-نحن': '/about',
  '/عن-غراس': '/about',
  '/اتصل-بنا': '/contact',
  '/المدونة': '/blog',
  '/الخصوصية': '/policies/privacy',
  '/سياسة-الخصوصية': '/policies/privacy',
  '/سياسة-التوصيل-والخصوصية': '/policies/privacy',
  '/سياسة-الاسترجاع-والاسترداد': '/policies/returns',
  '/سياسة-الاسترجاع-والاستبدال': '/policies/returns',
};

/**
 * Generates the corresponding URL path in the target language.
 * Arabic lives strictly at root (e.g. / or /product/abc).
 * English lives strictly at /en (e.g. /en or /en/product/abc).
 * NEVER produces /ar/.
 */
export function getLocalizedPath(currentPath: string, targetLocale: Locale): string {
  // Normalize path
  let path = currentPath.trim();
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  // Remove query params for route analysis if any, but preserve them
  const [pathname, queryString] = path.split('?');
  const query = queryString ? `?${queryString}` : '';

  // Determine current locale and root path
  const isEnglish = pathname === '/en' || pathname.startsWith('/en/');
  let basePath = isEnglish ? pathname.replace(/^\/en/, '') || '/' : pathname;
  const decodedBasePath = decodeURIComponent(basePath);

  // If basePath is a category route, translate the slug if possible
  const categoryMatch = basePath.match(/^\/category\/(.+)$/);
  if (categoryMatch) {
    const rawSlug = decodeURIComponent(categoryMatch[1]).trim().toLowerCase();
    if (targetLocale === 'ar') {
      const translatedSlug = CATEGORY_SLUG_ALIASES[rawSlug] || rawSlug;
      basePath = `/category/${encodeURIComponent(translatedSlug)}`;
    } else {
      const translatedSlug = REVERSE_SLUG_ALIASES[rawSlug] || rawSlug;
      basePath = `/category/${encodeURIComponent(translatedSlug)}`;
    }
  } else if (PAGE_PATH_ALIASES[decodedBasePath]) {
    basePath = PAGE_PATH_ALIASES[decodedBasePath];
  }

  if (targetLocale === 'ar') {
    return `${basePath}${query}` || '/';
  } else {
    return basePath === '/' ? `/en${query}` : `/en${basePath}${query}`;
  }
}

/**
 * Returns the direction for the given locale.
 */
export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
