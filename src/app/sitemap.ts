import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getStoreCategories, getStoreProducts } from '@/lib/wordpress/store-api';
import { blogPosts } from '@/data/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Static pages definition
  const staticPaths = [
    '',
    '/products',
    '/about',
    '/contact',
    '/faq',
    '/blog',
    '/policies/privacy',
    '/policies/terms',
    '/policies/shipping',
    '/policies/returns',
  ];

  const entries: MetadataRoute.Sitemap = [];

  // 1. Static Pages (Arabic root + English /en)
  staticPaths.forEach((path) => {
    const isHome = path === '';
    // Arabic
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: isHome ? 'daily' : 'weekly',
      priority: isHome ? 1.0 : 0.8,
    });
    // English
    entries.push({
      url: `${baseUrl}/en${path}`,
      lastModified: now,
      changeFrequency: isHome ? 'daily' : 'weekly',
      priority: isHome ? 1.0 : 0.8,
    });
  });

  try {
    const [categories, { products }] = await Promise.all([
      getStoreCategories('ar'),
      getStoreProducts({ per_page: 100, locale: 'ar' }),
    ]);

    // 2. Dynamic Categories
    categories.forEach((cat) => {
      entries.push({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      });
      entries.push({
        url: `${baseUrl}/en/category/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      });
    });

    // 3. Dynamic Products
    products.forEach((prod) => {
      entries.push({
        url: `${baseUrl}/product/${prod.slug.ar}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.85,
      });
      entries.push({
        url: `${baseUrl}/en/product/${prod.slug.en}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.85,
      });
    });
  } catch (err) {
    console.error('[sitemap] Error loading dynamic routes:', err);
  }

  // 4. Blog Posts
  blogPosts.forEach((post) => {
    entries.push({
      url: `${baseUrl}/blog/${post.slug.ar}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
    entries.push({
      url: `${baseUrl}/en/blog/${post.slug.en}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  });

  return entries;
}
