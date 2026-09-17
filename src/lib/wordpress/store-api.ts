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

  return {
    id: String(wc.id),
    name: {
      ar: cleanProductName,
      en: cleanProductName,
    },
    slug: {
      ar: decodedSlug,
      en: decodedSlug,
    },
    description: {
      ar: cleanFullDesc || cleanProductName,
      en: cleanFullDesc || cleanProductName,
    },
    shortDescription: {
      ar: cleanShortDesc || cleanProductName,
      en: cleanShortDesc || cleanProductName,
    },
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
    currency: wc.prices?.currency_code || 'SAR',
    discount,
    images: rawImages,
    thumbnail,
    category: {
      ar: categoryName,
      en: categoryName,
    },
    categorySlug,
    subcategory: secondaryCategory
      ? {
        ar: decodeHtmlEntities(secondaryCategory.name),
        en: decodeHtmlEntities(secondaryCategory.name),
      }
      : undefined,
    subcategorySlug: secondaryCategory ? decodeURIComponent(secondaryCategory.slug) : undefined,
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
      en: `${cleanProductName} | Grass Florist Saudi Arabia`,
    },
    seoDescription: {
      ar: cleanShortDesc || `اطلب ${cleanProductName} من غراس فلوريست مع توصيل سريع لجميع مناطق المملكة.`,
      en: cleanShortDesc || `Order ${cleanProductName} from Grass Florist with express delivery across Saudi Arabia.`,
    },
  };
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
  const childCategories: Subcategory[] = allCategories
    .filter((c) => c.parent === cat.id)
    .map((c) => ({
      id: String(c.id),
      name: {
        ar: decodeHtmlEntities(c.name),
        en: decodeHtmlEntities(c.name),
      },
      slug: decodeURIComponent(c.slug),
      count: c.count,
    }));

  const imageUrl =
    cat.image?.src ||
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80';

  const cleanDesc = stripHtml(cat.description || '');

  return {
    id: String(cat.id),
    name: {
      ar: cleanCategoryName,
      en: cleanCategoryName,
    },
    slug: decodedSlug,
    description: {
      ar: cleanDesc || `تصفح أرقى تشكيلة من ${cleanCategoryName} مع توصيل سريع وهدايا فاخرة من غراس فلوريست.`,
      en: cleanDesc || `Explore premium ${cleanCategoryName} handcrafted arrangements by Grass Florist.`,
    },
    image: imageUrl,
    seoTitle: {
      ar: `${cleanCategoryName} | غراس فلوريست`,
      en: `${cleanCategoryName} | Grass Florist`,
    },
    seoDescription: {
      ar: cleanDesc || `اكتشف أجمل تشكيلات ${cleanCategoryName} في المملكة العربية السعودية مع توصيل سريع في نفس اليوم.`,
      en: cleanDesc || `Discover beautiful ${cleanCategoryName} collections in Saudi Arabia with same-day express delivery.`,
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
      next: { revalidate: 120 },
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

    return {
      products: data.map(mapWCProductToProduct),
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
 * Fetch a single product by slug or ID
 */
export async function getStoreProductBySlug(slug: string, locale?: Locale): Promise<Product | null> {
  try {
    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
    const wpmlQuery = locale ? `&wpml_language=${locale}` : '';

    // Query by slug
    const res = await fetch(`${STORE_API_BASE}/products?slug=${encodeURIComponent(cleanSlug)}${wpmlQuery}`, {
      next: { revalidate: 120 },
    });

    if (res.ok) {
      const list: WCStoreProduct[] = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        return mapWCProductToProduct(list[0]);
      }
    }

    // Try fallback lookup by ID if slug is numeric
    if (/^\d+$/.test(cleanSlug)) {
      const idRes = await fetch(`${STORE_API_BASE}/products/${cleanSlug}${wpmlQuery ? '?' + wpmlQuery.slice(1) : ''}`, {
        next: { revalidate: 120 },
      });
      if (idRes.ok) {
        const item: WCStoreProduct = await idRes.json();
        if (item?.id) {
          return mapWCProductToProduct(item);
        }
      }
    }

    // Fallback search by mock data
    const fallback = fallbackProducts.find(
      (p) =>
        p.slug.ar.toLowerCase() === cleanSlug ||
        p.slug.en.toLowerCase() === cleanSlug ||
        p.id === cleanSlug
    );
    return fallback || null;
  } catch (error) {
    console.error(`[getStoreProductBySlug] Error for slug ${slug}:`, error);
    const fallback = fallbackProducts.find(
      (p) =>
        p.slug.ar.toLowerCase() === slug.toLowerCase() ||
        p.slug.en.toLowerCase() === slug.toLowerCase()
    );
    return fallback || null;
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
