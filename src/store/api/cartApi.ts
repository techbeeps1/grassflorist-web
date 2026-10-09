import { baseApi } from './baseApi';
import { CartItem } from '@/types/cart';
import { formatStorageUrl } from '@/lib/wordpress/store-api';

export function getCartSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let sid = localStorage.getItem('grass_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('grass_session_id', sid);
  }
  return sid;
}

export interface LaravelCartItem {
  id: number;
  product_id: number | string;
  product_name: string;
  product_slug: string;
  product_price: number | string;
  product_mrp: number | string;
  stock_quantity?: number;
  quantity: number;
  image?: string;
  product_weight?: number | string;
  subtotal: number | string;
}

export interface LaravelCartResponse {
  cart_id?: number;
  session_id?: string;
  user_id?: number | null;
  items?: LaravelCartItem[];
  items_count?: number;
  total?: number;
  message?: string;
}

export function getLocalizedProductName(name: any, locale: string = 'en'): string {
  if (!name) return '';

  let curr = name;

  // Recursively unwrap nested objects
  while (curr && typeof curr === 'object') {
    const next = curr[locale] ?? curr.en ?? curr.ar ?? Object.values(curr)[0];
    if (next === curr) break;
    curr = next;
  }

  // If it's a JSON string, parse and unwrap again
  if (typeof curr === 'string') {
    const trimmed = curr.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('"{') && trimmed.endsWith('}"'))) {
      try {
        let clean = trimmed;
        if (clean.startsWith('"{') && clean.endsWith('}"')) {
          clean = JSON.parse(clean);
        }
        const parsed = typeof clean === 'string' ? JSON.parse(clean) : clean;
        return getLocalizedProductName(parsed, locale);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  return typeof curr === 'string' ? curr : String(curr ?? '');
}

export function parseLocalizedField(val: any): { ar: string; en: string } {
  return {
    ar: getLocalizedProductName(val, 'ar'),
    en: getLocalizedProductName(val, 'en'),
  };
}

export function convertServerCartItemToClient(item: LaravelCartItem): CartItem {
  const price = Number(item.product_price) || 0;
  const qty = Number(item.quantity) || 1;
  const productId = String(item.product_id);
  const localizedName = parseLocalizedField(item.product_name);
  const localizedSlug = parseLocalizedField(item.product_slug);

  return {
    cartItemId: `${productId}-standard`,
    productId,
    quantity: qty,
    itemTotal: price * qty,
    product: {
      id: productId,
      name: localizedName,
      slug: localizedSlug,
      price,
      originalPrice: Number(item.product_mrp) || price,
      currency: 'SAR',
      thumbnail: formatStorageUrl(item.image),
      images: item.image ? [formatStorageUrl(item.image)] : [formatStorageUrl(null)],
      category: { ar: '', en: '' },
      categorySlug: '',
      description: { ar: '', en: '' },
      shortDescription: { ar: '', en: '' },
      sku: `PROD-${productId}`,
      stock: item.stock_quantity !== undefined ? Math.max(0, Number(item.stock_quantity)) : 999,
      availability: (item.stock_quantity !== undefined && Number(item.stock_quantity) <= 0) ? 'out_of_stock' : 'in_stock',
      rating: 5,
      reviewCount: 1,
      tags: [],
      seoTitle: { ar: '', en: '' },
      seoDescription: { ar: '', en: '' },
    },
  };
}


export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    viewCart: builder.query<LaravelCartResponse, void>({
      query: () => ({
        url: '/cart/viewcart',
        params: {
          session_id: getCartSessionId(),
        },
      }),
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation<
      { message: string; cart: any; total_products_count: number },
      { productId: string | number; quantity: number }
    >({
      query: ({ productId, quantity }) => ({
        url: '/cart/add',
        method: 'POST',
        body: {
          product_id: Number(productId),
          quantity,
          session_id: getCartSessionId(),
        },
      }),
      invalidatesTags: ['Cart'],
    }),

    updateCartQuantity: builder.mutation<
      { success: boolean; message: string },
      { productId: string | number; quantityChange: 1 | -1 }
    >({
      query: ({ productId, quantityChange }) => ({
        url: '/cart/cartupdate',
        method: 'POST',
        body: {
          product_id: Number(productId),
          quantity_change: quantityChange,
          session_id: getCartSessionId(),
        },
      }),
      invalidatesTags: ['Cart'],
    }),

    removeCartItem: builder.mutation<
      { success: boolean; message: string },
      { productId: string | number }
    >({
      query: ({ productId }) => ({
        url: '/cart/remove',
        method: 'POST',
        body: {
          product_id: Number(productId),
          session_id: getCartSessionId(),
        },
      }),
      invalidatesTags: ['Cart'],
    }),

    emptyCart: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/cart/empty',
        params: {
          session_id: getCartSessionId(),
        },
      }),
      invalidatesTags: ['Cart'],
    }),

    syncCustomerCart: builder.mutation<
      { message: string },
      { userId?: string | number }
    >({
      query: ({ userId }) => ({
        url: '/cart/sync-customer',
        method: 'POST',
        body: {
          session_id: getCartSessionId(),
          user_id: userId,
        },
      }),
      invalidatesTags: ['Cart'],
    }),

    mergeCart: builder.mutation<
      LaravelCartResponse,
      { guest_session_id?: string; local_items?: Array<{ productId: string | number; quantity: number }> }
    >({
      query: (body) => ({
        url: '/cart/merge',
        method: 'POST',
        body: {
          session_id: body.guest_session_id || getCartSessionId(),
          local_items: body.local_items || [],
        },
      }),
      invalidatesTags: ['Cart'],
    }),

    getAvailableCoupons: builder.query<any[], void>({
      query: () => '/cart/coupons',
    }),

    applyServerCoupon: builder.mutation<
      { success?: boolean; discount?: number; message?: string },
      string
    >({
      query: (couponCode) => ({
        url: `/cart/coupon/${encodeURIComponent(couponCode)}`,
        method: 'POST',
        body: {
          session_id: getCartSessionId(),
        },
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useViewCartQuery,
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useRemoveCartItemMutation,
  useEmptyCartMutation,
  useSyncCustomerCartMutation,
  useMergeCartMutation,
  useGetAvailableCouponsQuery,
  useApplyServerCouponMutation,
} = cartApi;
