import { type Locale } from './config';

/**
 * Generates the corresponding URL path in the target language.
 * Arabic lives strictly at root (e.g. / or /product/abc).
 * English lives strictly at /en (e.g. /en or /en/product/abc).
 * NEVER produces /ar/.
 */
export function getLocalizedPath(currentPath: string, targetLocale: Locale): string {
  // Normalize path
  let path = currentPath.trim();
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  // Remove query params for route analysis if any, but preserve them
  const [pathname, queryString] = path.split('?');
  const query = queryString ? `?${queryString}` : '';

  // Determine current locale and root path
  const isEnglish = pathname === '/en' || pathname.startsWith('/en/');
  const basePath = isEnglish ? pathname.replace(/^\/en/, '') || '/' : pathname;

  if (targetLocale === 'ar') {
    return `${basePath}${query}` || '/';
  } else {
    return basePath === '/' ? `/en${query}` : `/en${basePath}${query}`;
  }
}

/**
 * Returns the direction for the given locale.
 */
export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
