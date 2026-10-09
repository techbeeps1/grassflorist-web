import { siteConfig } from '@/config/site';
import { getStoreCategories, getStoreProducts, getCategorySlugForLocale } from '@/lib/wordpress/store-api';
import { blogPosts } from '@/data/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface SitemapItem {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: {
    ar?: string;
    en?: string;
  };
}

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function getGlobalSeoSettings() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/global-settings', {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.seo || null;
  } catch (err) {
    return null;
  }
}

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const acceptHeader = req.headers.get('accept') || '';
  const forceXml = requestUrl.searchParams.get('format') === 'xml';
  const isBrowser = !forceXml && acceptHeader.includes('text/html');

  const baseUrl = siteConfig.url || 'https://grassflorist.com';
  const now = new Date();

  // Fetch admin dynamic controls
  const seoSettings = await getGlobalSeoSettings();
  const sitemapConfig = seoSettings?.sitemap;

  // If Sitemap is deactivated in Admin
  if (sitemapConfig && sitemapConfig.enabled === false) {
    if (isBrowser) {
      return new Response(
        `<!DOCTYPE html><html><head><title>Sitemap Disabled</title></head><body style="font-family:sans-serif;padding:40px;text-align:center;"><h2>Sitemap is currently disabled in Admin settings.</h2></body></html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
    return new Response(emptyXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
      },
    });
  }

  const includeStatic = sitemapConfig ? sitemapConfig.include_static_pages !== false : true;
  const includeCategories = sitemapConfig ? sitemapConfig.include_categories !== false : true;
  const includeProducts = sitemapConfig ? sitemapConfig.include_products !== false : true;
  const includeBlog = sitemapConfig ? sitemapConfig.include_blog !== false : true;

  const entries: SitemapItem[] = [];

  // =========================================================================
  // 1. Static Core & Policy Pages
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
      entries.push({
        url: `${baseUrl}${route.ar}`,
        lastModified: now,
        changeFrequency: route.freq,
        priority: route.priority,
        alternates: {
          ar: `${baseUrl}${route.ar}`,
          en: `${baseUrl}${route.en}`,
        },
      });

      entries.push({
        url: `${baseUrl}${route.en}`,
        lastModified: now,
        changeFrequency: route.freq,
        priority: route.priority,
        alternates: {
          ar: `${baseUrl}${route.ar}`,
          en: `${baseUrl}${route.en}`,
        },
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

  // =========================================================================
  // 2. Dynamic Categories
  // =========================================================================
  if (includeCategories) {
    try {
      const categories = await getStoreCategories('ar');
      categories.forEach((cat) => {
        const slugEn = cat.slug;
        const slugAr = getCategorySlugForLocale(cat.slug, 'ar') || cat.slug;

        const arUrl = `${baseUrl}/category/${slugAr}`;
        const enUrl = `${baseUrl}/en/category/${slugEn}`;

        entries.push({
          url: arUrl,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.85,
          alternates: { ar: arUrl, en: enUrl },
        });

        entries.push({
          url: enUrl,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.85,
          alternates: { ar: arUrl, en: enUrl },
        });
      });
    } catch (err) {
      console.error('[sitemap] Error loading dynamic categories:', err);
    }
  }

  // =========================================================================
  // 3. Dynamic Products
  // =========================================================================
  if (includeProducts) {
    try {
      const { products } = await getStoreProducts({ per_page: 100, locale: 'ar' });
      (products || []).forEach((prod) => {
        const slugAr = typeof prod.slug === 'string' ? prod.slug : (prod.slug?.ar || prod.slug?.en || prod.id);
        const slugEn = typeof prod.slug === 'string' ? prod.slug : (prod.slug?.en || prod.slug?.ar || prod.id);
        const arUrl = `${baseUrl}/product/${slugAr}`;
        const enUrl = `${baseUrl}/en/product/${slugEn}`;

        entries.push({
          url: arUrl,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.9,
          alternates: { ar: arUrl, en: enUrl },
        });

        entries.push({
          url: enUrl,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.9,
          alternates: { ar: arUrl, en: enUrl },
        });
      });
    } catch (err) {
      console.error('[sitemap] Error loading dynamic products:', err);
    }
  }

  // =========================================================================
  // 4. Dynamic Blog Posts
  // =========================================================================
  if (includeBlog) {
    try {
      blogPosts.forEach((post) => {
        const postDate = post.publishedAt ? new Date(post.publishedAt) : now;
        const arUrl = `${baseUrl}/blog/${post.slug.ar}`;
        const enUrl = `${baseUrl}/en/blog/${post.slug.en}`;

        entries.push({
          url: arUrl,
          lastModified: postDate,
          changeFrequency: 'weekly',
          priority: 0.75,
          alternates: { ar: arUrl, en: enUrl },
        });

        entries.push({
          url: enUrl,
          lastModified: postDate,
          changeFrequency: 'weekly',
          priority: 0.75,
          alternates: { ar: arUrl, en: enUrl },
        });
      });
    } catch (err) {
      console.error('[sitemap] Error loading blog posts:', err);
    }
  }

  // =========================================================================
  // 5. Excluded Paths Filter
  // =========================================================================
  const excludedPaths = sitemapConfig?.excluded_paths || [];
  let filteredEntries = entries;
  if (Array.isArray(excludedPaths) && excludedPaths.length > 0) {
    filteredEntries = entries.filter((entry) => {
      return !excludedPaths.some((excluded) => {
        const pattern = excluded.trim().toLowerCase();
        if (!pattern) return false;

        if (pattern.endsWith('/*')) {
          const prefix = pattern.slice(0, -2);
          return entry.url.toLowerCase().includes(prefix);
        }

        return entry.url.toLowerCase().endsWith(pattern) || entry.url.toLowerCase().includes(pattern);
      });
    });
  }

  // If viewed directly in browser: return clean, fast HTML UI without XSLT and without warnings
  if (isBrowser) {
    const tableRows = filteredEntries
      .map((item) => {
        const priorityClass =
          (item.priority || 0) >= 0.8
            ? 'priority-high'
            : (item.priority || 0) >= 0.6
            ? 'priority-mid'
            : 'priority-low';

        const lastModStr = item.lastModified
          ? item.lastModified.toISOString().replace('T', ' ').substring(0, 19)
          : '';

        const alts = item.alternates
          ? [
              item.alternates.ar ? `<a href="${item.alternates.ar}" target="_blank" class="alt-badge">AR</a>` : '',
              item.alternates.en ? `<a href="${item.alternates.en}" target="_blank" class="alt-badge">EN</a>` : '',
            ].filter(Boolean).join(' ')
          : '';

        return `<tr>
          <td>
            <a href="${item.url}" target="_blank" class="url-link">${item.url}</a>
            ${alts ? `<div class="alternate-links">${alts}</div>` : ''}
          </td>
          <td><span class="priority-pill ${priorityClass}">${item.priority?.toFixed(1) || '0.5'}</span></td>
          <td><span class="freq-badge">${item.changeFrequency || 'weekly'}</span></td>
          <td class="date-cell">${lastModStr}</td>
        </tr>`;
      })
      .join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sitemap | Grass Florist (غراس فلوريست)</title>
  <style>
    :root {
      --primary: #1b3d2f;
      --primary-dark: #12281f;
      --accent-gold: #c5a059;
      --bg: #f8faf8;
      --card-bg: #ffffff;
      --text-main: #19211d;
      --text-muted: #5e6d65;
      --border: #e1e6e2;
      --radius: 12px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      font-size: 14px;
      line-height: 1.6;
      padding: 32px 20px 80px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header-card {
      background: linear-gradient(135deg, #1b3d2f 0%, #0d1e17 100%);
      border-radius: var(--radius);
      padding: 30px 32px;
      color: #ffffff;
      margin-bottom: 24px;
      box-shadow: 0 10px 30px rgba(27, 61, 47, 0.15);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-badge {
      background: rgba(197, 160, 89, 0.2);
      color: #e5c98d;
      border: 1px solid rgba(197, 160, 89, 0.4);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 600;
    }
    .brand-actions a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ffffff;
      color: var(--primary);
      text-decoration: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.2s ease;
    }
    .brand-actions a:hover {
      background: #f0f0f0;
      transform: translateY(-1px);
    }
    .info-bar {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-group {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .stat-item { display: flex; flex-direction: column; }
    .stat-val { font-size: 20px; font-weight: 700; color: var(--primary); }
    .stat-lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .search-box {
      position: relative;
      flex: 1;
      max-width: 360px;
      min-width: 240px;
    }
    .search-box input {
      width: 100%;
      padding: 10px 14px 10px 38px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      background: #ffffff;
    }
    .search-box input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(27, 61, 47, 0.1);
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }
    .table-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
    }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    thead { background: #f3f6f4; border-bottom: 1px solid var(--border); }
    th {
      padding: 14px 18px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }
    tbody tr { border-bottom: 1px solid var(--border); }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background-color: #f7faf8; }
    td { padding: 14px 18px; vertical-align: middle; }
    .url-link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
      word-break: break-all;
    }
    .url-link:hover { color: var(--accent-gold); text-decoration: underline; }
    .priority-pill {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .priority-high { background: #e6f4ea; color: #137333; }
    .priority-mid { background: #fef7e0; color: #b06000; }
    .priority-low { background: #f1f3f4; color: #5f6368; }
    .freq-badge {
      display: inline-block;
      background: #f1f5f3;
      color: var(--primary);
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .date-cell { color: var(--text-muted); font-size: 12px; white-space: nowrap; }
    .alternate-links { display: flex; gap: 6px; margin-top: 4px; }
    .alt-badge {
      font-size: 10px;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background: #eef2f0;
      color: #3f554a;
      text-decoration: none;
      font-weight: 600;
    }
    .alt-badge:hover { background: var(--primary); color: #ffffff; }
    .xml-raw-link {
      margin-top: 24px;
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
    }
    .xml-raw-link a { color: var(--primary); font-weight: 600; text-decoration: none; }
    .xml-raw-link a:hover { text-decoration: underline; }
  </style>
  <script>
    function filterSitemap() {
      var input = document.getElementById('sitemapSearch');
      var filter = input.value.toLowerCase();
      var rows = document.querySelectorAll('#sitemapTable tbody tr');
      var count = 0;
      rows.forEach(function(row) {
        var td = row.querySelector('td');
        if (td) {
          var text = td.textContent || td.innerText;
          if (text.toLowerCase().indexOf(filter) > -1) {
            row.style.display = '';
            count++;
          } else {
            row.style.display = 'none';
          }
        }
      });
      document.getElementById('visibleCount').innerText = count;
    }
  </script>
</head>
<body>
  <div class="container">
    <div class="header-card">
      <div class="brand-title">
        <span>🌸 Grass Florist (غراس فلوريست)</span>
        <span class="brand-badge">Sitemap</span>
      </div>
      <div class="brand-actions">
        <a href="/">Visit Storefront (المتجر) →</a>
      </div>
    </div>

    <div class="info-bar">
      <div class="stat-group">
        <div class="stat-item">
          <span class="stat-val" id="visibleCount">${filteredEntries.length}</span>
          <span class="stat-lbl">Indexed URLs</span>
        </div>
        <div class="stat-item">
          <span class="stat-val">100%</span>
          <span class="stat-lbl">Index Status</span>
        </div>
        <div class="stat-item">
          <span class="stat-val">Bilingual</span>
          <span class="stat-lbl">Arabic &amp; English</span>
        </div>
      </div>

      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="sitemapSearch" onkeyup="filterSitemap()" placeholder="Filter URLs..." />
      </div>
    </div>

    <div class="table-card">
      <table id="sitemapTable">
        <thead>
          <tr>
            <th style="width: 50%;">Page URL (المسار)</th>
            <th style="width: 12%;">Priority</th>
            <th style="width: 14%;">Change Frequency</th>
            <th style="width: 24%;">Last Modified</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    <div class="xml-raw-link">
      <p>View pure XML for bots &amp; tools: <a href="/sitemap.xml?format=xml">/sitemap.xml?format=xml</a></p>
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  // Pure XML for Search Engines & Crawlers (no XSLT, no Chrome warnings)
  const xmlUrls = filteredEntries
    .map((item) => {
      const alternatesXml = item.alternates
        ? [
            item.alternates.ar ? `    <xhtml:link rel="alternate" hreflang="ar" href="${xmlEscape(item.alternates.ar)}" />` : '',
            item.alternates.en ? `    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(item.alternates.en)}" />` : '',
          ].filter(Boolean).join('\n')
        : '';

      return `  <url>
    <loc>${xmlEscape(item.url)}</loc>
${alternatesXml ? alternatesXml + '\n' : ''}${item.lastModified ? `    <lastmod>${item.lastModified.toISOString()}</lastmod>\n` : ''}${item.changeFrequency ? `    <changefreq>${item.changeFrequency}</changefreq>\n` : ''}${item.priority !== undefined ? `    <priority>${item.priority.toFixed(1)}</priority>\n` : ''}  </url>`;
    })
    .join('\n');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlUrls}
</urlset>`;

  return new Response(xmlContent, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
