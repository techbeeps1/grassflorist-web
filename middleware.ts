import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
     * - favicon.ico, sitemap.xml, robots.txt, llms.txt
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt|images).*)',
  ],
};
