import { baseApi } from './baseApi';

export interface PaymentGatewayMethod {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  icon?: string;
  is_sandbox?: boolean;
  extra_fee?: number;
}

export interface BlockedDateItem {
  id?: number;
  date: string;
  title_en: string;
  title_ar: string;
  title?: string;
  reason_en?: string;
  reason_ar?: string;
  reason?: string;
  is_all_day?: boolean;
}

export interface DeliverySlotItem {
  id: number;
  code?: string;
  title_en?: string;
  title_ar?: string;
  name_en?: string;
  name_ar?: string;
  start_time?: string;
  end_time?: string;
  is_available: boolean;
  cutoff_reason?: string | null;
  extra_charge?: number;
}

export interface DeliverySlotsResponse {
  status: string;
  date: string;
  is_friday: boolean;
  is_blocked?: boolean;
  blocked_info?: BlockedDateItem | null;
  blocked_dates?: BlockedDateItem[];
  slots: DeliverySlotItem[];
}

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<PaymentGatewayMethod[], void>({
      query: () => '/v1/payment-methods',
      transformResponse: (res: any) => {
        if (res?.data && Array.isArray(res.data)) {
          return res.data;
        }
        if (Array.isArray(res)) return res;
        return [];
      },
      providesTags: ['PaymentMethods'],
    }),

    getDeliverySlots: builder.query<DeliverySlotsResponse, string | void>({
      query: (date) => {
        const queryDate = date || new Date().toISOString().split('T')[0];
        return `/v1/delivery-slots?date=${queryDate}`;
      },
      transformResponse: (res: any): DeliverySlotsResponse => {
        return {
          status: res?.status || 'success',
          date: res?.date || '',
          is_friday: Boolean(res?.is_friday),
          is_blocked: Boolean(res?.is_blocked),
          blocked_info: res?.blocked_info || null,
          blocked_dates: Array.isArray(res?.blocked_dates) ? res.blocked_dates : [],
          slots: Array.isArray(res?.slots) ? res.slots : [],
        };
      },
      providesTags: ['DeliverySlots'],
    }),

    initiatePayment: builder.mutation<
      any,
      { orderId: string | number; gateway: string }
    >({
      query: (data) => ({
        url: '/v1/payments/initiate',
        method: 'POST',
        body: {
          order_id: data.orderId,
          payment_gateway: data.gateway,
        },
      }),
    }),

    verifyPayment: builder.mutation<
      any,
      { orderId: string | number; gateway?: string }
    >({
      query: (data) => ({
        url: '/v1/payments/verify',
        method: 'POST',
        body: {
          order_id: data.orderId,
          payment_gateway: data.gateway || 'hyperpay',
        },
      }),
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useGetDeliverySlotsQuery,
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
} = checkoutApi;
