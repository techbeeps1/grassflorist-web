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

// Sample mock orders for demonstration if backend not connected
const MOCK_USER_ORDERS: Order[] = [
  {
    orderNumber: 'GF-98124',
    items: [
      {
        cartItemId: 'item-1',
        productId: '92121',
        product: {
          id: '92121',
          name: { ar: 'باقة بيبي روز الأرجوانية', en: 'Purple Baby Rose Bouquet' },
          slug: { ar: 'g896', en: 'g896' },
          description: { ar: 'تنسيق أنيق', en: 'Elegant arrangement' },
          shortDescription: { ar: 'تنسيق أنيق', en: 'Elegant arrangement' },
          price: 350,
          currency: 'SAR',
          images: ['https://grassflorist.com/wp-content/uploads/2024/09/G896.webp'],
          thumbnail: 'https://grassflorist.com/wp-content/uploads/2024/09/G896.webp',
          category: { ar: 'باقات يد', en: 'Hand Bouquet' },
          categorySlug: 'hand-bouquet',
          rating: 4.9,
          reviewCount: 12,
          stock: 10,
          sku: 'GF-92121',
          tags: ['roses'],
          availability: 'in_stock',
          seoTitle: { ar: 'باقة بيبي روز الأرجوانية', en: 'Purple Baby Rose Bouquet' },
          seoDescription: { ar: 'تنسيق أنيق', en: 'Elegant arrangement' },
        },
        quantity: 1,
        itemTotal: 350,
      },
    ],
    recipient: {
      type: 'myself',
      name: 'سارة المنصور',
      phone: '+966 50 123 4567',
      city: 'جدة',
      district: 'حي الروضة',
      street: 'شارع الأمير سلطان',
    },
    delivery: {
      date: '2026-09-16',
      timeSlot: 'evening',
    },
    paymentMethod: 'mada',
    subtotal: 350,
    shippingFee: 0,
    vat: 52.5,
    discount: 0,
    total: 350,
    status: 'delivered',
    createdAt: '2026-09-12T14:30:00Z',
  },
  {
    orderNumber: 'GF-97502',
    items: [
      {
        cartItemId: 'item-2',
        productId: '92110',
        product: {
          id: '92110',
          name: { ar: 'فازة التوليب الملكية', en: 'Royal Tulip Ceramic Vase' },
          slug: { ar: 'tulip-vase', en: 'tulip-vase' },
          description: { ar: 'فازة زهور فاخرة', en: 'Luxury floral vase' },
          shortDescription: { ar: 'فازة زهور فاخرة', en: 'Luxury floral vase' },
          price: 420,
          currency: 'SAR',
          images: ['https://grassflorist.com/wp-content/uploads/2024/09/G896.webp'],
          thumbnail: 'https://grassflorist.com/wp-content/uploads/2024/09/G896.webp',
          category: { ar: 'زهور فاخرة', en: 'Luxury Flowers' },
          categorySlug: 'all-flowers',
          rating: 5.0,
          reviewCount: 8,
          stock: 5,
          sku: 'GF-92110',
          tags: ['tulips'],
          availability: 'in_stock',
          seoTitle: { ar: 'فازة التوليب الملكية', en: 'Royal Tulip Ceramic Vase' },
          seoDescription: { ar: 'فازة زهور فاخرة', en: 'Luxury floral vase' },
        },
        quantity: 1,
        itemTotal: 420,
      },
    ],
    recipient: {
      type: 'gift',
      name: 'نورة العتيبي',
      phone: '+966 55 987 6543',
      city: 'جدة',
      district: 'حي الشاطئ',
      street: 'طريق الكورنيش',
    },
    delivery: {
      date: '2026-09-18',
      timeSlot: 'afternoon',
    },
    paymentMethod: 'apple_pay',
    subtotal: 420,
    shippingFee: 0,
    vat: 63,
    discount: 0,
    total: 420,
    status: 'preparing',
    createdAt: '2026-09-15T11:00:00Z',
  },
];

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      queryFn: async (credentials) => {
        // Simulate network latency
        await new Promise((res) => setTimeout(res, 600));

        if (!credentials.email || !credentials.password) {
          return { error: { status: 400, data: 'Email and password are required' } };
        }

        // Mock success response (API-ready for backend integration)
        const mockUser: User = {
          id: 'usr_' + Math.random().toString(36).substring(2, 9),
          name: credentials.email.split('@')[0].replace(/[._]/g, ' '),
          email: credentials.email,
          phone: '+966 50 123 4567',
          city: 'جدة',
          district: 'حي الروضة',
          street: 'شارع الأمير سلطان، مبنى 14',
          createdAt: new Date().toISOString(),
        };

        const mockToken = 'jwt_token_' + Math.random().toString(36).substring(2);

        return { data: { user: mockUser, token: mockToken } };
      },
      invalidatesTags: ['Order', 'Cart'],
    }),

    register: builder.mutation<AuthResponse, RegisterData>({
      queryFn: async (data) => {
        await new Promise((res) => setTimeout(res, 700));

        if (!data.name || !data.email || !data.password) {
          return { error: { status: 400, data: 'All fields are required' } };
        }

        const mockUser: User = {
          id: 'usr_' + Math.random().toString(36).substring(2, 9),
          name: data.name,
          email: data.email,
          phone: data.phone || '+966 50 000 0000',
          city: 'جدة',
          district: 'حي النعيم',
          createdAt: new Date().toISOString(),
        };

        const mockToken = 'jwt_token_' + Math.random().toString(36).substring(2);

        return { data: { user: mockUser, token: mockToken } };
      },
    }),

    forgotPassword: builder.mutation<{ success: boolean; message: string }, ForgotPasswordData>({
      queryFn: async ({ email }) => {
        await new Promise((res) => setTimeout(res, 500));
        return {
          data: {
            success: true,
            message: `Password reset instructions have been sent to ${email}`,
          },
        };
      },
    }),

    resetPassword: builder.mutation<{ success: boolean; message: string }, ResetPasswordData>({
      queryFn: async () => {
        await new Promise((res) => setTimeout(res, 600));
        return {
          data: {
            success: true,
            message: 'Your password has been reset successfully.',
          },
        };
      },
    }),

    updateProfile: builder.mutation<User, UpdateProfileData & { userId: string }>({
      queryFn: async (data) => {
        await new Promise((res) => setTimeout(res, 500));
        const updatedUser: User = {
          id: data.userId,
          name: data.name || 'User',
          email: data.email || 'user@example.com',
          phone: data.phone,
          city: data.city || 'جدة',
          district: data.district,
          street: data.street,
          createdAt: new Date().toISOString(),
        };
        return { data: updatedUser };
      },
    }),

    getUserOrders: builder.query<Order[], string | void>({
      queryFn: async () => {
        await new Promise((res) => setTimeout(res, 400));
        return { data: MOCK_USER_ORDERS };
      },
      providesTags: ['Order'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useGetUserOrdersQuery,
} = authApi;
