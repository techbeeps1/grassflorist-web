import { Product } from '@/types/product';
import { Category, Subcategory } from '@/types/category';
import { BlogPost } from '@/types/blog';
import { FAQItem } from '@/types/faq';
import { type Locale } from '@/config/site';
import { products as fallbackProducts } from '@/data/products';
import { categories as fallbackCategories } from '@/data/categories';
import { blogPosts as fallbackBlogPosts } from '@/data/blog';
import { faqs as fallbackFaqs } from '@/data/faqs';

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const LARAVEL_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
const IS_DEV = process.env.NODE_ENV !== 'production';

export interface WCStoreImage {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
}

export interface WCStoreCategoryRef {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface WCStorePrices {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range: unknown;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface WCStoreProduct {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: string;
  variation: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: WCStorePrices;
  price_html: string;
  average_rating: string;
  review_count: number;
  images: WCStoreImage[];
  categories: WCStoreCategoryRef[];
  tags: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{
    id: number;
    name: string;
    taxonomy: string;
    has_variations: boolean;
    terms: Array<{ id: number; name: string; slug: string }>;
  }>;
  is_in_stock: boolean;
  is_purchasable: boolean;
  low_stock_remaining: number | null;
  add_to_cart?: {
    text: string;
    description: string;
    url: string;
    minimum: number;
    maximum: number;
    multiple_of: number;
  };
}

export interface WCStoreCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
  image: WCStoreImage | null;
  review_count?: number;
  permalink?: string;
}

/**
 * Safely decodes URI percent-encoded UTF-8 strings (e.g. %d8%a8%d9%8a%d8%ac -> بيج)
 */
export function safeDecodeUri(str?: string | null): string {
  if (!str || typeof str !== 'string') return '';
  if (!str.includes('%')) return str;
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

/**
 * Decodes all HTML entities commonly returned by WooCommerce & Laravel REST APIs
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  let str = safeDecodeUri(text);
  return str
    .replace(/&amp;/gi, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&ndash;/gi, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&mdash;/gi, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&lsquo;/gi, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&rsquo;/gi, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&ldquo;/gi, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&rdquo;/gi, '”')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#34;/g, '"')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return '';
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips HTML tags and entities from raw API content
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  const withoutTags = html.replace(/<[^>]*>/g, ' ');
  return decodeHtmlEntities(withoutTags);
}

/**
 * Parses numeric price from WooCommerce prices object
 */
export function parsePrice(prices: WCStorePrices): number {
  if (!prices?.price) return 0;
  const num = parseFloat(prices.price);
  if (isNaN(num)) return 0;
  const minorUnit = prices.currency_minor_unit ?? 0;
  return minorUnit > 0 ? num / Math.pow(10, minorUnit) : num;
}

/**
 * Parses regular price for discount calculation
 */
export function parseRegularPrice(prices: WCStorePrices): number | undefined {
  if (!prices?.regular_price) return undefined;
  const num = parseFloat(prices.regular_price);
  if (isNaN(num)) return undefined;
  const minorUnit = prices.currency_minor_unit ?? 0;
  const price = minorUnit > 0 ? num / Math.pow(10, minorUnit) : num;
  return price > 0 ? price : undefined;
}

// In-memory cache for ultra-fast instant product retrieval
const productMemoryCache = new Map<string, Product>();

export function hasArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

const PHRASE_TRANSLATIONS: Record<string, string> = {
  'بوكيه ورد': 'Rose Bouquet',
  'باقة ورد': 'Flower Bouquet',
  'باقة زهور': 'Floral Arrangement',
  'ورد طبيعي': 'Fresh Flowers',
  'ورد جوري': 'Classic Roses',
  'بيبي جوري': 'Baby Roses',
  'بيبي روز': 'Spray Roses',
  'ورد أحمر': 'Red Roses',
  'ورد احمر': 'Red Roses',
  'ورد أبيض': 'White Roses',
  'ورد ابيض': 'White Roses',
  'ورد وردي': 'Pink Roses',
  'ورد أصفر': 'Yellow Roses',
  'ورد اصفر': 'Yellow Roses',
  'ورد بنفسجي': 'Purple Roses',
  'ورد موف': 'Mauve Roses',
  'ورد برتقالي': 'Orange Roses',
  'ورد أزرق': 'Blue Roses',
  'ورد ازرق': 'Blue Roses',
  'فازة ورد': 'Flower Vase Arrangement',
  'فازة زهور': 'Floral Vase Arrangement',
  'بوكس ورد': 'Flower Box',
  'صينية ورد': 'Flower Tray Arrangement',
  'سلة ورد': 'Flower Basket',
  'هاند بوكيه': 'Hand Bouquet',
  'باقة يد': 'Hand Bouquet',
  'باقة فاخرة': 'Luxury Bouquet',
  'باقات فاخرة': 'Luxury Bouquets',
  'شوكولاتة باتشي': 'Patchi Chocolates',
  'شوكولاته باتشي': 'Patchi Chocolates',
  'شوكولاتة بستاني': 'Bostani Chocolates',
  'شوكولاته بستاني': 'Bostani Chocolates',
  'كيك شوكولاتة': 'Chocolate Cake',
  'كيكة شوكولاتة': 'Chocolate Cake',
  'كيك فانيليا': 'Vanilla Cake',
  'كيكة فانيليا': 'Vanilla Cake',
  'كيك رد فيلفيت': 'Red Velvet Cake',
  'كيكة رد فيلفيت': 'Red Velvet Cake',
  'عيد ميلاد': 'Birthday Celebration',
  'عيد ميلاد سعيد': 'Happy Birthday Bouquet',
  'مولود جديد': 'New Baby Boy Arrangement',
  'مولودة جديدة': 'New Baby Girl Arrangement',
  'ألف مبروك': 'Congratulations Bouquet',
  'مبروك التخرج': 'Graduation Congratulations',
  'حمدالله على السلامة': 'Get Well Soon Arrangement',
  'الحمدلله على السلامة': 'Get Well Soon Arrangement',
  'حب وغرام': 'Love & Romance Bouquet',
  'عيد الأم': "Mother's Day Special",
  'يوم الأم': "Mother's Day Special",
  'عيد الاب': "Father's Day Arrangement",
  'عيد الأب': "Father's Day Arrangement",
  'يوم التأسيس': 'Founding Day Collection',
  'اليوم الوطني': 'National Day Collection',
  'دوار الشمس': 'Sunflowers Bouquet',
  'عباد الشمس': 'Sunflowers Bouquet',
  'زهرة التوليب': 'Tulip Arrangement',
  'زهرة الأوركيد': 'Orchid Plant',
  'زهرة الهيدرانجيا': 'Hydrangea Arrangement',
  'زهرة الليليوم': 'Lily Bouquet',
};

const WORD_TRANSLATIONS: Record<string, string> = {
  بوكيه: 'Bouquet',
  باقة: 'Bouquet',
  باقات: 'Bouquets',
  ورد: 'Roses',
  ورود: 'Roses',
  زهور: 'Flowers',
  زهرة: 'Flower',
  جوري: 'Roses',
  روز: 'Roses',
  روزز: 'Roses',
  توليب: 'Tulips',
  اوركيد: 'Orchids',
  أوركيد: 'Orchids',
  هيدرانجيا: 'Hydrangeas',
  هايدرانجيا: 'Hydrangeas',
  ليليوم: 'Lilies',
  ليلي: 'Lilies',
  قرنفل: 'Carnations',
  لافندر: 'Lavender',
  خزامى: 'Lavender',
  جيبسوفيليا: 'Gypsophila',
  جبسوفيليا: "Baby's Breath",
  استوما: 'Lisianthus',
  فازة: 'Vase',
  فازه: 'Vase',
  بوكس: 'Box',
  صندوق: 'Box',
  صينية: 'Tray',
  اكريليك: 'Acrylic',
  أكريليك: 'Acrylic',
  زجاج: 'Glass',
  زجاجية: 'Glass',
  خشب: 'Wood',
  خشبية: 'Wooden',
  سلة: 'Basket',
  شوكولاتة: 'Chocolates',
  شوكولاته: 'Chocolates',
  تشوكليت: 'Chocolates',
  كيك: 'Cake',
  كيكة: 'Cake',
  بالون: 'Balloon',
  بالونات: 'Balloons',
  هيليوم: 'Helium',
  حروف: 'Letters',
  أرقام: 'Numbers',
  ارقام: 'Numbers',
  احمر: 'Red',
  أحمر: 'Red',
  حمراء: 'Red',
  ابيض: 'White',
  أبيض: 'White',
  بيضاء: 'White',
  وردي: 'Pink',
  زهري: 'Pink',
  اصفر: 'Yellow',
  أصفر: 'Yellow',
  صفراء: 'Yellow',
  بنفسجي: 'Purple',
  موف: 'Mauve',
  ازرق: 'Blue',
  أزرق: 'Blue',
  زرقاء: 'Blue',
  برتقالي: 'Orange',
  ذهبي: 'Golden',
  ذهبيه: 'Golden',
  فضة: 'Silver',
  فضي: 'Silver',
  فضيه: 'Silver',
  اسود: 'Black',
  أسود: 'Black',
  سوداء: 'Black',
  فاخر: 'Luxury',
  فاخرة: 'Deluxe',
  مميز: 'Special',
  مميزة: 'Premium',
  طبيعي: 'Fresh',
  طبيعية: 'Natural',
  كبير: 'Large',
  كبيرة: 'Grand',
  صغير: 'Mini',
  صغيرة: 'Petite',
  وسط: 'Medium',
  تخرج: 'Graduation',
  زواج: 'Wedding',
  خطوبة: 'Engagement',
  مولود: 'Baby Boy',
  مولودة: 'Baby Girl',
  حب: 'Love',
  عشق: 'Romance',
  شوق: 'Affection',
  اعتذار: 'Apology',
  شفاء: 'Get Well',
  سلامة: 'Wellness',
  تهنئة: 'Celebration',
  هدية: 'Gift',
  هدايا: 'Gifts',
  مع: 'with',
  و: '&',
};

export function translateArabicProductName(arabicName: string, slug?: string): string {
  if (!arabicName) {
    if (slug && !hasArabicText(slug)) {
      return slug
        .split(/[-_]/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return 'Exclusive Floral Arrangement';
  }

  const clean = decodeHtmlEntities(arabicName).trim();
  if (!hasArabicText(clean)) return clean;

  // Check full phrases first
  let remaining = clean;
  for (const [phrase, translated] of Object.entries(PHRASE_TRANSLATIONS)) {
    if (remaining.includes(phrase)) {
      remaining = remaining.replace(new RegExp(phrase, 'g'), ` ${translated} `);
    }
  }

  // Split and translate tokens
  const tokens = remaining
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const translatedTokens = tokens.map((token) => {
    if (WORD_TRANSLATIONS[token]) {
      return WORD_TRANSLATIONS[token];
    }
    // Check if token without 'ال' matches
    if (token.startsWith('ال') && WORD_TRANSLATIONS[token.slice(2)]) {
      return WORD_TRANSLATIONS[token.slice(2)];
    }
    // If it's already English, keep it
    if (!hasArabicText(token)) {
      return token;
    }
    return '';
  }).filter(Boolean);

  if (translatedTokens.length > 0) {
    const result = translatedTokens.join(' ').replace(/\s+/g, ' ').trim();
    // Capitalize properly
    return result
      .split(' ')
      .map((w) => (w.toLowerCase() === '&' || w.toLowerCase() === 'with' ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(' ');
  }

  if (slug && !hasArabicText(slug)) {
    return slug
      .split(/[-_]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  return 'Luxury Floral Arrangement';
}

export function translateArabicCategoryName(categoryName: string, slug?: string): string {
  if (!categoryName) return 'Flowers & Gifts';
  let clean = safeDecodeUri(decodeHtmlEntities(categoryName)).trim();
  const decodedSlug = slug ? safeDecodeUri(slug).trim() : '';

  if (!hasArabicText(clean)) {
    if (clean.includes('-') || clean.includes('_')) {
      return clean
        .split(/[-_]/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return clean;
  }

  const CATEGORY_MAP: Record<string, string> = {
    'جميع الزهور': 'All Flowers',
    'باقات فاخرة': 'Luxury Bouquets',
    'كيك وشوكولاته': 'Cakes & Chocolates',
    'كيك وشوكولاتة': 'Cakes & Chocolates',
    'بالونات': 'Balloons',
    'المناسبات': 'Occasions',
    'هاند بوكيه': 'Hand Bouquets',
    'هاند-بوكيه': 'Hand Bouquets',
    'فازات ورد': 'Flower Vases',
    'بوكسات ورد': 'Flower Boxes',
    'زهور وهدايا': 'Flowers & Gifts',
    'هدايا': 'Gifts',
    'للأم': "For Mother",
    'عيد ميلاد': 'Birthday',
    'تخرج': 'Graduation',
    'مولود جديد': 'New Baby',
    'مولودة جديدة': 'New Baby Girl',
    'حب': 'Love & Romance',
    'تمني بالشفاء': 'Get Well Soon',
    'اعتذار': 'Apology',
    'وظيفة وترقية': 'Promotion & New Job',
    'باقات الفواكه': 'Fruit Bouquets',
    'شوكولاته': 'Chocolates',
    'كيك': 'Cakes',
    'بوكيه شوكولاته': 'Chocolate Bouquets',
    'بالونات مطاطية': 'Latex Balloons',
    'بالونات الحروف': 'Letter Balloons',
    'أحرف ذهبية': 'Golden Letters',
    'أحرف فضية': 'Silver Letters',
    'بالونات الأرقام': 'Number Balloons',
    'بالونات أرقام': 'Number Balloons',
    'بالونات-أرقام': 'Number Balloons',
    'الأرقام الذهبية': 'Golden Numbers',
    'أرقام فضية': 'Silver Numbers',
    'بيج': 'Beige',
    'منوع': 'Assorted',
    'زواج': 'Wedding',
    'الجمعة البيضاء': 'White Friday',
    'عيد زواج سعيد': 'Happy Anniversary',
    'عيد زواج': 'Anniversary',
    'الألوان': 'Colors',
    'أحمر': 'Red',
    'أصفر': 'Yellow',
    'وردي': 'Pink',
    'أبيض': 'White',
    'بنفسجي': 'Purple',
    'أزرق': 'Blue',
    'برتقالي': 'Orange',
    'خوخي': 'Peach',
    'للمرأة': 'For Her',
    'للرجل': 'For Him',
    'الأفضل مبيعاً': 'Best Seller',
    'رمضان': 'Ramadan',
    'فالنتاين': 'Valentine',
    'اقتراحات': 'Suggestions',
    'مسكة عروس': 'Bridal Bouquet',
    'باقة عروس': 'Bridal Bouquet',
    'يوم المعلم': "Teacher's Day",
    'رأس السنة': 'New Year',
    'منزل مبارك': 'Housewarming',
    'أحبك': 'I Love You',
  };

  if (CATEGORY_MAP[clean]) {
    return CATEGORY_MAP[clean];
  }

  const normalizedClean = clean.replace(/[-_]/g, ' ');
  if (CATEGORY_MAP[normalizedClean]) {
    return CATEGORY_MAP[normalizedClean];
  }

  if (decodedSlug) {
    const slugNormalized = decodedSlug.replace(/[-_]/g, ' ');
    if (CATEGORY_MAP[slugNormalized]) {
      return CATEGORY_MAP[slugNormalized];
    }
    if (!hasArabicText(decodedSlug)) {
      return decodedSlug
        .split(/[-_]/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  return translateArabicProductName(clean, slug) || 'Flowers & Gifts';
}

export function translateArabicToEnglishDescription(
  rawDesc: string,
  productNameEn: string,
  categoryEn?: string
): string {
  if (!rawDesc || !hasArabicText(rawDesc)) {
    return rawDesc || `An exquisite arrangement handcrafted by Grass Florist master artisans, designed to bring beauty and joy to every celebration.`;
  }

  const name = productNameEn || 'luxury floral arrangement';
  const category = categoryEn || 'exclusive gifts';

  return `An exquisite handcrafted ${name.toLowerCase()} thoughtfully designed by master florists at Grass Florist. Every stem is meticulously hand-selected for pristine freshness, vibrant natural colors, and long-lasting elegance.

Key Features & Highlights:
• 100% Farm-Fresh Premium Blooms: Carefully nurtured and arranged to preserve maximum petal freshness.
• Artisanal Luxury Styling: Hand-tied with Grass Florist signature wrapping and presentation accents.
• Perfect For All Moments: An ideal gift for birthdays, anniversaries, celebrations, or spontaneous heartfelt gestures.
• Express Same-Day Delivery: Hand-delivered with utmost care across all regions of Saudi Arabia.`;
}

export function translateArabicToEnglishShortDescription(
  rawDesc: string,
  productNameEn: string
): string {
  if (!rawDesc || !hasArabicText(rawDesc)) {
    return rawDesc || `Handcrafted fresh floral arrangement by Grass Florist, styled to perfection with express delivery.`;
  }
  const name = productNameEn || 'Luxury floral bouquet';
  return `Handcrafted ${name.toLowerCase()} by Grass Florist with fresh premium blooms and express delivery across Saudi Arabia.`;
}

export function cacheProduct(product: Product) {
  if (IS_DEV) return;
  if (!product) return;
  if (product.id) productMemoryCache.set(String(product.id), product);
  if (product.slug?.ar) productMemoryCache.set(product.slug.ar.toLowerCase(), product);
  if (product.slug?.en) productMemoryCache.set(product.slug.en.toLowerCase(), product);
}

export function cacheProducts(products: Product[]) {
  for (const p of products) {
    cacheProduct(p);
  }
}

/**
 * Map WooCommerce Store API Product to Frontend Product Type
 */
export function mapWCProductToProduct(wc: WCStoreProduct): Product {
  const price = parsePrice(wc.prices);
  const originalPrice = parseRegularPrice(wc.prices);
  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

  const rawImages = wc.images && wc.images.length > 0
    ? wc.images.map((img) => img.src)
    : ['https://grassflorist.com/wp-content/uploads/2025/02/placeholder.png'];

  const thumbnail =
    wc.images && wc.images.length > 0
      ? wc.images[0].thumbnail || wc.images[0].src
      : rawImages[0];

  const primaryCategory = wc.categories && wc.categories.length > 0 ? wc.categories[0] : null;
  const secondaryCategory = wc.categories && wc.categories.length > 1 ? wc.categories[1] : null;

  const cleanProductName = decodeHtmlEntities(wc.name);
  const categoryName = primaryCategory ? decodeHtmlEntities(primaryCategory.name) : 'زهور وهدايا';
  const categorySlug = primaryCategory ? decodeURIComponent(primaryCategory.slug) : 'flowers';

  const cleanShortDesc = stripHtml(wc.short_description || '');
  const cleanFullDesc = stripHtml(wc.description || wc.short_description || '');

  const decodedSlug = decodeURIComponent(wc.slug);

  const englishProductName = translateArabicProductName(cleanProductName, decodedSlug);
  const englishCategoryName = translateArabicCategoryName(categoryName, categorySlug);
  const englishShortDesc = translateArabicToEnglishShortDescription(cleanShortDesc, englishProductName);
  const englishFullDesc = translateArabicToEnglishDescription(cleanFullDesc, englishProductName, englishCategoryName);

  const secondaryCategoryNameAr = secondaryCategory ? decodeHtmlEntities(secondaryCategory.name) : undefined;
  const secondaryCategorySlug = secondaryCategory ? decodeURIComponent(secondaryCategory.slug) : undefined;
  const secondaryCategoryNameEn = secondaryCategoryNameAr
    ? translateArabicCategoryName(secondaryCategoryNameAr, secondaryCategorySlug)
    : undefined;

  const product: Product = {
    id: String(wc.id),
    name: {
      ar: cleanProductName,
      en: englishProductName,
    },
    slug: {
      ar: decodedSlug,
      en: decodedSlug,
    },
    description: {
      ar: cleanFullDesc || cleanProductName,
      en: englishFullDesc,
    },
    shortDescription: {
      ar: cleanShortDesc || cleanProductName,
      en: englishShortDesc,
    },
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
    currency: wc.prices?.currency_code || 'SAR',
    discount,
    images: rawImages,
    thumbnail,
    category: {
      ar: categoryName,
      en: englishCategoryName,
    },
    categorySlug,
    subcategory: secondaryCategoryNameAr
      ? {
        ar: secondaryCategoryNameAr,
        en: secondaryCategoryNameEn || secondaryCategoryNameAr,
      }
      : undefined,
    subcategorySlug: secondaryCategorySlug,
    rating: parseFloat(wc.average_rating) || 4.9,
    reviewCount: wc.review_count || 12,
    stock: wc.is_in_stock ? 20 : 0,
    sku: wc.sku || `GF-${wc.id}`,
    tags: wc.tags ? wc.tags.map((t) => decodeHtmlEntities(t.name)) : [],
    featured: Boolean(wc.on_sale),
    bestseller: true,
    newArrival: true,
    availability: wc.is_in_stock ? 'in_stock' : 'out_of_stock',
    seoTitle: {
      ar: `${cleanProductName} | غراس فلوريست للورود والهدايا`,
      en: `${englishProductName} | Grass Florist Saudi Arabia`,
    },
    seoDescription: {
      ar: cleanShortDesc || `اطلب ${cleanProductName} من غراس فلوريست مع توصيل سريع لجميع مناطق المملكة.`,
      en: englishShortDesc || `Order ${englishProductName} from Grass Florist with express delivery across Saudi Arabia.`,
    },
  };

  cacheProduct(product);
  return product;
}

/**
 * Map WooCommerce Store API Category to Frontend Category Type
 */
export function mapWCCategoryToCategory(
  cat: WCStoreCategory,
  allCategories: WCStoreCategory[] = []
): Category {
  const decodedSlug = decodeURIComponent(cat.slug);
  const cleanCategoryName = decodeHtmlEntities(cat.name);
  const englishCategoryName = translateArabicCategoryName(cleanCategoryName, decodedSlug);

  const childCategories: Subcategory[] = allCategories
    .filter((c) => c.parent === cat.id)
    .map((c) => {
      const childAr = decodeHtmlEntities(c.name);
      const childSlug = decodeURIComponent(c.slug);
      return {
        id: String(c.id),
        name: {
          ar: childAr,
          en: translateArabicCategoryName(childAr, childSlug),
        },
        slug: childSlug,
        count: c.count,
      };
    });

  const imageUrl =
    cat.image?.src ||
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80';

  const cleanDesc = stripHtml(cat.description || '');

  return {
    id: String(cat.id),
    name: {
      ar: cleanCategoryName,
      en: englishCategoryName,
    },
    slug: decodedSlug,
    description: {
      ar: cleanDesc || `تصفح أرقى تشكيلة من ${cleanCategoryName} مع توصيل سريع وهدايا فاخرة من غراس فلوريست.`,
      en: cleanDesc && !hasArabicText(cleanDesc) ? cleanDesc : `Explore premium handcrafted ${englishCategoryName.toLowerCase()} collections curated with love by Grass Florist.`,
    },
    image: imageUrl,
    seoTitle: {
      ar: `${cleanCategoryName} | غراس فلوريست`,
      en: `${englishCategoryName} | Grass Florist`,
    },
    seoDescription: {
      ar: cleanDesc || `اكتشف أجمل تشكيلات ${cleanCategoryName} في المملكة العربية السعودية مع توصيل سريع في نفس اليوم.`,
      en: cleanDesc && !hasArabicText(cleanDesc) ? cleanDesc : `Discover beautiful ${englishCategoryName.toLowerCase()} collections in Saudi Arabia with same-day express delivery.`,
    },
    featured: cat.count > 0,
    itemCount: cat.count,
    subcategories: childCategories,
  };
}

/**
 * Cleanly format storage URLs.
 * Local Laravel storage paths are served via Next.js /storage rewrite proxy.
 */
export function formatStorageUrl(path?: string | null): string {
  if (!path) return 'https://grassflorist.com/wp-content/uploads/2025/02/placeholder.png';
  const str = String(path).trim();
  if (!str) return 'https://grassflorist.com/wp-content/uploads/2025/02/placeholder.png';
  if (str.startsWith('http://127.0.0.1:8000/storage/') || str.startsWith('http://localhost:8000/storage/')) {
    return str.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, '');
  }
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }
  if (str.startsWith('/images/') || str.startsWith('/assets/') || str.startsWith('/icons/') || str.startsWith('/placeholder')) {
    return str;
  }
  const cleanPath = str.replace(/^\/?storage\/?/, '').replace(/^\/+/, '');
  return `/storage/${cleanPath}`;
}

/**
 * Map Laravel Product to Frontend Product Type
 */
export function mapLaravelProductToProduct(item: any, activeLocale?: Locale): Product {
  const price = parseFloat(item.price) || 0;
  const originalPrice = parseFloat(item.mrp) || price;
  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

  let rawImages: string[] = [];
  if (Array.isArray(item.gallery) && item.gallery.length > 0) {
    rawImages = item.gallery.map((img: string) => formatStorageUrl(img));
  } else if (item.image) {
    rawImages = [formatStorageUrl(item.image)];
  } else {
    rawImages = ['https://grassflorist.com/wp-content/uploads/2025/02/placeholder.png'];
  }

  const thumbnail = rawImages[0];

  let rawNameAr = '';
  let rawNameEn = '';
  if (typeof item.name === 'object' && item.name !== null) {
    rawNameAr = item.name.ar || item.name.en || '';
    rawNameEn = item.name.en || item.name.ar || '';
  } else if (typeof item.name === 'string') {
    if (activeLocale === 'en' && !hasArabicText(item.name)) {
      rawNameEn = item.name;
      rawNameAr = item.name;
    } else {
      rawNameAr = item.name;
      rawNameEn = translateArabicProductName(item.name, item.slug);
    }
  } else {
    rawNameAr = item.slug || '';
    rawNameEn = item.slug || '';
  }

  const nameAr = safeDecodeUri(rawNameAr || item.slug);
  const nameEn = safeDecodeUri(rawNameEn || (hasArabicText(nameAr) ? translateArabicProductName(nameAr, item.slug) : nameAr));

  // Extract raw descriptions and sub_titles from API
  let rawDesc = '';
  if (typeof item.description === 'object' && item.description !== null) {
    rawDesc = item.description[activeLocale || 'ar'] || item.description.en || item.description.ar || '';
  } else if (typeof item.description === 'string') {
    rawDesc = item.description;
  }
  const cleanDesc = stripHtml(rawDesc).trim();

  let rawSubTitle = '';
  if (typeof item.sub_title === 'object' && item.sub_title !== null) {
    rawSubTitle = item.sub_title[activeLocale || 'ar'] || item.sub_title.en || item.sub_title.ar || '';
  } else if (typeof item.sub_title === 'string') {
    rawSubTitle = item.sub_title;
  }
  const cleanSubTitle = stripHtml(rawSubTitle).trim();

  const primaryCategory = Array.isArray(item.meta_data?.categories) && item.meta_data.categories.length > 0
    ? item.meta_data.categories[0]
    : Array.isArray(item.categories) && item.categories.length > 0
    ? item.categories[0]
    : null;

  const catNameAr = primaryCategory?.name ? safeDecodeUri(decodeHtmlEntities(primaryCategory.name)) : 'زهور وهدايا';
  const catSlug = primaryCategory?.slug ? safeDecodeUri(primaryCategory.slug) : 'flowers';
  const catNameEn = translateArabicCategoryName(catNameAr, catSlug);

  let descAr = cleanDesc || nameAr;
  let descEn = cleanDesc || nameEn;

  if (typeof item.description === 'object' && item.description !== null) {
    if (item.description.ar) descAr = stripHtml(item.description.ar).trim();
    if (item.description.en) descEn = stripHtml(item.description.en).trim();
  } else if (cleanDesc) {
    if (activeLocale === 'en') {
      descEn = cleanDesc;
    } else {
      descAr = cleanDesc;
    }
  }

  let shortDescAr = cleanSubTitle || (cleanDesc ? cleanDesc.slice(0, 160) : nameAr);
  let shortDescEn = cleanSubTitle || (cleanDesc ? cleanDesc.slice(0, 160) : nameEn);

  if (typeof item.sub_title === 'object' && item.sub_title !== null) {
    if (item.sub_title.ar) shortDescAr = stripHtml(item.sub_title.ar).trim();
    if (item.sub_title.en) shortDescEn = stripHtml(item.sub_title.en).trim();
  } else if (cleanSubTitle) {
    if (activeLocale === 'en') {
      shortDescEn = cleanSubTitle;
    } else {
      shortDescAr = cleanSubTitle;
    }
  }

  const rawCategoryIds = Array.isArray(item.category_ids)
    ? item.category_ids
    : Array.isArray(item.category_id)
    ? item.category_id
    : [];
  const categoryIds: number[] = rawCategoryIds
    .map((id: any) => Number(id))
    .filter((id: number) => !isNaN(id));

  const rawCategorySlugs: string[] = Array.isArray(item.category_slugs) ? item.category_slugs : [];
  const categorySlugs = Array.from(
    new Set([
      ...rawCategorySlugs.map((s: string) => safeDecodeUri(s).toLowerCase()),
      ...(Array.isArray(item.categories)
        ? item.categories.flatMap((c: any) => [
            safeDecodeUri(c.slug || '').toLowerCase(),
            safeDecodeUri(c.slug_en || '').toLowerCase(),
            safeDecodeUri(c.slug_ar || '').toLowerCase(),
          ])
        : []),
    ].filter(Boolean))
  );

  const categoriesList = Array.isArray(item.categories) ? item.categories : [];

  const secondaryCategory = Array.isArray(item.meta_data?.categories) && item.meta_data.categories.length > 1
    ? item.meta_data.categories[1]
    : Array.isArray(item.categories) && item.categories.length > 1
    ? item.categories[1]
    : null;
  const subcategorySlug = secondaryCategory?.slug
    ? safeDecodeUri(secondaryCategory.slug)
    : categoriesList.length > 1
    ? safeDecodeUri(categoriesList[1].slug)
    : undefined;

  return {
    id: String(item.id),
    name: {
      ar: nameAr,
      en: nameEn,
    },
    slug: {
      ar: item.slug_ar || item.slug,
      en: item.slug,
    },
    description: {
      ar: descAr,
      en: descEn,
    },
    shortDescription: {
      ar: shortDescAr,
      en: shortDescEn,
    },
    price,
    originalPrice: originalPrice > price ? originalPrice : undefined,
    currency: 'SAR',
    discount,
    images: rawImages,
    thumbnail,
    category: {
      ar: catNameAr,
      en: catNameEn,
    },
    categorySlug: catSlug,
    subcategorySlug,
    categoryIds,
    categorySlugs,
    categoriesList,
    rating: 4.9,
    reviewCount: 15,
    stock: typeof item.quantity === 'number' ? item.quantity : 10,
    sku: item.sku || `GF-${item.id}`,
    tags: Array.isArray(item.meta_data?.tags) ? item.meta_data.tags.map((t: any) => t.name || t) : [],
    featured: Boolean(item.meta_data?.featured || item.is_visible),
    bestseller: true,
    newArrival: true,
    availability: (item.quantity === undefined || item.quantity > 0) ? 'in_stock' : 'out_of_stock',
    seoTitle: {
      ar: `${nameAr} | غراس فلوريست للورود والهدايا`,
      en: `${nameEn} | Grass Florist Saudi Arabia`,
    },
    seoDescription: {
      ar: `اطلب ${nameAr} من غراس فلوريست مع توصيل سريع في المملكة.`,
      en: `Order ${nameEn} from Grass Florist with express delivery across Saudi Arabia.`,
    },
  };
}

/**
 * Map Laravel Category to Frontend Category Type
 */
export function mapLaravelCategoryToCategory(cat: any): Category {
  const rawNameAr =
    typeof cat.name === 'object' && cat.name?.ar
      ? cat.name.ar
      : typeof cat.name === 'string'
      ? cat.name
      : cat.slug;
  const rawNameEn =
    typeof cat.name === 'object' && cat.name?.en
      ? cat.name.en
      : undefined;

  let nameAr = safeDecodeUri(decodeHtmlEntities(rawNameAr || ''));
  const decodedSlug = safeDecodeUri(cat.slug || '');

  if (hasArabicText(decodedSlug) && (!nameAr || nameAr.includes('%'))) {
    nameAr = decodedSlug.replace(/[-_]/g, ' ');
  }

  let nameEn = rawNameEn ? safeDecodeUri(decodeHtmlEntities(rawNameEn)) : undefined;
  if (!nameEn || hasArabicText(nameEn) || nameEn === nameAr) {
    nameEn = translateArabicCategoryName(nameAr, decodedSlug);
  }

  const image = formatStorageUrl(cat.cat_image || cat.image || cat.image_path);

  const rawChildren =
    Array.isArray(cat.child) && cat.child.length > 0
      ? cat.child
      : Array.isArray(cat.subcategories) && cat.subcategories.length > 0
      ? cat.subcategories
      : Array.isArray(cat.sub_categories) && cat.sub_categories.length > 0
      ? cat.sub_categories
      : [];

  const subcategories: Subcategory[] = rawChildren.map((ch: any) => {
    const chRawAr = typeof ch.name === 'object' ? ch.name?.ar || ch.slug : ch.name || ch.slug;
    const chRawEn = typeof ch.name === 'object' ? ch.name?.en : undefined;
    let chAr = safeDecodeUri(decodeHtmlEntities(chRawAr || ''));
    const chSlug = safeDecodeUri(ch.slug || '');
    if (hasArabicText(chSlug) && (!chAr || chAr.includes('%'))) {
      chAr = chSlug.replace(/[-_]/g, ' ');
    }
    let chEn = chRawEn ? safeDecodeUri(decodeHtmlEntities(chRawEn)) : undefined;
    if (!chEn || hasArabicText(chEn) || chEn === chAr) {
      chEn = translateArabicCategoryName(chAr, chSlug);
    }
    const subImage = formatStorageUrl(ch.cat_image || ch.image || ch.image_path);
    return {
      id: String(ch.id),
      name: {
        ar: chAr,
        en: chEn,
      },
      slug: chSlug,
      image: subImage,
      count: ch.meta_data?.count || ch.count || 10,
    };
  });

  return {
    id: String(cat.id),
    name: {
      ar: nameAr,
      en: nameEn,
    },
    slug: decodedSlug,
    description: {
      ar: typeof cat.description === 'object' ? cat.description?.ar || nameAr : cat.description || nameAr,
      en: typeof cat.description === 'object' ? cat.description?.en || nameEn : cat.description || nameEn,
    },
    image,
    seoTitle: {
      ar: `${nameAr} | غراس فلوريست`,
      en: `${nameEn} | Grass Florist`,
    },
    seoDescription: {
      ar: `تسوق تشكيلة ${nameAr} الفاخرة من غراس فلوريست.`,
      en: `Shop luxury ${nameEn} from Grass Florist.`,
    },
    featured: Boolean(cat.is_visible),
    itemCount: cat.meta_data?.count || 12,
    subcategories,
  };
}

/**
 * Fetch products list from Laravel Backend REST API (with WooCommerce fallback)
 */
export async function getStoreProducts(params?: {
  per_page?: number;
  page?: number;
  category?: string | number;
  categoryIds?: number[];
  search?: string;
  orderby?: 'date' | 'price' | 'popularity' | 'rating' | 'title';
  order?: 'asc' | 'desc';
  featured?: boolean;
  locale?: Locale;
}): Promise<{ products: Product[]; total: number }> {
  try {
    const activeLocale = params?.locale || 'ar';
    let url = activeLocale === 'en'
      ? `${LARAVEL_API_BASE}/en/products`
      : `${LARAVEL_API_BASE}/products`;

    if (params?.search) {
      url = activeLocale === 'en'
        ? `${LARAVEL_API_BASE}/en/search?q=${encodeURIComponent(params.search)}`
        : `${LARAVEL_API_BASE}/search?q=${encodeURIComponent(params.search)}`;
    } else if (params?.category) {
      url = activeLocale === 'en'
        ? `${LARAVEL_API_BASE}/en/category/${encodeURIComponent(String(params.category))}`
        : `${LARAVEL_API_BASE}/category/${encodeURIComponent(String(params.category))}`;
    }

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Locale': activeLocale,
        ...(IS_DEV ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}),
      },
      cache: IS_DEV ? 'no-store' : 'default',
      next: IS_DEV ? undefined : { revalidate: 300 },
    });

    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : data.products || data.data || [];
      if (Array.isArray(rawList) && rawList.length > 0) {
        const products = rawList.map((item: any) => mapLaravelProductToProduct(item, activeLocale));
        cacheProducts(products);
        const limit = params?.per_page || 24;
        return {
          products: products.slice(0, limit),
          total: products.length,
        };
      }
    }

    // Resilient Fallback: If /category/{slug} returns 0 products (e.g. backend casting bug),
    // query /products and filter accurately by category IDs and meta_data slugs
    if (params?.category || (params?.categoryIds && params.categoryIds.length > 0)) {
      const allRes = await fetch(`${LARAVEL_API_BASE}/products`, {
        headers: {
          'Accept': 'application/json',
          'X-Locale': activeLocale,
          ...(IS_DEV ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}),
        },
        cache: IS_DEV ? 'no-store' : 'default',
        next: IS_DEV ? undefined : { revalidate: 300 },
      });

      if (allRes.ok) {
        const allData = await allRes.json();
        if (Array.isArray(allData) && allData.length > 0) {
          const catStr = params.category ? String(params.category).toLowerCase().trim() : '';
          const catDecoded = decodeURIComponent(catStr);
          const targetIds = (params.categoryIds || []).map(Number);
          if (catStr && !isNaN(Number(catStr))) {
            targetIds.push(Number(catStr));
          }

          const filtered = allData.filter((item: any) => {
            const itemCatIds = Array.isArray(item.category_id) ? item.category_id.map(Number) : [];
            const metaCats = Array.isArray(item.meta_data?.categories) ? item.meta_data.categories : [];

            if (targetIds.some((id) => itemCatIds.includes(id))) {
              return true;
            }

            if (
              catStr &&
              metaCats.some((c: any) => {
                const s = String(c.slug || '').toLowerCase();
                const n = String(c.name || '').toLowerCase();
                return s === catStr || s === catDecoded || n === catStr || n === catDecoded;
              })
            ) {
              return true;
            }

            return false;
          });

          if (filtered.length > 0) {
            const products = filtered.map((item: any) => mapLaravelProductToProduct(item, activeLocale));
            cacheProducts(products);
            const limit = params?.per_page || 24;
            return {
              products: products.slice(0, limit),
              total: products.length,
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('[getStoreProducts] Laravel API call failed, falling back:', err);
  }

  // Fallback to mock data
  return {
    products: fallbackProducts.slice(0, params?.per_page || 12),
    total: fallbackProducts.length,
  };
}

/**
 * Fast multi-strategy product lookup returning product details and related products from the API.
 * Arabic:  http://127.0.0.1:8000/api/products/{slug}
 * English: http://127.0.0.1:8000/api/en/products/{slug}
 */
export async function getStoreProductDetails(
  slug: string,
  locale?: Locale
): Promise<{ product: Product | null; relatedProducts: Product[] }> {
  if (!slug) return { product: null, relatedProducts: [] };

  const rawSlug = String(slug).trim();
  const decodedSlug = decodeURIComponent(rawSlug).trim();
  const activeLocale = locale || 'ar';

  try {
    // 1. Check in-memory cache for INSTANT 0ms response (production only)
    if (!IS_DEV && productMemoryCache.has(decodedSlug.toLowerCase())) {
      const cached = productMemoryCache.get(decodedSlug.toLowerCase())!;
      return { product: cached, relatedProducts: [] };
    }

    // 2. Direct API fetch from Laravel Backend (with en / ar prefix matching user's spec)
    const apiUrl = activeLocale === 'en'
      ? `${LARAVEL_API_BASE}/en/products/${encodeURIComponent(decodedSlug)}`
      : `${LARAVEL_API_BASE}/products/${encodeURIComponent(decodedSlug)}`;

    const res = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Locale': activeLocale,
        ...(IS_DEV ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}),
      },
      cache: IS_DEV ? 'no-store' : 'default',
      next: IS_DEV ? undefined : { revalidate: 300 },
    });

    if (res.ok) {
      const data = await res.json();
      const rawProduct = data.product || data;
      if (rawProduct && rawProduct.id) {
        const product = mapLaravelProductToProduct(rawProduct, activeLocale);
        cacheProduct(product);

        const rawRelated = Array.isArray(data.related_products)
          ? data.related_products
          : Array.isArray(data.bought_together)
          ? data.bought_together
          : [];

        const relatedProducts = rawRelated.map((p: any) =>
          mapLaravelProductToProduct(p, activeLocale)
        );

        return { product, relatedProducts };
      }
    }
  } catch (error) {
    console.error(`[getStoreProductDetails] Error for slug ${slug}:`, error);
  }

  // 3. Fallback to mock products
  const fallback = fallbackProducts.find(
    (p) =>
      p.slug.ar.toLowerCase() === decodedSlug.toLowerCase() ||
      p.slug.en.toLowerCase() === decodedSlug.toLowerCase() ||
      p.id === decodedSlug
  );
  return { product: fallback || null, relatedProducts: [] };
}

export async function getStoreProductBySlug(slug: string, locale?: Locale): Promise<Product | null> {
  const { product } = await getStoreProductDetails(slug, locale);
  return product;
}

/**
 * Fetch all categories from Laravel Backend REST API
 * Arabic:  http://127.0.0.1:8000/api/category
 * English: http://127.0.0.1:8000/api/en/category
 */
export async function getStoreCategories(locale?: Locale): Promise<Category[]> {
  try {
    const activeLocale = locale || 'ar';
    const apiUrl = activeLocale === 'en'
      ? `${LARAVEL_API_BASE}/en/category`
      : `${LARAVEL_API_BASE}/category`;

    const res = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Locale': activeLocale,
        ...(IS_DEV ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}),
      },
      cache: IS_DEV ? 'no-store' : 'default',
      next: IS_DEV ? undefined : { revalidate: 300 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapLaravelCategoryToCategory);
      }
    }
  } catch (error) {
    console.warn('[getStoreCategories] Error fetching categories from Laravel:', error);
  }

  return fallbackCategories;
}


export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  // English to Arabic slug mappings
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

export const REVERSE_SLUG_ALIASES: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_ALIASES).map(([en, ar]) => [ar, en])
);

/**
 * Helper to resolve category slug in either language
 */
export function getCategorySlugForLocale(slug: string, targetLocale: Locale): string {
  const decoded = decodeURIComponent(slug).trim().toLowerCase();
  if (targetLocale === 'en') {
    return REVERSE_SLUG_ALIASES[decoded] || decoded;
  }
  return CATEGORY_SLUG_ALIASES[decoded] || decoded;
}

/**
 * Fetch category details by slug, including its products
 * Arabic:  http://127.0.0.1:8000/api/category/{slug}
 * English: http://127.0.0.1:8000/api/en/category/{slug}
 */
export async function getStoreCategoryBySlug(
  slug: string,
  locale?: Locale
): Promise<{ category: Category | null; products: Product[] }> {
  try {
    const decodedSlug = decodeURIComponent(slug).trim();
    const activeLocale = locale || 'ar';
    const mappedSlug =
      CATEGORY_SLUG_ALIASES[decodedSlug.toLowerCase()] ||
      REVERSE_SLUG_ALIASES[decodedSlug.toLowerCase()] ||
      decodedSlug;

    // 1. Direct fetch from Laravel API category endpoint
    const candidates = [decodedSlug, mappedSlug];
    for (const cand of candidates) {
      const apiUrl = activeLocale === 'en'
        ? `${LARAVEL_API_BASE}/en/category/${encodeURIComponent(cand)}`
        : `${LARAVEL_API_BASE}/category/${encodeURIComponent(cand)}`;

      try {
        const res = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'X-Locale': activeLocale,
            ...(IS_DEV ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}),
          },
          cache: IS_DEV ? 'no-store' : 'default',
          next: IS_DEV ? undefined : { revalidate: 300 },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.category) {
            const catPayload = {
              ...data.category,
              child:
                Array.isArray(data.category.child) && data.category.child.length > 0
                  ? data.category.child
                  : Array.isArray(data.sub_categories) && data.sub_categories.length > 0
                  ? data.sub_categories
                  : Array.isArray(data.subcategories) && data.subcategories.length > 0
                  ? data.subcategories
                  : [],
            };
            const category = mapLaravelCategoryToCategory(catPayload);
            const rawProducts = Array.isArray(data.products) ? data.products : [];
            const products = rawProducts.map((p: any) => mapLaravelProductToProduct(p, activeLocale));
            return { category, products };
          }
        }
      } catch {
        // Continue to next candidate or fallback
      }
    }

    const categories = await getStoreCategories(activeLocale);

    // Match category by slug, alias, name, or id
    let matchedCategory =
      categories.find(
        (c) =>
          c.slug.toLowerCase() === decodedSlug ||
          c.slug.toLowerCase() === mappedSlug ||
          c.name.ar.toLowerCase() === decodedSlug ||
          c.name.ar.toLowerCase() === mappedSlug ||
          c.name.en.toLowerCase() === decodedSlug ||
          c.name.en.toLowerCase() === mappedSlug ||
          c.id === decodedSlug ||
          c.id === mappedSlug
      ) || null;

    // Check in subcategories if not in top level
    if (!matchedCategory) {
      for (const parentCat of categories) {
        const sub = parentCat.subcategories.find(
          (s) =>
            s.slug.toLowerCase() === decodedSlug ||
            s.slug.toLowerCase() === mappedSlug ||
            s.id === decodedSlug ||
            s.id === mappedSlug
        );
        if (sub) {
          matchedCategory = {
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            description: parentCat.description,
            image: parentCat.image,
            seoTitle: sub.name,
            seoDescription: parentCat.seoDescription,
            featured: true,
            itemCount: sub.count || 0,
            subcategories: [],
          };
          break;
        }
      }
    }

    // If still not matched, check fallback categories
    if (!matchedCategory) {
      matchedCategory =
        fallbackCategories.find(
          (c) =>
            c.slug === decodedSlug ||
            c.slug === mappedSlug ||
            c.id === decodedSlug ||
            c.id === mappedSlug
        ) || null;
    }

    // Gather all target category IDs (parent + all subcategories)
    const allTargetIds: number[] = [];
    if (matchedCategory) {
      if (!isNaN(Number(matchedCategory.id))) {
        allTargetIds.push(Number(matchedCategory.id));
      }
      if (Array.isArray(matchedCategory.subcategories)) {
        matchedCategory.subcategories.forEach((sub) => {
          if (!isNaN(Number(sub.id))) {
            allTargetIds.push(Number(sub.id));
          }
        });
      }
    }

    // Fetch products for category using slug and category IDs
    const categoryFilter = matchedCategory ? (matchedCategory.slug || matchedCategory.id) : mappedSlug;
    const { products } = await getStoreProducts({
      category: categoryFilter,
      categoryIds: allTargetIds,
      per_page: 24,
      locale,
    });

    return {
      category: matchedCategory,
      products,
    };
  } catch (error) {
    console.error(`[getStoreCategoryBySlug] Error for slug ${slug}:`, error);
    const decodedSlug = decodeURIComponent(slug).trim().toLowerCase();
    const mappedSlug =
      CATEGORY_SLUG_ALIASES[decodedSlug] ||
      REVERSE_SLUG_ALIASES[decodedSlug] ||
      decodedSlug;
    const fallbackCat =
      fallbackCategories.find(
        (c) => c.slug === decodedSlug || c.slug === mappedSlug
      ) || null;
    const fallbackProds = fallbackProducts.filter(
      (p) => p.categorySlug === decodedSlug || p.categorySlug === mappedSlug
    );
    return {
      category: fallbackCat,
      products: fallbackProds,
    };
  }
}

export interface HomeCategorySection {
  id: string;
  title: {
    ar: string;
    en: string;
  };
  subtitle: {
    ar: string;
    en: string;
  };
  categorySlug: string;
  viewAllUrl: {
    ar: string;
    en: string;
  };
  products: Product[];
}

/**
 * Fetch products for the 4 homepage category carousel sections in parallel
 */
export async function getHomeCategorySections(locale: Locale): Promise<HomeCategorySection[]> {
  try {
    const [
      bouquetsRes,
      luxuryRes,
      cakesRes,
      balloonsRes,
      allProductsRes,
    ] = await Promise.all([
      getStoreProducts({ category: 'all-flowers', categoryIds: [32, 221], per_page: 12, locale }),
      getStoreProducts({ category: 'luxury-bouquets', categoryIds: [25, 214], per_page: 12, locale }),
      getStoreProducts({ category: 'cake-chocolate', categoryIds: [31, 220], per_page: 12, locale }),
      getStoreProducts({ category: 'balloons', categoryIds: [30, 219], per_page: 12, locale }),
      getStoreProducts({ per_page: 24, locale }),
    ]);

    const fallbackSlice = allProductsRes.products;

    const sections: HomeCategorySection[] = [
      {
        id: 'bouquets',
        title: {
          ar: 'اكتشف باقاتنا',
          en: 'Explore our Bouquets',
        },
        subtitle: {
          ar: 'نوصل مشاعرك من خلال زهورنا المتميزة التي تناسب جميع الأذواق والمناسبات',
          en: 'Delivering emotions through flowers is our specialty by creating meaningful moments with carefully crafted arrangements.',
        },
        categorySlug: 'جميع-الزهور',
        viewAllUrl: {
          ar: '/category/جميع-الزهور',
          en: '/en/category/all-flowers',
        },
        products: bouquetsRes.products.length > 0 ? bouquetsRes.products : fallbackSlice.slice(0, 12),
      },
      {
        id: 'luxury-bouquets',
        title: {
          ar: 'باقات فاخرة',
          en: 'Luxury Bouquets',
        },
        subtitle: {
          ar: 'يمكنك أرسال باقاتنا الفاخرة إلى أصدقائك وعائلتك وأحبتك.',
          en: 'Send our Luxury Bouquets to impress your friends, family and loved ones.',
        },
        categorySlug: 'باقات-فاخرة',
        viewAllUrl: {
          ar: '/category/باقات-فاخرة',
          en: '/en/category/luxury-bouquets',
        },
        products: luxuryRes.products.length > 0 ? luxuryRes.products : fallbackSlice.slice(4, 16),
      },
      {
        id: 'cakes-chocolate',
        title: {
          ar: 'اكتشف الكيك و الشوكولاتة',
          en: 'Explore Cakes & Chocolate',
        },
        subtitle: {
          ar: 'نقوم بتوصيل الكيك والشوكولاتة لكل مناسبة.',
          en: 'We deliver cakes & chocolate for every occasion.',
        },
        categorySlug: 'كيك-وشوكولاته',
        viewAllUrl: {
          ar: '/category/كيك-وشوكولاته',
          en: '/en/category/cake-chocolate',
        },
        products: cakesRes.products.length > 0 ? cakesRes.products : fallbackSlice.slice(8, 20),
      },
      {
        id: 'balloons',
        title: {
          ar: 'بالوناتنا',
          en: 'Our Balloons',
        },
        subtitle: {
          ar: 'لونوا مناسباتكم بالبالونات الرائعة.',
          en: 'Color your occasions by wonderful balloons.',
        },
        categorySlug: 'بالونات',
        viewAllUrl: {
          ar: '/category/بالونات',
          en: '/en/category/balloons',
        },
        products: balloonsRes.products.length > 0 ? balloonsRes.products : fallbackSlice.slice(12, 24),
      },
    ];

    return sections;
  } catch (error) {
    console.error('[getHomeCategorySections] Error fetching category sections:', error);
    return [];
  }
}

/**
 * Fetch home page live collections (Categories, Featured, Best Sellers, New Arrivals, Category Sections)
 */
export async function getHomePageData(locale: Locale) {
  try {
    const res = await fetch(`${LARAVEL_API_BASE}/home-page`, {
      headers: {
        'Accept': 'application/json',
        'X-Locale': locale,
        ...(IS_DEV ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}),
      },
      cache: IS_DEV ? 'no-store' : 'default',
      next: IS_DEV ? undefined : { revalidate: 60 },
    });

    if (res.ok) {
      const homeData = await res.json();

      const popularCats: Category[] = Array.isArray(homeData.popular_section?.popular_category)
        ? homeData.popular_section.popular_category.map(mapLaravelCategoryToCategory)
        : [];

      const bestSellerProducts: Product[] = Array.isArray(homeData.best_sellers_section?.products)
        ? homeData.best_sellers_section.products.map((item: any) => mapLaravelProductToProduct(item, locale))
        : [];

      const [allCats, allProductsRes] = await Promise.all([
        getStoreCategories(locale),
        getStoreProducts({ per_page: 12, locale }),
      ]);

      const categories = popularCats.length > 0 ? popularCats : allCats;
      const featuredProducts = allProductsRes.products.slice(0, 4);
      const bestsellers =
        bestSellerProducts.length > 0
          ? bestSellerProducts
          : allProductsRes.products.slice(0, 8);
      const newArrivals = allProductsRes.products.slice(0, 8);
      // Dynamic category sections from Admin HomePage repeater
      let dynamicCategorySections: HomeCategorySection[] = [];
      if (Array.isArray(homeData.category_sections) && homeData.category_sections.length > 0) {
        dynamicCategorySections = homeData.category_sections.map((sec: any) => ({
          id: sec.id || `sec-${sec.category_id}`,
          title: {
            ar: sec.title?.ar || sec.title?.en || '',
            en: sec.title?.en || sec.title?.ar || '',
          },
          subtitle: {
            ar: sec.subtitle?.ar || sec.subtitle?.en || '',
            en: sec.subtitle?.en || sec.subtitle?.ar || '',
          },
          categorySlug: sec.categorySlug || '',
          viewAllUrl: {
            ar: sec.viewAllUrl?.ar || `/category/${sec.categorySlug}`,
            en: sec.viewAllUrl?.en || `/en/category/${sec.categorySlug}`,
          },
          products: Array.isArray(sec.products)
            ? sec.products.map((p: any) => mapLaravelProductToProduct(p, locale))
            : [],
        })).filter((sec: any) => sec.products.length > 0);
      }

      const categorySections = dynamicCategorySections.length > 0
        ? dynamicCategorySections
        : await getHomeCategorySections(locale);

      const blogSection = {
        title: homeData.blog_section?.title || (locale === 'ar' ? 'إلهام وأسرار العناية بالزهور' : 'Floral Inspiration & Care Guides'),
        subtitle: homeData.blog_section?.subtitle || '',
        posts: Array.isArray(homeData.blog_section?.posts) ? homeData.blog_section.posts : [],
      };

      const testimonialsSection = {
        title: homeData.testimonials_section?.title || (locale === 'ar' ? 'تجارب عملائنا المميزين' : 'Stories from Our Clients'),
        subtitle: homeData.testimonials_section?.subtitle || '',
        testimonials: Array.isArray(homeData.testimonials_section?.testimonials) ? homeData.testimonials_section.testimonials : [],
      };

      const faqSection = {
        title: homeData.faq_section?.title || (locale === 'ar' ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions'),
        subtitle: homeData.faq_section?.subtitle || '',
        faqs: Array.isArray(homeData.faq_section?.faqs) ? homeData.faq_section.faqs : [],
      };

      const heroSlides = Array.isArray(homeData.slider_section) && homeData.slider_section.length > 0
        ? homeData.slider_section.map((slide: any, index: number) => {
            const rawImg = slide.image || (locale === 'ar' ? (slide.slider_image_ar || slide.slider_image_en) : (slide.slider_image_en || slide.slider_image_ar)) || slide.slider_image;
            const linkUrl = slide.link || slide.slider_url || (locale === 'ar' ? '/products' : '/en/products');
            return {
              id: `admin-slide-${index + 1}`,
              image: rawImg,
              link: linkUrl,
              title: {
                ar: slide.title?.ar || 'توصيل الزهور في جدة خلال نفس اليوم',
                en: slide.title?.en || 'Flowers delivery in Jeddah within the Same Day',
              },
            };
          }).filter((s: any) => Boolean(s.image))
        : [];

      const popularSection = {
        title: homeData.popular_section?.popular_title || (locale === 'ar' ? 'التصنيفات الأكثر طلباً' : 'Popular Categories'),
        subtitle: homeData.popular_section?.popular_subtitle || '',
      };

      const editorialBanner = {
        title: homeData.editorial_banner?.title || (locale === 'ar' ? "توصيل في نفس اليوم\nزهور وهدايا فاخرة" : "Same Day Delivery\nFlowers & Gifts"),
        buttonText: homeData.editorial_banner?.button_text || (locale === 'ar' ? 'تسوق زهور اليوم نفسه' : 'Shop Same Day Flowers'),
        buttonUrl: homeData.editorial_banner?.button_url || (locale === 'ar' ? '/category/جميع-الزهور' : '/en/category/all-flowers'),
        image: homeData.editorial_banner?.image || '/editorial-woman-bouquet.webp',
      };

      const benefitsSection = Array.isArray(homeData.benefits_section) ? homeData.benefits_section : [];
      const eventsSection = homeData.events_section || null;

      return {
        heroSlides,
        categories: categories.filter((c) => c.image),
        popularSection,
        editorialBanner,
        benefitsSection,
        eventsSection,
        featuredProducts:
          featuredProducts.length > 0 ? featuredProducts : fallbackProducts.slice(0, 4),
        bestsellers:
          bestsellers.length > 0 ? bestsellers : fallbackProducts.slice(0, 8),
        newArrivals:
          newArrivals.length > 0 ? newArrivals : fallbackProducts.slice(0, 8),
        categorySections,
        blogSection,
        testimonialsSection,
        faqSection,
      };
    }
  } catch (error) {
    console.warn('[getHomePageData] Error loading from Laravel /api/home-page:', error);
  }

  // Fallback
  return {
    heroSlides: [],
    categories: fallbackCategories,
    popularSection: {
      title: locale === 'ar' ? 'التصنيفات الأكثر طلباً' : 'Popular Categories',
      subtitle: locale === 'ar' ? 'استكشف باقات الزهور وتنسيقات الهدايا حسب التصنيف المفضل لديك' : 'Everything to shop from, chosen with love and precision',
    },
    editorialBanner: {
      title: locale === 'ar' ? "توصيل في نفس اليوم\nزهور وهدايا فاخرة" : "Same Day Delivery\nFlowers & Gifts",
      buttonText: locale === 'ar' ? 'تسوق زهور اليوم نفسه' : 'Shop Same Day Flowers',
      buttonUrl: locale === 'ar' ? '/category/جميع-الزهور' : '/en/category/all-flowers',
      image: '/editorial-woman-bouquet.webp',
    },
    benefitsSection: [],
    eventsSection: null,
    featuredProducts: fallbackProducts.slice(0, 4),
    bestsellers: fallbackProducts.slice(0, 8),
    newArrivals: fallbackProducts.slice(0, 8),
    categorySections: [],
    blogSection: {
      title: locale === 'ar' ? 'إلهام وأسرار العناية بالزهور' : 'Floral Inspiration & Care Guides',
      subtitle: '',
      posts: [],
    },
    testimonialsSection: {
      title: locale === 'ar' ? 'تجارب عملائنا المميزين' : 'Stories from Our Clients',
      subtitle: '',
      testimonials: [],
    },
    faqSection: {
      title: locale === 'ar' ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions',
      subtitle: '',
      faqs: fallbackFaqs.slice(0, 5),
    },
  };
}

/**
 * Fetch all published blog posts from Laravel /api/blog
 */
export async function getBlogPosts(locale: Locale): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${LARAVEL_API_BASE}/blog`, {
      headers: {
        'Accept': 'application/json',
        'X-Locale': locale,
        ...(IS_DEV ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}),
      },
      cache: IS_DEV ? 'no-store' : 'default',
      next: IS_DEV ? undefined : { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as BlogPost[];
      }
    }
  } catch (error) {
    console.warn('[getBlogPosts] Error loading from Laravel /api/blog:', error);
  }

  return fallbackBlogPosts;
}

/**
 * Fetch a single blog post by slug from Laravel /api/blog/{slug}
 */
export async function getBlogPostBySlug(slug: string, locale: Locale): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${LARAVEL_API_BASE}/blog/${encodeURIComponent(slug)}`, {
      headers: {
        'Accept': 'application/json',
        'X-Locale': locale,
        ...(IS_DEV ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}),
      },
      cache: IS_DEV ? 'no-store' : 'default',
      next: IS_DEV ? undefined : { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.id) {
        return data as BlogPost;
      }
    }
  } catch (error) {
    console.warn(`[getBlogPostBySlug] Error loading from Laravel /api/blog/${slug}:`, error);
  }

  // Fallback to static fallbackBlogPosts
  return fallbackBlogPosts.find((p) => p.slug.ar === slug || p.slug.en === slug) || null;
}

/**
 * Fetch all FAQs from Laravel /api/faqs
 */
export async function getFaqs(locale: Locale): Promise<FAQItem[]> {
  try {
    const res = await fetch(`${LARAVEL_API_BASE}/faqs`, {
      headers: {
        'Accept': 'application/json',
        'X-Locale': locale,
        ...(IS_DEV ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}),
      },
      cache: IS_DEV ? 'no-store' : 'default',
      next: IS_DEV ? undefined : { revalidate: 60 },
    });

    if (res.ok) {
      const json = await res.json();
      const list = json?.data || json;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any) => ({
          id: String(item.id),
          category: item.category || 'General',
          question: {
            ar: item.translations?.question?.ar || (typeof item.question === 'object' ? item.question?.ar : item.question) || '',
            en: item.translations?.question?.en || (typeof item.question === 'object' ? item.question?.en : item.question) || '',
          },
          answer: {
            ar: item.translations?.answer?.ar || (typeof item.answer === 'object' ? item.answer?.ar : item.answer) || '',
            en: item.translations?.answer?.en || (typeof item.answer === 'object' ? item.answer?.en : item.answer) || '',
          },
          sort_order: item.sort_order ?? 0,
        }));
      }
    }
  } catch (error) {
    console.warn('[getFaqs] Error loading from Laravel /api/faqs:', error);
  }

  return fallbackFaqs;
}

export interface CmsPageData {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  content?: string;
  banner_images?: string[];
  updated_at?: string | null;
  seo?: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  };
}

/**
 * Fetch a CMS page by slug from Laravel /api/cms-pages/{slug}
 */
export async function getCmsPageBySlug(slug: string, locale: Locale): Promise<CmsPageData | null> {
  try {
    const res = await fetch(`${LARAVEL_API_BASE}/cms-pages/${encodeURIComponent(slug)}`, {
      headers: {
        'Accept': 'application/json',
        'X-Locale': locale,
        ...(IS_DEV ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}),
      },
      cache: IS_DEV ? 'no-store' : 'default',
      next: IS_DEV ? undefined : { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return data as CmsPageData;
      }
    }
  } catch (error) {
    console.warn(`[getCmsPageBySlug] Error loading from Laravel /api/cms-pages/${slug}:`, error);
  }

  return null;
}

export interface ContactPageData {
  badge: string;
  title: string;
  subtitle: string;
  form_title: string;
  inquiries_title: string;
  phone: string;
  whatsapp: string;
  email: string;
  working_hours: string;
  ateliers_title: string;
  city: string;
  address: string;
  map_link?: string | null;
  seo?: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  };
}

const fallbackContactDataEn: ContactPageData = {
  badge: 'ALWAYS AT YOUR SERVICE',
  title: 'Connect with Our Concierge',
  subtitle: 'We are at your service for bespoke floral requests, event styling, and delivery inquiries.',
  form_title: 'Send an Inquiry',
  inquiries_title: 'DIRECT INQUIRIES',
  phone: '+966 55 513 4211',
  whatsapp: '+966 55 513 4211',
  email: 'info@grassflorist.com',
  working_hours: 'Daily 9:00 AM - 11:30 PM AST',
  ateliers_title: 'BOUTIQUE ATELIERS',
  city: 'Jeddah',
  address: '4366 Al Kayyal Street, Al-Rawdah District, Jeddah 23434, Saudi Arabia',
};

const fallbackContactDataAr: ContactPageData = {
  badge: 'نحن في خدمتك',
  title: 'تواصل مع خدمة العملاء',
  subtitle: 'نحن في خدمتكم لتلبية طلبات الزهور وتنسيق المناسبات والاستفسارات الفاخرة.',
  form_title: 'أرسل استفسارك',
  inquiries_title: 'التواصل المباشر',
  phone: '+966 55 513 4211',
  whatsapp: '+966 55 513 4211',
  email: 'info@grassflorist.com',
  working_hours: 'يومياً من 9:00 صباحاً حتى 11:30 مساءً',
  ateliers_title: 'فروعنا وبوتيكاتنا',
  city: 'جدة',
  address: '٤٣٦٦ شارع الكيال، حي الروضة، جدة ٢٣٤٣٤، المملكة العربية السعودية',
};

/**
 * Fetch Contact Page Content from Laravel /api/contact-page
 */
export async function getContactPageData(locale: Locale): Promise<ContactPageData> {
  const fallback = locale === 'ar' ? fallbackContactDataAr : fallbackContactDataEn;
  try {
    const url = locale === 'en' ? `${LARAVEL_API_BASE}/en/contact-page` : `${LARAVEL_API_BASE}/contact-page`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Locale': locale,
        ...(IS_DEV ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}),
      },
      cache: IS_DEV ? 'no-store' : 'default',
      next: IS_DEV ? undefined : { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          badge: data.badge || fallback.badge,
          title: data.title || fallback.title,
          subtitle: data.subtitle || fallback.subtitle,
          form_title: data.form_title || fallback.form_title,
          inquiries_title: data.inquiries_title || fallback.inquiries_title,
          phone: data.phone || fallback.phone,
          whatsapp: data.whatsapp || fallback.whatsapp,
          email: data.email || fallback.email,
          working_hours: data.working_hours || fallback.working_hours,
          ateliers_title: data.ateliers_title || fallback.ateliers_title,
          city: data.city || fallback.city,
          address: data.address || fallback.address,
          map_link: data.map_link || null,
          seo: data.seo,
        };
      }
    }
  } catch (error) {
    console.warn('[getContactPageData] Error loading from Laravel /api/contact-page:', error);
  }

  return fallback;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
}

/**
 * Submit Contact Inquiry to Laravel /api/contact-form
 */
export async function submitContactInquiry(payload: ContactFormPayload): Promise<{ success: boolean; message: string; inquiry_id?: number }> {
  const url = `${LARAVEL_API_BASE}/contact-form`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg = data?.message || (data?.errors ? Object.values(data.errors).flat().join(', ') : 'Failed to submit inquiry');
    throw new Error(errorMsg);
  }

  return {
    success: true,
    message: data?.message || 'Your message has been sent successfully!',
    inquiry_id: data?.inquiry_id,
  };
}

export interface DynamicNavItem {
  id: string;
  name: { en: string; ar: string };
  href: { en: string; ar: string };
  hasDropdown: boolean;
  dropdownType?: 'mega' | 'simple';
  showcaseType?: 'category_random_product' | 'custom_card' | 'none';
  featuredCategoryId?: number | string;
  subcategories?: Array<{
    id: string;
    name: { en: string; ar: string };
    href: { en: string; ar: string };
    icon?: string;
    children?: Array<{
      id: string;
      name: { en: string; ar: string };
      href: { en: string; ar: string };
    }>;
  }>;
  featuredProduct?: {
    id: number;
    name: { en: string; ar: string };
    price: number;
    image: string;
    slug: { en: string; ar: string };
    categoryName?: { en: string; ar: string };
    badge: { en: string; ar: string };
    cta: { en: string; ar: string };
  };
  featuredCard?: {
    title: { en: string; ar: string };
    desc: { en: string; ar: string };
    image: string;
    tag: { en: string; ar: string };
    link?: { en: string; ar: string };
  };
}

export interface DynamicFooterData {
  column_1?: {
    title: { en: string; ar: string };
    categories?: Array<{
      id: string;
      name: { en: string; ar: string };
      href: { en: string; ar: string };
    }>;
  };
  column_2?: {
    title: { en: string; ar: string };
    links: Array<{
      id: string;
      name: { en: string; ar: string };
      href: { en: string; ar: string };
    }>;
  };
  column_3?: {
    title: { en: string; ar: string };
    links: Array<{
      id: string;
      name: { en: string; ar: string };
      href: { en: string; ar: string };
    }>;
  };
  settings?: {
    delivery_city: { en: string; ar: string };
    delivery_badge: { en: string; ar: string };
  };
}

export interface DynamicNavigationResponse {
  header: DynamicNavItem[];
  footer: DynamicFooterData;
}

/**
 * Fetch Dynamic Navigation (Header & Footer) from backend
 */
export async function getNavigationData(): Promise<DynamicNavigationResponse | null> {
  try {
    const url = `${LARAVEL_API_BASE}/navigation`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        // Normalize header items to match NavItem structure
        const header: DynamicNavItem[] = (data.header || []).map((item: any) => ({
          id: item.id || String(Math.random()),
          name: {
            en: item.name_en || (typeof item.name === 'object' ? item.name?.en : item.name) || '',
            ar: item.name_ar || (typeof item.name === 'object' ? item.name?.ar : item.name) || '',
          },
          href: {
            en: item.url_en || (typeof item.href === 'object' ? item.href?.en : item.href) || '',
            ar: item.url_ar || (typeof item.href === 'object' ? item.href?.ar : item.href) || '',
          },
          hasDropdown: Boolean(item.has_dropdown),
          dropdownType: item.dropdown_type || 'simple',
          showcaseType: item.showcase_type || 'none',
          featuredCategoryId: item.featured_category_id,
          subcategories: (item.subcategories || []).map((sub: any) => ({
            id: sub.id || String(Math.random()),
            name: {
              en: sub.name_en || (typeof sub.name === 'object' ? sub.name?.en : sub.name) || '',
              ar: sub.name_ar || (typeof sub.name === 'object' ? sub.name?.ar : sub.name) || '',
            },
            href: {
              en: sub.url_en || (typeof sub.href === 'object' ? sub.href?.en : sub.href) || '',
              ar: sub.url_ar || (typeof sub.href === 'object' ? sub.href?.ar : sub.href) || '',
            },
            icon: sub.icon || 'flower',
            children: (sub.children || []).map((child: any) => ({
              id: child.id || String(Math.random()),
              name: {
                en: child.name_en || (typeof child.name === 'object' ? child.name?.en : child.name) || '',
                ar: child.name_ar || (typeof child.name === 'object' ? child.name?.ar : child.name) || '',
              },
              href: {
                en: child.url_en || (typeof child.href === 'object' ? child.href?.en : child.href) || '',
                ar: child.url_ar || (typeof child.href === 'object' ? child.href?.ar : child.href) || '',
              },
            })),
          })),
          featuredProduct: item.featured_product || undefined,
          featuredCard: item.featured_card || undefined,
        }));

        // Normalize footer items
        const rawFooter = data.footer || {};
        const rawSettings = data.footer_settings || {};

        const footer: DynamicFooterData = {
          column_1: rawFooter.column_1 ? {
            title: {
              en: rawFooter.column_1.title_en || 'CATEGORIES',
              ar: rawFooter.column_1.title_ar || 'التصنيفات',
            },
            categories: (rawFooter.column_1.categories || []).map((c: any) => ({
              id: c.id,
              name: { en: c.name_en, ar: c.name_ar },
              href: { en: c.url_en, ar: c.url_ar },
            })),
          } : undefined,
          column_2: rawFooter.column_2 ? {
            title: {
              en: rawFooter.column_2.title_en || 'QUICK LINKS',
              ar: rawFooter.column_2.title_ar || 'روابط سريعة',
            },
            links: (rawFooter.column_2.links || []).map((l: any) => ({
              id: l.id || String(Math.random()),
              name: { en: l.name_en, ar: l.name_ar },
              href: { en: l.url_en, ar: l.url_ar },
            })),
          } : undefined,
          column_3: rawFooter.column_3 ? {
            title: {
              en: rawFooter.column_3.title_en || 'POLICIES',
              ar: rawFooter.column_3.title_ar || 'السياسات',
            },
            links: (rawFooter.column_3.links || []).map((l: any) => ({
              id: l.id || String(Math.random()),
              name: { en: l.name_en, ar: l.name_ar },
              href: { en: l.url_en, ar: l.url_ar },
            })),
          } : undefined,
          settings: {
            delivery_city: {
              en: rawSettings.delivery_city_en || 'Jeddah',
              ar: rawSettings.delivery_city_ar || 'جدة',
            },
            delivery_badge: {
              en: rawSettings.delivery_badge_en || 'Delivery to',
              ar: rawSettings.delivery_badge_ar || 'التوصيل إلى',
            },
          },
        };

        return { header, footer };
      }
    }
  } catch (err) {
    console.warn('[getNavigationData] Failed to fetch dynamic navigation:', err);
  }
  return null;
}


