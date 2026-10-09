import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { logout } from '../slices/authSlice';

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

/**
 * Custom baseQuery that intercepts 401 Unauthorized for secure logout / token refresh
 */
const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // If receiving 401 Unauthorized from protected endpoint, trigger clean logout
    const state = api.getState() as RootState;
    if (state?.auth?.isAuthenticated) {
      api.dispatch(logout());
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
  ],
  endpoints: () => ({}),
});
