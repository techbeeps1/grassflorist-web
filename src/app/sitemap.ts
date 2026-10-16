import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getStoreCategories, getStoreProducts, getCategorySlugForLocale } from '@/lib/wordpress/store-api';
import { blogPosts } from '@/data/blog';

// Dynamic revalidation so admin settings reflect immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SitemapConfig {
  enabled?: boolean;
  include_products?: boolean;
  include_categories?: boolean;
  include_static_pages?: boolean;
  include_blog?: boolean;
  excluded_paths?: string[];
  excluded_paths_raw?: string;
}

interface SitemapResourceItem {
  id: number;
  slug_en: string;
  slug_ar: string;
  updated_at?: string;
}

interface SitemapResourcesResponse {
  products: SitemapResourceItem[];
  categories: SitemapResourceItem[];
}

/**
 * Fetch dynamic SEO & Sitemap management settings configured in Filament Admin:
 * api.grassflorist.com/admin/seo-tracking-settings
 */
async function getGlobalSeoSettings(): Promise<SitemapConfig | null> {
  try {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '');

    // 1. Try dedicated fast /seo-settings endpoint first with no-store
    try {
      const res = await fetch(`${apiBase}/seo-settings`, {
        cache: 'no-store',
        headers: { Connection: 'close' },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.sitemap) {
          return json.data.sitemap;
        }
      }
    } catch {
      // Fall through to /global-settings
    }

    // 2. Fallback to /global-settings
    const res = await fetch(`${apiBase}/global-settings`, {
      cache: 'no-store',
      headers: { Connection: 'close' },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.seo?.sitemap || json?.data?.sitemap || null;
  } catch (err) {
    console.warn('[sitemap] Notice: could not load SEO sitemap settings from API:', err);
    return null;
  }
}

/**
 * Fast endpoint fetching all products and categories lean slugs and updated_at
 */
async function getSitemapResources(): Promise<SitemapResourcesResponse | null> {
  try {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '');
    const res = await fetch(`${apiBase}/sitemap-resources`, {
      cache: 'no-store',
      headers: { Connection: 'close' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (Array.isArray(json?.products) && Array.isArray(json?.categories)) {
      return json as SitemapResourcesResponse;
    }
    return null;
  } catch (err) {
    console.warn('[sitemap] Notice: could not load lean /sitemap-resources:', err);
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url || 'https://grassflorist.com';
  const now = new Date();

  // Fetch admin dynamic controls
  const sitemapConfig = await getGlobalSeoSettings();

  // 1. Master Toggle: "Enable Dynamic Sitemap (sitemap.xml)"
  // If disabled in admin panel, return an empty list of URLs
  if (sitemapConfig && sitemapConfig.enabled === false) {
    return [];
  }

  // 2. Resource Toggles
  const includeStatic = sitemapConfig ? sitemapConfig.include_static_pages !== false : true;
  const includeCategories = sitemapConfig ? sitemapConfig.include_categories !== false : true;
  const includeProducts = sitemapConfig ? sitemapConfig.include_products !== false : true;
  const includeBlog = sitemapConfig ? sitemapConfig.include_blog !== false : true;

  const entries: MetadataRoute.Sitemap = [];

  // =========================================================================
  // 1. Static Core & Policy Pages (Controlled by "Include Static Pages")
  // =========================================================================
  if (includeStatic) {
    const staticRoutes = [
      { ar: '', en: '/en', priority: 1.0, freq: 'daily' as const },
      { ar: '/products', en: '/en/products', priority: 0.9, freq: 'daily' as const },
      { ar: '/about', en: '/en/about', priority: 0.85, freq: 'weekly' as const },
      { ar: '/contact', en: '/en/contact', priority: 0.85, freq: 'weekly' as const },
      { ar: '/event-booking', en: '/en/event-booking', priority: 0.9, freq: 'weekly' as const },
      { ar: '/partner-with-us', en: '/en/partner-with-us', priority: 0.85, freq: 'weekly' as const },
      { ar: '/faq', en: '/en/faq', priority: 0.8, freq: 'weekly' as const },
      { ar: '/blog', en: '/en/blog', priority: 0.8, freq: 'daily' as const },
      { ar: '/wishlist', en: '/en/wishlist', priority: 0.6, freq: 'monthly' as const },
      { ar: '/privacy-policy', en: '/en/privacy-policy', priority: 0.7, freq: 'monthly' as const },
      { ar: '/terms-conditions', en: '/en/terms-conditions', priority: 0.7, freq: 'monthly' as const },
      { ar: '/shipping-policy', en: '/en/shipping-policy', priority: 0.7, freq: 'monthly' as const },
      { ar: '/return-policy', en: '/en/return-policy', priority: 0.7, freq: 'monthly' as const },
    ];

    staticRoutes.forEach((route) => {
      // Arabic URL (default root)
      entries.push({
        url: `${baseUrl}${route.ar}`,
        lastModified: now,
        changeFrequency: route.freq,
        priority: route.priority,
      });

      // English URL (/en/)
      entries.push({
        url: `${baseUrl}${route.en}`,
        lastModified: now,
        changeFrequency: route.freq,
        priority: route.priority,
      });
    });

    const arabicAliases = [
      '/عن-غراس',
      '/اتصل-بنا',
      '/حجز-مناسبة',
      '/حجز-وتنظيم-المناسبات',
      '/شارك-معنا',
      '/الأسئلة-الشائعة',
      '/المدونة',
    ];

    arabicAliases.forEach((alias) => {
      entries.push({
        url: `${baseUrl}${alias}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  }

  // Pre-fetch lean resources if either Categories or Products are enabled
  let resources: SitemapResourcesResponse | null = null;
  if (includeCategories || includeProducts) {
    resources = await getSitemapResources();
  }

  // =========================================================================
  // 2. Dynamic Categories (Controlled by "Include Categories")
  // =========================================================================
  if (includeCategories) {
    try {
      if (resources && Array.isArray(resources.categories) && resources.categories.length > 0) {
        resources.categories.forEach((cat) => {
          const lastmod = cat.updated_at ? new Date(cat.updated_at) : now;
          const slugEn = cat.slug_en || cat.slug_ar;
          const slugAr = cat.slug_ar || cat.slug_en;

          entries.push({
            url: `${baseUrl}/category/${slugAr}`,
            lastModified: lastmod,
            changeFrequency: 'daily',
            priority: 0.85,
          });

          entries.push({
            url: `${baseUrl}/en/category/${slugEn}`,
            lastModified: lastmod,
            changeFrequency: 'daily',
            priority: 0.85,
          });
        });
      } else {
        // Fallback to legacy categories fetch
        const categories = await getStoreCategories('ar');
        if (Array.isArray(categories)) {
          categories.forEach((cat) => {
            const slugEn = cat.slug;
            const slugAr = getCategorySlugForLocale(cat.slug, 'ar') || cat.slug;

            entries.push({
              url: `${baseUrl}/category/${slugAr}`,
              lastModified: now,
              changeFrequency: 'daily',
              priority: 0.85,
            });

            entries.push({
              url: `${baseUrl}/en/category/${slugEn}`,
              lastModified: now,
              changeFrequency: 'daily',
              priority: 0.85,
            });
          });
        }
      }
    } catch (err) {
      console.warn('[sitemap] Notice: could not load dynamic categories for sitemap:', err);
    }
  }

  // =========================================================================
  // 3. Dynamic Products (Controlled by "Include Products")
  // =========================================================================
  if (includeProducts) {
    try {
      if (resources && Array.isArray(resources.products) && resources.products.length > 0) {
        resources.products.forEach((prod) => {
          const lastmod = prod.updated_at ? new Date(prod.updated_at) : now;
          const slugEn = prod.slug_en || prod.slug_ar;
          const slugAr = prod.slug_ar || prod.slug_en;

          entries.push({
            url: `${baseUrl}/product/${slugAr}`,
            lastModified: lastmod,
            changeFrequency: 'daily',
            priority: 0.9,
          });

          entries.push({
            url: `${baseUrl}/en/product/${slugEn}`,
            lastModified: lastmod,
            changeFrequency: 'daily',
            priority: 0.9,
          });
        });
      } else {
        // Fallback to getStoreProducts
        const res = await getStoreProducts({ per_page: 100, locale: 'ar' });
        const products = res?.products;
        if (Array.isArray(products)) {
          products.forEach((prod) => {
            const slugAr = typeof prod.slug === 'string' ? prod.slug : (prod.slug?.ar || prod.slug?.en || prod.id);
            const slugEn = typeof prod.slug === 'string' ? prod.slug : (prod.slug?.en || prod.slug?.ar || prod.id);

            entries.push({
              url: `${baseUrl}/product/${slugAr}`,
              lastModified: now,
              changeFrequency: 'daily',
              priority: 0.9,
            });

            entries.push({
              url: `${baseUrl}/en/product/${slugEn}`,
              lastModified: now,
              changeFrequency: 'daily',
              priority: 0.9,
            });
          });
        }
      }
    } catch (err) {
      console.warn('[sitemap] Notice: could not load dynamic products for sitemap:', err);
    }
  }

  // =========================================================================
  // 4. Dynamic Blog Posts (Controlled by "Include Blog Posts")
  // =========================================================================
  if (includeBlog) {
    try {
      blogPosts.forEach((post) => {
        const postDate = post.publishedAt ? new Date(post.publishedAt) : now;

        entries.push({
          url: `${baseUrl}/blog/${post.slug.ar}`,
          lastModified: postDate,
          changeFrequency: 'weekly',
          priority: 0.75,
        });

        entries.push({
          url: `${baseUrl}/en/blog/${post.slug.en}`,
          lastModified: postDate,
          changeFrequency: 'weekly',
          priority: 0.75,
        });
      });
    } catch (err) {
      console.warn('[sitemap] Notice: could not load blog posts for sitemap:', err);
    }
  }

  // =========================================================================
  // 5. Excluded Paths Filter (Controlled by "Excluded Paths & Routes" Textarea)
  // =========================================================================
  let excludedList: string[] = [];
  if (Array.isArray(sitemapConfig?.excluded_paths)) {
    excludedList = sitemapConfig.excluded_paths;
  } else if (typeof sitemapConfig?.excluded_paths_raw === 'string') {
    excludedList = sitemapConfig.excluded_paths_raw.split('\n');
  } else if (typeof sitemapConfig?.excluded_paths === 'string') {
    excludedList = (sitemapConfig.excluded_paths as string).split('\n');
  }

  const cleanExcluded = excludedList
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (cleanExcluded.length > 0) {
    return entries.filter((entry) => {
      let path = '';
      try {
        const u = new URL(entry.url);
        path = u.pathname.toLowerCase();
      } catch {
        path = entry.url.toLowerCase();
      }

      for (const rule of cleanExcluded) {
        if (!rule) continue;

        // Wildcard /path/*
        if (rule.endsWith('/*')) {
          const prefix = rule.slice(0, -2);
          if (path === prefix || path.startsWith(prefix + '/')) {
            return false;
          }
        } else if (rule.endsWith('*')) {
          const prefix = rule.slice(0, -1);
          if (path.startsWith(prefix)) {
            return false;
          }
        } else {
          // Exact path or subpath match
          const cleanRule = rule.endsWith('/') && rule.length > 1 ? rule.slice(0, -1) : rule;
          const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

          if (cleanPath === cleanRule || cleanPath.startsWith(cleanRule + '/')) {
            return false;
          }

          // Check language-prefixed equivalent (e.g. if rule is /cart, exclude /en/cart)
          if (cleanPath === '/en' + cleanRule || cleanPath.startsWith('/en' + cleanRule + '/')) {
            return false;
          }
        }
      }

      return true;
    });
  }

  return entries;
}
