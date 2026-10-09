import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const DEFAULT_ROBOTS = (baseUrl: string) => `User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /en/cart
Disallow: /en/checkout
Disallow: /account
Disallow: /en/account
Disallow: /api/*
Disallow: /_next/*
Disallow: /orders/*
Disallow: /en/orders/*
Disallow: /admin/*

# AI Answer Engines & LLM Search Agents
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: PerplexityBot
User-agent: Applebot-Extended
User-agent: Google-Extended
User-agent: cohere-ai
User-agent: Bytespider
Allow: /
Allow: /llms.txt
Allow: /sitemap.xml
Allow: /products
Allow: /en/products
Allow: /about
Allow: /en/about
Allow: /contact
Allow: /en/contact
Allow: /event-booking
Allow: /en/event-booking
Allow: /partner-with-us
Allow: /en/partner-with-us
Allow: /faq
Allow: /en/faq
Allow: /blog
Allow: /en/blog
Disallow: /cart
Disallow: /checkout
Disallow: /en/cart
Disallow: /en/checkout
Disallow: /account
Disallow: /en/account
Disallow: /api/*

Sitemap: ${baseUrl}/sitemap.xml
`;

export async function GET() {
  const baseUrl = siteConfig.url || 'https://grassflorist.com';

  try {
    const res = await fetch('http://127.0.0.1:8000/api/global-settings', {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const json = await res.json();
      const customContent = json?.data?.seo?.robots?.custom_content;

      if (customContent && customContent.trim()) {
        return new NextResponse(customContent.trim() + '\n', {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          },
        });
      }
    }
  } catch (err) {
    console.warn('[robots.txt] Failed to fetch custom robots settings, using fallback default.');
  }

  return new NextResponse(DEFAULT_ROBOTS(baseUrl), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
