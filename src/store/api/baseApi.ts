import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { logout, setToken } from '../slices/authSlice';
import { addToast } from '../slices/uiSlice';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Helper to determine current locale in SSR or Client environment
 */
export function getCurrentLocale(): string {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/en') || pathname.startsWith('/en/')) {
      return 'en';
    }
    const htmlLang = document.documentElement.lang;
    if (htmlLang === 'en') return 'en';
  }
  return 'ar';
}

/**
 * Ensures all API endpoint URLs are strictly prefixed with /en or /ar
 */
export function prefixUrlWithLocale(url: string, locale?: string): string {
  if (!url || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const activeLocale = locale || getCurrentLocale();
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;

  // If already prefixed with /en or /ar, keep as is
  if (
    cleanUrl.startsWith('/en/') ||
    cleanUrl === '/en' ||
    cleanUrl.startsWith('/ar/') ||
    cleanUrl === '/ar'
  ) {
    return cleanUrl;
  }

  return `/${activeLocale}${cleanUrl}`;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // 1. JWT Bearer Token Injection
    const state = getState() as RootState;
    const token =
      state?.auth?.token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('grass_auth_token')
        : null);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // 2. Bilingual Locale Header (kept as supplementary context alongside URL prefix)
    const locale = getCurrentLocale();
    headers.set('X-Locale', locale);
    headers.set('Accept-Language', locale === 'ar' ? 'ar,en;q=0.8' : 'en,ar;q=0.8');

    // 3. Format & Dev Cache Bypass
    headers.set('Accept', 'application/json');
    if (process.env.NODE_ENV !== 'production') {
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
    }

    return headers;
  },
});

// Single-flight promise lock to prevent parallel duplicate refresh requests
let refreshPromise: Promise<string | null> | null = null;
let lastSessionExpiredNotice = 0;

/**
 * Handle session expiration when refresh token is invalid or expired
 */
function handleSessionExpired(api: any, errorData?: any) {
  const now = Date.now();
  // Throttle notification and redirect to avoid duplicates if multiple requests fail at once
  if (now - lastSessionExpiredNotice < 4000) return;
  lastSessionExpiredNotice = now;

  const locale = getCurrentLocale();
  const isEn = locale === 'en';

  const isDeactivated =
    errorData?.code === 'account_deactivated' ||
    (typeof errorData?.message === 'string' && errorData.message.toLowerCase().includes('deactivated')) ||
    (typeof errorData?.error === 'string' && errorData.error.toLowerCase().includes('deactivated'));

  const toastMessage = isDeactivated
    ? (isEn
        ? 'Your account has been deactivated. Please contact customer support.'
        : 'تم تعطيل وتجميد حسابك. يرجى التواصل مع فريق الدعم للمساعدة.')
    : (isEn
        ? 'Your session has expired. Please log in again.'
        : 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.');

  // 1. Dispatch toast notification
  api.dispatch(
    addToast({
      type: 'error',
      message: toastMessage,
    })
  );

  // 2. Clear auth credentials in state & storage
  api.dispatch(logout());

  // 3. Redirect to login page with indicator
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname + window.location.search;
    if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
      const redirectParam = encodeURIComponent(currentPath);
      const queryParam = isDeactivated ? 'account_deactivated=1' : 'session_expired=1';
      const loginUrl = isEn
        ? `/en/login?${queryParam}&redirect=${redirectParam}`
        : `/login?${queryParam}&redirect=${redirectParam}`;
      window.location.href = loginUrl;
    }
  }
}

/**
 * Custom baseQuery that enforces URL locale prefix (/en/... or /ar/...)
 * and intercepts 401 Unauthorized for automatic silent token refresh.
 */
let lastRefreshErrorPayload: any = null;

const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const locale = getCurrentLocale();
  const adjustedArgs: string | FetchArgs =
    typeof args === 'string'
      ? prefixUrlWithLocale(args, locale)
      : { ...args, url: prefixUrlWithLocale(args.url, locale) };

  let result = await rawBaseQuery(adjustedArgs, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const rawUrl = typeof args === 'string' ? args : args.url;
    const isRefreshUrl = rawUrl.includes('/refresh');
    const isAuthExempt =
      rawUrl.includes('/login') ||
      rawUrl.includes('/register') ||
      rawUrl.includes('/forgot-password') ||
      rawUrl.includes('/reset-password') ||
      isRefreshUrl;

    const state = api.getState() as RootState;
    const existingToken =
      state?.auth?.token ||
      (typeof window !== 'undefined' ? localStorage.getItem('grass_auth_token') : null);

    // If request was from an authenticated user and not an exempt auth endpoint
    if (!isAuthExempt && existingToken) {
      if (!refreshPromise) {
        // Start single-flight silent refresh with locale prefix
        refreshPromise = (async () => {
          try {
            const refreshResult = await rawBaseQuery(
              {
                url: prefixUrlWithLocale('/my-account/refresh', locale),
                method: 'POST',
              },
              api,
              extraOptions
            );

            if (refreshResult.data && (refreshResult.data as any).access_token) {
              const newToken = (refreshResult.data as any).access_token as string;
              api.dispatch(setToken(newToken));
              lastRefreshErrorPayload = null;
              return newToken;
            }

            if (refreshResult.error) {
              lastRefreshErrorPayload = refreshResult.error.data;
            }
            return null;
          } catch {
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const refreshedToken = await refreshPromise;

      if (refreshedToken) {
        // Retry the original query with the refreshed token using adjusted prefixed args
        result = await rawBaseQuery(adjustedArgs, api, extraOptions);
      } else {
        // Silent refresh failed (refresh token expired, deactivated, or invalid) -> redirect to login with notification
        handleSessionExpired(api, lastRefreshErrorPayload || (result.error as any)?.data);
      }
    } else if (isRefreshUrl) {
      // Direct refresh request returned 401
      handleSessionExpired(api, (result.error as any)?.data);
    }
  }

  return result;
};

const IS_DEV = process.env.NODE_ENV !== 'production';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: dynamicBaseQuery,
  refetchOnMountOrArgChange: IS_DEV ? true : false,
  keepUnusedDataFor: IS_DEV ? 0 : 60,
  tagTypes: [
    'Product',
    'Category',
    'Cart',
    'Order',
    'Auth',
    'Wishlist',
    'HomePage',
    'PaymentMethods',
    'DeliverySlots',
    'Settings',
    'Cms',
    'SubscriptionPlans',
    'ShippingMethods',
  ],
  endpoints: () => ({}),
});
