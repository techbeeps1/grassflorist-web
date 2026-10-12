import { baseApi } from './baseApi';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ForgotPasswordData,
  ResetPasswordData,
} from '@/types/user';
import { Order } from '@/types/order';

interface LaravelAuthResponse {
  access_token: string;
  customer: {
    id: number | string;
    name: string;
  };
}

interface LaravelCheckAuthResponse {
  status: string;
  message?: string;
  data?: {
    id: number | string;
    name: string;
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/v1/login',
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password,
        },
      }),
      transformResponse: (res: LaravelAuthResponse, _meta, arg) => {
        const user: User = {
          id: String(res.customer.id),
          name: res.customer.name,
          email: arg.email,
          createdAt: new Date().toISOString(),
        };
        return {
          user,
          token: res.access_token,
        };
      },
      invalidatesTags: ['Auth', 'Order', 'Cart'],
    }),

    register: builder.mutation<AuthResponse, RegisterData>({
      query: (data) => {
        const nameParts = data.name ? data.name.trim().split(' ') : [];
        const first_name = data.firstName?.trim() || nameParts[0] || data.name || 'User';
        const last_name = data.lastName?.trim() || nameParts.slice(1).join(' ') || '.';
        return {
          url: '/v1/register',
          method: 'POST',
          body: {
            first_name,
            last_name,
            email: data.email,
            phone: data.phone || '',
            password: data.password,
            locale:
              typeof window !== 'undefined' &&
              (window.location.pathname.startsWith('/en') || window.location.pathname.startsWith('/en/'))
                ? 'en'
                : 'ar',
          },
        };
      },
      transformResponse: (res: LaravelAuthResponse, _meta, arg) => {
        const user: User = {
          id: String(res.customer.id),
          name: res.customer.name,
          email: arg.email,
          phone: arg.phone && arg.phone !== '9876543210' ? arg.phone : undefined,
          createdAt: new Date().toISOString(),
        };
        return {
          user,
          token: res.access_token,
        };
      },
      invalidatesTags: ['Auth', 'Cart'],
    }),

    checkAuth: builder.query<User | null, void>({
      query: () => '/my-account/checkauth',
      transformResponse: (res: LaravelCheckAuthResponse) => {
        if (res.status === 'success' && res.data) {
          return {
            id: String(res.data.id),
            name: res.data.name,
            email: '',
            createdAt: new Date().toISOString(),
          };
        }
        return null;
      },
      providesTags: ['Auth'],
    }),

    getUserProfile: builder.query<User, void>({
      query: () => '/my-account/user',
      transformResponse: (res: any) => {
        const cleanLast = res.last_name && res.last_name !== '.' ? res.last_name : '';
        const fullName = [res.first_name, cleanLast].filter(Boolean).join(' ') || res.name || 'User';
        const cleanPhone =
          res.phone && res.phone !== '9876543210' && res.phone !== '0500000000'
            ? res.phone
            : undefined;
        return {
          id: String(res.id),
          firstName: res.first_name || '',
          lastName: cleanLast,
          name: fullName,
          email: res.email || '',
          phone: cleanPhone,
          country: res.country || undefined,
          city: res.city || undefined,
          district: res.district || undefined,
          street: res.address || undefined,
          emailVerified: Boolean(res.email_verified || res.email_verified_at),
          emailVerifiedAt: res.email_verified_at || null,
          createdAt: res.created_at || new Date().toISOString(),
        };
      },
      providesTags: ['Auth'],
    }),

    logoutUser: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/my-account/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Order', 'Cart', 'Wishlist'],
    }),

    forgotPassword: builder.mutation<{ success: boolean; message: string }, ForgotPasswordData>({
      query: ({ email }) => ({
        url: '/customer/forgot-password',
        method: 'POST',
        body: {
          email,
          locale:
            typeof window !== 'undefined' &&
            (window.location.pathname.startsWith('/en') || window.location.pathname.startsWith('/en/'))
              ? 'en'
              : 'ar',
        },
      }),
      transformResponse: (res: any) => ({
        success: true,
        message: res?.message || 'Password reset link sent to your email.',
      }),
    }),

    resetPassword: builder.mutation<
      { success: boolean; message: string },
      ResetPasswordData & { email?: string }
    >({
      query: (data) => ({
        url: '/customer/reset-password',
        method: 'POST',
        body: {
          token: data.token,
          email: data.email,
          password: data.newPassword,
          password_confirmation: data.newPassword,
        },
      }),
      transformResponse: (res: any) => ({
        success: true,
        message: res?.message || 'Password reset successfully.',
      }),
    }),

    updateProfile: builder.mutation<User, UpdateProfileData & { userId: string }>({
      query: (data) => {
        let first_name = data.firstName?.trim() || '';
        let last_name = data.lastName?.trim() || '';

        if (!first_name && data.name) {
          const nameParts = data.name.trim().split(' ');
          first_name = nameParts[0] || 'User';
          last_name = nameParts.slice(1).join(' ') || '';
        }

        return {
          url: '/v1/updateuser',
          method: 'POST',
          body: {
            user_id: data.userId,
            email: data.email,
            first_name: first_name || 'User',
            last_name: last_name,
            phone: data.phone,
            country: data.country,
            city: data.city,
            district: data.district,
            address: data.street,
          },
        };
      },
      transformResponse: (res: any) => {
        const cust = res.customer || res.data || res;
        const cleanLast = cust.last_name && cust.last_name !== '.' ? cust.last_name : '';
        const fullName = [cust.first_name, cleanLast].filter(Boolean).join(' ') || cust.name || 'User';
        return {
          id: String(cust.id),
          firstName: cust.first_name || '',
          lastName: cleanLast,
          name: fullName,
          email: cust.email || '',
          phone: cust.phone,
          country: cust.country,
          city: cust.city,
          district: cust.district,
          street: cust.address,
          emailVerified: Boolean(cust.email_verified || cust.email_verified_at),
          emailVerifiedAt: cust.email_verified_at || null,
          createdAt: cust.created_at || new Date().toISOString(),
        };
      },
      invalidatesTags: ['Auth'],
    }),

    sendVerificationEmail: builder.mutation<{ message: string; success?: boolean }, { email?: string } | void>({
      query: (arg) => ({
        url: '/my-account/send-verification-email',
        method: 'POST',
        body: {
          email: arg?.email,
          locale:
            typeof window !== 'undefined' &&
            (window.location.pathname.startsWith('/en') || window.location.pathname.startsWith('/en/'))
              ? 'en'
              : 'ar',
        },
      }),
    }),

    verifyEmail: builder.mutation<{ message: string; success?: boolean; is_verified?: boolean }, { token: string }>({
      query: ({ token }) => ({
        url: '/my-account/verify-email',
        method: 'POST',
        body: { token },
      }),
      invalidatesTags: ['Auth'],
    }),

    changePassword: builder.mutation<
      { status?: string; message?: string; success?: string; error?: string },
      { currentPassword?: string; password: string; password_confirmation: string; email?: string }
    >({
      query: (data) => ({
        url: '/my-account/passwordchange',
        method: 'POST',
        body: {
          current_password: data.currentPassword,
          password: data.password,
          password_confirmation: data.password_confirmation,
          email: data.email,
        },
      }),
    }),

    getUserOrders: builder.query<Order[], string | void>({
      query: (userId) => {
        const id = userId || '0';
        return `/my-account/user_order/${id}`;
      },
      transformResponse: (res: any) => {
        let rawOrders: any[] = [];
        if (Array.isArray(res)) {
          rawOrders = res;
        } else if (Array.isArray(res?.data?.orders)) {
          rawOrders = res.data.orders;
        } else if (Array.isArray(res?.data)) {
          rawOrders = res.data;
        } else if (Array.isArray(res?.orders)) {
          rawOrders = res.orders;
        }

        const parseName = (nameVal: any) => {
          if (!nameVal) return { ar: 'منتج غراس', en: 'Grass Product' };
          if (typeof nameVal === 'object') {
            return {
              ar: nameVal.ar || nameVal.en || 'منتج غراس',
              en: nameVal.en || nameVal.ar || 'Grass Product',
            };
          }
          if (typeof nameVal === 'string') {
            try {
              const parsed = JSON.parse(nameVal);
              if (typeof parsed === 'object' && parsed !== null) {
                return {
                  ar: parsed.ar || parsed.en || 'منتج غراس',
                  en: parsed.en || parsed.ar || 'Grass Product',
                };
              }
            } catch {}
            return { ar: nameVal, en: nameVal };
          }
          return { ar: String(nameVal), en: String(nameVal) };
        };

        const parseImage = (imgVal: any): string => {
          if (!imgVal) return '';
          if (Array.isArray(imgVal)) return imgVal[0] || '';
          if (typeof imgVal === 'string') {
            try {
              const parsed = JSON.parse(imgVal);
              return Array.isArray(parsed) ? parsed[0] || '' : String(parsed || '');
            } catch {
              return imgVal;
            }
          }
          return '';
        };

        return rawOrders.map((entry: any) => {
          const ord = entry.order_details || entry.order || entry;
          const items = Array.isArray(entry.items) ? entry.items : Array.isArray(ord.items) ? ord.items : [];

          const rawStatus = (ord.status || 'confirmed').toLowerCase();
          let status: Order['status'] = 'confirmed';
          if (['completed', 'delivered'].includes(rawStatus)) {
            status = 'delivered';
          } else if (['on_delivery', 'shipped', 'out_for_delivery', 'dispatch'].includes(rawStatus)) {
            status = 'on_delivery';
          } else if (['processing', 'preparing', 'in_production'].includes(rawStatus)) {
            status = 'preparing';
          } else {
            status = 'confirmed';
          }

          const metaData = typeof ord.meta_data === 'string'
            ? (() => { try { return JSON.parse(ord.meta_data); } catch { return {}; } })()
            : (ord.meta_data || {});

          const isPaypal = String(ord.payment_method || '').toLowerCase() === 'paypal';
          const isUsd = (String(ord.currency || metaData?.currency || '').toUpperCase() === 'USD') || isPaypal;
          const orderCurrency: 'SAR' | 'USD' = isUsd ? 'USD' : 'SAR';
          let exchangeRate = Number(ord.exchange_rate || metaData?.exchange_rate || 0.2667);
          if (exchangeRate <= 0 || (isPaypal && exchangeRate >= 1.0)) {
            exchangeRate = 0.2667;
          }
          const sarTotal = Number(ord.sar_amount || metaData?.sar_total || ord.total_amount || 0);

          let usdTotal = 0;
          if (metaData?.usd_total && Number(metaData.usd_total) < sarTotal) {
            usdTotal = Number(metaData.usd_total);
          } else if (ord.currency_amount && Number(ord.currency_amount) < sarTotal) {
            usdTotal = Number(ord.currency_amount);
          } else {
            usdTotal = Number((sarTotal * exchangeRate).toFixed(2));
          }
          const currencyAmount = isUsd ? usdTotal : sarTotal;

          const subtotal = Number(ord.subtotal || ord.total_amount || 0);
          const vat = Number(ord.tax_amount || 0);
          const shippingFee = Number(ord.shipping_amount || 0);
          const discount = Number(ord.discount_amount || 0);

          return {
            orderNumber: ord.order_number || `ORD-${ord.id}`,
            orderKey: ord.order_key || entry.order_key || '',
            createdAt: ord.created_at || new Date().toISOString(),
            status,
            subtotal,
            vat,
            shippingFee,
            discount,
            total: sarTotal,
            sarTotal,
            sarAmount: sarTotal,
            sarSubtotal: Number(metaData?.sar_subtotal || subtotal),
            sarShippingFee: shippingFee,
            sarVat: vat,
            sarDiscount: discount,
            usdTotal,
            usdSubtotal: Number(metaData?.usd_subtotal || Number((subtotal * exchangeRate).toFixed(2))),
            usdShippingFee: Number((shippingFee * exchangeRate).toFixed(2)),
            usdVat: Number((vat * exchangeRate).toFixed(2)),
            usdDiscount: Number((discount * exchangeRate).toFixed(2)),
            paymentMethod: (ord.payment_method || 'mada') as Order['paymentMethod'],
            payment_status: ord.payment_status || 'pending',
            currency: orderCurrency,
            currencyAmount,
            exchangeRate,
            shipping_method: ord.shipping_method || 'Delivery Inside Jeddah',
            shippingMethodTitle: ord.shipping_method || 'Delivery Inside Jeddah',
            vat_percentage: Number(ord.vat_percentage || 15),
            delivery: {
              date: ord.delivery_date || ord.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
              timeSlot: ord.delivery_time || ord.delivery_slot || '11:00 AM to 03:00 PM',
            },
            sender: {
              firstName: ord.first_name || (ord.sender_name ? ord.sender_name.split(' ')[0] : '') || '',
              lastName: ord.last_name || (ord.sender_name ? ord.sender_name.split(' ').slice(1).join(' ') : '') || '',
              phone: ord.customer_phone || ord.phone || '',
              email: ord.email || '',
            },
            recipient: {
              type: 'gift' as const,
              name: ord.recipient_name || ord.customer_name || `${ord.first_name || ''} ${ord.last_name || ''}`.trim() || 'Customer',
              phone: ord.recipient_phone || ord.customer_phone || ord.phone || '',
              city: ord.city || 'Jeddah',
              district: ord.district || '',
              street: ord.address || '',
            },
            giftCard: {
              senderName: ord.meta_data?.sender_name_on_card || ord.sender_name || '',
              message: ord.delivery_message || ord.card_message || ord.meta_data?.card_message || '',
              songLink: ord.song_link || ord.meta_data?.song_link || '',
            },
            songLink: ord.song_link || ord.meta_data?.song_link || '',
            locationLink: ord.location_link || '',
            items: items.map((it: any) => {
              const prodName = parseName(it.product_name || it.name);
              const prodImg = parseImage(it.product_image || it.image);
              const qty = Number(it.quantity || 1);
              const price = Number(it.price || it.unit_price || 0);
              const itemTotal = Number(it.total || it.subtotal || price * qty || 0);

              return {
                cartItemId: String(it.id),
                productId: String(it.product_id || it.id),
                product: {
                  id: String(it.product_id || it.id),
                  name: prodName,
                  slug: { ar: it.product_slug || String(it.product_id), en: it.product_slug || String(it.product_id) },
                  price: price,
                  currency: 'SAR',
                  images: prodImg ? [prodImg] : [],
                  thumbnail: prodImg,
                  category: { ar: 'زهور فاخرة', en: 'Luxury Flowers' },
                  categorySlug: '',
                  rating: 5,
                  reviewCount: 1,
                  stock: 10,
                  sku: it.sku || '',
                  tags: [],
                  availability: 'in_stock' as const,
                  description: { ar: '', en: '' },
                  shortDescription: { ar: '', en: '' },
                  seoTitle: { ar: '', en: '' },
                  seoDescription: { ar: '', en: '' },
                },
                quantity: qty,
                itemTotal: itemTotal,
              };
            }),
          };
        });
      },
      providesTags: ['Order'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useCheckAuthQuery,
  useGetUserProfileQuery,
  useLogoutUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useGetUserOrdersQuery,
  useSendVerificationEmailMutation,
  useVerifyEmailMutation,
  useChangePasswordMutation,
} = authApi;
