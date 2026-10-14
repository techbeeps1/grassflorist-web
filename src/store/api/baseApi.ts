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
function getCurrentLocale(): string {
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

    // 2. Bilingual Locale Header (picked up by Laravel's SetApiLocale middleware)
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
function handleSessionExpired(api: any) {
  const now = Date.now();
  // Throttle notification and redirect to avoid duplicates if multiple requests fail at once
  if (now - lastSessionExpiredNotice < 4000) return;
  lastSessionExpiredNotice = now;

  const locale = getCurrentLocale();
  const isEn = locale === 'en';

  // 1. Dispatch toast notification
  api.dispatch(
    addToast({
      type: 'error',
      message: isEn
        ? 'Your session has expired. Please log in again.'
        : 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.',
    })
  );

  // 2. Clear auth credentials in state & storage
  api.dispatch(logout());

  // 3. Redirect to login page with session_expired indicator
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname + window.location.search;
    if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
      const redirectParam = encodeURIComponent(currentPath);
      const loginUrl = isEn
        ? `/en/login?session_expired=1&redirect=${redirectParam}`
        : `/login?session_expired=1&redirect=${redirectParam}`;
      window.location.href = loginUrl;
    }
  }
}

/**
 * Custom baseQuery that intercepts 401 Unauthorized for automatic silent token refresh.
 * If refresh fails, alerts user and redirects to login page.
 */
const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    const isRefreshUrl = url.includes('/refresh');
    const isAuthExempt =
      url.includes('/login') ||
      url.includes('/register') ||
      url.includes('/forgot-password') ||
      url.includes('/reset-password') ||
      isRefreshUrl;

    const state = api.getState() as RootState;
    const existingToken =
      state?.auth?.token ||
      (typeof window !== 'undefined' ? localStorage.getItem('grass_auth_token') : null);

    // If request was from an authenticated user and not an exempt auth endpoint
    if (!isAuthExempt && existingToken) {
      if (!refreshPromise) {
        // Start single-flight silent refresh
        refreshPromise = (async () => {
          try {
            const refreshResult = await rawBaseQuery(
              {
                url: '/my-account/refresh',
                method: 'POST',
              },
              api,
              extraOptions
            );

            if (refreshResult.data && (refreshResult.data as any).access_token) {
              const newToken = (refreshResult.data as any).access_token as string;
              api.dispatch(setToken(newToken));
              return newToken;
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
        // Retry the original query with the refreshed token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Silent refresh failed (refresh token expired or invalid) -> redirect to login with notification
        handleSessionExpired(api);
      }
    } else if (isRefreshUrl) {
      // Direct refresh request returned 401
      handleSessionExpired(api);
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
