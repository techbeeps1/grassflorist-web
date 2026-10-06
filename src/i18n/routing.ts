import { type Locale } from './config';

const PRIMARY_CATEGORY_SLUG_MAP: Record<string, string> = {
  'all-flowers': 'جميع-الزهور',
  'luxury-bouquets': 'باقات-فاخرة',
  'flower-boxes': 'بوكسات-ورد',
  'luxury-box': 'بوكسات-ورد',
  'flower-vases': 'فازات-ورد',
  'hand-bouquets': 'هاند-بكيه',
  'hand-bouquet': 'هاند-بكيه',
  'cakes-chocolate': 'كيك-وشوكولاتة',
  'cake-chocolate': 'كيك-وشوكولاتة',
  'chocolate': 'شوكولاتة',
  'cake': 'كيك',
  'chocolate-bouquet': 'بوكيه-شوكولاته',
  'balloons': 'بالونات',
  'occasions': 'المناسبات',
  'bridal-bouquet': 'مسكات-عروس',
  'bridal-bouquets': 'مسكات-عروس',
  'bridal': 'مسكات-عروس',
  'colors': 'الألوان',
  'beige': 'بيج-2',
  'white': 'أبيض',
  'red': 'أحمر',
  'green': 'أخضر',
  'yellow': 'أصفر',
  'purple': 'بنفسجي',
  'pink': 'وردي',
  'blue': 'أزرق',
  'orange': 'برتقالي',
  'black': 'أسود',
  'letters-balloons': 'بالونات-الحروف',
  'letter-balloons': 'بالونات-الحروف',
  'ramadan': 'رمضان',
  'suggestions': 'اقتراحات',
  'valentine': 'فلنتاين',
  'valentines': 'فلنتاين',
  'valentines-day': 'فلنتاين',
  'for-mother': 'للأم',
  'birthday': 'عيد-ميلاد-سعيد',
  'for-father': 'للآب',
  'for-her': 'للمرأة',
  'for-him': 'للرجل',
  'i-love-you': 'أحبك',
  'love': 'حب',
  'get-well-soon': 'تمنيات-بالشفاء',
  'get-well': 'تمنيات-بالشفاء',
  'graduation': 'تخرج',
  'anniversary': 'عيد-زواج-سعيد',
  'housewarming': 'منزل-مبارك',
  'i-am-sorry': 'اعتذار',
  'new-born': 'تهنئة-بالمولود',
  'new-baby': 'تهنئة-بالمولود',
  'new-baby-boy': 'مولود-جديد',
  'new-baby-girl': 'مولودة-جديدة',
  'new-job': 'وظيفة-وترقية',
  'fruits-bouquets': 'باقات-الفواكه',
  'fruits-bouquet': 'باقات-الفواكه',
  'latex-balloons': 'بالونات-مطاطية',
  'golden-letters': 'أحرف-ذهبية',
  'silver-letters': 'أحرف-فضية',
  'numbers-balloons': 'بالونات-الأرقام',
  'golden-numbers': 'الأرقام-الذهبية',
  'silver-numbers': 'أرقام-فضية',
  'eid': 'العيد',
  'national-day': 'اليوم-الوطني',
  'pink-october': 'اكتوبر-الوردي',
  'best-selling': 'الأكثر-مبيعاً',
  'best-sellers': 'الأكثر-مبيعاً',
  'best-seller': 'الأكثر-مبيعاً',
  'thank-you': 'شكراً',
  'flag-day': 'flag-day-ar',
  'foundation-day': 'foundation-day-ar',
};

const REVERSE_SLUG_ALIASES: Record<string, string> = {
  'جميع-الزهور': 'all-flowers',
  'باقات-فاخرة': 'luxury-bouquets',
  'بوكسات-ورد': 'flower-boxes',
  'فازات-ورد': 'flower-vases',
  'هاند-بكيه': 'hand-bouquets',
  'هاند-بوكيه': 'hand-bouquets',
  'كيك-وشوكولاتة': 'cakes-chocolate',
  'كيك-وشوكولاته': 'cakes-chocolate',
  'شوكولاته': 'chocolate',
  'شوكولاتة': 'chocolate',
  'كيك': 'cake',
  'بوكيه-شوكولاته': 'chocolate-bouquet',
  'بالونات': 'balloons',
  'المناسبات': 'occasions',
  'جميع-المناسبات': 'occasions',
  'مناسبات': 'occasions',
  'مسكات-عروس': 'bridal-bouquet',
  'مسكة-عروس': 'bridal-bouquet',
  'باقات-العروس': 'bridal-bouquet',
  'الألوان': 'colors',
  'الوان': 'colors',
  'بيج-2': 'beige',
  'بيج': 'beige',
  '2-بيج': 'beige',
  'أبيض': 'white',
  'ابيض': 'white',
  'أحمر': 'red',
  'احمر': 'red',
  'أخضر': 'green',
  'اخضر': 'green',
  'أصفر': 'yellow',
  'اصفر': 'yellow',
  'بنفسجي': 'purple',
  'وردي': 'pink',
  'زهري': 'pink',
  'أزرق': 'blue',
  'ازرق': 'blue',
  'برتقالي': 'orange',
  'أسود': 'black',
  'اسود': 'black',
  'فضي': 'silver',
  'ذهبي': 'gold',
  'بالونات-الحروف': 'letters-balloons',
  'بالونات-أحرف': 'letters-balloons',
  'بالونات-احرف': 'letters-balloons',
  'رمضان': 'ramadan',
  'اقتراحات': 'suggestions',
  'فلنتاين': 'valentine',
  'فالنتاين': 'valentine',
  'عيد-الحب': 'valentine',
  'يوم-الحب': 'valentine',
  'للأم': 'for-mother',
  'عيد-ميلاد-سعيد': 'birthday',
  'عيد-ميلاد': 'birthday',
  'للآب': 'for-father',
  'للمرأة': 'for-her',
  'للرجل': 'for-him',
  'أحبك': 'i-love-you',
  'احبك': 'i-love-you',
  'حب': 'love',
  'تمنيات-بالشفاء': 'get-well-soon',
  'تمني-بالشفاء': 'get-well-soon',
  'تمنيات-بالشفاء-العاجل': 'get-well-soon',
  'تخرج': 'graduation',
  'عيد-زواج-سعيد': 'anniversary',
  'ذكرى-سنوية': 'anniversary',
  'زواج': 'wedding',
  'منزل-مبارك': 'housewarming',
  'تهنئة-بالمولود': 'new-born',
  'اعتذار': 'i-am-sorry',
  'مولود-جديد': 'new-born',
  'مولودة-جديدة': 'new-baby-girl',
  'وظيفة-وترقية': 'new-job',
  'باقات-الفواكه': 'fruits-bouquets',
  'باقات-الفواكة': 'fruits-bouquets',
  'بالونات-مطاطية': 'latex-balloons',
  'أحرف-ذهبية': 'golden-letters',
  'أحرف-فضية': 'silver-letters',
  'بالونات-الأرقام': 'numbers-balloons',
  'الأرقام-الذهبية': 'golden-numbers',
  'أرقام-ذهبية': 'golden-numbers',
  'أرقام-فضية': 'silver-numbers',
  'الأرقام-الفضية': 'silver-numbers',
  'العيد': 'eid',
  'اليوم-الوطني': 'national-day',
  'اكتوبر-الوردي': 'pink-october',
  'الأكثر-مبيعاً': 'best-selling',
  'الاكثر-مبيعا': 'best-selling',
  'الأفضل-مبيعاً': 'best-selling',
  'الافضل-مبيعا': 'best-selling',
  'شكراً': 'thank-you',
  'flag-day-ar': 'flag-day',
  'foundation-day-ar': 'foundation-day',
};

const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  ...PRIMARY_CATEGORY_SLUG_MAP,
  'flowers': 'جميع-الزهور',
  'luxury-arrangements': 'بوكسات-ورد',
  'chocolates-cakes': 'كيك-وشوكولاته',
  'flower-box': 'بوكسات-ورد',
  'boxes': 'بوكسات-ورد',
  'all-occasions': 'المناسبات',
  'letter-balloons': 'بالونات-الحروف',
  'letters-balloon': 'بالونات-الحروف',
  'color': 'الألوان',
  'by-color': 'الألوان',
  'suggestion': 'اقتراحات',
};

const EN_TO_AR_PAGE_ALIASES: Record<string, string> = {
  '/about': '/عن-غراس',
  '/contact': '/اتصل-بنا',
  '/blog': '/المدونة',
  '/faq': '/الأسئلة-الشائعة',
  '/wishlist': '/المفضلة',
  '/event-booking': '/حجز-مناسبة',
  '/events': '/حجز-مناسبة',
  '/policies/privacy': '/الخصوصية',
  '/policies/returns': '/سياسة-الاسترجاع-والاسترداد',
  '/policies/terms': '/الشروط-والأحكام',
  '/policies/shipping': '/الشحن-والتوصيل',
};

const AR_TO_EN_PAGE_ALIASES: Record<string, string> = {
  '/من-نحن': '/about',
  '/عن-غراس': '/about',
  '/اتصل-بنا': '/contact',
  '/المدونة': '/blog',
  '/الأسئلة-الشائعة': '/faq',
  '/المفضلة': '/wishlist',
  '/حجز-مناسبة': '/event-booking',
  '/حجز-وتنظيم-المناسبات': '/event-booking',
  '/تنظيم-المناسبات': '/event-booking',
  '/الخصوصية': '/policies/privacy',
  '/سياسة-الخصوصية': '/policies/privacy',
  '/سياسة-التوصيل-والخصوصية': '/policies/privacy',
  '/سياسة-الاسترجاع-والاسترداد': '/policies/returns',
  '/سياسة-الاسترجاع-والاستبدال': '/policies/returns',
  '/الشروط-والأحكام': '/policies/terms',
  '/الشحن-والتوصيل': '/policies/shipping',
};

function normalizeArString(str: string): string {
  return str
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[-_]+/g, '-')
    .trim();
}

function resolveCategorySlug(rawSlug: string, targetLocale: Locale): string {
  const clean = rawSlug.trim().toLowerCase();
  if (targetLocale === 'ar') {
    if (CATEGORY_SLUG_ALIASES[clean]) return CATEGORY_SLUG_ALIASES[clean];
    const stripped = clean.replace(/-\d+$/, '');
    if (CATEGORY_SLUG_ALIASES[stripped]) return CATEGORY_SLUG_ALIASES[stripped];
    return clean;
  } else {
    if (REVERSE_SLUG_ALIASES[clean]) return REVERSE_SLUG_ALIASES[clean];
    const stripped = clean.replace(/-\d+$/, '');
    if (REVERSE_SLUG_ALIASES[stripped]) return REVERSE_SLUG_ALIASES[stripped];
    const norm = normalizeArString(clean);
    for (const [k, v] of Object.entries(REVERSE_SLUG_ALIASES)) {
      if (normalizeArString(k) === norm) return v;
    }
    return clean;
  }
}

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
    const translatedSlug = resolveCategorySlug(rawSlug, targetLocale);
    basePath = `/category/${encodeURIComponent(translatedSlug)}`;
  } else if (targetLocale === 'ar') {
    if (EN_TO_AR_PAGE_ALIASES[decodedBasePath]) {
      basePath = EN_TO_AR_PAGE_ALIASES[decodedBasePath];
    }
  } else {
    if (AR_TO_EN_PAGE_ALIASES[decodedBasePath]) {
      basePath = AR_TO_EN_PAGE_ALIASES[decodedBasePath];
    }
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
