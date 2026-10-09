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
            phone: data.phone || '9876543210',
            password: data.password,
          },
        };
      },
      transformResponse: (res: LaravelAuthResponse, _meta, arg) => {
        const user: User = {
          id: String(res.customer.id),
          name: res.customer.name,
          email: arg.email,
          phone: arg.phone,
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
        return {
          id: String(res.id),
          name: `${res.first_name || ''} ${res.last_name || ''}`.trim() || res.name || 'User',
          email: res.email || '',
          phone: res.phone || undefined,
          country: res.country || undefined,
          city: res.city || undefined,
          district: res.district || undefined,
          street: res.address || undefined,
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
        body: { email },
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
        const nameParts = (data.name || '').trim().split(' ');
        const first_name = nameParts[0] || 'User';
        const last_name = nameParts.slice(1).join(' ') || '.';
        return {
          url: '/v1/updateuser',
          method: 'POST',
          body: {
            user_id: data.userId,
            email: data.email,
            first_name,
            last_name,
            phone: data.phone,
            country: data.country,
            city: data.city,
            district: data.district,
            address: data.street,
          },
        };
      },
      transformResponse: (res: any) => {
        const cust = res.customer || res;
        return {
          id: String(cust.id),
          name: `${cust.first_name || ''} ${cust.last_name || ''}`.trim() || 'User',
          email: cust.email || '',
          phone: cust.phone,
          country: cust.country,
          city: cust.city,
          district: cust.district,
          street: cust.address,
          createdAt: cust.created_at || new Date().toISOString(),
        };
      },
      invalidatesTags: ['Auth'],
    }),

    getUserOrders: builder.query<Order[], string | void>({
      query: (userId) => {
        const id = userId || '0';
        return `/my-account/user_order/${id}`;
      },
      transformResponse: (res: any) => {
        if (!Array.isArray(res)) return [];
        return res.map((entry: any) => {
          const ord = entry.order || entry;
          const items = entry.items || [];
          return {
            orderNumber: ord.order_number || `ORD-${ord.id}`,
            createdAt: ord.created_at || new Date().toISOString(),
            status: (['confirmed', 'preparing', 'on_delivery', 'delivered'].includes(ord.status)
              ? ord.status
              : 'confirmed') as Order['status'],
            subtotal: Number(ord.subtotal || ord.total_amount || 0),
            vat: Number(ord.tax_amount || 0),
            shippingFee: Number(ord.shipping_amount || 0),
            discount: Number(ord.discount_amount || 0),
            total: Number(ord.total_amount || 0),
            paymentMethod: (['mada', 'apple_pay', 'credit_card', 'cod', 'tabby'].includes(ord.payment_method)
              ? ord.payment_method
              : 'mada') as Order['paymentMethod'],
            delivery: {
              date: ord.delivery_date || ord.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
              timeSlot: (['morning', 'afternoon', 'evening'].includes(ord.delivery_slot)
                ? ord.delivery_slot
                : 'afternoon') as Order['delivery']['timeSlot'],
            },
            recipient: {
              type: 'myself' as const,
              name: ord.customer_name || `${ord.first_name || ''} ${ord.last_name || ''}`.trim(),
              phone: ord.phone || '',
              city: ord.city || '',
              district: ord.district || '',
              street: ord.address || '',
            },
            items: items.map((it: any) => ({
              cartItemId: String(it.id),
              productId: String(it.product_id),
              product: {
                id: String(it.product_id),
                name: { ar: it.product_name || '', en: it.product_name || '' },
                slug: { ar: it.product_slug || String(it.product_id), en: it.product_slug || String(it.product_id) },
                price: Number(it.price || 0),
                currency: 'SAR',
                images: it.product_image ? [it.product_image] : [],
                thumbnail: it.product_image || '',
                category: { ar: '', en: '' },
                categorySlug: '',
                rating: 5,
                reviewCount: 1,
                stock: 10,
                sku: '',
                tags: [],
                availability: 'in_stock' as const,
                description: { ar: '', en: '' },
                shortDescription: { ar: '', en: '' },
                seoTitle: { ar: '', en: '' },
                seoDescription: { ar: '', en: '' },
              },
              quantity: Number(it.quantity || 1),
              itemTotal: Number(it.subtotal || it.price * it.quantity || 0),
            })),
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
} = authApi;
