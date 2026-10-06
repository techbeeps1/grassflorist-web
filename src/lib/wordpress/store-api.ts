import { Product, LocalizedString } from '@/types/product';
import { Category, Subcategory } from '@/types/category';
import { type Locale } from '@/config/site';
import { products as fallbackProducts } from '@/data/products';
import { categories as fallbackCategories } from '@/data/categories';

const STORE_API_BASE = 'https://grassflorist.com/wp-json/wc/store/v1';

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
 * Decodes all HTML entities commonly returned by WooCommerce REST APIs
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
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
  const clean = decodeHtmlEntities(categoryName).trim();
  if (!hasArabicText(clean)) return clean;

  const CATEGORY_MAP: Record<string, string> = {
    'جميع الزهور': 'All Flowers',
    'باقات فاخرة': 'Luxury Bouquets',
    'كيك وشوكولاته': 'Cakes & Chocolates',
    'كيك وشوكولاتة': 'Cakes & Chocolates',
    'بالونات': 'Balloons',
    'المناسبات': 'Occasions',
    'جميع المناسبات': 'All Occasions',
    'مسكات عروس': 'Bridal Bouquet',
    'مسكة عروس': 'Bridal Bouquet',
    'باقات العروس': 'Bridal Bouquet',
    'الألوان': 'Colors',
    'الوان': 'Colors',
    'بيج': 'Beige',
    'بيج-2': 'Beige',
    'أبيض': 'White',
    'ابيض': 'White',
    'أحمر': 'Red',
    'احمر': 'Red',
    'أخضر': 'Green',
    'اخضر': 'Green',
    'أصفر': 'Yellow',
    'اصفر': 'Yellow',
    'بنفسجي': 'Purple',
    'وردي': 'Pink',
    'زهري': 'Pink',
    'أزرق': 'Blue',
    'ازرق': 'Blue',
    'برتقالي': 'Orange',
    'أسود': 'Black',
    'اسود': 'Black',
    'فضي': 'Silver',
    'ذهبي': 'Gold',
    'بالونات الحروف': 'Letters Balloons',
    'بالونات أحرف': 'Letters Balloons',
    'رمضان': 'Ramadan',
    'اقتراحات': 'Suggestions',
    'فلنتاين': 'Valentine',
    'فالنتاين': 'Valentine',
    'عيد الحب': 'Valentine',
    'هاند بوكيه': 'Hand Bouquets',
    'هاند-بوكيه': 'Hand Bouquets',
    'فازات ورد': 'Flower Vases',
    'بوكسات ورد': 'Luxury Box',
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
    'أحرف ذهبية': 'Golden Letters',
    'أحرف فضية': 'Silver Letters',
    'بالونات الأرقام': 'Number Balloons',
    'الأرقام الذهبية': 'Golden Numbers',
    'أرقام فضية': 'Silver Numbers',
    'العيد': 'Eid',
    'اليوم الوطني': 'National Day',
    'اكتوبر الوردي': 'Pink October',
    'الأفضل مبيعاً': 'Best Sellers',
    'شكراً': 'Thank You',
    'Flag Day': 'Flag Day',
    'Foundation day': 'Foundation Day',
    'flag-day-ar': 'Flag Day',
    'foundation-day-ar': 'Foundation Day',
  };

  if (CATEGORY_MAP[clean]) {
    return CATEGORY_MAP[clean];
  }

  if (slug && !hasArabicText(slug)) {
    return slug
      .split(/[-_]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
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

export const CATEGORY_DESC_ARABIC_MAP: Record<string, string> = {
  'جميع الزهور': 'اطلب أرقى تشكيلة من الزهور مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'باقات فاخرة': 'اطلب أرقى تشكيلة من الباقات الفاخرة مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'مسكات عروس': 'اطلب أرقى باقات ومسكات العروس الفاخرة مع توصيل سريع من غراس فلوريست',
  'الألوان': 'تصفح تشكيلة الزهور والهدايا حسب لونك المفضل مع توصيل سريع من غراس فلوريست',
  'المناسبات': 'اطلب أجمل تنسيقات الزهور والهدايا لجميع مناسباتكم السعيدة من غراس فلوريست',
  'رمضان': 'أجمل باقات وتنسيقات زهور وهدايا شهر رمضان المبارك مع توصيل سريع من غراس فلوريست',
  'اقتراحات': 'اكتشف أفضل اقتراحات وتنسيقات الزهور المختارة بعناية من خبراء غراس فلوريست',
  'فلنتاين': 'أرقى باقات الورد والهدايا الرومانسية للاحتفال بأجمل اللحظات من غراس فلوريست',
  'كيك وشوكولاته': 'اطلب أرقى تشكيلة من الكيك والشكولاتة مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'كيك وشوكولاتة': 'اطلب أرقى تشكيلة من الكيك والشكولاتة مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'شوكولاته': 'اطلب أرقى تشكيلة من الشوكولاتة الفاخرة مع توصيل سريع من غراس فلوريست',
  'شوكولاتة': 'اطلب أرقى تشكيلة من الشوكولاتة الفاخرة مع توصيل سريع من غراس فلوريست',
  'كيك': 'اطلب أرقى تشكيلة من الكيك الفاخر مع توصيل سريع من غراس فلوريست',
  'بالونات': 'اطلب أرقى تشكيلة من البالونات مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'بالونات مطاطية': 'اطلب أرقى تشكيلة من البالونات مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'بالونات المطاطية': 'اطلب أرقى تشكيلة من البالونات مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'بالونات الحروف': 'اطلب بالونات الحروف المميزة لجميع مناسباتكم واحتفالاتكم من غراس فلوريست',
  'بالونات أحرف': 'اطلب بالونات الحروف المميزة لجميع مناسباتكم واحتفالاتكم من غراس فلوريست',
  'بالونات الأرقام': 'اطلب بالونات الأرقام المميزة لجميع مناسباتكم من غراس فلوريست',
  'هاند بوكيه': 'اطلب أرقى تشكيلة من الهاند بوكيه مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'هاند-بوكيه': 'اطلب أرقى تشكيلة من الهاند بوكيه مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'فازات ورد': 'اطلب أرقى تشكيلة من فازات الورد مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'بوكسات ورد': 'اطلب أرقى تشكيلة من بوكسات الورد مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'باقات الفواكه': 'اطلب أرقى تشكيلة من باقات الفواكة مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
  'باقات الفواكة': 'اطلب أرقى تشكيلة من باقات الفواكة مع توصيل سريع وهدايا فاخرة من غراس فلوريست',
};

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
      ar: CATEGORY_DESC_ARABIC_MAP[cleanCategoryName] || CATEGORY_DESC_ARABIC_MAP[decodedSlug] || cleanDesc || `اطلب أرقى تشكيلة من ${cleanCategoryName} مع توصيل سريع وهدايا فاخرة من غراس فلوريست`,
      en: cleanDesc && !hasArabicText(cleanDesc) ? cleanDesc : `Order the finest collection of ${englishCategoryName === 'All Flowers' ? 'flowers' : englishCategoryName.toLowerCase()} with express delivery and luxury gifts from Grass Florist`,
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
 * Fetch products list from WooCommerce Store API
 */
export async function getStoreProducts(params?: {
  per_page?: number;
  page?: number;
  category?: string | number;
  search?: string;
  orderby?: 'date' | 'price' | 'popularity' | 'rating' | 'title';
  order?: 'asc' | 'desc';
  featured?: boolean;
  locale?: Locale;
}): Promise<{ products: Product[]; total: number }> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('per_page', String(params?.per_page || 12));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.category) searchParams.set('category', String(params.category));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.orderby) searchParams.set('orderby', params.orderby);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.featured) searchParams.set('featured', 'true');
    if (params?.locale) searchParams.set('wpml_language', params.locale);

    const res = await fetch(`${STORE_API_BASE}/products?${searchParams.toString()}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`[getStoreProducts] Failed with status ${res.status}`);
      return { products: fallbackProducts.slice(0, params?.per_page || 12), total: fallbackProducts.length };
    }

    const totalHeader = res.headers.get('x-wp-total');
    const total = totalHeader ? parseInt(totalHeader, 10) : 0;
    const data: WCStoreProduct[] = await res.json();

    if (!Array.isArray(data)) {
      return { products: fallbackProducts.slice(0, params?.per_page || 12), total: fallbackProducts.length };
    }

    const products = data.map(mapWCProductToProduct);
    cacheProducts(products);

    return {
      products,
      total: total || data.length,
    };
  } catch (error) {
    console.error('[getStoreProducts] Error fetching products:', error);
    return {
      products: fallbackProducts.slice(0, params?.per_page || 12),
      total: fallbackProducts.length,
    };
  }
}

/**
 * Fast multi-strategy product lookup with instant cache resolution
 */
export async function getStoreProductBySlug(slug: string, locale?: Locale): Promise<Product | null> {
  if (!slug) return null;

  try {
    const rawSlug = String(slug).trim();
    const decodedSlug = decodeURIComponent(rawSlug).trim().toLowerCase();

    // 1. Check in-memory cache for INSTANT 0ms response
    if (productMemoryCache.has(decodedSlug)) {
      return productMemoryCache.get(decodedSlug)!;
    }
    const numericId = decodedSlug.replace(/\D/g, '');
    if (numericId && productMemoryCache.has(numericId)) {
      return productMemoryCache.get(numericId)!;
    }

    // 2. Direct high-speed API fetch by slug
    const wpmlQuery = locale ? `&wpml_language=${locale}` : '';
    const fetchPromises = [
      fetch(`${STORE_API_BASE}/products?slug=${encodeURIComponent(decodedSlug)}${wpmlQuery}`, {
        next: { revalidate: 3600 },
      }).then(async (r) => (r.ok ? ((await r.json()) as WCStoreProduct[]) : []))
        .catch(() => [] as WCStoreProduct[]),
    ];

    if (numericId) {
      fetchPromises.push(
        fetch(`${STORE_API_BASE}/products/${numericId}${wpmlQuery ? '?' + wpmlQuery.slice(1) : ''}`, {
          next: { revalidate: 3600 },
        }).then(async (r) => (r.ok ? [((await r.json()) as WCStoreProduct)] : []))
          .catch(() => [] as WCStoreProduct[])
      );
    }

    const results = await Promise.all(fetchPromises);
    for (const list of results) {
      if (Array.isArray(list) && list.length > 0 && list[0]?.id) {
        const product = mapWCProductToProduct(list[0]);
        cacheProduct(product);
        return product;
      }
    }

    // 3. Fast search fallback
    try {
      const searchRes = await fetch(`${STORE_API_BASE}/products?search=${encodeURIComponent(decodedSlug)}${wpmlQuery}`, {
        next: { revalidate: 3600 },
      });
      if (searchRes.ok) {
        const list: WCStoreProduct[] = await searchRes.json();
        if (Array.isArray(list) && list.length > 0) {
          const match = list.find(
            (p) =>
              p.slug.toLowerCase() === decodedSlug ||
              decodeURIComponent(p.slug).toLowerCase() === decodedSlug ||
              p.name.toLowerCase() === decodedSlug ||
              String(p.id) === decodedSlug
          );
          const matchedItem = match || list[0];
          const product = mapWCProductToProduct(matchedItem);
          cacheProduct(product);
          return product;
        }
      }
    } catch {
      // Continue to mock fallback
    }

    // 4. Mock fallback
    const fallback = fallbackProducts.find(
      (p) =>
        p.slug.ar.toLowerCase() === decodedSlug ||
        p.slug.en.toLowerCase() === decodedSlug ||
        p.id === decodedSlug ||
        (numericId && p.id === numericId)
    );
    return fallback || null;
  } catch (error) {
    console.error(`[getStoreProductBySlug] Error for slug ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch all categories from WooCommerce Store API
 */
export async function getStoreCategories(locale?: Locale): Promise<Category[]> {
  try {
    const wpmlQuery = locale ? `?wpml_language=${locale}&per_page=100` : '?per_page=100';
    const res = await fetch(`${STORE_API_BASE}/products/categories${wpmlQuery}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.warn(`[getStoreCategories] Failed with status ${res.status}`);
      return fallbackCategories;
    }

    const data: WCStoreCategory[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return fallbackCategories;
    }

    // Filter meaningful top-level categories (skip "." or empty titles)
    const validCats = data.filter((c) => c.name && c.name !== '.' && c.name.trim().length > 0);
    const topLevel = validCats.filter((c) => c.parent === 0);

    return topLevel.map((cat) => mapWCCategoryToCategory(cat, validCats));
  } catch (error) {
    console.error('[getStoreCategories] Error fetching categories:', error);
    return fallbackCategories;
  }
}

export const PRIMARY_CATEGORY_SLUG_MAP: Record<string, string> = {
  'all-flowers': 'جميع-الزهور',
  'luxury-bouquets': 'باقات-فاخرة',
  'flower-boxes': 'بوكسات-ورد',
  'luxury-box': 'بوكسات-ورد',
  'flower-vases': 'فازات-ورد',
  'hand-bouquets': 'هاند-بوكيه',
  'hand-bouquet': 'هاند-بوكيه',
  'cake-chocolate': 'كيك-وشوكولاته',
  'chocolate': 'شوكولاته',
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
  'birthday': 'عيد-ميلاد',
  'for-father': 'للآب',
  'for-her': 'للمرأة',
  'for-him': 'للرجل',
  'love': 'حب',
  'i-love-you': 'حب',
  'get-well': 'تمني-بالشفاء',
  'get-well-soon': 'تمني-بالشفاء',
  'graduation': 'تخرج',
  'anniversary': 'ذكرى-سنوية',
  'housewarming': 'منزل-مبارك',
  'i-am-sorry': 'اعتذار',
  'new-baby': 'مولود-جديد',
  'new-baby-boy': 'مولود-جديد',
  'new-baby-girl': 'مولودة-جديدة',
  'new-born': 'مولود-جديد',
  'new-job': 'وظيفة-وترقية',
  'fruits-bouquet': 'باقات-الفواكه',
  'fruits-bouquets': 'باقات-الفواكه',
  'latex-balloons': 'بالونات-مطاطية',
  'golden-letters': 'أحرف-ذهبية',
  'silver-letters': 'أحرف-فضية',
  'numbers-balloons': 'بالونات-الأرقام',
  'golden-numbers': 'الأرقام-الذهبية',
  'silver-numbers': 'أرقام-فضية',
  'eid': 'العيد',
  'national-day': 'اليوم-الوطني',
  'pink-october': 'اكتوبر-الوردي',
  'best-sellers': 'الأفضل-مبيعاً',
  'best-seller': 'الأفضل-مبيعاً',
  'best-selling': 'الأفضل-مبيعاً',
  'thank-you': 'شكراً',
  'flag-day': 'flag-day-ar',
  'foundation-day': 'foundation-day-ar',
};

export const REVERSE_SLUG_ALIASES: Record<string, string> = {
  'جميع-الزهور': 'all-flowers',
  'باقات-فاخرة': 'luxury-bouquets',
  'بوكسات-ورد': 'flower-boxes',
  'فازات-ورد': 'flower-vases',
  'هاند-بوكيه': 'hand-bouquets',
  'كيك-وشوكولاته': 'cake-chocolate',
  'كيك-وشوكولاتة': 'cake-chocolate',
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
  'عيد-ميلاد': 'birthday',
  'للآب': 'for-father',
  'للمرأة': 'for-her',
  'للرجل': 'for-him',
  'حب': 'love',
  'أحبك': 'love',
  'احبك': 'love',
  'تمني-بالشفاء': 'get-well',
  'تمنيات-بالشفاء': 'get-well',
  'تمنيات-بالشفاء-العاجل': 'get-well',
  'تخرج': 'graduation',
  'ذكرى-سنوية': 'anniversary',
  'عيد-زواج-سعيد': 'anniversary',
  'زواج': 'wedding',
  'منزل-مبارك': 'housewarming',
  'تهنئة-بالمولود': 'new-baby',
  'اعتذار': 'i-am-sorry',
  'مولود-جديد': 'new-baby',
  'مولودة-جديدة': 'new-baby-girl',
  'وظيفة-وترقية': 'new-job',
  'باقات-الفواكه': 'fruits-bouquet',
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
  'الأفضل-مبيعاً': 'best-sellers',
  'الافضل-مبيعا': 'best-sellers',
  'شكراً': 'thank-you',
  'flag-day-ar': 'flag-day',
  'foundation-day-ar': 'foundation-day',
};

export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
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

export function normalizeCategoryMatchString(str?: string): string {
  if (!str) return '';
  return decodeURIComponent(str)
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ');
}

export function isCategoryMatch(category: Category, targetSlugOrName: string): boolean {
  if (!category || !targetSlugOrName) return false;

  const rawDecoded = decodeURIComponent(targetSlugOrName).trim().toLowerCase();
  const normalizedTarget = normalizeCategoryMatchString(targetSlugOrName);

  const mappedSlug =
    CATEGORY_SLUG_ALIASES[rawDecoded] ||
    REVERSE_SLUG_ALIASES[rawDecoded] ||
    CATEGORY_SLUG_ALIASES[normalizedTarget.replace(/\s+/g, '-')] ||
    REVERSE_SLUG_ALIASES[normalizedTarget.replace(/\s+/g, '-')] ||
    '';

  const normalizedMapped = normalizeCategoryMatchString(mappedSlug);

  // Exact ID match
  if (String(category.id).toLowerCase() === rawDecoded || (mappedSlug && String(category.id).toLowerCase() === mappedSlug)) {
    return true;
  }

  // Exact slug match
  const catSlugDecoded = decodeURIComponent(category.slug || '').trim().toLowerCase();
  if (
    catSlugDecoded === rawDecoded ||
    (mappedSlug && catSlugDecoded === mappedSlug) ||
    catSlugDecoded.replace(/[-_]+/g, ' ') === normalizedTarget
  ) {
    return true;
  }

  // Normalized Name & Slug matches
  const normCatSlug = normalizeCategoryMatchString(category.slug);
  const normCatAr = normalizeCategoryMatchString(category.name?.ar);
  const normCatEn = normalizeCategoryMatchString(category.name?.en);

  if (
    (normCatSlug && (normCatSlug === normalizedTarget || normCatSlug === normalizedMapped)) ||
    (normCatAr && (normCatAr === normalizedTarget || normCatAr === normalizedMapped)) ||
    (normCatEn && (normCatEn === normalizedTarget || normCatEn === normalizedMapped))
  ) {
    return true;
  }

  return false;
}

/**
 * Helper to resolve category slug in either language
 */
export function getCategorySlugForLocale(slug: string, targetLocale: Locale): string {
  const decoded = decodeURIComponent(slug).trim().toLowerCase();
  if (targetLocale === 'en') {
    if (REVERSE_SLUG_ALIASES[decoded]) return REVERSE_SLUG_ALIASES[decoded];
    const stripped = decoded.replace(/-\d+$/, '');
    if (REVERSE_SLUG_ALIASES[stripped]) return REVERSE_SLUG_ALIASES[stripped];
    const norm = normalizeCategoryMatchString(decoded);
    for (const [k, v] of Object.entries(REVERSE_SLUG_ALIASES)) {
      if (normalizeCategoryMatchString(k) === norm) return v;
    }
    return decoded;
  }
  if (CATEGORY_SLUG_ALIASES[decoded]) return CATEGORY_SLUG_ALIASES[decoded];
  const stripped = decoded.replace(/-\d+$/, '');
  if (CATEGORY_SLUG_ALIASES[stripped]) return CATEGORY_SLUG_ALIASES[stripped];
  return decoded;
}

/**
 * Fetch category details by slug, including its products
 */
export async function getStoreCategoryBySlug(
  slug: string,
  locale?: Locale
): Promise<{ category: Category | null; products: Product[] }> {
  try {
    const decodedSlug = decodeURIComponent(slug).trim().toLowerCase();
    const mappedSlug =
      CATEGORY_SLUG_ALIASES[decodedSlug] ||
      REVERSE_SLUG_ALIASES[decodedSlug] ||
      decodedSlug;

    const categories = await getStoreCategories(locale);

    // Match category by robust isCategoryMatch
    let matchedCategory =
      categories.find((c) => isCategoryMatch(c, decodedSlug)) || null;

    // Check in subcategories if not in top level
    if (!matchedCategory) {
      for (const parentCat of categories) {
        const sub = parentCat.subcategories?.find((s) => {
          const subMock: Category = {
            id: String(s.id),
            name: s.name,
            slug: s.slug,
            description: {
              ar: CATEGORY_DESC_ARABIC_MAP[s.name?.ar] || CATEGORY_DESC_ARABIC_MAP[s.slug] || parentCat.description?.ar || `اطلب أرقى تشكيلة من ${s.name?.ar} مع توصيل سريع وهدايا فاخرة من غراس فلوريست`,
              en: parentCat.description?.en || `Order the finest collection of ${s.name?.en?.toLowerCase() || 'flowers'} with express delivery and luxury gifts from Grass Florist`,
            },
            image: parentCat.image,
            seoTitle: s.name,
            seoDescription: parentCat.seoDescription,
            featured: true,
            itemCount: s.count || 0,
            subcategories: [],
          };
          return isCategoryMatch(subMock, decodedSlug);
        });

        if (sub) {
          const subDescAr =
            CATEGORY_DESC_ARABIC_MAP[sub.name?.ar] ||
            CATEGORY_DESC_ARABIC_MAP[sub.slug] ||
            `اطلب أرقى تشكيلة من ${sub.name?.ar} مع توصيل سريع وهدايا فاخرة من غراس فلوريست`;
          const subDescEn = `Order the finest collection of ${sub.name?.en?.toLowerCase() || 'flowers'} with express delivery and luxury gifts from Grass Florist`;

          matchedCategory = {
            id: String(sub.id),
            name: sub.name,
            slug: sub.slug,
            description: {
              ar: subDescAr,
              en: subDescEn,
            },
            image: parentCat.image,
            seoTitle: sub.name,
            seoDescription: {
              ar: subDescAr,
              en: subDescEn,
            },
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
        fallbackCategories.find((c) => isCategoryMatch(c, decodedSlug)) || null;
    }

    // Fetch products for category
    const categoryFilter = matchedCategory ? matchedCategory.id : mappedSlug;
    const { products } = await getStoreProducts({
      category: categoryFilter,
      per_page: 24,
      locale,
    });

    // If still not matched, construct a solid fallback category so it never 404s
    if (!matchedCategory) {
      const cleanName = hasArabicText(decodedSlug)
        ? decodedSlug.replace(/[-_]+/g, ' ')
        : (CATEGORY_SLUG_ALIASES[decodedSlug] || decodedSlug).replace(/[-_]+/g, ' ');
      const englishName = translateArabicCategoryName(cleanName, decodedSlug);
      const arabicName = hasArabicText(decodedSlug)
        ? decodedSlug.replace(/[-_]+/g, ' ')
        : (PRIMARY_CATEGORY_SLUG_MAP[decodedSlug] || decodedSlug).replace(/[-_]+/g, ' ');

      matchedCategory = {
        id: decodedSlug,
        name: {
          ar: arabicName,
          en: englishName,
        },
        slug: decodedSlug,
        description: {
          ar: `اطلب أرقى تشكيلة من ${arabicName} مع توصيل سريع وهدايا فاخرة من غراس فلوريست`,
          en: `Order the finest collection of ${englishName.toLowerCase()} with express delivery and luxury gifts from Grass Florist`,
        },
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
        seoTitle: {
          ar: `${arabicName} | غراس فلوريست`,
          en: `${englishName} | Grass Florist`,
        },
        seoDescription: {
          ar: `اكتشف أجمل تشكيلات ${arabicName} في المملكة العربية السعودية مع توصيل سريع في نفس اليوم.`,
          en: `Discover beautiful ${englishName.toLowerCase()} collections in Saudi Arabia with same-day express delivery.`,
        },
        featured: true,
        itemCount: products.length || 10,
        subcategories: [],
      };
    }

    return {
      category: matchedCategory,
      products,
    };
  } catch (error) {
    console.error(`[getStoreCategoryBySlug] Error for slug ${slug}:`, error);
    const decodedSlug = decodeURIComponent(slug).trim().toLowerCase();
    const cleanName = hasArabicText(decodedSlug)
      ? decodedSlug.replace(/[-_]+/g, ' ')
      : (CATEGORY_SLUG_ALIASES[decodedSlug] || decodedSlug).replace(/[-_]+/g, ' ');
    const englishName = translateArabicCategoryName(cleanName, decodedSlug);
    const arabicName = hasArabicText(decodedSlug)
      ? decodedSlug.replace(/[-_]+/g, ' ')
      : (PRIMARY_CATEGORY_SLUG_MAP[decodedSlug] || decodedSlug).replace(/[-_]+/g, ' ');

    const fallback: Category = {
      id: decodedSlug,
      name: {
        ar: arabicName,
        en: englishName,
      },
      slug: decodedSlug,
      description: {
        ar: `اطلب أرقى تشكيلة من ${arabicName} مع توصيل سريع وهدايا فاخرة من غراس فلوريست`,
        en: `Order the finest collection of ${englishName.toLowerCase()} with express delivery and luxury gifts from Grass Florist`,
      },
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
      seoTitle: {
        ar: `${arabicName} | غراس فلوريست`,
        en: `${englishName} | Grass Florist`,
      },
      seoDescription: {
        ar: `اكتشف أجمل تشكيلات ${arabicName} في المملكة العربية السعودية مع توصيل سريع في نفس اليوم.`,
        en: `Discover beautiful ${englishName.toLowerCase()} collections in Saudi Arabia with same-day express delivery.`,
      },
      featured: true,
      itemCount: 0,
      subcategories: [],
    };

    return {
      category: fallback,
      products: [],
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
    ] = await Promise.all([
      getStoreProducts({ category: 221, per_page: 12, locale }),
      getStoreProducts({ category: 214, per_page: 12, locale }),
      getStoreProducts({ category: 220, per_page: 12, locale }),
      getStoreProducts({ category: 219, per_page: 12, locale }),
    ]);

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
        products: bouquetsRes.products,
      },
      {
        id: 'luxury-bouquets',
        title: {
          ar: 'باقات فاخرة',
          en: 'Luxury Bouquets',
        },
        subtitle: {
          ar: 'باقة فاخرة تُهديها لمن تحب، في كل مناسبة.',
          en: 'Send a luxurious bouquet to the ones you love.',
        },
        categorySlug: 'باقات-فاخرة',
        viewAllUrl: {
          ar: '/category/باقات-فاخرة',
          en: '/en/category/luxury-bouquets',
        },
        products: luxuryRes.products,
      },
      {
        id: 'cakes-chocolate',
        title: {
          ar: 'كيك وشوكلاتة',
          en: 'Cakes & Chocolate',
        },
        subtitle: {
          ar: 'اهدي من تحب كيك وشوكلاته لكل مناسبة',
          en: 'Send Cakes & Chocolate to the ones you love.',
        },
        categorySlug: 'كيك-وشوكولاته',
        viewAllUrl: {
          ar: '/category/كيك-وشوكولاته',
          en: '/en/category/cake-chocolate',
        },
        products: cakesRes.products,
      },
      {
        id: 'balloons',
        title: {
          ar: 'بالونات',
          en: 'Balloons',
        },
        subtitle: {
          ar: 'زيّنوا مناسباتكم ببالوناتنا الرائعة',
          en: 'Make Every Celebration Special with Our Beautiful Balloons.',
        },
        categorySlug: 'بالونات',
        viewAllUrl: {
          ar: '/category/بالونات',
          en: '/en/category/balloons',
        },
        products: balloonsRes.products,
      },
    ];

    return sections;
  } catch (error) {
    console.error('[getHomeCategorySections] Error fetching category sections:', error);
    return [];
  }
}

/**
 * 13 Curated categories for the category banner slider in exact requested order
 */
export interface HomeBannerCategoryConfig {
  key: string;
  name: LocalizedString;
  slug: { ar: string; en: string };
  apiMatch: string[];
  defaultImage: string;
}

export const HOME_BANNER_CATEGORIES_CONFIG: HomeBannerCategoryConfig[] = [
  {
    key: 'graduation',
    name: { ar: 'تخرج', en: 'Graduation' },
    slug: { ar: 'تخرج', en: 'graduation' },
    apiMatch: ['تخرج', 'graduation'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/graduation.png',
  },
  {
    key: 'anniversary',
    name: { ar: 'عيد زواج سعيد', en: 'Anniversary' },
    slug: { ar: 'عيد-زواج-سعيد', en: 'anniversary' },
    apiMatch: ['عيد زواج سعيد', 'عيد-زواج-سعيد', 'ذكرى-سنوية', 'ذكرى سنوية', 'ذكرى', 'anniversary', 'wedding', 'زواج', 'زفاف'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/anniversary.png',
  },
  {
    key: 'get-well',
    name: { ar: 'تمنيات بالشفاء', en: 'Get Well Soon' },
    slug: { ar: 'تمنيات-بالشفاء', en: 'get-well' },
    apiMatch: ['تمنيات بالشفاء', 'تمنيات-بالشفاء', 'تمني بالشفاء', 'تمني-بالشفاء', 'get well', 'get-well', 'شفاء'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/get-well-soon.png',
  },
  {
    key: 'housewarming',
    name: { ar: 'منزل مبارك', en: 'Housewarming' },
    slug: { ar: 'منزل-مبارك', en: 'housewarming' },
    apiMatch: ['منزل مبارك', 'منزل-مبارك', 'housewarming', 'وظيفة وترقية', 'وظيفة-وترقية', 'new-job'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/housewarming.png',
  },
  {
    key: 'new-born',
    name: { ar: 'تهنئة بالمولود', en: 'New Born' },
    slug: { ar: 'تهنئة-بالمولود', en: 'new-baby' },
    apiMatch: ['تهنئة بالمولود', 'تهنئة-بالمولود', 'مولود جديد', 'مولود-جديد', 'مولودة جديدة', 'مولودة-جديدة', 'new baby', 'new-baby', 'new-born'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/new-born.png',
  },
  {
    key: 'birthday',
    name: { ar: 'عيد ميلاد سعيد', en: 'Birthday' },
    slug: { ar: 'عيد-ميلاد', en: 'birthday' },
    apiMatch: ['عيد ميلاد سعيد', 'عيد-ميلاد-سعيد', 'عيد ميلاد', 'عيد-ميلاد', 'birthday'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/happy-birthday-1.png',
  },
  {
    key: 'love',
    name: { ar: 'أحبك', en: 'I Love You' },
    slug: { ar: 'أحبك', en: 'love' },
    apiMatch: ['أحبك', 'احبك', 'حب', 'love', 'i love you'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/i-love-you.png',
  },
  {
    key: 'best-selling',
    name: { ar: 'الأكثر مبيعاً', en: 'Best Selling' },
    slug: { ar: 'الأكثر-مبيعاً', en: 'best-seller' },
    apiMatch: ['الأكثر مبيعاً', 'الأكثر-مبيعاً', 'الاكثر مبيعا', 'الاكثر-مبيعا', 'الأفضل-مبيعاً', 'الأفضل مبيعاً', 'الافضل-مبيعا', 'الافضل مبيعا', 'best-seller', 'best seller', 'best-selling', 'best selling', 'best-sellers'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/best-seller.png',
  },
  {
    key: 'cakes-chocolate',
    name: { ar: 'كيك وشوكولاتة', en: 'Cakes & Chocolate' },
    slug: { ar: 'كيك-وشوكولاتة', en: 'cake-chocolate' },
    apiMatch: ['كيك وشوكولاتة', 'كيك-وشوكولاتة', 'كيك وشوكولاته', 'كيك-وشوكولاته', 'cake & chocolate', 'cake-chocolate', 'cakes-chocolate'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/Cakes-chocolate.png',
  },
  {
    key: 'balloons',
    name: { ar: 'بالونات', en: 'Balloons' },
    slug: { ar: 'بالونات', en: 'balloons' },
    apiMatch: ['بالونات', 'balloons'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/balloons.png',
  },
  {
    key: 'fruits-bouquets',
    name: { ar: 'باقات الفواكه', en: 'Fruits Bouquets' },
    slug: { ar: 'باقات-الفواكه', en: 'fruits-bouquet' },
    apiMatch: ['باقات الفواكه', 'باقات-الفواكه', 'fruits bouquet', 'fruits-bouquet', 'fruits-bouquets'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/fruits-bouquets.png',
  },
  {
    key: 'hand-bouquets',
    name: { ar: 'هاند بكيه', en: 'Hand Bouquets' },
    slug: { ar: 'هاند-بوكيه', en: 'hand-bouquet' },
    apiMatch: ['هاند بكيه', 'هاند-بكيه', 'هاند بوكيه', 'هاند-بوكيه', 'hand bouquet', 'hand-bouquet', 'hand-bouquets'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/hand-bouquets.png',
  },
  {
    key: 'luxury-bouquets',
    name: { ar: 'باقات فاخرة', en: 'Luxury Bouquets' },
    slug: { ar: 'باقات-فاخرة', en: 'luxury-bouquets' },
    apiMatch: ['باقات فاخرة', 'باقات-فاخرة', 'luxury bouquets', 'luxury-bouquets'],
    defaultImage: 'https://grassflorist.com/wp-content/uploads/2026/10/luxury-bouquets.png',
  },
];

/**
 * Fetch the 13 curated category banner slider items matching live API data
 */
export async function getHomePageBannerCategories(locale: Locale = 'ar'): Promise<Category[]> {
  try {
    const [arRes, enRes] = await Promise.all([
      fetch(`${STORE_API_BASE}/products/categories?per_page=100`, { next: { revalidate: 300 } }),
      fetch(`${STORE_API_BASE}/products/categories?per_page=100&wpml_language=en`, { next: { revalidate: 300 } }),
    ]);

    const arCats: WCStoreCategory[] = arRes.ok ? await arRes.json() : [];
    const enCats: WCStoreCategory[] = enRes.ok ? await enRes.json() : [];
    const rawCats: WCStoreCategory[] = [
      ...(Array.isArray(arCats) ? arCats : []),
      ...(Array.isArray(enCats) ? enCats : []),
    ];

    return HOME_BANNER_CATEGORIES_CONFIG.map((config) => {
      const matched = rawCats.find((c) => {
        const decodedSlug = decodeURIComponent(c.slug || '').toLowerCase();
        const catName = (c.name || '').toLowerCase();
        return config.apiMatch.some((m) => {
          const ml = m.toLowerCase();
          return decodedSlug === ml || catName === ml || decodedSlug.includes(ml) || catName.includes(ml);
        });
      });

      const slug = locale === 'ar' ? config.slug.ar : config.slug.en;

      const categoryImage =
        matched?.image?.src && (matched.image.src.includes('2026/10') || !config.defaultImage)
          ? matched.image.src
          : config.defaultImage || matched?.image?.src || '';

      return {
        id: matched ? String(matched.id) : config.key,
        name: config.name,
        slug,
        description: {
          ar: `اطلب أجمل تشكيلة من ${config.name.ar} من غراس فلوريست مع توصيل سريع في نفس اليوم`,
          en: `Order the finest collection of ${config.name.en} with same-day express delivery from Grass Florist`,
        },
        image: categoryImage,
        seoTitle: config.name,
        seoDescription: {
          ar: `تسوق ${config.name.ar} بأعلى جودة مع توصيل سريع في جدة من غراس فلوريست`,
          en: `Shop ${config.name.en} with express delivery in Jeddah from Grass Florist`,
        },
        featured: true,
        itemCount: matched?.count || 12,
        subcategories: [],
      };
    });
  } catch (error) {
    console.error('[getHomePageBannerCategories] Error loading banner categories:', error);
    return HOME_BANNER_CATEGORIES_CONFIG.map((config) => ({
      id: config.key,
      name: config.name,
      slug: locale === 'ar' ? config.slug.ar : config.slug.en,
      description: {
        ar: `اطلب أجمل تشكيلة من ${config.name.ar} من غراس فلوريست مع توصيل سريع في نفس اليوم`,
        en: `Order the finest collection of ${config.name.en} with same-day express delivery from Grass Florist`,
      },
      image: config.defaultImage,
      seoTitle: config.name,
      seoDescription: {
        ar: `تسوق ${config.name.ar} بأعلى جودة مع توصيل سريع في جدة من غراس فلوريست`,
        en: `Shop ${config.name.en} with express delivery in Jeddah from Grass Florist`,
      },
      featured: true,
      itemCount: 12,
      subcategories: [],
    }));
  }
}

/**
 * Fetch home page live collections (Categories, Featured, Best Sellers, New Arrivals, Category Sections)
 */
export async function getHomePageData(locale: Locale) {
  try {
    const [categories, featuredRes, bestsellersRes, newArrivalsRes, categorySections] = await Promise.all([
      getHomePageBannerCategories(locale),
      getStoreProducts({ per_page: 4, orderby: 'popularity', locale }),
      getStoreProducts({ per_page: 8, orderby: 'popularity', locale }),
      getStoreProducts({ per_page: 8, orderby: 'date', order: 'desc', locale }),
      getHomeCategorySections(locale),
    ]);

    return {
      categories,
      featuredProducts: featuredRes.products.length > 0 ? featuredRes.products : fallbackProducts.slice(0, 4),
      bestsellers: bestsellersRes.products.length > 0 ? bestsellersRes.products : fallbackProducts.slice(0, 8),
      newArrivals: newArrivalsRes.products.length > 0 ? newArrivalsRes.products : fallbackProducts.slice(0, 8),
      categorySections,
    };
  } catch (error) {
    console.error('[getHomePageData] Error loading home page collections:', error);
    return {
      categories: await getHomePageBannerCategories(locale),
      featuredProducts: fallbackProducts.slice(0, 4),
      bestsellers: fallbackProducts.slice(0, 8),
      newArrivals: fallbackProducts.slice(0, 8),
      categorySections: [],
    };
  }
}
