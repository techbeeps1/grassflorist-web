import { Product } from '@/types/product';
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
    'الأرقام الذهبية': 'Golden Numbers',
    'أرقام فضية': 'Silver Numbers',
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

    // Fetch products for category
    const categoryFilter = matchedCategory ? matchedCategory.id : mappedSlug;
    const { products } = await getStoreProducts({
      category: categoryFilter,
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
          ar: 'يمكنك أرسال باقاتنا الفاخرة إلى أصدقائك وعائلتك وأحبتك.',
          en: 'Send our Luxury Bouquets to impress your friends, family and loved ones.',
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
        products: cakesRes.products,
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
 * Fetch home page live collections (Categories, Featured, Best Sellers, New Arrivals, Category Sections)
 */
export async function getHomePageData(locale: Locale) {
  try {
    const [categories, featuredRes, bestsellersRes, newArrivalsRes, categorySections] = await Promise.all([
      getStoreCategories(locale),
      getStoreProducts({ per_page: 4, orderby: 'popularity', locale }),
      getStoreProducts({ per_page: 8, orderby: 'popularity', locale }),
      getStoreProducts({ per_page: 8, orderby: 'date', order: 'desc', locale }),
      getHomeCategorySections(locale),
    ]);

    return {
      categories: categories.filter((c) => c.image && c.itemCount > 0),
      featuredProducts: featuredRes.products.length > 0 ? featuredRes.products : fallbackProducts.slice(0, 4),
      bestsellers: bestsellersRes.products.length > 0 ? bestsellersRes.products : fallbackProducts.slice(0, 8),
      newArrivals: newArrivalsRes.products.length > 0 ? newArrivalsRes.products : fallbackProducts.slice(0, 8),
      categorySections,
    };
  } catch (error) {
    console.error('[getHomePageData] Error loading home page collections:', error);
    return {
      categories: fallbackCategories,
      featuredProducts: fallbackProducts.slice(0, 4),
      bestsellers: fallbackProducts.slice(0, 8),
      newArrivals: fallbackProducts.slice(0, 8),
      categorySections: [],
    };
  }
}
