import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ARABIC_STATIC_PAGE_REWRITES: Record<string, string> = {
  '/عن-غراس': '/about',
  '/من-نحن': '/about',
  '/اتصل-بنا': '/contact',
  '/المدونة': '/blog',
  '/الخصوصية': '/policies/privacy',
  '/سياسة-الخصوصية': '/policies/privacy',
  '/سياسة-التوصيل-والخصوصية': '/policies/privacy',
  '/سياسة-الاسترجاع-والاسترداد': '/policies/returns',
  '/سياسة-الاسترجاع-والاستبدال': '/policies/returns',
  '/الأسئلة-الشائعة': '/faq',
  '/المفضلة': '/wishlist',
  '/الشروط-والأحكام': '/policies/terms',
  '/الشحن-والتوصيل': '/policies/shipping',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Strict Enforcement: Arabic NEVER uses /ar/.
  // If user requests /ar or /ar/*, redirect permanently (301) to root equivalent.
  if (pathname === '/ar' || pathname === '/ar/') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url, 301);
  }

  if (pathname.startsWith('/ar/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/ar/, '');
    return NextResponse.redirect(url, 301);
  }

  // 2. Determine active locale
  const isEnglish = pathname === '/en' || pathname.startsWith('/en/');
  const locale = isEnglish ? 'en' : 'ar';

  // 3. Set custom headers for server components & layouts
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-locale', locale);
  requestHeaders.set('x-direction', locale === 'ar' ? 'rtl' : 'ltr');

  // 4. Internal Rewrite for Arabic static page URLs (so browser URL stays in Arabic without 404)
  let decodedPath = pathname;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    decodedPath = pathname;
  }

  // Normalize trailing slash (e.g., /عن-غراس/ -> /عن-غراس)
  const normalizedDecodedPath =
    decodedPath.endsWith('/') && decodedPath.length > 1
      ? decodedPath.slice(0, -1)
      : decodedPath;

  if (ARABIC_STATIC_PAGE_REWRITES[normalizedDecodedPath]) {
    const targetPath = ARABIC_STATIC_PAGE_REWRITES[normalizedDecodedPath];
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, llms.txt, images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt|images).*)',
  ],
};
