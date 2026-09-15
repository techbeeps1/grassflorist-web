import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { products } from '@/data/products';
import { categories } from '@/data/categories';
import { blogPosts } from '@/data/blog';

export default function sitemap(): MetadataRoute.Sitemap {
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

  // 2. Categories
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

  // 3. Products
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
